'use client';

import React, { useState } from 'react';
import { Users, MessageCircle, Send, CheckCircle2 } from 'lucide-react';

const INITIAL_POSTS = [
  {
    id: 'p1',
    author: 'أحمد طارق - الصف الثالث الثانوي',
    time: 'منذ ساعة',
    question: 'ما الفرق الجوهري بين الدعامة الفسيولوجية والدعامة التركيبية في النبات من حيث الدوام؟',
    reply: 'الدعامة الفسيولوجية مؤقتة تعتمد على امتلاء الفجوة العصارية بالماء بالخاصية الأسموزية، بينما التركيبية دائمة تعتمد على ترسيب مواد صلبة كاللجنين والسيوبرين والكيوتين.',
    repliedBy: 'مستر عمار رزق 🧬',
  },
  {
    id: 'p2',
    author: 'مريم محمود - الصف الثالث الثانوي',
    time: 'منذ 3 ساعات',
    question: 'هل الفقرات العجزية والفقرات العصعصية تتصل ببعضها بمفاصل غضروفية؟',
    reply: 'لا، الفقرات العجزية (5 فقرات) والفقرات العصعصية (4 فقرات) هي فقرات ملتحمة تماماً ولا توجد بينها أقراص غضروفية.',
    repliedBy: 'إشراف المادة العلمي',
  },
];

export default function StudentForumPage() {
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [newQuestion, setNewQuestion] = useState('');
  const [submittedNotice, setSubmittedNotice] = useState(false);

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    setPosts((prev) => [
      {
        id: String(Date.now()),
        author: 'طالب منصة عمار رزق',
        time: 'الآن',
        question: newQuestion.trim(),
        reply: 'تم استلام سؤالك العلمي وسيقوم مستر عمار أو الفريق العلمي بالرد عليك قريباً.',
        repliedBy: 'النظام التلقائي',
      },
      ...prev,
    ]);
    setNewQuestion('');
    setSubmittedNotice(true);
    setTimeout(() => setSubmittedNotice(false), 3000);
  };

  return (
    <div className="space-y-3 sm:space-y-4" dir="rtl">
      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-sm dark:border-teal-500/20 dark:bg-[#091D20]">
        <h1 className="text-sm sm:text-base font-black text-slate-900 dark:text-emerald-300 flex items-center gap-2">
          <Users className="h-4 w-4 text-bio-teal dark:text-emerald-400" />
          <span>منتدى النقاش والأسئلة العلمية</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-teal-200/60 mt-0.5">
          اطرح سؤالك في مادة الأحياء ليجيبك مستر عمار رزق والمساعدون العلميون
        </p>

        <form onSubmit={handleAddQuestion} className="mt-3 flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="اكتب سؤالك العلمي هنا بوضوح..."
            className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-bio-teal focus:outline-none dark:border-teal-500/30 dark:bg-[#071719] dark:text-white"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-bio-teal dark:bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-bio-deep dark:hover:bg-emerald-500 active:scale-95"
          >
            <Send className="h-3.5 w-3.5" />
            <span>إرسال السؤال</span>
          </button>
        </form>

        {submittedNotice && (
          <div className="mt-2.5 flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            <span>تم نشر سؤالك في المنتدى بنجاح!</span>
          </div>
        )}
      </div>

      <div className="space-y-2.5">
        {posts.map((post) => (
          <div
            key={post.id}
            className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-teal-500/20 dark:bg-[#091D20] space-y-2"
          >
            <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-teal-300/60">
              <span className="font-bold text-slate-700 dark:text-slate-200">{post.author}</span>
              <span>{post.time}</span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              ❓ {post.question}
            </p>
            <div className="rounded-xl bg-slate-50 dark:bg-[#071719] border border-slate-200/70 dark:border-teal-500/15 p-2.5 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-1.5 font-bold text-bio-teal dark:text-emerald-400 mb-1">
                <MessageCircle className="h-3.5 w-3.5" />
                <span>{post.repliedBy}</span>
              </div>
              <p className="leading-relaxed">{post.reply}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
