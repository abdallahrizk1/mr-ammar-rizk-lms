import { createClient } from '@/lib/supabase/client';
import type { EnrolledCourseItem, InvoiceItem, LoginSessionItem, StudentStats } from '@/lib/data/student-profile-data';
import type { StudentMistakeItem, ExamResultSummary, WatchHistoryItem, ExamQuestion } from '@/lib/data/exam-types';
import {
  AccountDataBundle,
  DEFAULT_PROFILE,
  DEFAULT_STATS,
  formatGrade,
  formatStudyType,
  optToIndex,
} from './account-mappers';

export async function loadStudentAccountData(): Promise<AccountDataBundle> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      profile: DEFAULT_PROFILE,
      stats: DEFAULT_STATS,
      enrolledCourses: [],
      invoices: [],
      sessions: [],
      logoutsToday: 0,
      logoutsThisWeek: 0,
      quizResults: [],
      homeworkResults: [],
      watchHistory: [],
      mistakes: [],
    };
  }

  // 1. Fetch Profile
  let profile = DEFAULT_PROFILE;
  const { data: pData } = await supabase
    .from('profiles')
    .select('id, full_name, phone, parent_phone, grade_level, education_type, governorate, created_at')
    .eq('id', user.id)
    .maybeSingle();

  if (pData) {
    profile = {
      name: pData.full_name || DEFAULT_PROFILE.name,
      memberSince: 'طالب المنصة',
      memberDate: pData.created_at ? new Date(pData.created_at).toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' }) : DEFAULT_PROFILE.memberDate,
      phone: pData.phone || DEFAULT_PROFILE.phone,
      parentPhone: pData.parent_phone || DEFAULT_PROFILE.parentPhone,
      governorate: pData.governorate || DEFAULT_PROFILE.governorate,
      grade: formatGrade(pData.grade_level),
      studyType: formatStudyType(pData.education_type),
    };
  }

  // 2. Fetch Dashboard RPC & Enrolled Courses
  let enrolledCourses: EnrolledCourseItem[] = [];
  try {
    const { data: dashData } = await supabase.rpc('get_student_dashboard_data');
    if (dashData?.enrolled_courses) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      enrolledCourses = dashData.enrolled_courses.map((c: any) => ({
        id: c.id,
        title: c.title,
        grade: profile.grade,
        status: c.is_temporary_activation ? 'temporary' : 'active',
        statusLabel: c.is_temporary_activation ? 'تفعيل مؤقت قيد المراجعة' : 'مفعل نهائياً',
        expiresAt: c.expires_at ? new Date(c.expires_at).toLocaleDateString('ar-EG') : 'طوال العام الدراسي',
        progress: 0,
      }));
    }
  } catch {}

  // 3. Fetch Invoices
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: invRows } = await supabase
    .from('student_invoices')
    .select('id, amount, payment_method, status, created_at, courses:course_id(title)')
    .eq('student_id', user.id)
    .order('created_at', { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const invoices: InvoiceItem[] = (invRows || []).map((inv: any) => ({
    id: inv.id,
    courseTitle: inv.courses?.title || 'اشتراك تعليمي',
    amount: `${Number(inv.amount || 0)} ج.م`,
    method: inv.payment_method === 'center_code' ? 'كود سنتر' : inv.payment_method === 'instapay' ? 'إنستا باي' : 'فودافون كاش',
    date: new Date(inv.created_at).toLocaleDateString('ar-EG'),
    status: inv.status === 'approved' ? 'مفعل نهائياً' : 'تفعيل مؤقت قيد المراجعة',
  }));

  // 4. Fetch Login Sessions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: sessionRows } = await supabase
    .from('login_sessions')
    .select('id, device_type, device_name, os_name, browser_name, logout_count_today, logout_count_week, last_active_at, created_at')
    .eq('user_id', user.id)
    .order('last_active_at', { ascending: false });

  let logoutsToday = 0;
  let logoutsThisWeek = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sessions: LoginSessionItem[] = (sessionRows || []).map((s: any) => {
    logoutsToday = Math.max(logoutsToday, s.logout_count_today || 0);
    logoutsThisWeek = Math.max(logoutsThisWeek, s.logout_count_week || 0);
    return {
      id: s.id,
      deviceType: (s.device_type || '').toLowerCase().includes('mobile') ? 'mobile' : 'desktop',
      deviceName: s.device_name || 'جهاز معروف',
      os: s.os_name || 'نظام التشغيل',
      browser: s.browser_name || 'المتصفح',
      lastActive: new Date(s.last_active_at || s.created_at).toLocaleString('ar-EG'),
      loginDate: new Date(s.created_at).toLocaleDateString('ar-EG'),
    };
  });

  // 5. Fetch Exam Attempts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: attemptRows } = await supabase
    .from('exam_attempts')
    .select('id, exam_id, score, score_percentage, total_questions, solved_questions, correct_answers_count, started_at, submitted_at, passed, exams:exam_id(id, title, exam_type)')
    .eq('student_id', user.id)
    .in('status', ['submitted', 'expired_submitted'])
    .order('submitted_at', { ascending: false });

  const quizResults: ExamResultSummary[] = [];
  const homeworkResults: ExamResultSummary[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (attemptRows || []).forEach((row: any) => {
    const summary: ExamResultSummary = {
      id: row.id,
      examName: row.exams?.title || 'امتحان',
      totalQuestions: row.total_questions || 0,
      score: Math.round(Number(row.score) || 0),
      percentage: Math.round(Number(row.score_percentage) || 0),
      solvedCount: row.solved_questions || 0,
      correctCount: row.correct_answers_count || 0,
      startTime: row.started_at ? new Date(row.started_at).toLocaleDateString('ar-EG') : 'اليوم',
      endTime: row.submitted_at ? new Date(row.submitted_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : '',
      questions: [],
      studentAnswers: {},
    };
    if (row.exams?.exam_type === 'homework') {
      homeworkResults.push(summary);
    } else {
      quizResults.push(summary);
    }
  });

  // 6. Fetch Mistakes Bank
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: mistakeRows } = await supabase
    .from('student_mistakes_bank')
    .select('id, question_id, exam_id, source_type, wrong_option, created_at, exam_questions:question_id(id, question_text, image_url, correct_option), exams:exam_id(title)')
    .eq('student_id', user.id)
    .order('created_at', { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mistakes: StudentMistakeItem[] = (mistakeRows || []).map((m: any) => {
    const q = m.exam_questions;
    return {
      id: m.id,
      category: m.source_type === 'homework' ? 'homework' : 'quiz',
      sourceTitle: m.exams?.title || 'امتحان',
      questionId: m.question_id,
      questionText: q?.question_text || 'سؤال مراجعة',
      diagramTitle: q?.image_url ? 'رسم توضيحي للمسألة' : undefined,
      choices: ['( أ )', '( ب )', '( ج )', '( د )'],
      studentChoiceIndex: optToIndex(m.wrong_option),
      correctChoiceIndex: optToIndex(q?.correct_option),
      explanation: 'راجع شرح المحاضرة المرتبط بهذا السؤال واستعن بالرسم التوضيحي للحل.',
    };
  });

  // 7. Fetch Watch History
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: compRows } = await supabase
    .from('lesson_completions')
    .select('id, watched_duration_seconds, completed_at, lessons:lesson_id(title), courses:course_id(title)')
    .eq('student_id', user.id)
    .order('completed_at', { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const watchHistory: WatchHistoryItem[] = (compRows || []).map((c: any) => ({
    id: c.id,
    videoTitle: c.lessons?.title || 'محاضرة تعليمية',
    courseTitle: c.courses?.title || 'كورس الأحياء',
    watchDuration: `${Math.round((c.watched_duration_seconds || 0) / 60)} دقيقة`,
    watchDate: new Date(c.completed_at).toLocaleDateString('ar-EG'),
  }));

  // 8. Stats Calculation
  const stats: StudentStats = {
    videosWatched: watchHistory.length,
    totalVideos: Math.max(watchHistory.length, 1),
    quizzesTaken: quizResults.length,
    quizzesPassed: quizResults.filter((q) => q.percentage >= 50).length,
    totalQuizzes: Math.max(quizResults.length, 1),
  };

  return {
    profile,
    stats,
    enrolledCourses,
    invoices,
    sessions,
    logoutsToday,
    logoutsThisWeek,
    quizResults,
    homeworkResults,
    watchHistory,
    mistakes,
  };
}

export async function deleteStudentMistakes(mistakeIds: string[]): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from('student_mistakes_bank').delete().in('id', mistakeIds);
  return !error;
}

