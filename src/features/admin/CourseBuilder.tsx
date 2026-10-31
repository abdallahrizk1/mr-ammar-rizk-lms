'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Layers, BookOpen, RefreshCw } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { AdminCourse } from './admin-types';
import { CourseModal } from './CourseModal';
import { CourseCard } from './CourseCard';

interface CourseBuilderProps {
  onSelectCourse: (course: AdminCourse) => void;
  selectedCourseId?: string;
}

export function CourseBuilder({ onSelectCourse, selectedCourseId }: CourseBuilderProps) {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<AdminCourse | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('350');
  const [gradeLevel, setGradeLevel] = useState('3');
  const [educationType, setEducationType] = useState('general');
  const [validityDays, setValidityDays] = useState('180');
  const [isBundle, setIsBundle] = useState(false);
  const [bannerImageUrl, setBannerImageUrl] = useState('/images/teacher-circle.png');
  const [isSaving, setIsSaving] = useState(false);

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setCourses(data);
        if (data.length > 0 && !selectedCourseId) {
          onSelectCourse(data[0]);
        }
      }
    } catch {}
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const openCreateModal = () => {
    setEditingCourse(null);
    setTitle('');
    setDescription('');
    setPrice('350');
    setGradeLevel('3');
    setEducationType('general');
    setValidityDays('180');
    setIsBundle(false);
    setBannerImageUrl('/images/teacher-circle.png');
    setIsModalOpen(true);
  };

  const openEditModal = (c: AdminCourse) => {
    setEditingCourse(c);
    setTitle(c.title);
    setDescription(c.description || '');
    setPrice(String(c.price));
    setGradeLevel(c.grade_level);
    setEducationType(c.education_type);
    setValidityDays(String(c.validity_days));
    setIsBundle(c.is_bundle);
    setBannerImageUrl(c.thumbnail_url || c.banner_image_url || '/images/teacher-circle.png');
    setIsModalOpen(true);
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSaving(true);
    try {
      const supabase = createClient();
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        price: Number(price) || 0,
        grade_level: gradeLevel,
        education_type: educationType,
        validity_days: Number(validityDays) || 180,
        is_bundle: isBundle,
        thumbnail_url: bannerImageUrl.trim() || null,
        is_published: true,
      };

      if (editingCourse) {
        const { data, error } = await supabase
          .from('courses')
          .update(payload)
          .eq('id', editingCourse.id)
          .select()
          .single();

        if (!error && data) {
          setCourses((prev) => prev.map((c) => (c.id === data.id ? data : c)));
          onSelectCourse(data);
        }
      } else {
        const { data, error } = await supabase
          .from('courses')
          .insert(payload)
          .select()
          .single();

        if (!error && data) {
          setCourses((prev) => [data, ...prev]);
          onSelectCourse(data);
        }
      }
      setIsModalOpen(false);
    } catch {}
    setIsSaving(false);
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      const supabase = createClient();
      await supabase.from('courses').update({ deleted_at: new Date().toISOString() }).eq('id', courseId);
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
    } catch {}
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-bio-teal dark:text-emerald-400" />
          <span>قائمة الكورسات التعليمية</span>
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchCourses}
            className="p-2 rounded-xl border border-slate-200 dark:border-teal-500/20 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-[#071719]"
            title="تحديث"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-bio-teal dark:bg-emerald-600 text-white text-xs sm:text-sm font-bold shadow-sm hover:bg-bio-deep dark:hover:bg-emerald-500 transition active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>إضافة كورس جديد</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-xs font-bold text-slate-500">جارٍ تحميل الكورسات...</div>
      ) : courses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-teal-500/30">
          <Layers className="mx-auto h-8 w-8 text-slate-400 dark:text-teal-400 mb-2" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">لا توجد كورسات مضافة حتى الآن</p>
          <p className="text-xs text-slate-500 mt-1">ابدأ بإضافة أول كورس لدفعة 2027 عبر الزر أعلاه</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {courses.map((c) => (
            <CourseCard
              key={c.id}
              course={c}
              isSelected={selectedCourseId === c.id}
              onSelect={() => onSelectCourse(c)}
              onEdit={() => openEditModal(c)}
              onDelete={() => handleDeleteCourse(c.id)}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <CourseModal
        isOpen={isModalOpen}
        editingCourse={editingCourse}
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        price={price}
        setPrice={setPrice}
        gradeLevel={gradeLevel}
        setGradeLevel={setGradeLevel}
        educationType={educationType}
        setEducationType={setEducationType}
        validityDays={validityDays}
        setValidityDays={setValidityDays}
        isBundle={isBundle}
        setIsBundle={setIsBundle}
        isSaving={isSaving}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCourse}
      />
    </div>
  );
}
