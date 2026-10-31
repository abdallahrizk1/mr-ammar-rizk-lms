'use client';

import React, { useState, useEffect } from 'react';
import { FolderPlus, Link as LinkIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { AdminCourse, AdminModule, AdminLesson } from './admin-types';
import { ModuleModals } from './ModuleModals';
import { ModuleAccordionItem } from './ModuleAccordionItem';

interface ModuleAndLectureManagerProps {
  course: AdminCourse;
  onSelectLesson: (lesson: AdminLesson) => void;
  selectedLessonId?: string;
}

export function ModuleAndLectureManager({
  course,
  onSelectLesson,
  selectedLessonId,
}: ModuleAndLectureManagerProps) {
  const [modules, setModules] = useState<AdminModule[]>([]);
  const [lessonsMap, setLessonsMap] = useState<Record<string, AdminLesson[]>>({});
  const [availableModules, setAvailableModules] = useState<AdminModule[]>([]);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  const [isNewModuleModalOpen, setIsNewModuleModalOpen] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [isLinkModuleModalOpen, setIsLinkModuleModalOpen] = useState(false);
  const [selectedModuleToLink, setSelectedModuleToLink] = useState('');

  const [isNewLessonModalOpen, setIsNewLessonModalOpen] = useState(false);
  const [activeModuleIdForLesson, setActiveModuleIdForLesson] = useState<string>('');
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [passPercent, setPassPercent] = useState('50');

  const fetchCourseModulesAndLessons = async () => {
    try {
      const supabase = createClient();
      // Fetch modules mapped to this course via course_modules_map
      const { data: mapData } = await supabase
        .from('course_modules_map')
        .select('sort_order, modules(id, title, created_at)')
        .eq('course_id', course.id)
        .order('sort_order', { ascending: true });

      if (mapData) {
        const mods: AdminModule[] = mapData
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((m: any, idx: number) => ({
            id: m.modules?.id,
            title: m.modules?.title,
            sort_order: m.sort_order ?? idx + 1,
          }))
          .filter((m) => !!m.id);

        setModules(mods);

        // Auto-expand all modules
        const expanded: Record<string, boolean> = {};
        mods.forEach((m) => (expanded[m.id] = true));
        setExpandedModules(expanded);

        // Fetch lessons for each module
        const modIds = mods.map((m) => m.id);
        if (modIds.length > 0) {
          const { data: lessonsData } = await supabase
            .from('lessons')
            .select('*')
            .in('module_id', modIds)
            .is('deleted_at', null)
            .order('sort_order', { ascending: true });

          if (lessonsData) {
            const mapped: Record<string, AdminLesson[]> = {};
            lessonsData.forEach((l) => {
              if (!mapped[l.module_id]) mapped[l.module_id] = [];
              mapped[l.module_id].push(l);
            });
            setLessonsMap(mapped);
          }
        }
      }
    } catch {}
  };

  useEffect(() => {
    fetchCourseModulesAndLessons();
  }, [course.id]);

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;
    try {
      const supabase = createClient();
      const { data: mod } = await supabase
        .from('modules')
        .insert({ title: newModuleTitle.trim() })
        .select()
        .single();

      if (mod) {
        await supabase.from('course_modules_map').insert({
          course_id: course.id,
          module_id: mod.id,
          sort_order: modules.length + 1,
        });
        setNewModuleTitle('');
        setIsNewModuleModalOpen(false);
        fetchCourseModulesAndLessons();
      }
    } catch {}
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLessonTitle.trim() || !activeModuleIdForLesson) return;
    try {
      const supabase = createClient();
      const currentLessons = lessonsMap[activeModuleIdForLesson] || [];
      const { data: lesson } = await supabase
        .from('lessons')
        .insert({
          module_id: activeModuleIdForLesson,
          title: newLessonTitle.trim(),
          required_pass_percentage: Number(passPercent) || 50,
          sort_order: currentLessons.length + 1,
        })
        .select()
        .single();

      if (lesson) {
        setNewLessonTitle('');
        setIsNewLessonModalOpen(false);
        fetchCourseModulesAndLessons();
        onSelectLesson(lesson);
      }
    } catch {}
  };

  const handleLinkExistingModule = async () => {
    if (!selectedModuleToLink) return;
    try {
      const supabase = createClient();
      await supabase.from('course_modules_map').insert({
        course_id: course.id,
        module_id: selectedModuleToLink,
        sort_order: modules.length + 1,
      });
      setIsLinkModuleModalOpen(false);
      fetchCourseModulesAndLessons();
    } catch {}
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-teal-500/20 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>الأبواب والمحاضرات للكورس:</span>
            <span className="text-bio-teal dark:text-emerald-400 font-black">{course.title}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-teal-200/60 mt-0.5">
            نسبة النجاح الافتراضية لفتح المحاضرة التالية: 50%
          </p>
        </div>

        <div className="flex items-center gap-2">
          {course.is_bundle && (
            <button
              type="button"
              onClick={async () => {
                const sb = createClient();
                const { data } = await sb.from('modules').select('*');
                if (data) setAvailableModules(data);
                setIsLinkModuleModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-bold hover:bg-amber-500/20 transition"
            >
              <LinkIcon className="h-3.5 w-3.5" />
              <span>ربط باب موجود للكورس الشامل</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsNewModuleModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-emerald-600 text-white text-xs font-bold hover:bg-slate-800 transition"
          >
            <FolderPlus className="h-3.5 w-3.5" />
            <span>إنشاء باب جديد</span>
          </button>
        </div>
      </div>

      {modules.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-xs text-slate-500 dark:border-teal-500/20">
          لم يتم إضافة أي أبواب لهذا الكورس حتى الآن. أضف باباً أو أسبوعاً جديداً للبدء.
        </div>
      ) : (
        <div className="space-y-3">
          {modules.map((m, idx) => (
            <ModuleAccordionItem
              key={m.id}
              module={m}
              index={idx}
              lessons={lessonsMap[m.id] || []}
              isExpanded={expandedModules[m.id] !== false}
              selectedLessonId={selectedLessonId}
              onToggleExpand={() =>
                setExpandedModules((prev) => ({ ...prev, [m.id]: !(prev[m.id] !== false) }))
              }
              onAddLesson={() => {
                setActiveModuleIdForLesson(m.id);
                setIsNewLessonModalOpen(true);
              }}
              onSelectLesson={onSelectLesson}
            />
          ))}
        </div>
      )}

      {/* Modals Container */}
      <ModuleModals
        isNewModuleModalOpen={isNewModuleModalOpen}
        setIsNewModuleModalOpen={setIsNewModuleModalOpen}
        newModuleTitle={newModuleTitle}
        setNewModuleTitle={setNewModuleTitle}
        handleCreateModule={handleCreateModule}
        isNewLessonModalOpen={isNewLessonModalOpen}
        setIsNewLessonModalOpen={setIsNewLessonModalOpen}
        newLessonTitle={newLessonTitle}
        setNewLessonTitle={setNewLessonTitle}
        passPercent={passPercent}
        setPassPercent={setPassPercent}
        handleCreateLesson={handleCreateLesson}
        isLinkModuleModalOpen={isLinkModuleModalOpen}
        setIsLinkModuleModalOpen={setIsLinkModuleModalOpen}
        selectedModuleToLink={selectedModuleToLink}
        setSelectedModuleToLink={setSelectedModuleToLink}
        availableModules={availableModules}
        handleLinkExistingModule={handleLinkExistingModule}
      />
    </div>
  );
}
