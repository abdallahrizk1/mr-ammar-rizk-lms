import { StudentMistakeItem, WatchHistoryItem } from '@/lib/data/exam-types';
import { SAMPLE_MISTAKES, SAMPLE_WATCH_HISTORY } from '@/lib/data/exam-data';
import { EnrolledCourseItem, INITIAL_ENROLLED_COURSES } from '@/lib/data/student-profile-data';
import { ForumPostItem, INITIAL_FORUM_POSTS } from '@/lib/data/forum-data';

const MISTAKES_KEY = 'lms_student_mistakes_bank_v5';
const ENROLLED_COURSES_KEY = 'lms_student_enrolled_courses';
const LOGOUT_STATS_KEY = 'lms_student_logout_stats';
const EXAM_SUBMISSIONS_KEY = 'lms_student_exam_submissions';
const WATCH_HISTORY_KEY = 'lms_student_watch_history_v4';
const FORUM_POSTS_KEY = 'lms_student_forum_posts';

export interface ExamSubmissionRecord {
  examId: string;
  courseId?: string;
  isHomework: boolean;
  score: number;
  total: number;
  percentage: number;
  isPassed: boolean;
  examTitle: string;
  submittedAt: string;
}

export function getStoredMistakes(): StudentMistakeItem[] {
  if (typeof window === 'undefined') return SAMPLE_MISTAKES;
  const raw = localStorage.getItem(MISTAKES_KEY);
  if (!raw) {
    localStorage.setItem(MISTAKES_KEY, JSON.stringify(SAMPLE_MISTAKES));
    return SAMPLE_MISTAKES;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return SAMPLE_MISTAKES;
  }
}

export function saveStoredMistakes(mistakes: StudentMistakeItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MISTAKES_KEY, JSON.stringify(mistakes));
}

export function removeMistakeById(mistakeId: string): StudentMistakeItem[] {
  const current = getStoredMistakes();
  const updated = current.filter((m) => m.id !== mistakeId);
  saveStoredMistakes(updated);
  return updated;
}

export function removeMistakesByIds(mistakeIds: string[]): StudentMistakeItem[] {
  const idSet = new Set(mistakeIds);
  const current = getStoredMistakes();
  const updated = current.filter((m) => !idSet.has(m.id));
  saveStoredMistakes(updated);
  return updated;
}

export function removeMistakeByQuestionId(questionId: string, category?: string): StudentMistakeItem[] {
  const current = getStoredMistakes();
  const updated = current.filter((m) => {
    if (category) {
      return !(m.questionId === questionId && m.category === category);
    }
    return m.questionId !== questionId;
  });
  saveStoredMistakes(updated);
  return updated;
}

export function addMistakeItem(item: StudentMistakeItem): void {
  const current = getStoredMistakes();
  const exists = current.some((m) => m.questionId === item.questionId && m.category === item.category);
  if (!exists) {
    const updated = [item, ...current];
    saveStoredMistakes(updated);
  }
}

export function getStoredExamSubmissions(): Record<string, ExamSubmissionRecord> {
  if (typeof window === 'undefined') return {};
  const raw = localStorage.getItem(EXAM_SUBMISSIONS_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function recordExamSubmission(sub: ExamSubmissionRecord): void {
  if (typeof window === 'undefined') return;
  const all = getStoredExamSubmissions();
  all[sub.examId] = sub;
  localStorage.setItem(EXAM_SUBMISSIONS_KEY, JSON.stringify(all));
}

export function getStoredEnrolledCourses(): EnrolledCourseItem[] {
  if (typeof window === 'undefined') return INITIAL_ENROLLED_COURSES;
  const raw = localStorage.getItem(ENROLLED_COURSES_KEY);
  if (!raw) {
    localStorage.setItem(ENROLLED_COURSES_KEY, JSON.stringify(INITIAL_ENROLLED_COURSES));
    return INITIAL_ENROLLED_COURSES;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return INITIAL_ENROLLED_COURSES;
  }
}

export function addTemporaryEnrolledCourse(course: {
  id: string;
  title: string;
  grade: string;
}): void {
  if (typeof window === 'undefined') return;
  const courses = getStoredEnrolledCourses();
  const exists = courses.some((c) => c.id === course.id);
  if (!exists) {
    const newCourse: EnrolledCourseItem = {
      id: course.id,
      title: course.title,
      grade: course.grade,
      status: 'temporary',
      statusLabel: 'تفعيل مؤقت قيد المراجعة',
      expiresAt: 'بعد 14 يوماً (مؤقت)',
      progress: 0,
    };
    const updated = [newCourse, ...courses];
    localStorage.setItem(ENROLLED_COURSES_KEY, JSON.stringify(updated));
  }
}

export function getStoredWatchHistory(): WatchHistoryItem[] {
  if (typeof window === 'undefined') return SAMPLE_WATCH_HISTORY;
  const raw = localStorage.getItem(WATCH_HISTORY_KEY);
  if (!raw) {
    localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(SAMPLE_WATCH_HISTORY));
    return SAMPLE_WATCH_HISTORY;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return SAMPLE_WATCH_HISTORY;
  }
}

export function recordWatchHistory(item: WatchHistoryItem): void {
  if (typeof window === 'undefined') return;
  const current = getStoredWatchHistory();
  const filtered = current.filter((w) => w.id !== item.id);
  const updated = [item, ...filtered];
  localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(updated));
}

export function getStoredForumPosts(): ForumPostItem[] {
  if (typeof window === 'undefined') return INITIAL_FORUM_POSTS;
  const raw = localStorage.getItem(FORUM_POSTS_KEY);
  if (!raw) {
    localStorage.setItem(FORUM_POSTS_KEY, JSON.stringify(INITIAL_FORUM_POSTS));
    return INITIAL_FORUM_POSTS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return INITIAL_FORUM_POSTS;
  }
}

export function addStoredForumPost(post: ForumPostItem): void {
  if (typeof window === 'undefined') return;
  const current = getStoredForumPosts();
  const updated = [post, ...current];
  localStorage.setItem(FORUM_POSTS_KEY, JSON.stringify(updated));
}

export function getLogoutStats(): { today: number; thisWeek: number } {
  if (typeof window === 'undefined') return { today: 1, thisWeek: 3 };
  const raw = localStorage.getItem(LOGOUT_STATS_KEY);
  if (!raw) {
    const defaults = { today: 1, thisWeek: 3 };
    localStorage.setItem(LOGOUT_STATS_KEY, JSON.stringify(defaults));
    return defaults;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return { today: 1, thisWeek: 3 };
  }
}

export function incrementLogoutCount(): void {
  if (typeof window === 'undefined') return;
  const stats = getLogoutStats();
  stats.today += 1;
  stats.thisWeek += 1;
  localStorage.setItem(LOGOUT_STATS_KEY, JSON.stringify(stats));
}
