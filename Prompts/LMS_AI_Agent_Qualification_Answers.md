# 🏛️ الإجابة الهندسية الشاملة لاختبار الكفاءة المعمارية (LMS AI Readiness & Competency Audit)

تمت قراءة واستيعاب وثيقة المواصفات الهندسية المعمارية `Lms Ai Agent Master Spec And Test.txt` بنسبة 100%، والالتزام الصارم بالتعليمات الواردة بعدم كتابة أي كود تطبيقي في هذه المرحلة.

فيما يلي الإجابات الهندسية التفصيلية والمقتطفات البرمجية الدقيقة للاختبارات الـ 10 الإجبارية:

---

## 1️⃣ اختبار منع انفجار الـ Requests في الداشبورد (Anti-Request Waterfall)

### أ. المعمارية الهندسية لتجميع الشاشة في Request واحد فقط
بدلاً من تقسيم صفحة "داشبورد الطالب الرئيسية" إلى 6 مكونات فرعية يرسل كل منها طلب `SELECT` منفصل داخل `useEffect` (وهو ما يسبب `Request Waterfall` يستنزف اتصالات `Supabase`)، نطبق المعمارية التالية:
1. **دالة PostgreSQL RPC تجميعية واحدة (`get_student_dashboard_data`)**:
   - تستخرج هوية الطالب من التوكن مباشرة عبر `auth.uid()` وتُرجع كائن `JSONB` واحد يضم الـ 6 أقسام كاملة في استعلام داخلي واحد على السيرفر:
     1. بيانات الطالب وحالة مراجعة الحساب (`profile`).
     2. كورسات الطالب المشترك بها مع تطبيق منطق **الكورس الشامل (`Unified Bundle View`)** لإخفاء الأبواب الفردية المكررة (`enrolled_courses`).
     3. آخر محاضرة توقف عندها الطالب ونسبة الإنجاز (`recent_video_progress`).
     4. آخر نتائج الامتحانات والواجبات (`recent_exam_attempts`).
     5. عدد الإشعارات غير المقروءة مقارنة بـ `last_notifications_read_at` وآخر الإشعارات (`notifications_summary`).
     6. إحصائيات الطالب العامة (`student_stats`).
2. **إعدادات الـ Caching الصارمة (React Query) وعزل الأخطاء**:
   - يتم ضبط `staleTime: 5 * 60 * 1000` (5 دقائق كاملة)، و`refetchOnWindowFocus: false`، و`refetchOnReconnect: false`.
   - الصفحة تستدعي الـ `RPC` مرة واحدة فقط وتمرر البيانات للمكعبات الفرعية عبر `Props`، مع إحاطة كل مكعب بـ `<GranularErrorBoundary>` لمنع سقوط الصفحة بالكامل إذا حدث خطأ عارض في أحد المكعبات.
3. **التعامل مع مكون `<Link>` في القائمة الجانبية والعلوية**:
   - إضافة الخاصية `prefetch={false}` إجبارياً على كافة مكونات `<Link>` لمنع `Next.js App Router` من إرسال طلبات `RSC Prefetch` خلفية لكل روابط القائمة بمجرد فتح الداشبورد.

### ب. الكود التوضيحي (`SQL RPC` + `React Query Caching` + `Sidebar <Link prefetch={false}>`)

```sql
-- 1. دالة PostgreSQL RPC تجمع الـ 6 أقسام لداشبورد الطالب في Request واحد فقط
CREATE OR REPLACE FUNCTION public.get_student_dashboard_data()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student_id UUID := auth.uid();
  v_profile RECORD;
  v_result JSONB;
BEGIN
  IF v_student_id IS NULL THEN
    RAISE EXCEPTION 'UNAUTHORIZED: يجب تسجيل الدخول أولاً';
  END IF;

  SELECT id, full_name, phone, parent_phone, grade_id, review_status,
         last_notifications_read_at, created_at
  INTO v_profile
  FROM public.profiles
  WHERE id = v_student_id AND deleted_at IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'PROFILE_NOT_FOUND';
  END IF;

  SELECT jsonb_build_object(
    -- (1) بيانات البروفايل وحالة المراجعة (24-48 ساعة)
    'profile', jsonb_build_object(
      'id', v_profile.id,
      'full_name', v_profile.full_name,
      'phone', v_profile.phone,
      'grade_id', v_profile.grade_id,
      'review_status', v_profile.review_status
    ),

    -- (2) الكورسات المشترك بها مع تطبيق Unified Bundle View (إخفاء الأبواب الفردية المضمنة في كورس شامل مشترك به الطالب)
    'enrolled_courses', COALESCE((
      SELECT jsonb_agg(course_item ORDER BY course_item.enrolled_at DESC)
      FROM (
        SELECT
          c.id,
          c.title,
          c.thumbnail_url,
          c.is_bundle,
          ce.enrolled_at,
          ce.is_temporary_activation
        FROM public.course_enrollments ce
        JOIN public.courses c ON c.id = ce.course_id
        WHERE ce.student_id = v_student_id
          AND ce.status = 'active'
          AND c.deleted_at IS NULL
          AND NOT (
            c.is_bundle = false AND EXISTS (
              SELECT 1
              FROM public.course_enrollments ce_b
              JOIN public.courses cb ON cb.id = ce_b.course_id AND cb.is_bundle = true AND cb.deleted_at IS NULL
              JOIN public.course_modules_map cmm_b ON cmm_b.course_id = cb.id
              JOIN public.course_modules_map cmm_s ON cmm_s.course_id = c.id
              WHERE ce_b.student_id = v_student_id
                AND ce_b.status = 'active'
                AND cmm_b.module_id = cmm_s.module_id
            )
          )
      ) course_item
    ), '[]'::jsonb),

    -- (3) تقدم الفيديوهات (آخر المحاضرات المكتملة)
    'recent_video_progress', COALESCE((
      SELECT jsonb_agg(vp_row)
      FROM (
        SELECT l.id AS lesson_id, l.title AS lesson_title, lc.completed_at
        FROM public.lesson_completions lc
        JOIN public.lessons l ON l.id = lc.lesson_id AND l.deleted_at IS NULL
        WHERE lc.student_id = v_student_id
        ORDER BY lc.completed_at DESC
        LIMIT 5
      ) vp_row
    ), '[]'::jsonb),

    -- (4) آخر نتائج الامتحانات والواجبات
    'recent_exam_attempts', COALESCE((
      SELECT jsonb_agg(ea_row)
      FROM (
        SELECT
          ea.id AS attempt_id,
          e.title AS exam_title,
          e.exam_type,
          ea.score,
          ea.score_percentage,
          ea.submitted_at
        FROM public.exam_attempts ea
        JOIN public.exams e ON e.id = ea.exam_id AND e.deleted_at IS NULL
        WHERE ea.student_id = v_student_id
          AND ea.status = 'submitted'
        ORDER BY ea.submitted_at DESC
        LIMIT 5
      ) ea_row
    ), '[]'::jsonb),

    -- (5) ملخص الإشعارات غير المقروءة
    'notifications_summary', (
      SELECT jsonb_build_object(
        'unread_count', COUNT(*) FILTER (
          WHERE n.created_at > COALESCE(v_profile.last_notifications_read_at, v_profile.created_at)
        )::INT,
        'latest_notification', (
          SELECT jsonb_build_object(
            'id', n2.id,
            'title', n2.title,
            'body', n2.body,
            'created_at', n2.created_at,
            'is_read', (n2.created_at <= COALESCE(v_profile.last_notifications_read_at, v_profile.created_at))
          )
          FROM public.notifications n2
          WHERE (
            n2.target_type = 'all'
            OR (n2.target_type = 'grade' AND n2.target_grade_id = v_profile.grade_id)
            OR (n2.target_type = 'student' AND n2.target_student_id = v_student_id)
            OR (n2.target_type = 'course' AND EXISTS (
              SELECT 1 FROM public.course_enrollments ce2
              WHERE ce2.student_id = v_student_id
                AND ce2.course_id = n2.target_course_id
                AND ce2.status = 'active'
            ))
          )
          ORDER BY n2.created_at DESC
          LIMIT 1
        )
      )
      FROM public.notifications n
      WHERE (
        n.target_type = 'all'
        OR (n.target_type = 'grade' AND n.target_grade_id = v_profile.grade_id)
        OR (n.target_type = 'student' AND n.target_student_id = v_student_id)
        OR (n.target_type = 'course' AND EXISTS (
          SELECT 1 FROM public.course_enrollments ce
          WHERE ce.student_id = v_student_id
            AND ce.course_id = n.target_course_id
            AND ce.status = 'active'
        ))
      )
    ),

    -- (6) إحصائيات الطالب المجمعة
    'student_stats', jsonb_build_object(
      'completed_lessons_count', (
        SELECT COUNT(*)::INT FROM public.lesson_completions WHERE student_id = v_student_id
      ),
      'mistakes_count', (
        SELECT COUNT(*)::INT FROM public.student_mistakes_bank WHERE student_id = v_student_id
      )
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;
```

```tsx
// 2. استدعاء الداشبورد بـ Request واحد + إعدادات الكاش الصارمة + القائمة الجانبية بدون Prefetch
'use client';

import Link from 'next/link';
import { QueryClient, useQuery } from '@tanstack/react-query';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { GranularErrorBoundary } from '@/components/ui/GranularErrorBoundary';

// إعدادات الكاش العامة لمنع إعادة الجلب التلقائي عند التركيز
export function createLmsQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 دقائق كاملة
        refetchOnWindowFocus: false, // منع إعادة الجلب عند التنقل بين التابات
        refetchOnReconnect: false,
        retry: 1,
      },
    },
  });
}

export function useStudentDashboardData() {
  const supabase = createBrowserSupabaseClient();

  return useQuery({
    queryKey: ['student-dashboard-rpc'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_student_dashboard_data');
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// التعامل مع مكون <Link> في القائمة الجانبية (إيقاف الـ Prefetch العشوائي تماماً)
const NAV_LINKS = [
  { href: '/dashboard', label: 'الرئيسية' },
  { href: '/my-courses', label: 'كورساتي' },
  { href: '/forum', label: 'المنتدى' },
  { href: '/account', label: 'حسابي' },
] as const;

export function StudentSidebar() {
  return (
    <aside className="w-64 shrink-0 border-l border-slate-200 dark:border-slate-800">
      <nav className="flex flex-col gap-2 p-4">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            prefetch={false} // إجباري لمنع إرسال طلبات RSC خلفية لصفحات لم يضغط عليها الطالب
            className="rounded-xl px-4 py-3 text-base font-medium transition hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
```

---

## 2️⃣ اختبار مشغل الفيديو على الآيفون (iOS Safari) مقابل الأندرويد والويندوز

### أ. المعمارية الهندسية للمشغل الهجين (Cross-Platform HLS Player)
1. **تشغيل موحد لفولدر الـ HLS (`.m3u8` + `.ts segments`)**:
   - **على الآيفون (iOS Safari)**: نفحص الجهاز والمتصفح؛ إذا كان `iOS Safari` (أو يدعم `application/vnd.apple.mpegurl` أصلياً)، نمرر رابط الـ `.m3u8` مباشرة إلى عنصر `<video playsInline>` الأصلي (`Native HLS`) بدون `hls.js`.
   - **على الأندرويد والويندوز (`Hls.isSupported()`)**: نشغل البث عبر `hls.js` مع ضبط `backBufferLength: 60` و `maxBufferHole: 0.5` لمنع التعليق عند القفز أو التقديم والتأخير أو تسريع الفيديو.
2. **زرار تكبير الشاشة (Fullscreen) بدون فشل على الآيفون**:
   - على الكمبيوتر والأندرويد: نكبر الحاوية الأب (`containerRef.current.requestFullscreen()`) لكي تبقى العلامة المائية المتحركة (`Dynamic Watermark`) وأزرار التحكم المخصصة ظاهرة داخل وضع ملء الشاشة.
   - على الآيفون (iOS Safari): دالة `requestFullscreen()` غير مدعومة على عناصر `<div>` في الآيفون، لذا نستدعي `video.webkitEnterFullscreen()` مباشرة على عنصر الـ `<video>`.
3. **حفظ مكان التوقف بدون Requests**:
   - يتم عمل `Overwrite` لنفس المفتاح في `localStorage` كل 3 ثوانٍ بدون إرسال أي طلب للسيرفر، ولا يُرسل للسيرفر سوى `Request` واحد فقط عند إتمام المحاضرة.

### ب. الكود التوضيحي (`React / TypeScript Snippet`)

```tsx
'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import Hls from 'hls.js';

interface CrossPlatformHlsPlayerProps {
  lessonId: string;
  manifestUrl: string; // رابط .m3u8 محمي بـ Signed Token عبر Cloudflare Worker
  studentName: string;
  studentPhone: string;
  onLessonComplete: (lessonId: string) => void;
}

type IOSHTMLVideoElement = HTMLVideoElement & {
  webkitEnterFullscreen?: () => void;
  webkitExitFullscreen?: () => void;
  webkitDisplayingFullscreen?: boolean;
};

export function CrossPlatformHlsPlayer({
  lessonId,
  manifestUrl,
  studentName,
  studentPhone,
  onLessonComplete,
}: CrossPlatformHlsPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<IOSHTMLVideoElement | null>(null);
  const lastSavedAtRef = useRef<number>(0);
  const completionSentRef = useRef<boolean>(false);
  const storageKey = `lms_lesson_pos_${lessonId}`;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;

    // كشف أجهزة iOS (iPhone / iPad / iPod) لتمرير .m3u8 مباشرة لـ Native HLS
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    const restorePlaybackPosition = () => {
      const savedSeconds = Number(localStorage.getItem(storageKey) || '0');
      if (savedSeconds > 0 && Number.isFinite(savedSeconds)) {
        video.currentTime = savedSeconds;
      }
    };

    if (isIOSDevice && video.canPlayType('application/vnd.apple.mpegurl')) {
      // 1. الآيفون (iOS Safari): تشغيل Native HLS مباشرة بدون hls.js
      video.src = manifestUrl;
      video.addEventListener('loadedmetadata', restorePlaybackPosition, { once: true });
    } else if (Hls.isSupported()) {
      // 2. الأندرويد والويندوز: تشغيل عبر hls.js مع إعدادات الـ Buffer الصارمة
      hls = new Hls({
        backBufferLength: 60, // الاحتفاظ بـ 60 ثانية في الذاكرة الخلفية لمنع إعادة التحميل عند الرجوع
        maxBufferHole: 0.5,   // تخطي الفجوات الصغيرة لمنع التعليق عند التقديم والتأخير أو التسريع
        enableWorker: true,
      });

      hls.loadSource(manifestUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        restorePlaybackPosition();
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls?.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls?.recoverMediaError();
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Fallback لمتصفح Safari على macOS
      video.src = manifestUrl;
      video.addEventListener('loadedmetadata', restorePlaybackPosition, { once: true });
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [manifestUrl, storageKey]);

  // حفظ الثانية الحالية في localStorage كل 3 ثوانٍ بعملية Overwrite لنفس المفتاح بدون أي Request
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const now = Date.now();
    if (now - lastSavedAtRef.current >= 3000) {
      localStorage.setItem(storageKey, String(Math.floor(video.currentTime)));
      lastSavedAtRef.current = now;
    }
  }, [storageKey]);

  // كود زرار تكبير الشاشة (Fullscreen) الذي يعمل على الآيفون والأندرويد والكمبيوتر بدون فشل
  const handleFullscreenToggle = useCallback(async () => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video) return;

    try {
      // الخروج من وضع ملء الشاشة القياسي إن كان مفعلاً
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }

      // الخروج من وضع ملء الشاشة الخاص بـ iOS إن كان مفعلاً
      if (video.webkitDisplayingFullscreen && typeof video.webkitExitFullscreen === 'function') {
        video.webkitExitFullscreen();
        return;
      }

      // للأندرويد والكمبيوتر: تكبير حاوية المشغل بالكامل لبقاء العلامة المائية وأزرار التحكم
      if (typeof container.requestFullscreen === 'function') {
        await container.requestFullscreen();
        return;
      }

      // للآيفون (iOS Safari): استدعاء webkitEnterFullscreen مباشرة على عنصر <video>
      if (typeof video.webkitEnterFullscreen === 'function') {
        video.webkitEnterFullscreen();
      }
    } catch {
      // Fallback فوري للآيفون إذا رفض المتصفح requestFullscreen على الحاوية
      if (typeof video.webkitEnterFullscreen === 'function') {
        video.webkitEnterFullscreen();
      }
    }
  }, []);

  return (
    // إجبار المشغل على dir="ltr" ليعمل شريط التقديم من اليسار لليمين بشكل صحيح داخل موقع RTL
    <div
      ref={containerRef}
      dir="ltr"
      className="relative w-full overflow-hidden rounded-2xl bg-black select-none"
    >
      <video
        ref={videoRef}
        playsInline
        webkit-playsinline="true"
        controlsList="nodownload"
        onContextMenu={(e) => e.preventDefault()}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => {
          if (!completionSentRef.current) {
            completionSentRef.current = true;
            onLessonComplete(lessonId); // Request واحد فقط عند إتمام المحاضرة
          }
        }}
        className="aspect-video w-full"
      />

      {/* علامة مائية متحركة شفافة برقم واسم الطالب */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <span className="animate-watermark absolute top-6 left-6 rounded bg-black/35 px-2.5 py-1 text-xs font-semibold text-white/45">
          {studentName} • {studentPhone}
        </span>
      </div>

      {/* شريط التحكم المتجاوب */}
      <div className="flex items-center justify-between bg-slate-900/95 px-4 py-2.5 text-white">
        <button
          type="button"
          onClick={handleFullscreenToggle}
          className="rounded-lg bg-white/10 px-3 py-1.5 text-sm font-medium hover:bg-white/20"
        >
          تكبير الشاشة ⛶
        </button>
      </div>
    </div>
  );
}
```

---

## 3️⃣ اختبار منع التضارب اللحظي في أكواد الشحن (Race Condition)

### أ. المعمارية الهندسية للقفل الذري (Pessimistic Row-Level Lock)
عندما يدخل طالبان نفس كود الشحن في نفس الجزء من الثانية (`Microsecond Race Condition`)، فإن استخدام `SELECT` عادي ثم `UPDATE` منفصل سيؤدي لتفعيل الكود مرتين. الحل الحاسم هو تنفيذ العملية بالكامل داخل دالة `PostgreSQL (plpgsql)` واحدة تستخدم `SELECT ... FOR UPDATE`:
1. أول طلب يصل إلى السطر `FOR UPDATE` يحصل على قفل حصري (`Row-Level Exclusive Lock`) على صف الكود في جدول `activation_codes`.
2. الطلب الثاني المتزامن يُجبر على الانتظار على مستوى محرك `PostgreSQL` حتى ينهي الطلب الأول الـ `Transaction` (`COMMIT`).
3. بمجرد انتهاء الطلب الأول، يقرأ الطلب الثاني الحالة المحدثة للصف (`is_used = true`) فيرفض العملية فوراً برسالة `CODE_ALREADY_USED`.
4. كما تقوم الدالة بتحويل الأرقام العربية/الهندية إلى إنجليزية وحذف المسافات الزائدة تلقائياً قبل البحث.

### ب. الكود التوضيحي (`PostgreSQL plpgsql Function`)

```sql
CREATE OR REPLACE FUNCTION public.redeem_activation_code(p_raw_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student_id UUID := auth.uid();
  v_normalized_code TEXT;
  v_code_row RECORD;
BEGIN
  IF v_student_id IS NULL THEN
    RAISE EXCEPTION 'UNAUTHORIZED: يجب تسجيل الدخول أولاً';
  END IF;

  -- 1. تنظيف الكود وتحويل الأرقام العربية/الهندية إلى إنجليزية وحذف المسافات
  v_normalized_code := UPPER(
    REGEXP_REPLACE(
      TRANSLATE(
        COALESCE(p_raw_code, ''),
        '٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹',
        '01234567890123456789'
      ),
      '\s+',
      '',
      'g'
    )
  );

  IF v_normalized_code = '' THEN
    RAISE EXCEPTION 'INVALID_CODE: الرجاء إدخال كود شحن صحيح';
  END IF;

  -- 2. قفل الصف ذرياً (FOR UPDATE) لمنع أي طالب آخر من قراءة/تعديل نفس الكود في نفس اللحظة
  SELECT id, course_id, is_used, used_by, expires_at, price_amount
  INTO v_code_row
  FROM public.activation_codes
  WHERE code = v_normalized_code
    AND deleted_at IS NULL
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'INVALID_CODE: كود الشحن غير صحيح';
  END IF;

  -- 3. التحقق من عدم استخدام الكود (سواء قديماً أو من الطلب المتزامن الذي سبقنا بجزء من الثانية)
  IF v_code_row.is_used = true OR v_code_row.used_by IS NOT NULL THEN
    RAISE EXCEPTION 'CODE_ALREADY_USED: تم استخدام كود الشحن هذا مسبقاً';
  END IF;

  -- 4. التحقق من صلاحية الكود الزمنية
  IF v_code_row.expires_at IS NOT NULL AND v_code_row.expires_at < NOW() THEN
    RAISE EXCEPTION 'CODE_EXPIRED: انتهت صلاحية كود الشحن';
  END IF;

  -- 5. التأكد من أن الطالب غير مشترك بالفعل في نفس الكورس
  IF EXISTS (
    SELECT 1
    FROM public.course_enrollments
    WHERE student_id = v_student_id
      AND course_id = v_code_row.course_id
      AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'ALREADY_ENROLLED: أنت مشترك بالفعل في هذا الكورس';
  END IF;

  -- 6. تحديث حالة الكود إلى مستخدم داخل نفس الـ Transaction الذري
  UPDATE public.activation_codes
  SET is_used = true,
      used_by = v_student_id,
      used_at = NOW()
  WHERE id = v_code_row.id;

  -- 7. تفعيل اشتراك الكورس للطالب ذرياً
  INSERT INTO public.course_enrollments (
    student_id,
    course_id,
    enrollment_method,
    activation_code_id,
    is_temporary_activation,
    status,
    enrolled_at
  )
  VALUES (
    v_student_id,
    v_code_row.course_id,
    'center_code',
    v_code_row.id,
    false,
    'active',
    NOW()
  )
  ON CONFLICT (student_id, course_id)
  DO UPDATE SET
    status = 'active',
    enrollment_method = 'center_code',
    activation_code_id = v_code_row.id,
    is_temporary_activation = false,
    enrolled_at = NOW();

  -- 8. تسجيل الفاتورة النصية الدائمة في سجل فواتير الطالب
  INSERT INTO public.student_invoices (
    student_id,
    course_id,
    payment_method,
    amount,
    reference_number,
    status,
    created_at
  )
  VALUES (
    v_student_id,
    v_code_row.course_id,
    'center_code',
    v_code_row.price_amount,
    v_normalized_code,
    'approved',
    NOW()
  );

  RETURN jsonb_build_object(
    'success', true,
    'course_id', v_code_row.course_id
  );
END;
$$;
```

---

## 4️⃣ اختبار حماية الباك إند ضد المتلاعبين بالـ API (الصور والمنتدى)

### أ. المعمارية الهندسية للحماية متعددة الطبقات (Server + Database Defense-in-Depth)
إذا تخطى طالب يفهم في البرمجة واجهة المتصفح (`<canvas>` WebP compression) واستخدم `Postman` مباشرة:
1. **على مستوى الباك إند (Edge Route Handler / Server Action) قبل الرفع إلى R2**:
   - لا نثق في `file.type` أو الامتداد أو أي رقم حجم يرسله العميل في `JSON`.
   - يستقبل السيرفر الملف الفعلي، ويتحقق من `buffer.byteLength <= 500 * 1024` (500KB كحد أقصى صارم)، ويفحص الـ **Magic Bytes** الحقيقية في أول 12 بايت للتأكد من أنها صورة WebP حقيقية: البايتات 0..3 تساوي `RIFF` (`52 49 46 46`) والبايتات 8..11 تساوي `WEBP` (`57 45 42 50`). أي ملف 10MB أو ملف تنفيذي متنكر يُرفض فوراً في الذاكرة قبل لمس `Cloudflare R2`.
2. **على مستوى قاعدة البيانات (PostgreSQL Triggers + Transaction Advisory Locks)**:
   - حتى لو أرسل المهاجم 50 طلباً متوازياً في نفس الثانية عبر `Postman`، تستخدم دوال الـ `BEFORE INSERT Trigger` قفل `pg_advisory_xact_lock` مخصص لمعرف الطالب لتسلسل طلباته (`Serialize`)، وتفرض:
     - **قاعدة الإيصالات**: أقصى حد **3 إيصالات خلال آخر ساعة (1 hour)**، مع فحص `instant_activation_banned`، وفرض قيد `UNIQUE` على `reference_number` لمنع تكرار نفس رقم العملية المرجعي.
     - **قاعدة المنتدى**: أقصى حد **5 أسئلة خلال آخر 24 ساعة (24 hours)** لكل طالب.

### ب. الكود التوضيحي (`Server Magic Bytes & Size Validator` + `PostgreSQL Rate-Limit Triggers`)

```ts
// 1. فحص حجم الصورة الفعلي (<= 500KB) وفحص الـ Magic Bytes في الباك إند قبل الرفع لـ R2
// المسار: src/lib/server/image-security.ts
import 'server-only';

const MAX_WEBP_SIZE_BYTES = 500 * 1024; // 500 KB كحد أقصى صارم

export async function validateUploadedWebpFile(file: File): Promise<Uint8Array> {
  // رفض فوري لأي ملف يتجاوز 500KB قبل قراءة محتواه بالكامل
  if (!file || file.size === 0 || file.size > MAX_WEBP_SIZE_BYTES) {
    throw new Error('PAYLOAD_TOO_LARGE: حجم الصورة يتجاوز الحد الأقصى المسموح (500KB)');
  }

  const buffer = new Uint8Array(await file.arrayBuffer());

  if (buffer.byteLength > MAX_WEBP_SIZE_BYTES || buffer.byteLength < 12) {
    throw new Error('INVALID_IMAGE_SIZE: حجم ملف الصورة غير صالح');
  }

  // فحص الـ Magic Bytes الحقيقية لصيغة WebP:
  // Bytes 0..3 === "RIFF" (0x52, 0x49, 0x46, 0x46)
  // Bytes 8..11 === "WEBP" (0x57, 0x45, 0x42, 0x50)
  const isRiffHeader =
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46;

  const isWebpSignature =
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50;

  if (!isRiffHeader || !isWebpSignature) {
    throw new Error('INVALID_MAGIC_BYTES: الملف المرفوع ليس صورة WebP حقيقية');
  }

  return buffer;
}
```

```sql
-- 2. قيود الداتابيز الصارمة (Triggers) لفرض 3 إيصالات/ساعة و 5 أسئلة منتدى/24 ساعة

-- ضمان عدم تكرار رقم العملية المرجعي للإيصال
ALTER TABLE public.payment_receipts
  ADD CONSTRAINT uq_payment_receipts_reference_number UNIQUE (reference_number);

-- أ) Trigger حماية رفع الإيصالات (بحد أقصى 3 إيصالات في الساعة + حجم <= 500KB)
CREATE OR REPLACE FUNCTION public.enforce_payment_receipt_limits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_id UUID := auth.uid();
  v_hourly_count INT;
  v_is_banned BOOLEAN;
BEGIN
  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'UNAUTHORIZED';
  END IF;

  -- إجبار student_id على مطابقة هوية صاحب الـ JWT لمنع التزوير عبر Postman
  NEW.student_id := v_actor_id;

  -- قفل ذري لمعاملات هذا الطالب لمنع إرسال 50 طلباً متوازياً في نفس اللحظة
  PERFORM pg_advisory_xact_lock(hashtext('receipt_rate_limit_' || v_actor_id::text));

  IF NEW.file_size_bytes IS NULL OR NEW.file_size_bytes <= 0 OR NEW.file_size_bytes > 512000 THEN
    RAISE EXCEPTION 'IMAGE_TOO_LARGE: حجم صورة الإيصال يجب ألا يتجاوز 500 كيلوبايت';
  END IF;

  SELECT COUNT(*)
  INTO v_hourly_count
  FROM public.payment_receipts
  WHERE student_id = v_actor_id
    AND created_at > (NOW() - INTERVAL '1 hour');

  IF v_hourly_count >= 3 THEN
    RAISE EXCEPTION 'RECEIPT_RATE_LIMIT: لقد تجاوزت الحد المسموح (3 إيصالات كحد أقصى في الساعة)';
  END IF;

  -- التحقق مما إذا كان الطالب محظوراً من التفعيل المؤقت الفوري بسبب تلاعب سابق
  SELECT COALESCE(instant_activation_banned, false)
  INTO v_is_banned
  FROM public.profiles
  WHERE id = v_actor_id;

  IF v_is_banned THEN
    NEW.grant_instant_access := false;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_enforce_payment_receipt_limits
BEFORE INSERT ON public.payment_receipts
FOR EACH ROW EXECUTE FUNCTION public.enforce_payment_receipt_limits();

-- ب) Trigger حماية المنتدى (بحد أقصى 5 أسئلة كل 24 ساعة لكل طالب)
CREATE OR REPLACE FUNCTION public.enforce_forum_question_limits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_id UUID := auth.uid();
  v_daily_count INT;
BEGIN
  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'UNAUTHORIZED';
  END IF;

  NEW.student_id := v_actor_id;

  -- قفل ذري لمنع الهجوم المتوازي عبر Postman
  PERFORM pg_advisory_xact_lock(hashtext('forum_rate_limit_' || v_actor_id::text));

  SELECT COUNT(*)
  INTO v_daily_count
  FROM public.forum_questions
  WHERE student_id = v_actor_id
    AND created_at > (NOW() - INTERVAL '24 hours');

  IF v_daily_count >= 5 THEN
    RAISE EXCEPTION 'FORUM_RATE_LIMIT: لا يمكنك إرسال أكثر من 5 أسئلة خلال 24 ساعة';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_enforce_forum_question_limits
BEFORE INSERT ON public.forum_questions
FOR EACH ROW EXECUTE FUNCTION public.enforce_forum_question_limits();
```

---

## 5️⃣ اختبار التوافق مع Cloudflare Edge Runtime وعزل المفاتيح السرية

### أ. لماذا يفشل `@aws-sdk/client-s3` غالباً على Cloudflare Edge؟
1. **الاعتماد على وحدات Node.js غير المتوفرة في V8 Isolates**: مكتبة `@aws-sdk/client-s3` تعتمد داخلياً على حزم خاصة بـ Node.js (مثل `http`, `https`, `fs`, `stream`, و`Node XML parsers`) غير الموجودة في بيئة `Cloudflare Workers / Edge Runtime`.
2. **تجاوز حجم الـ Worker Bundle**: حجم الحزمة ضخم جداً ويرهق حدود حجم الكود وزمن الـ Cold Start على `Cloudflare Workers`.

### ب. المكتبة البديلة وعزل المفاتيح السرية برمجياً
1. **المكتبة البديلة**: نستخدم مكتبة **`aws4fetch`** الخفيفة جداً، لأنها مبنية بالكامل على المعايير القياسية لبيئة الـ Edge (`fetch` و `Web Crypto API` عبر `crypto.subtle`).
2. **ضمان استحالة تسرب R2_SECRET_ACCESS_KEY إلى متصفح الطالب**:
   - نضع كود التوقيع داخل المسار `src/lib/server/r2-presign.ts` ونبدأ الملف بالسطر الإجباري `import 'server-only';`. إذا حاول أي مكون `Client Component` استيراد هذا الملف بالخطأ، تفشل عملية الـ Build في `Next.js` فوراً.
   - لا نستخدم البادئة `NEXT_PUBLIC_` نهائياً مع مفاتيح `R2_SECRET_ACCESS_KEY` أو `SUPABASE_SERVICE_ROLE_KEY`.

### ج. الكود التوضيحي (Presigned URL بصلاحية 4 ساعات = 14400s عبر aws4fetch)

```ts
// المسار: src/lib/server/r2-presign.ts
import 'server-only'; // ضمان حاسم: يفشل الـ Build فوراً لو تم استيراد الملف داخل أي Client Component
import { AwsClient } from 'aws4fetch';

const FOUR_HOURS_IN_SECONDS = 14400; // 4 ساعات (14400 ثانية) لرفع فولدرات HLS (.m3u8 + .ts)

function createR2EdgeClient(): AwsClient {
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accessKeyId || !secretAccessKey) {
    throw new Error('R2_SERVER_CREDENTIALS_MISSING');
  }

  return new AwsClient({
    accessKeyId,
    secretAccessKey,
    service: 's3',
    region: 'auto',
  });
}

export async function createR2UploadPresignedUrl(params: {
  objectKey: string;
  contentType: string;
}): Promise<string> {
  const accountId = process.env.R2_ACCOUNT_ID;
  const bucketName = process.env.R2_BUCKET_NAME;

  if (!accountId || !bucketName) {
    throw new Error('R2_BUCKET_CONFIG_MISSING');
  }

  const r2Client = createR2EdgeClient();
  const endpointUrl = new URL(
    `https://${accountId}.r2.cloudflarestorage.com/${bucketName}/${params.objectKey}`
  );

  // تحديد صلاحية الرابط المؤقت بـ 4 ساعات (14400 ثانية)
  endpointUrl.searchParams.set('X-Amz-Expires', String(FOUR_HOURS_IN_SECONDS));

  const signedRequest = await r2Client.sign(
    new Request(endpointUrl.toString(), {
      method: 'PUT',
      headers: {
        'Content-Type': params.contentType,
      },
    }),
    {
      aws: { signQuery: true },
    }
  );

  return signedRequest.url;
}
```

---

## 6️⃣ اختبار الكورس الشامل (الباقات) والغلق التسلسلي بـ 50%

### أ. المعمارية الهندسية لربط الأبواب (Unified Bundle View) وحساب الأقفال 🔒
1. **منع رفع الفيديوهات مرتين وعرض كارت واحد للطالب**:
   - نفصل جدول الكورسات (`courses`) عن جدول الأبواب (`modules`)، ونربط بينهما عبر جدول وسيط `course_modules_map (course_id, module_id, sort_order)`.
   - المحاضرات (`lessons`) وعناصرها (`lesson_items`) تتبع للـ `module_id`. عند إنشاء "كورس شامل" (`is_bundle = true`)، يربط المدرس الأبواب الموجودة مسبقاً في `course_modules_map` دون إعادة رفع أي فيديو أو امتحان، ويظهر للطالب في "كورساتي" **كارت واحد فقط** بداخله الأبواب مرتبة.
2. **حساب حالة القفل للمحاضرات (Sequential Locking) ولفيديوهات الحل (unlock_after_exam_id)**:
   - **شرط الاشتراك والجدولة**: يتحقق السيرفر أولاً من أن الطالب مشترك فعلياً (`status = 'active'`) في الكورس، وأن وقت جدولة المحاضرة (`publish_at` بتوقيت `Africa/Cairo`) قد حلّ.
   - **المحاضرة الأولى (`global_seq = 1`)**: مفتوحة تلقائياً للمشتركين.
   - **المحاضرة الثانية وما بعدها**: مقفولة بـ 🔒، ولا تفتح إلا بوجود استثناء يدوي في `manual_lesson_unlocks`، أو بتسليم كويز وواجب المحاضرة السابقة في الترتيب وتحقيق `score_percentage >= prev_required_pass_pct` (الافتراضي 50%).
   - **فيديوهات وملفات الحل**: ترتبط بعمود `unlock_after_exam_id` وتفتح فوراً بمجرد وجود محاولة مُسلَّمة (`status = 'submitted'`) للطالب في الكويز/الواجب المرتبط.

### ب. الكود التوضيحي (`SQL Schema` + `RPC` لحساب شجرة الكورس والأقفال)

```sql
CREATE TABLE public.course_modules_map (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  sort_order INT NOT NULL DEFAULT 1,
  UNIQUE (course_id, module_id)
);

CREATE OR REPLACE FUNCTION public.get_course_tree_with_locks(p_course_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student_id UUID := auth.uid();
  v_is_enrolled BOOLEAN := false;
  v_result JSONB;
BEGIN
  IF v_student_id IS NULL THEN RAISE EXCEPTION 'UNAUTHORIZED'; END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.course_enrollments ce
    WHERE ce.student_id = v_student_id AND ce.course_id = p_course_id AND ce.status = 'active'
  ) OR COALESCE((auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'assistant'), false)
  INTO v_is_enrolled;

  WITH ordered_lessons AS (
    SELECT
      cmm.module_id,
      m.title AS module_title,
      cmm.sort_order AS module_order,
      l.id AS lesson_id,
      l.title AS lesson_title,
      l.sort_order AS lesson_order,
      l.publish_at,
      ROW_NUMBER() OVER (ORDER BY cmm.sort_order ASC, l.sort_order ASC) AS global_seq,
      LAG(l.id) OVER (ORDER BY cmm.sort_order ASC, l.sort_order ASC) AS prev_lesson_id,
      LAG(COALESCE(l.required_pass_percentage, 50)) OVER (ORDER BY cmm.sort_order ASC, l.sort_order ASC) AS prev_required_pass_pct
    FROM public.course_modules_map cmm
    JOIN public.modules m ON m.id = cmm.module_id AND m.deleted_at IS NULL
    JOIN public.lessons l ON l.module_id = m.id AND l.deleted_at IS NULL
    WHERE cmm.course_id = p_course_id
  ),
  evaluated_lessons AS (
    SELECT
      ol.*,
      CASE
        WHEN NOT v_is_enrolled THEN false
        WHEN ol.publish_at IS NOT NULL AND ol.publish_at > NOW() AND NOT EXISTS (\n          SELECT 1 FROM public.manual_lesson_unlocks mlu
          WHERE mlu.student_id = v_student_id AND mlu.lesson_id = ol.lesson_id
        ) THEN false
        WHEN EXISTS (
          SELECT 1 FROM public.manual_lesson_unlocks mlu
          WHERE mlu.student_id = v_student_id AND mlu.lesson_id = ol.lesson_id
        ) THEN true
        WHEN ol.global_seq = 1 THEN true
        WHEN NOT EXISTS (
          SELECT 1 FROM public.exams req_exam
          WHERE req_exam.lesson_id = ol.prev_lesson_id
            AND req_exam.exam_type IN ('quiz', 'homework')
            AND req_exam.deleted_at IS NULL
            AND NOT EXISTS (
              SELECT 1 FROM public.exam_attempts ea
              WHERE ea.exam_id = req_exam.id
                AND ea.student_id = v_student_id
                AND ea.status = 'submitted'
                AND ea.score_percentage >= ol.prev_required_pass_pct
            )
        ) THEN true
        ELSE false
      END AS is_lesson_unlocked
    FROM ordered_lessons ol
  ),
  modules_grouped AS (
    SELECT
      el.module_id,
      el.module_title,
      el.module_order,
      jsonb_agg(
        jsonb_build_object(
          'lesson_id', el.lesson_id,
          'title', el.lesson_title,
          'is_unlocked', el.is_lesson_unlocked,
          'items', (
            SELECT COALESCE(jsonb_agg(
              jsonb_build_object(
                'item_id', li.id,
                'item_type', li.item_type,
                'title', li.title,
                'is_item_unlocked', (
                  el.is_lesson_unlocked AND (
                    li.unlock_after_exam_id IS NULL OR EXISTS (
                      SELECT 1 FROM public.exam_attempts ea
                      WHERE ea.exam_id = li.unlock_after_exam_id
                        AND ea.student_id = v_student_id
                        AND ea.status = 'submitted'
                    )
                  )
                )
              ) ORDER BY li.sort_order ASC
            ), '[]'::jsonb)
            FROM public.lesson_items li
            WHERE li.lesson_id = el.lesson_id AND li.deleted_at IS NULL
          )
        ) ORDER BY el.lesson_order ASC
      ) AS lessons
    FROM evaluated_lessons el
    GROUP BY el.module_id, el.module_title, el.module_order
  )
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object('module_id', mg.module_id, 'module_title', mg.module_title, 'lessons', mg.lessons)
    ORDER BY mg.module_order ASC
  ), '[]'::jsonb)
  INTO v_result
  FROM modules_grouped mg;

  RETURN v_result;
END;
$$;
```

---

## 7️⃣ اختبار ثبات الامتحان والتايمر وإعادة التصحيح التلقائي (Auto Re-grade)

### أ. المعمارية الهندسية لتأمين الامتحان وإعادة التصحيح
1. **منع الغش بتأخير ساعة الهاتف**: يسجل السيرفر `started_at = NOW()` و `expires_at = NOW() + (duration_minutes * INTERVAL '1 minute')`، ويرسل للواجهة `remaining_seconds = EXTRACT(EPOCH FROM (expires_at - NOW()))::INT`. الواجهة تعد تنازلياً عبر `performance.now()`، وعند التسليم (`submit_exam_attempt`) يرفض السيرفر أي محاولة تجاوزت `expires_at` الفعلي على السيرفر.
2. **ثبات الترتيب العشوائي مع الـ Refresh وحجب `correct_option`**: يُحفظ الترتيب العشوائي عند بدء المحاولة في `assigned_question_ids UUID[]`، وعند عمل `Refresh` تُسترجع الأسئلة بنفس ترتيب المصفوفة عبر `UNNEST(...) WITH ORDINALITY` بدون إرجاع عمود `correct_option`.
3. **إعادة التصحيح التلقائي لـ 200 طالب (Auto Re-grade)**: عند تعديل `correct_option`، يقوم `Trigger` في الداتابيز بتحديث `is_correct` لإجابات الـ 200 طالب، وإعادة حساب `score` و `score_percentage` (مما يفتح المحاضرات التالية تلقائياً لمن بلغ `>= 50%`)، وتحديث جدول `student_mistakes_bank` اعتماداً على آخر محاولة مسلمة لكل طالب (`DISTINCT ON (ea.student_id)`) مع فصل `source_type` (`'quiz'` أو `'homework'`).

### ب. الكود التوضيحي (`Start/Resume` + `Submit` + `Auto Re-grade Trigger`)

```sql
-- 1. دالة بدء أو استئناف الامتحان
CREATE OR REPLACE FUNCTION public.start_or_resume_exam(p_exam_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student_id UUID := auth.uid();
  v_exam RECORD;
  v_attempt RECORD;
  v_question_ids UUID[];
  v_questions JSONB;
BEGIN
  IF v_student_id IS NULL THEN RAISE EXCEPTION 'UNAUTHORIZED'; END IF;

  SELECT id, duration_minutes, shuffle_questions INTO v_exam
  FROM public.exams WHERE id = p_exam_id AND deleted_at IS NULL;

  SELECT * INTO v_attempt
  FROM public.exam_attempts
  WHERE exam_id = p_exam_id AND student_id = v_student_id
    AND status = 'in_progress' AND expires_at > NOW()
  ORDER BY started_at DESC LIMIT 1;

  IF NOT FOUND THEN
    SELECT ARRAY_AGG(q.id ORDER BY CASE WHEN v_exam.shuffle_questions THEN RANDOM() ELSE q.sort_order::FLOAT END)
    INTO v_question_ids
    FROM public.exam_questions q WHERE q.exam_id = p_exam_id AND q.deleted_at IS NULL;

    INSERT INTO public.exam_attempts (exam_id, student_id, started_at, expires_at, assigned_question_ids, status)
    VALUES (p_exam_id, v_student_id, NOW(), NOW() + (v_exam.duration_minutes * INTERVAL '1 minute'), v_question_ids, 'in_progress')
    RETURNING * INTO v_attempt;
  END IF;

  -- إرجاع الأسئلة بنفس ترتيب assigned_question_ids وبدون عمود correct_option نهائياً
  SELECT jsonb_agg(jsonb_build_object('id', q.id, 'image_url', q.image_url, 'points', q.points) ORDER BY u.ord ASC)
  INTO v_questions
  FROM UNNEST(v_attempt.assigned_question_ids) WITH ORDINALITY AS u(q_id, ord)
  JOIN public.exam_questions q ON q.id = u.q_id;

  RETURN jsonb_build_object(
    'attempt_id', v_attempt.id,
    'remaining_seconds', GREATEST(0, EXTRACT(EPOCH FROM (v_attempt.expires_at - NOW()))::INT),
    'questions', COALESCE(v_questions, '[]'::jsonb)
  );
END;
$$;

-- 2. دالة تسليم الامتحان في Request واحد مع فحص وقت السيرفر
CREATE OR REPLACE FUNCTION public.submit_exam_attempt(p_attempt_id UUID, p_answers JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student_id UUID := auth.uid();
  v_attempt RECORD;
  v_score NUMERIC := 0;
  v_total NUMERIC := 1;
  v_pct NUMERIC := 0;
BEGIN
  SELECT ea.*, e.exam_type INTO v_attempt
  FROM public.exam_attempts ea JOIN public.exams e ON e.id = ea.exam_id
  WHERE ea.id = p_attempt_id AND ea.student_id = v_student_id FOR UPDATE;

  IF NOT FOUND OR v_attempt.status = 'submitted' THEN RAISE EXCEPTION 'INVALID_ATTEMPT'; END IF;
  IF NOW() > (v_attempt.expires_at + INTERVAL '30 seconds') THEN
    RAISE EXCEPTION 'EXAM_TIME_EXPIRED_ON_SERVER';
  END IF;

  INSERT INTO public.exam_attempt_answers (attempt_id, question_id, selected_option, is_correct)
  SELECT p_attempt_id, eq.id, ans.selected_option, (ans.selected_option = eq.correct_option)
  FROM public.exam_questions eq
  LEFT JOIN LATERAL (
    SELECT (item ->> 'selected_option') AS selected_option
    FROM jsonb_array_elements(COALESCE(p_answers, '[]'::jsonb)) AS item
    WHERE (item ->> 'question_id')::UUID = eq.id LIMIT 1
  ) ans ON true
  WHERE eq.exam_id = v_attempt.exam_id AND eq.deleted_at IS NULL
  ON CONFLICT (attempt_id, question_id) DO UPDATE
  SET selected_option = EXCLUDED.selected_option, is_correct = EXCLUDED.is_correct;

  SELECT COALESCE(SUM(CASE WHEN eaa.is_correct THEN eq.points ELSE 0 END), 0), GREATEST(1, COALESCE(SUM(eq.points), 1))
  INTO v_score, v_total
  FROM public.exam_questions eq
  LEFT JOIN public.exam_attempt_answers eaa ON eaa.attempt_id = p_attempt_id AND eaa.question_id = eq.id
  WHERE eq.exam_id = v_attempt.exam_id AND eq.deleted_at IS NULL;

  v_pct := ROUND((v_score / v_total) * 100, 2);
  UPDATE public.exam_attempts SET status = 'submitted', submitted_at = NOW(), score = v_score, score_percentage = v_pct WHERE id = p_attempt_id;

  INSERT INTO public.student_mistakes_bank (student_id, question_id, exam_id, source_type, wrong_option)
  SELECT v_student_id, eaa.question_id, v_attempt.exam_id, v_attempt.exam_type, eaa.selected_option
  FROM public.exam_attempt_answers eaa WHERE eaa.attempt_id = p_attempt_id AND eaa.is_correct = false
  ON CONFLICT (student_id, question_id) DO UPDATE SET wrong_option = EXCLUDED.wrong_option, updated_at = NOW();

  RETURN jsonb_build_object('score', v_score, 'score_percentage', v_pct);
END;
$$;

-- 3. Trigger إعادة التصحيح التلقائي عند تعديل المدرس للإجابة الصحيحة
CREATE OR REPLACE FUNCTION public.regrade_question_after_key_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_exam_type TEXT;
BEGIN
  IF NEW.correct_option IS DISTINCT FROM OLD.correct_option THEN
    SELECT exam_type INTO v_exam_type FROM public.exams WHERE id = NEW.exam_id;

    UPDATE public.exam_attempt_answers
    SET is_correct = (selected_option = NEW.correct_option)
    WHERE question_id = NEW.id;

    WITH recalculated AS (
      SELECT ea.id AS attempt_id,
             COALESCE(SUM(CASE WHEN eaa.is_correct THEN eq.points ELSE 0 END), 0) AS new_score,
             GREATEST(1, COALESCE(SUM(eq.points), 1)) AS total_points
      FROM public.exam_attempts ea
      JOIN public.exam_questions eq ON eq.exam_id = ea.exam_id AND eq.deleted_at IS NULL
      LEFT JOIN public.exam_attempt_answers eaa ON eaa.attempt_id = ea.id AND eaa.question_id = eq.id
      WHERE ea.exam_id = NEW.exam_id AND ea.status = 'submitted'
      GROUP BY ea.id
    )
    UPDATE public.exam_attempts ea
    SET score = r.new_score,
        score_percentage = ROUND((r.new_score::NUMERIC / r.total_points::NUMERIC) * 100, 2)
    FROM recalculated r WHERE ea.id = r.attempt_id;

    -- حذف السؤال من بنك غلطات من أصبحت إجابته في آخر محاولة صحيحة
    DELETE FROM public.student_mistakes_bank smb
    WHERE smb.question_id = NEW.id
      AND EXISTS (
        SELECT 1 FROM (
          SELECT DISTINCT ON (ea.student_id) ea.student_id, eaa.selected_option
          FROM public.exam_attempts ea
          JOIN public.exam_attempt_answers eaa ON eaa.attempt_id = ea.id AND eaa.question_id = NEW.id
          WHERE ea.exam_id = NEW.exam_id AND ea.status = 'submitted'
          ORDER BY ea.student_id, ea.submitted_at DESC NULLS LAST
        ) latest
        WHERE latest.student_id = smb.student_id AND latest.selected_option = NEW.correct_option
      );

    -- إدراج/تحديث السؤال في بنك غلطات من أصبحت إجابته في آخر محاولة خاطئة (DISTINCT ON يمنع خطأ تكرار الصفوف)
    INSERT INTO public.student_mistakes_bank (student_id, question_id, exam_id, source_type, wrong_option, updated_at)
    SELECT latest.student_id, NEW.id, NEW.exam_id, v_exam_type, latest.selected_option, NOW()
    FROM (
      SELECT DISTINCT ON (ea.student_id) ea.student_id, eaa.selected_option
      FROM public.exam_attempts ea
      LEFT JOIN public.exam_attempt_answers eaa ON eaa.attempt_id = ea.id AND eaa.question_id = NEW.id
      WHERE ea.exam_id = NEW.exam_id AND ea.status = 'submitted'
      ORDER BY ea.student_id, ea.submitted_at DESC NULLS LAST
    ) latest
    WHERE latest.selected_option IS NULL OR latest.selected_option <> NEW.correct_option
    ON CONFLICT (student_id, question_id)
    DO UPDATE SET wrong_option = EXCLUDED.wrong_option, source_type = EXCLUDED.source_type, updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$;
```

---

## 8️⃣ اختبار الإشعارات الذكية (بدون تضخم الداتابيز وبدون رنين مع الـ Refresh)

### أ. المعمارية الهندسية للإشعارات الرشيقة
1. **سطر واحد لـ 1000 طالب**: نُدرج صفاً واحداً فقط في جدول `notifications` مع تحديد `target_type` (`'all'`, `'grade'`, `'course'`, `'student'`). ويُحسب هل قرأه الطالب أم لا بمقارنة `n.created_at <= COALESCE(p.last_notifications_read_at, p.created_at)` في جدول `profiles`. عند فتح قائمة الجرس، نحدث فقط `last_notifications_read_at = NOW()` في صف الطالب.
2. **منع تكرار الرنين مع كل Refresh**: نخزن معرف آخر إشعار رنّ صوته في `localStorage` تحت المفتاح `last_notified_id`؛ فإذا طابق `latestNotification.id` بعد الـ `Refresh` لا يعمل الصوت.

### ب. الكود التوضيحي (`SQL` + `React Audio Guard`)

```sql
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('all', 'grade', 'course', 'student')),
  target_grade_id UUID REFERENCES public.grades(id) ON DELETE CASCADE,
  target_course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  target_student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.mark_all_notifications_read()
RETURNS VOID LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.profiles SET last_notifications_read_at = NOW() WHERE id = auth.uid();
$$;
```

```tsx
'use client';
import { useEffect } from 'react';

const LAST_NOTIFIED_STORAGE_KEY = 'last_notified_id';

export function useNotificationChimeGuard(latest: { id: string; is_read: boolean } | null) {
  useEffect(() => {
    if (!latest || latest.is_read) return;
    if (localStorage.getItem(LAST_NOTIFIED_STORAGE_KEY) === latest.id) return;

    localStorage.setItem(LAST_NOTIFIED_STORAGE_KEY, latest.id);
    const chime = new Audio('/sounds/notification-chime.mp3');
    chime.volume = 0.6;
    chime.play().catch(() => {});
  }, [latest]);
}
```

---

## 9️⃣ اختبار صلاحيات المساعدين (RBAC) والـ Middleware الصامت

### أ. المعمارية الهندسية للـ Middleware الصامت و Supabase RLS
1. **تحقق `middleware.ts` بدون DB Query**: تُحفظ صلاحيات المساعد كـ `JSONB` داخل `app_metadata.permissions` في الـ `JWT`. يتحقق `middleware.ts` من التوقيع التشفيري للـ `JWT` محلياً على `Cloudflare Edge` عبر `crypto.subtle.verify` ويقرأ الصلاحيات مباشرة، مع استثناء كافة الصور وملفات الـ `Static` في `config.matcher`.
2. **حماية جدول المدفوعات في RLS ضد مساعد يملك `manage_exams: true` فقط**: نفصل سياسات `RLS` حسب العملية (`SELECT`, `INSERT`, `UPDATE`) ونشترط في `has_payment_management_access()` أن يملك المساعد `(permissions ->> 'manage_payments')::boolean = true`، بينما يملك الطالب فقط `SELECT` و `INSERT` لإيصالاته (`status = 'pending'`) دون صلاحية `UPDATE` أو `DELETE`.

### ب. الكود التوضيحي (`middleware.ts` + `Supabase RLS`)

```ts
// 1. المسار: src/middleware.ts
import { NextResponse, type NextRequest } from 'next/server';

const ADMIN_ROUTE_PERMISSIONS: Record<string, string> = {
  '/admin/payments': 'manage_payments',
  '/admin/exams': 'manage_exams',
  '/admin/courses': 'manage_courses',
  '/admin/students': 'manage_students',
};

function b64UrlToBytes(b64Url: string): Uint8Array {
  const pad = '='.repeat((4 - (b64Url.length % 4)) % 4);
  const raw = atob((b64Url + pad).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

async function verifyJwtOnEdge(token: string, secret: string): Promise<Record<string, any> | null> {
  try {
    const [h, p, s] = token.split('.');
    if (!h || !p || !s) return null;
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    const valid = await crypto.subtle.verify('HMAC', key, b64UrlToBytes(s), enc.encode(`${h}.${p}`));
    if (!valid) return null;
    const payload = JSON.parse(new TextDecoder().decode(b64UrlToBytes(p)));
    return payload.exp && payload.exp * 1000 > Date.now() ? payload : null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith('/admin')) return NextResponse.next();

  const token = request.cookies.get('sb-access-token')?.value;
  const secret = process.env.SUPABASE_JWT_SECRET;
  if (!token || !secret) return NextResponse.redirect(new URL('/login', request.url));

  const payload = await verifyJwtOnEdge(token, secret);
  if (!payload) return NextResponse.redirect(new URL('/login', request.url));

  const role = payload.app_metadata?.role;
  const perms = payload.app_metadata?.permissions ?? {};

  if (role === 'admin') return NextResponse.next();
  if (role === 'assistant') {
    for (const [prefix, perm] of Object.entries(ADMIN_ROUTE_PERMISSIONS)) {
      if (pathname.startsWith(prefix) && perms[perm] !== true) {
        return NextResponse.redirect(new URL('/admin/unauthorized', request.url));
      }
    }
    return NextResponse.next();
  }
  return NextResponse.redirect(new URL('/dashboard', request.url));
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|mp3|mp4|m3u8|ts)$).*)'],
};
```

```sql
-- 2. سياسات RLS المفصولة لحماية جدول المدفوعات
ALTER TABLE public.payment_receipts ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_payment_management_access()
RETURNS BOOLEAN LANGUAGE sql STABLE AS $$
  SELECT (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  OR (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'assistant'
    AND COALESCE((auth.jwt() -> 'app_metadata' -> 'permissions' ->> 'manage_payments')::BOOLEAN, false) = true
  );
$$;

CREATE POLICY "payment_receipts_select" ON public.payment_receipts
FOR SELECT TO authenticated USING (public.has_payment_management_access() OR student_id = auth.uid());

CREATE POLICY "payment_receipts_student_insert" ON public.payment_receipts
FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid() AND status = 'pending');

CREATE POLICY "payment_receipts_staff_update" ON public.payment_receipts
FOR UPDATE TO authenticated USING (public.has_payment_management_access()) WITH CHECK (public.has_payment_management_access());
```

---

## 🔟 اختبار تفاصيل تجربة المستخدم الحرجة (iOS & Mobile UX)

### أ. الشرح الهندسي
1. **منع الـ Zoom العشوائي في الآيفون عند الضغط على خانات الكتابة**: يقوم `iOS Safari` بعمل تكبير تلقائي إذا كان `font-size` لأي `<input>`, `<textarea>`, أو `<select>` أقل من `16px`. نمنعه بفرض `font-size: 16px` (`text-base`) على جميع حقول الإدخال في شاشات الموبايل.
2. **توافق الـ Voice Note في المنتدى على الآيفون والأندرويد معاً**: نعطي الأولوية لصيغة `audio/mp4;codecs=mp4a.40.2` (`MP4/AAC`) عبر `MediaRecorder.isTypeSupported` لأنها مدعومة أصلياً على `iOS Safari` والأندرويد معاً، ونشغلها عبر `<audio controls playsInline preload="metadata">`.
3. **اتجاه شريط الفيديو في موقع عربي RTL**: نجبر حاوية مشغل الفيديو والصوت على `dir="ltr"` ليعمل شريط التقديم (`Seekbar`) وحسابات اللمس من اليسار لليمين بشكل صحيح.

### ب. الكود التوضيحي

```css
/* src/app/globals.css */
@media screen and (max-width: 768px) {
  input, textarea, select {
    font-size: 16px !important;
  }
}
```

```tsx
'use client';
import React from 'react';

export function getPreferredAudioMimeType(): string {
  const types = ['audio/mp4;codecs=mp4a.40.2', 'audio/mp4', 'audio/aac', 'audio/webm;codecs=opus'];
  if (typeof window !== 'undefined' && typeof MediaRecorder !== 'undefined') {
    for (const t of types) if (MediaRecorder.isTypeSupported(t)) return t;
  }
  return 'audio/mp4';
}

export function ForumVoiceNotePlayer({ audioUrl }: { audioUrl: string }) {
  return (
    <div dir="ltr" className="w-full max-w-md rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
      <audio controls playsInline preload="metadata" controlsList="nodownload" className="w-full">
        <source src={audioUrl} type="audio/mp4" />
        <source src={audioUrl} type="audio/webm" />
      </audio>
    </div>
  );
}
```
