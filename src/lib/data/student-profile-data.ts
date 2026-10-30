export interface StudentProfile {
  name: string;
  memberSince: string;
  memberDate: string;
  phone: string;
  parentPhone: string;
  governorate: string;
  grade: string;
  studyType: 'عام' | 'أزهري' | 'لغات';
}

export interface StudentStats {
  videosWatched: number;
  totalVideos: number;
  quizzesTaken: number;
  quizzesPassed: number;
  totalQuizzes: number;
}

export interface EnrolledCourseItem {
  id: string;
  title: string;
  grade: string;
  status: 'active' | 'temporary';
  statusLabel: string;
  expiresAt: string;
  progress: number;
}

export interface InvoiceItem {
  id: string;
  courseTitle: string;
  amount: string;
  method: 'كود سنتر' | 'فودافون كاش' | 'إنستا باي';
  date: string;
  status: 'مفعل نهائياً' | 'تفعيل مؤقت قيد المراجعة';
}

export interface LoginSessionItem {
  id: string;
  deviceType: 'mobile' | 'desktop';
  deviceName: string;
  os: string;
  browser: string;
  lastActive: string;
  loginDate: string;
}

export const INITIAL_STUDENT_PROFILE: StudentProfile = {
  name: 'أحمد محمد العوضي',
  memberSince: '3 أشهر',
  memberDate: 'أغسطس 2026',
  phone: '01012345678',
  parentPhone: '01198765432',
  governorate: 'القاهرة',
  grade: 'الصف الثالث الثانوي',
  studyType: 'عام',
};

export const INITIAL_STUDENT_STATS: StudentStats = {
  videosWatched: 24,
  totalVideos: 32,
  quizzesTaken: 18,
  quizzesPassed: 17,
  totalQuizzes: 20,
};

export const INITIAL_ENROLLED_COURSES: EnrolledCourseItem[] = [
  {
    id: 'c-comprehensive',
    title: 'الكورس الشامل لمادة الأحياء للثانوية العامة 2027',
    grade: 'الصف الثالث الثانوي',
    status: 'active',
    statusLabel: 'مفعل نهائياً',
    expiresAt: '1 يوليو 2027',
    progress: 75,
  },
  {
    id: 'c-chapter-2',
    title: 'كورس الباب الثاني: التنسيق الهرموني في الكائنات الحية',
    grade: 'الصف الثالث الثانوي',
    status: 'temporary',
    statusLabel: 'تفعيل مؤقت قيد المراجعة',
    expiresAt: '15 نوفمبر 2026',
    progress: 10,
  },
];

export const INITIAL_INVOICES: InvoiceItem[] = [
  {
    id: 'INV-2026-081',
    courseTitle: 'الكورس الشامل لمادة الأحياء للثانوية العامة',
    amount: '1200 ج.م',
    method: 'فودافون كاش',
    date: '15 أغسطس 2026',
    status: 'مفعل نهائياً',
  },
  {
    id: 'INV-2026-114',
    courseTitle: 'كورس الباب الثاني: التنسيق الهرموني',
    amount: '350 ج.م',
    method: 'إنستا باي',
    date: '28 أكتوبر 2026',
    status: 'تفعيل مؤقت قيد المراجعة',
  },
  {
    id: 'INV-2026-003',
    courseTitle: 'مذكرة بنك الأسئلة الشامل 2027 (مطبوعة)',
    amount: '150 ج.م',
    method: 'كود سنتر',
    date: '1 سبتمبر 2026',
    status: 'مفعل نهائياً',
  },
];

export const INITIAL_LOGIN_SESSIONS: LoginSessionItem[] = [
  {
    id: 's-1',
    deviceType: 'mobile',
    deviceName: 'iPhone 15 Pro Max',
    os: 'iOS 18.1',
    browser: 'Safari',
    lastActive: 'نشط الآن',
    loginDate: '30 أكتوبر 2026 - 02:15 م',
  },
  {
    id: 's-2',
    deviceType: 'desktop',
    deviceName: 'Windows PC (منزل)',
    os: 'Windows 11',
    browser: 'Chrome 130',
    lastActive: 'منذ يومين',
    loginDate: '28 أكتوبر 2026 - 08:30 م',
  },
];
