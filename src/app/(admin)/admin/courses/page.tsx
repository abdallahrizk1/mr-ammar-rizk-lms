'use client';

import React, { useState } from 'react';
import { CourseBuilder } from '@/features/admin/CourseBuilder';
import { ModuleAndLectureManager } from '@/features/admin/ModuleAndLectureManager';
import { LessonItemManager } from '@/features/admin/LessonItemManager';
import type { AdminCourse, AdminLesson } from '@/features/admin/admin-types';

export default function AdminCoursesPage() {
  const [selectedCourse, setSelectedCourse] = useState<AdminCourse | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<AdminLesson | null>(null);

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          باني الكورسات والمناهج الدراسية 🧬
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-teal-200/70">
          إضافة وتسمية الكورسات، تنظيم الأبواب، ربط الكورس الشامل، وإدارة عناصر المحاضرات
        </p>
      </div>

      {/* 1. Courses List & Creator */}
      <CourseBuilder
        selectedCourseId={selectedCourse?.id}
        onSelectCourse={(course) => {
          setSelectedCourse(course);
          setSelectedLesson(null);
        }}
      />

      {/* 2. Modules and Lessons for Selected Course */}
      {selectedCourse && (
        <div className="pt-4 border-t border-slate-200 dark:border-teal-500/20">
          <ModuleAndLectureManager
            course={selectedCourse}
            selectedLessonId={selectedLesson?.id}
            onSelectLesson={(lesson) => setSelectedLesson(lesson)}
          />
        </div>
      )}

      {/* 3. Lesson Items for Selected Lesson */}
      {selectedLesson && (
        <div className="pt-4 border-t border-slate-200 dark:border-teal-500/20">
          <LessonItemManager lesson={selectedLesson} />
        </div>
      )}
    </div>
  );
}
