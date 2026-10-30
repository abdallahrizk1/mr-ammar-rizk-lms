'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { ChevronRight, Layers, ArrowRight, Maximize2, Minimize2, Sparkles } from 'lucide-react';
import { CourseHeader } from '@/features/courses/CourseHeader';
import { LectureItem } from '@/features/courses/LectureItem';
import { QuizPreCardModal } from '@/features/courses/QuizPreCardModal';
import { PdfViewerModal } from '@/features/courses/PdfViewerModal';
import { CrossPlatformHlsPlayer } from '@/features/video-player/CrossPlatformHlsPlayer';
import { InAppNotificationBanner, InAppNotification } from '@/components/ui/InAppNotificationBanner';
import { SAMPLE_COURSES } from '@/lib/data/courses-data';
import { LectureMaterials, CourseItem, CourseModule } from '@/lib/data/courses-types';
import { getStoredExamSubmissions, recordWatchHistory } from '@/lib/utils/student-storage';

interface PageProps {
  params: { courseId: string } | Promise<{ courseId: string }>;
}

export default function CourseDetailPage({ params }: PageProps) {
  const resolvedParams = params && typeof (params as any)?.then === 'function' ? use(params as any) : (params as any) || {};
  const courseId = resolvedParams.courseId;
  const course: CourseItem = SAMPLE_COURSES.find((c) => c.id === courseId) || SAMPLE_COURSES[0];

  const [submissions, setSubmissions] = useState(() => getStoredExamSubmissions());
  const [activeVideo, setActiveVideo] = useState<{ hlsUrl: string; title: string; lessonId: string } | null>(null);
  const [isCinemaWide, setIsCinemaWide] = useState(false);
  const [activePdf, setActivePdf] = useState<{ title: string; pagesCount: number } | null>(null);
  const [activeQuizLecture, setActiveQuizLecture] = useState<LectureMaterials | null>(null);
  const [notification, setNotification] = useState<InAppNotification | null>(null);

  const showToast = (title: string, subtitle?: string) => {
    setNotification({ title, subtitle, type: 'success' });
    setTimeout(() => setNotification(null), 4000);
  };

  React.useEffect(() => {
    setSubmissions(getStoredExamSubmissions());
  }, []);

  const rawModules = course.modules && course.modules.length > 0 ? course.modules : SAMPLE_COURSES[0].modules;

  // Dynamically compute sequential 50% lock and solution unlock based on submissions
  const modules: CourseModule[] = rawModules.map((mod) => {
    const dynamicLectures: LectureMaterials[] = [];
    for (let i = 0; i < mod.lectures.length; i++) {
      const orig = mod.lectures[i];
      const subQ = submissions[orig.quiz.id];
      const subHw = submissions[orig.homework.id];
      const isQuizPassed = subQ ? subQ.isPassed : orig.quiz.isPassed;
      const isHwSubmitted = subHw ? true : orig.homework.isSubmitted;

      let isUnlocked = orig.isUnlocked;
      if (i === 0) {
        isUnlocked = true;
      } else {
        const prev = dynamicLectures[i - 1];
        isUnlocked = !!(prev && prev.quiz.isPassed && prev.homework.isSubmitted);
      }

      dynamicLectures.push({
        ...orig,
        isUnlocked,
        quiz: { ...orig.quiz, isPassed: isQuizPassed, studentScore: subQ ? subQ.score : orig.quiz.studentScore },
        homework: { ...orig.homework, isSubmitted: isHwSubmitted, studentScore: subHw ? subHw.score : orig.homework.studentScore },
      });
    }
    return { ...mod, lectures: dynamicLectures };
  });

  const handlePlayVideo = (hlsUrl: string, title: string, lessonId: string) => {
    recordWatchHistory({
      id: `watch-${lessonId}-${Date.now()}`,
      videoTitle: title,
      courseTitle: course.title,
      watchDuration: '00:20 ثانية (فيديو تجريبي)',
      watchDate: 'اليوم',
    });
    setActiveVideo({ hlsUrl, title, lessonId });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-4" dir="rtl">
      <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-teal-300/70">
        <Link href="/courses" prefetch={false} className="hover:text-bio-teal dark:hover:text-emerald-400">الكورسات</Link>
        <ChevronRight className="h-3.5 w-3.5 rotate-180" />
        <span className="font-bold text-slate-900 dark:text-white line-clamp-1">{course.title}</span>
      </nav>

      {activeVideo ? (
        <div className="rounded-3xl border border-teal-500/30 bg-[#061517] p-3 sm:p-5 shadow-2xl space-y-4 text-white">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-teal-500/20 pb-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <button type="button" onClick={() => setActiveVideo(null)} className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs font-bold text-white transition active:scale-95 shrink-0">
                <ArrowRight className="h-4 w-4" /><span>العودة للمحاضرات</span>
              </button>
              <h2 className="text-xs sm:text-base font-black text-emerald-300 truncate">🎬 {activeVideo.title}</h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-bold text-emerald-300">
                <Sparkles className="h-3 w-3" /><span>مشغل احترافي متعدد السرعات والجودات</span>
              </span>
              <button type="button" onClick={() => setIsCinemaWide((w) => !w)} className="inline-flex items-center gap-1 rounded-xl border border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/20 px-2.5 py-1.5 text-xs font-bold text-teal-200 transition">
                {isCinemaWide ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                <span>{isCinemaWide ? 'الحجم القياسي' : 'وضع السينما العريض'}</span>
              </button>
            </div>
          </div>

          <div className={`mx-auto w-full transition-all ${isCinemaWide ? 'max-w-full' : 'max-w-4xl'}`}>
            <CrossPlatformHlsPlayer
              lessonId={activeVideo.lessonId}
              manifestUrl={activeVideo.hlsUrl}
              title={activeVideo.title}
              showWatermark={false}
              onLessonComplete={() => showToast('أحسنت! أتممت مشاهدة الفيديو بنجاح 👏', 'تم تسجيل المشاهدة في سجل مشاهداتك')}
            />
          </div>
        </div>
      ) : (
        <CourseHeader course={course} />
      )}

      <div className="space-y-4">
        {modules.map((mod) => (
          <div key={mod.id} className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-5 shadow-sm dark:border-teal-500/20 dark:bg-[#091D20] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-teal-500/15">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-bio-teal/10 dark:bg-emerald-500/10 text-bio-teal dark:text-emerald-400">
                  <Layers className="h-4 w-4" />
                </div>
                <h2 className="text-xs sm:text-sm font-black text-slate-900 dark:text-emerald-300">{mod.title}</h2>
              </div>
              <span className="text-[11px] font-bold text-slate-400">{mod.lectures.length} محاضرات</span>
            </div>

            <div className="space-y-3">
              {mod.lectures.map((lecture) => (
                <LectureItem
                  key={lecture.id}
                  courseId={course.id}
                  lecture={lecture}
                  onPlayVideo={handlePlayVideo}
                  onOpenPdf={(title, pagesCount) => setActivePdf({ title, pagesCount })}
                  onOpenQuizModal={(lec) => setActiveQuizLecture(lec)}
                  onNotify={(msg) => showToast(msg)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {activePdf && (
        <PdfViewerModal title={activePdf.title} pagesCount={activePdf.pagesCount} onClose={() => setActivePdf(null)} onNotify={(msg) => showToast(msg)} />
      )}

      {activeQuizLecture && (
        <QuizPreCardModal courseId={course.id} lecture={activeQuizLecture} onClose={() => setActiveQuizLecture(null)} />
      )}

      <InAppNotificationBanner notification={notification} onDismiss={() => setNotification(null)} />
    </div>
  );
}
