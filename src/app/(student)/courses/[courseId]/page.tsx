'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ChevronRight, Layers, ArrowRight, BookOpen } from 'lucide-react';
import { CourseHeader } from '@/features/courses/CourseHeader';
import { LectureItem } from '@/features/courses/LectureItem';
import { QuizPreCardModal } from '@/features/courses/QuizPreCardModal';
import { PdfViewerModal } from '@/features/courses/PdfViewerModal';
import { CrossPlatformHlsPlayer } from '@/features/video-player/CrossPlatformHlsPlayer';
import { InAppNotificationBanner, InAppNotification } from '@/components/ui/InAppNotificationBanner';
import { CourseItem, CourseModule, LectureMaterials } from '@/lib/data/courses-types';
import { SAMPLE_COURSES } from '@/lib/data/courses-data';
import { mapTreeDataToModules } from '@/features/courses/course-tree-mapper';
import { createClient } from '@/lib/supabase/client';
import { recordWatchHistory, getStoredExamSubmissions } from '@/lib/utils/student-storage';

interface PageProps {
  params: { courseId: string } | Promise<{ courseId: string }>;
}

export default function CourseDetailPage({ params }: PageProps) {
  const resolvedParams = params && typeof (params as any)?.then === 'function' ? use(params as any) : (params as any) || {};
  const courseId = resolvedParams.courseId;

  const [course, setCourse] = useState<CourseItem | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeVideo, setActiveVideo] = useState<{ hlsUrl: string; title: string; lessonId: string } | null>(null);
  const [activePdf, setActivePdf] = useState<{ title: string; pagesCount: number } | null>(null);
  const [activeQuizLecture, setActiveQuizLecture] = useState<LectureMaterials | null>(null);
  const [notification, setNotification] = useState<InAppNotification | null>(null);

  const showToast = (title: string, subtitle?: string) => {
    setNotification({ title, subtitle, type: 'success' });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchCourseAndTree = async () => {
    setIsLoading(true);
    if (!courseId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(courseId)) {
      const sample = SAMPLE_COURSES.find((c) => c.id === courseId) || SAMPLE_COURSES[0];
      setCourse(sample);
      setModules(sample.modules || []);
      setIsLoading(false);
      return;
    }
    try {
      const supabase = createClient();
      const [courseRes, treeRes] = await Promise.all([
        supabase.from('courses').select('*').eq('id', courseId).single(),
        supabase.rpc('get_course_tree_with_locks', { p_course_id: courseId }),
      ]);

      if (courseRes.data) {
        const c = courseRes.data;
        setCourse({
          id: c.id,
          title: c.title,
          tagline: c.description || 'منهج الأحياء للثانوية العامة 2027',
          description: c.description || '',
          grade: `الصف ${c.grade_level} الثانوي`,
          price: c.price,
          priceFormatted: c.price === 0 ? 'مجاني' : `${c.price} ج.م`,
          isComprehensive: !!c.is_bundle,
          isEnrolled: true,
          isTemporary: false,
          progress: 0,
          bannerImage: c.thumbnail_url || '/images/teacher-circle.png',
          lecturesCount: 0,
          modules: [],
        });
      }

      if (Array.isArray(treeRes.data)) {
        const raw = mapTreeDataToModules(treeRes.data);
        const submissions = getStoredExamSubmissions();
        const computed = raw.map((mod) => {
          const dynamicLectures: LectureMaterials[] = [];
          for (let i = 0; i < mod.lectures.length; i++) {
            const orig = mod.lectures[i];
            const subQ = submissions[orig.quiz.id];
            const subHw = submissions[orig.homework.id];
            const isQuizPassed = subQ ? subQ.isPassed : orig.quiz.isPassed;
            const isHwSubmitted = subHw ? true : orig.homework.isSubmitted;
            const prev = dynamicLectures[i - 1];
            const isUnlocked = i === 0 || !!(prev && prev.quiz.isPassed && prev.homework.isSubmitted);
            dynamicLectures.push({
              ...orig,
              isUnlocked,
              quiz: { ...orig.quiz, isPassed: isQuizPassed },
              homework: { ...orig.homework, isSubmitted: isHwSubmitted },
            });
          }
          return { ...mod, lectures: dynamicLectures };
        });
        setModules(computed);
      }
    } catch {}
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCourseAndTree();
  }, [courseId]);

  const handlePlayVideo = async (hlsUrl: string, title: string, lessonId: string) => {
    let resolvedUrl = hlsUrl;
    if (hlsUrl && !hlsUrl.includes('/') && hlsUrl.length > 20) {
      try {
        const supabase = createClient();
        const { data } = await supabase.rpc('get_authorized_lesson_item_content', { p_item_id: hlsUrl });
        if (data?.r2_path_or_url) resolvedUrl = data.r2_path_or_url;
      } catch {}
    }

    recordWatchHistory({
      id: `watch-${lessonId}-${Date.now()}`,
      videoTitle: title,
      courseTitle: course?.title || 'كورس الأحياء',
      watchDuration: 'مشاهدة مستمرة',
      watchDate: 'اليوم',
    });
    setActiveVideo({ hlsUrl: resolvedUrl, title, lessonId });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center" dir="rtl">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-bio-teal border-t-transparent mx-auto mb-3" />
        <span className="text-xs font-bold text-slate-500">جارٍ تحميل شجرة المحاضرات...</span>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-8 text-center text-slate-500 rounded-2xl bg-white dark:bg-[#091D20]" dir="rtl">
        <BookOpen className="h-10 w-10 mx-auto mb-2 text-slate-300" />
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">الكورس غير موجود أو تم إخفاؤه</h3>
        <Link href="/courses" prefetch={false} className="mt-3 inline-block text-xs font-bold text-bio-teal">العودة لدليل الكورسات</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-teal-300/70">
        <Link href="/courses" prefetch={false} className="hover:text-bio-teal dark:hover:text-emerald-400">الكورسات</Link>
        <ChevronRight className="h-3.5 w-3.5 rotate-180" />
        <span className="font-bold text-slate-900 dark:text-white line-clamp-1">{course.title}</span>
      </nav>

      {activeVideo ? (
        <div className="rounded-2xl sm:rounded-3xl border border-teal-500/30 bg-[#061517] p-1 sm:p-5 shadow-2xl space-y-2.5 sm:space-y-4 text-white">
          <div className="flex items-center justify-between gap-2 border-b border-teal-500/20 pb-2 sm:pb-3 px-1 sm:px-0">
            <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
              <button
                type="button"
                onClick={() => setActiveVideo(null)}
                className="inline-flex items-center gap-1 sm:gap-1.5 rounded-lg sm:rounded-xl bg-white/10 hover:bg-white/20 px-2 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold text-white transition active:scale-95 shrink-0"
              >
                <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">العودة للمحاضرات</span>
                <span className="sm:hidden">العودة</span>
              </button>
              <h2 className="text-xs sm:text-base font-black text-emerald-300 truncate">🎬 {activeVideo.title}</h2>
            </div>
          </div>

          <div className="mx-auto w-full max-w-5xl">
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

      {modules.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 dark:border-teal-500/20 dark:bg-[#091D20]">
          <BookOpen className="h-10 w-10 mx-auto mb-2 text-bio-teal/40 dark:text-emerald-400/40" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">سيتم نشر الأبواب والمحاضرات قريباً 🧬</h3>
          <p className="text-xs text-slate-400 mt-1">يقوم مستر عمار بإعداد هذا الكورس بأعلى المعايير</p>
        </div>
      ) : (
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
      )}

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

