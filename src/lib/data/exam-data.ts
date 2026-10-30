import {
  ExamQuestion,
  ExamResultSummary,
  StudentMistakeItem,
  WatchHistoryItem,
} from './exam-types';

export const SAMPLE_EXAM_QUESTIONS: ExamQuestion[] = [
  {
    id: 'q-1',
    questionNumber: 1,
    questionText: 'أي التغيرات التالية يطرأ على خلية نباتية عند وضعها في محلول سكري عالي التركيز لفترة كافية؟',
    diagramTitle: 'تجربة ضغط الامتلاء والخاصية الأسموزية داخل فجوة الخلية النباتية',
    choices: [
      'يزداد حجم الفجوة العصارية ويزداد ضغط الامتلاء',
      'يقل حجم الفجوة العصارية ويزداد الضغط الأسموزي داخلها',
      'يتحرك الماء إلى داخل الخلية بالتشرب وينتفخ الجدار',
      'لا يتأثر حجم الفجوة العصارية نظراً لصلابة الجدار الخلوي',
    ],
    correctChoiceIndex: 1,
    explanation: 'عند وضع الخلية في محلول عالي التركيز، يخرج الماء من الفجوة بالخاصية الأسموزية فتنكمش ويزداد الضغط الأسموزي.',
  },
  {
    id: 'q-2',
    questionNumber: 2,
    questionText: 'ما المادة الكيميائية الصلبة غير المنفذة للماء التي تترسب على جدر خلايا نسيج الفلين في سيقان النباتات الخشبية؟',
    choices: ['السليلوز', 'البكتين', 'السيوبرين', 'اللجنين'],
    correctChoiceIndex: 2,
    explanation: 'السيوبرين مادة غير منفذة للماء تترسب في نسيج الفلين لتمنع فقد الماء وتوفر دعامة تركيبية.',
  },
  {
    id: 'q-3',
    questionNumber: 3,
    questionText: 'كم عدد الفقرات العظمية في العمود الفقري للإنسان التي تتمفصل مع الضلوع الصدرية؟',
    choices: ['7 فقرات', '12 فقرة', '5 فقرات', '24 فقرة'],
    correctChoiceIndex: 1,
    explanation: 'الفقرات الظهرية (الصدرية) وعددها 12 فقرة (من رقم 8 إلى 19) هي المتصلة بالضلوع.',
  },
  {
    id: 'q-4',
    questionNumber: 4,
    questionText: 'الرباط الصليبي في مفصل الركبة يصل بين عظمتي:',
    choices: ['الفخذ والشظية', 'الفخذ والقصبة', 'القصبة والشظية', 'الفخذ والرضفة'],
    correctChoiceIndex: 1,
    explanation: 'الأربطة الصليبية (الأمامي والخلفي) تربط بين عظمة الفخذ وعظمة القصبة في مفصل الركبة.',
  },
  {
    id: 'q-5',
    questionNumber: 5,
    questionText: 'أي مما يلي يميز المفاصل الغضروفية عن المفاصل الليفية في الهيكل العظمي للإنسان؟',
    choices: [
      'تسمح بحركة محدودة جداً وتوجد بين عظام العمود الفقري',
      'لا تسمح بأي حركة وتتحول مع تقدم العمر لنسيج عظمي',
      'تحتوي على سائل مصلي يسهل انزلاق العظام',
      'تثبت الأسنان في الفكين العلوي والسفلي',
    ],
    correctChoiceIndex: 0,
    explanation: 'المفاصل الغضروفية تسمح بحركة محدودة جداً، بينما المفاصل الليفية عديمة الحركة.',
  },
];

const QUIZ_TITLES = [
  'كويز المحاضرة 1: الدعامة الفسيولوجية في النبات',
  'كويز المحاضرة 2: الدعامة التركيبية والأنسجة النباتية',
  'كويز المحاضرة 3: العمود الفقري والجمجمة والقفص الصدري',
  'كويز المحاضرة 4: الهيكل الطرفي والأحزمة العظمية',
  'كويز المحاضرة 5: الغضاريف والمفاصل والأربطة والأوتار',
  'كويز المحاضرة 6: الحركة في النبات (اللمس والانتحاء والشد)',
  'كويز المحاضرة 7: تركيب العضلة الهيكلية والقطعة العضلية',
  'كويز المحاضرة 8: آلية انقباض العضلة ونظرية الخيوط المنزلقة',
  'كويز المحاضرة 9: الوحدة الحركية والإجهاد والشد العضلي',
  'كويز المحاضرة 10: مراجعة شاملة على الباب الأول',
  'كويز المحاضرة 11: التنسيق الهرموني والغدة النخامية',
  'كويز المحاضرة 12: الغدة الدرقية والجاردرقية والكظرية',
];

export const SAMPLE_QUIZ_RESULTS: ExamResultSummary[] = QUIZ_TITLES.map((examName, i) => {
  const score = 15 - (i % 3);
  return {
    id: `res-q-${i + 1}`,
    examName,
    totalQuestions: 15,
    score,
    percentage: Math.round((score / 15) * 100),
    solvedCount: 15,
    correctCount: score,
    startTime: `${18 + (i % 12)} أكتوبر 2026 - 06:00 م`,
    endTime: `${18 + (i % 12)} أكتوبر 2026 - 06:18 م`,
    questions: SAMPLE_EXAM_QUESTIONS,
    studentAnswers: { 'q-1': 1, 'q-2': i % 2 === 0 ? 2 : 3, 'q-3': 1, 'q-4': 0, 'q-5': 0 },
  };
});

const HW_TITLES = [
  'واجب المحاضرة 1: أسئلة الفهم والربط في الدعامة الفسيولوجية',
  'واجب المحاضرة 2: تدريبات ترسيب السليلوز واللجنين والسيوبرين',
  'واجب المحاضرة 3: مسائل أرقام الفقرات والقفص الصدري',
  'واجب المحاضرة 4: تطبيقات الحزام الصدري والحوضي',
  'واجب المحاضرة 5: تدريبات المفاصل الزلالية وتمزق وتر أخيل',
  'واجب المحاضرة 6: أسئلة المحاليق والجذور الشادة في النبات',
  'واجب المحاضرة 7: مسائل المناطق المضيئة والداكنة في الساركومير',
  'واجب المحاضرة 8: أسئلة السيال العصبي وأيونات الكالسيوم',
  'واجب المحاضرة 9: مسائل حساب عدد الوحدات الحركية والألياف',
  'واجب المحاضرة 10: بنك أسئلة الامتحانات السابقة على الباب الأول',
  'واجب المحاضرة 11: تدريبات أوكسينات النبات والغدة النخامية',
  'واجب المحاضرة 12: تطبيقات هرمونات الأيض والاتزان الداخلي',
];

export const SAMPLE_HOMEWORK_RESULTS: ExamResultSummary[] = HW_TITLES.map((examName, i) => {
  const score = 20 - (i % 4);
  return {
    id: `res-hw-${i + 1}`,
    examName,
    totalQuestions: 20,
    score,
    percentage: Math.round((score / 20) * 100),
    solvedCount: 20,
    correctCount: score,
    startTime: `${18 + (i % 12)} أكتوبر 2026 - 07:30 م`,
    endTime: `${18 + (i % 12)} أكتوبر 2026 - 08:10 م`,
    questions: SAMPLE_EXAM_QUESTIONS,
    studentAnswers: { 'q-1': 1, 'q-2': 2, 'q-3': i % 2 === 0 ? 0 : 1, 'q-4': 1, 'q-5': 0 },
  };
});

export const SAMPLE_MISTAKES: StudentMistakeItem[] = [
  ...QUIZ_TITLES.map((sourceTitle, i): StudentMistakeItem => {
    const q = SAMPLE_EXAM_QUESTIONS[i % SAMPLE_EXAM_QUESTIONS.length];
    return {
      id: `mistake-${i + 1}`,
      category: 'quiz',
      sourceTitle,
      questionId: i < SAMPLE_EXAM_QUESTIONS.length ? q.id : `${q.id}-v${i + 1}`,
      questionText: q.questionText,
      diagramTitle: q.diagramTitle || (i === 0 ? 'تشريح أربطة مفصل الركبة في الإنسان' : undefined),
      choices: q.choices,
      studentChoiceIndex: (q.correctChoiceIndex + 2) % 4,
      correctChoiceIndex: q.correctChoiceIndex,
      explanation: q.explanation,
    };
  }),
  ...HW_TITLES.slice(0, 4).map((sourceTitle, i): StudentMistakeItem => {
    const q = SAMPLE_EXAM_QUESTIONS[(i + 2) % SAMPLE_EXAM_QUESTIONS.length];
    return {
      id: `mistake-hw-${i + 1}`,
      category: 'homework',
      sourceTitle,
      questionId: i < 2 ? q.id : `${q.id}-hw-${i + 1}`,
      questionText: q.questionText,
      diagramTitle: q.diagramTitle || 'توزيع فقرات العمود الفقري والضلوع',
      choices: q.choices,
      studentChoiceIndex: (q.correctChoiceIndex + 1) % 4,
      correctChoiceIndex: q.correctChoiceIndex,
      explanation: q.explanation,
    };
  }),
];

export const SAMPLE_WATCH_HISTORY: WatchHistoryItem[] = Array.from({ length: 12 }, (_, i) => ({
  id: `w-${i + 1}`,
  videoTitle: QUIZ_TITLES[i].replace('كويز', 'فيديو شرح'),
  courseTitle: 'الكورس الشامل في الأحياء للثانوية العامة 2027',
  watchDuration: i % 3 === 0 ? 'مشاهدة نشطة' : '00:20 ثانية (مكتمل 100%)',
  watchDate: `${19 + (i % 11)} أكتوبر 2026 - 0${(i % 8) + 1}:30 م`,
}));
