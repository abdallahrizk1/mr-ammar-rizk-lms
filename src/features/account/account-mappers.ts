import { createClient } from '@/lib/supabase/client';
import type {
  StudentProfile,
  StudentStats,
  EnrolledCourseItem,
  InvoiceItem,
  LoginSessionItem,
} from '@/lib/data/student-profile-data';
import type {
  StudentMistakeItem,
  ExamResultSummary,
  WatchHistoryItem,
  ExamQuestion,
} from '@/lib/data/exam-types';

export interface AccountDataBundle {
  profile: StudentProfile;
  stats: StudentStats;
  enrolledCourses: EnrolledCourseItem[];
  invoices: InvoiceItem[];
  sessions: LoginSessionItem[];
  logoutsToday: number;
  logoutsThisWeek: number;
  quizResults: ExamResultSummary[];
  homeworkResults: ExamResultSummary[];
  watchHistory: WatchHistoryItem[];
  mistakes: StudentMistakeItem[];
}

export const DEFAULT_PROFILE: StudentProfile = {
  name: 'طالب منصة الأحياء',
  memberSince: 'جديد',
  memberDate: 'أكتوبر 2026',
  phone: '01000000000',
  parentPhone: '01100000000',
  governorate: 'الإسكندرية',
  grade: 'الصف الثالث الثانوي',
  studyType: 'عام',
};

export const DEFAULT_STATS: StudentStats = {
  videosWatched: 0,
  totalVideos: 1,
  quizzesTaken: 0,
  quizzesPassed: 0,
  totalQuizzes: 1,
};

export function formatGrade(level?: string | null): string {
  if (level === '1') return 'الصف الأول الثانوي';
  if (level === '2') return 'الصف الثاني الثانوي';
  return 'الصف الثالث الثانوي';
}

export function formatStudyType(t?: string | null): 'عام' | 'أزهري' | 'لغات' {
  if (t === 'azhar') return 'أزهري';
  if (t === 'languages') return 'لغات';
  return 'عام';
}

export function optToIndex(opt?: string | null): number {
  if (!opt) return 0;
  const idx = ['a', 'b', 'c', 'd'].indexOf(opt.toLowerCase());
  return idx >= 0 ? idx : 0;
}

export async function fetchAttemptReview(attemptId: string): Promise<{ questions: ExamQuestion[]; studentAnswers: Record<string, number> } | null> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('review_submitted_attempt', { p_attempt_id: attemptId });
  if (error || !data || !Array.isArray(data.questions)) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const questions: ExamQuestion[] = data.questions.map((q: any, i: number) => ({
    id: q.question_id,
    questionNumber: i + 1,
    questionText: q.question_text || `السؤال ${i + 1}`,
    diagramTitle: q.image_url ? 'رسم توضيحي' : undefined,
    choices: ['الاختيار (أ)', 'الاختيار (ب)', 'الاختيار (ج)', 'الاختيار (د)'],
    correctChoiceIndex: optToIndex(q.correct_option),
    explanation: 'وفق النموذج المعتمد للمحاضرة.',
  }));

  const studentAnswers: Record<string, number> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data.questions.forEach((q: any) => {
    studentAnswers[q.question_id] = optToIndex(q.selected_option);
  });

  return { questions, studentAnswers };
}
