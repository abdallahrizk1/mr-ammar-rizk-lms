'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { ChevronRight, X, Layers } from 'lucide-react';
import { CourseHeader } from '@/features/courses/CourseHeader';
import { LectureItem } from '@/features/courses/LectureItem';
import { QuizPreCardModal } from '@/features/courses/QuizPreCardModal';
import { PdfViewerModal } from '@/features/courses/PdfViewerModal';
import { CrossPlatformHlsPlayer } from '@/features/video-player/CrossPlatformHlsPlayer';
import { SAMPLE_COURSES } from '@/lib/data/courses-data';
import { LectureMaterials, CourseItem, CourseModule } from '@/lib/data/courses-types';
import {
  getStoredExamSubmissions,
  recordWatchHistory,
} from '@/lib/utils/student-storage';

interface PageProps {
  params: { courseId: string } | Promise<{ courseId: string }>;
}

export default function CourseDetailPage({ params }: PageProps) {
  const resolvedParams = params && typeof (params as any)?.then === 'function' ? use(params as any) : (params as any) || {};
  const courseId = resolvedParams.courseId;

  const course: CourseItem =
    SAMPLE_COURSES.find((c) => c.id === courseId) || SAMPLE_COURSES[0];

  const [submissions, setSubmissions] = useState(() => getStoredExamSubmissions());

  // Modals state
  const [activeVideo, setActiveVideo] = useState<{
    hlsUrl: string;
    title: string;
    lessonId: string;
  } | null>(null);

  const [activePdf, setActivePdf] = useState<{
    title: string;
    pagesCount: number;
  } | null>(null);

  const [activeQuizLecture, setActiveQuizLecture] = useState<LectureMaterials | null>(null);

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

      // Sequential 50% Lock: Lecture 1 is open; Lecture 2+ requires previous quiz & hw to pass >= 50%
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
        quiz: {
          ...orig.quiz,
          isPassed: isQuizPassed,
          studentScore: subQ ? subQ.score : orig.quiz.studentScore,
        },
        homework: {
          ...orig.homework,
          isSubmitted: isHwSubmitted,
          studentScore: subHw ? subHw.score : orig.homework.studentScore,
        },
      });
    }

    return { ...mod, lectures: dynamicLectures };
  });

  const handlePlayVideo = (hlsUrl: string, title: string, lessonId: string) => {
    recordWatchHistory({
      id: `watch-${lessonId}-${Date.now()}`,
      videoTitle: title,
      courseTitle: course.title,
      watchDuration: 'مشاهدة نشطة',
      watchDate: 'اليوم',
    });
    setActiveVideo({ hlsUrl, title, lessonId });
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-teal-300/70">
        <Link href="/courses" prefetch={false} className="hover:text-bio-teal dark:hover:text-emerald-400">
          الكورسات
        </Link>
        <ChevronRight className="h-3.5 w-3.5 rotate-180" />
        <span className="font-bold text-slate-900 dark:text-white line-clamp-1">
          {course.title}
        </span>
      </nav>

      {/* Course Header Banner */}
      <CourseHeader course={course} />

      {/* Dynamic Curriculum / Lectures Tree */}
      <div className="space-y-4">
        {modules.map((mod) => (
          <div
            key={mod.id}
            className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-5 shadow-sm dark:border-teal-500/20 dark:bg-[#091D20] space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-teal-500/15">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-bio-teal/10 dark:bg-emerald-500/10 text-bio-teal dark:text-emerald-400">
                  <Layers className="h-4 w-4" />
                </div>
                <h2 className="text-xs sm:text-sm font-black text-slate-900 dark:text-emerald-300">
                  {mod.title}
                </h2>
              </div>
              <span className="text-[11px] font-bold text-slate-400">
                {mod.lectures.length} محاضرات
              </span>
            </div>

            {/* List of Lectures */}
            <div className="space-y-3">
              {mod.lectures.map((lecture) => (
                <LectureItem
                  key={lecture.id}
                  courseId={course.id}
                  lecture={lecture}
                  onPlayVideo={handlePlayVideo}
                  onOpenPdf={(title, pagesCount) =>
                    setActivePdf({ title, pagesCount })
                  }
                  onOpenQuizModal={(lec) => setActiveQuizLecture(lec)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Video Player Modal (HLS with showWatermark=false default and 3s position save) */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4" dir="ltr">
          <div className="flex flex-col w-full max-w-4xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-slate-800 text-white" dir="rtl">
              <span className="text-xs sm:text-sm font-bold line-clamp-1">
                🎬 {activeVideo.title}
              </span>
              <button
                type="button"
                onClick={() => setActiveVideo(null)}
                className="rounded-xl p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-2 sm:p-3 bg-black">
              <CrossPlatformHlsPlayer
                lessonId={activeVideo.lessonId}
                manifestUrl={activeVideo.hlsUrl}
                showWatermark={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* PDF Viewer Modal */}
      {activePdf && (
        <PdfViewerModal
          title={activePdf.title}
          pagesCount={activePdf.pagesCount}
          onClose={() => setActivePdf(null)}
        />
      )}

      {/* Quiz Pre-Exam Info Card Modal */}
      {activeQuizLecture && (
        <QuizPreCardModal
          courseId={course.id}
          lecture={activeQuizLecture}
          onClose={() => setActiveQuizLecture(null)}
        />
      )}
    </div>
  );
}
