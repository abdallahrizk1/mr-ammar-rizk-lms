export type StaffRole = 'super_admin' | 'admin' | 'assistant';

export interface AdminPermissions {
  manage_courses?: boolean;
  manage_exams?: boolean;
  manage_payments?: boolean;
  manage_students?: boolean;
  manage_forum?: boolean;
  manage_settings?: boolean;
}

export interface AdminUserSession {
  id: string;
  fullName: string;
  phone: string;
  role: StaffRole;
  permissions: AdminPermissions;
}

export interface AdminCourse {
  id: string;
  title: string;
  description: string | null;
  grade_level: string;
  education_type: string;
  price: number;
  validity_days: number;
  is_bundle: boolean;
  banner_image_url: string | null;
  is_published: boolean;
  created_at: string;
  deleted_at: string | null;
}

export interface AdminModule {
  id: string;
  title: string;
  sort_order: number;
  course_id?: string;
  lessons_count?: number;
}

export interface AdminLesson {
  id: string;
  module_id: string;
  title: string;
  sort_order: number;
  required_pass_percentage: number;
  publish_at: string | null;
}

export interface AdminLessonItem {
  id: string;
  lesson_id: string;
  title: string;
  item_type: 'video' | 'pdf' | 'quiz' | 'homework' | 'solution_video' | 'solution_pdf';
  sort_order: number;
  r2_path_or_url?: string | null;
  exam_id?: string | null;
  unlock_after_exam_id?: string | null;
  duration_seconds?: number;
}

export interface AdminExam {
  id: string;
  lesson_id: string;
  title: string;
  exam_type: 'quiz' | 'homework';
  duration_minutes: number;
  pass_percentage: number;
  shuffle_questions: boolean;
  questions_count?: number;
}

export interface AdminQuestion {
  id: string;
  exam_id: string;
  image_url: string;
  correct_option: 'a' | 'b' | 'c' | 'd' | 'A' | 'B' | 'C' | 'D';
  points: number;
  sort_order: number;
}

