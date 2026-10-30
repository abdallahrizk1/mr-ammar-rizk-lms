export interface ForumVoiceNote {
  url: string;
  durationSec: number;
  durationLabel: string;
}

export interface ForumPostItem {
  id: string;
  authorName: string;
  authorGrade: string;
  isMine: boolean;
  timeAgo: string;
  createdAt: string;
  status: 'answered' | 'pending';
  questionTitle: string;
  questionText: string;
  questionImageUrl?: string;
  replyText?: string;
  repliedBy?: string;
  replyVoiceNote?: ForumVoiceNote;
  replyImageUrl?: string;
  isPublicApproved: boolean;
}

export const INITIAL_FORUM_POSTS: ForumPostItem[] = [
  {
    id: 'fp-private-1',
    authorName: 'أحمد محمد العوضي (أنا)',
    authorGrade: 'الصف الثالث الثانوي',
    isMine: true,
    timeAgo: 'منذ ساعتين',
    createdAt: '30 أكتوبر 2026 - 12:30 م',
    status: 'answered',
    questionTitle: 'سؤال بخصوص حركة المحاليق في النباتات المتسلقة',
    questionText: 'يا مستر، لو المحلاق لم يجد الدعامة المناسبة في وقت محدد، ما مصير الأنسجة الدعامية بداخله ولماذا يذبل ويموت تحديداً؟',
    replyText: 'أهلاً يا أحمد يا بطل! إذا لم يجد المحلاق الدعامة يذبل ويموت لعدم حدوث التباين في سرعة النمو بين جانبي المحلاق، فتتوقف الأوكسينات عن التوزيع المناسب ويتصلب دون تثبيت. استمع للريكورد الصوتي للتفاصيل الدقيقة.',
    repliedBy: 'مستر عمار رزق 🧬',
    replyVoiceNote: {
      url: 'https://actions.google.com/sounds/v1/science/ambience_laboratory.ogg',
      durationSec: 84,
      durationLabel: '01:24',
    },
    replyImageUrl: '/images/teacher-circle.png',
    isPublicApproved: false,
  },
  {
    id: 'fp-private-2',
    authorName: 'أحمد محمد العوضي (أنا)',
    authorGrade: 'الصف الثالث الثانوي',
    isMine: true,
    timeAgo: 'منذ 30 دقيقة',
    createdAt: '30 أكتوبر 2026 - 02:00 م',
    status: 'pending',
    questionTitle: 'استفسار عن عدد أزواج الضلوع العائمة المتصلة بالفقرات',
    questionText: 'هل الزوج رقم 11 و 12 متصلان من الخلف بنتوءات الفقرات المستعرضة أم بأجسام الفقرات فقط؟',
    isPublicApproved: false,
  },
  {
    id: 'fp-public-1',
    authorName: 'سارة خالد - أسيوط',
    authorGrade: 'الصف الثالث الثانوي',
    isMine: false,
    timeAgo: 'أمس',
    createdAt: '29 أكتوبر 2026 - 04:15 م',
    status: 'answered',
    questionTitle: 'مسألة حسابية: عدد عظام الهيكل المحوري عند طفل حديث الولادة مقارنة ببالغ',
    questionText: 'لماذا يكون عدد عظام الطفل أكثر من 206 عظمة بينما البالغ 206 فقط؟ وما أشهر أمثلة العظام التي تلتحم؟',
    replyText: 'سؤال ممتاز ومن الأسئلة المفضلة في الامتحانات! الطفل يولد ولديه أكثر من 270 عظمة، ومع النمو تلتحم عظام الجمجمة وعظام الحزام الحوضي (الحرقفة والورك والعانة تلتحم لتصبح عظمة واحدة) وعظام الفقرات العجزية والعصعصية لتصل إلى 206 عظمة صلبة في الإنسان البالغ.',
    repliedBy: 'مستر عمار رزق 🧬',
    replyVoiceNote: {
      url: 'https://actions.google.com/sounds/v1/science/ambience_laboratory.ogg',
      durationSec: 110,
      durationLabel: '01:50',
    },
    isPublicApproved: true,
  },
  {
    id: 'fp-public-2',
    authorName: 'محمد ياسين - الإسكندرية',
    authorGrade: 'الصف الثالث الثانوي',
    isMine: false,
    timeAgo: 'منذ يومين',
    createdAt: '28 أكتوبر 2026 - 11:00 ص',
    status: 'answered',
    questionTitle: 'ما الفرق الدقيق بين الرباط والوتر من حيث درجات المرونة؟',
    questionText: 'هل الأربطة أكثر مرونة أم الأوتار؟ ولماذا صُمم وتر أخيل بقوة شد عالية بدلاً من المرونة الزائدة؟',
    replyText: 'الأربطة تتمتع بدرجة عالية من المرونة لتسمح بزيادة حركة المفصل قليلاً وتمنع تمزقه أثناء الحركة المفاجئة، بينما الأوتار تتميز بالقوة والمتانة العالية مع مرونة أقل لتنقل قوة انقباض العضلة إلى العظمة فوراً وبدون فقد للطاقة الحركية.',
    repliedBy: 'مستر عمار رزق 🧬',
    isPublicApproved: true,
  },
];
