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

const INVOICE_TITLES = [
  'الكورس الشامل لمادة الأحياء للثانوية العامة 2027',
  'كورس الباب الثاني: التنسيق الهرموني في الكائنات الحية',
  'مذكرة بنك الأسئلة الشامل 2027 (نسخة مطبوعة)',
  'كورس الباب الأول: الدعامة والحركة في الكائنات الحية',
  'مذكرة أطلس الرسومات التشريحية والبيانية',
  'ورشة حل مسائل البيولوجيا الجزيئية و DNA',
  'كورس التكاثر في الكائنات الحية (الجزء الأول)',
  'كورس التكاثر في الإنسان (الجزء الثاني)',
  'كورس المناعة في النبات والإنسان',
  'باقة المراجعة الشهرية الأولى (أكتوبر)',
  'باقة المراجعة الشهرية الثانية (نوفمبر)',
  'اختبارات كتاب الامتحان والتميز التفاعلية',
];

const PAYMENT_METHODS: Array<'كود سنتر' | 'فودافون كاش' | 'إنستا باي'> = [
  'فودافون كاش',
  'إنستا باي',
  'كود سنتر',
];

export const INITIAL_INVOICES: InvoiceItem[] = INVOICE_TITLES.map((courseTitle, i) => ({
  id: `INV-2026-${String(101 + i).padStart(3, '0')}`,
  courseTitle,
  amount: i === 0 ? '1200 ج.م' : i % 3 === 2 ? '150 ج.م' : '350 ج.م',
  method: PAYMENT_METHODS[i % 3],
  date: `${10 + i} أكتوبر 2026`,
  status: i === 1 ? 'تفعيل مؤقت قيد المراجعة' : 'مفعل نهائياً',
}));

export const INITIAL_LOGIN_SESSIONS: LoginSessionItem[] = Array.from({ length: 12 }, (_, i) => {
  const isMobile = i % 2 === 0;
  return {
    id: `s-${i + 1}`,
    deviceType: isMobile ? 'mobile' : 'desktop',
    deviceName: isMobile ? 'iPhone 15 Pro Max' : 'Windows PC (منزل)',
    os: isMobile ? 'iOS 18.1' : 'Windows 11',
    browser: isMobile ? 'Safari Mobile' : 'Google Chrome 130',
    lastActive: i === 0 ? 'نشط الآن' : `منذ ${i} يوم`,
    loginDate: `${30 - (i % 20)} أكتوبر 2026 - 0${(i % 8) + 1}:15 م`,
  };
});
