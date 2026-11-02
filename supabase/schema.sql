-- Full v4.0 Schema to test
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC, anon;

DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('student', 'assistant', 'admin', 'super_admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.enrollment_status AS ENUM ('active', 'temp_active', 'expired', 'revoked');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.payment_method AS ENUM ('vodafone_cash', 'instapay', 'center_code');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.payment_status AS ENUM ('pending_review', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.exam_type AS ENUM ('quiz', 'homework');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.lecture_item_type AS ENUM ('video', 'pdf', 'quiz', 'homework', 'solution_video', 'solution_pdf');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- (1) PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL CHECK (char_length(trim(full_name)) >= 3),
  phone TEXT NOT NULL UNIQUE CHECK (phone ~ '^01[0125][0-9]{8}$'),
  parent_phone TEXT NOT NULL CHECK (parent_phone ~ '^01[0125][0-9]{8}$'),
  grade_level TEXT NOT NULL DEFAULT '3' CHECK (grade_level IN ('1', '2', '3')),
  education_type TEXT NOT NULL DEFAULT 'general' CHECK (education_type IN ('general', 'azhar', 'languages')),
  governorate TEXT NOT NULL DEFAULT 'الإسكندرية',
  gender TEXT NOT NULL DEFAULT 'male' CHECK (gender IN ('male', 'female')),
  role public.user_role NOT NULL DEFAULT 'student',
  permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
  review_status TEXT NOT NULL DEFAULT 'pending_review' CHECK (review_status IN ('pending_review', 'verified', 'suspended')),
  is_verified_by_admin BOOLEAN NOT NULL DEFAULT false,
  instant_activation_banned BOOLEAN NOT NULL DEFAULT false,
  last_notifications_read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT chk_different_phones CHECK (phone <> parent_phone)
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- (2) LOGIN SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.login_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  device_type TEXT NOT NULL DEFAULT 'Mobile',
  device_name TEXT NOT NULL DEFAULT 'Unknown Device',
  os_name TEXT NOT NULL DEFAULT 'Unknown OS',
  browser_name TEXT NOT NULL DEFAULT 'Browser',
  logout_count_today INT NOT NULL DEFAULT 0 CHECK (logout_count_today >= 0),
  logout_count_week INT NOT NULL DEFAULT 0 CHECK (logout_count_week >= 0),
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.login_sessions ENABLE ROW LEVEL SECURITY;

-- (3) PLATFORM SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  vodafone_cash_numbers TEXT[] NOT NULL DEFAULT ARRAY['01000000000'],
  instapay_address TEXT NOT NULL DEFAULT 'ammar-rizk@instapay',
  support_whatsapp TEXT NOT NULL DEFAULT '201000000000',
  refund_policy_text TEXT NOT NULL DEFAULT 'يحق للطالب استرداد قيمة الاشتراك خلال 48 ساعة من التفعيل في حال عدم مشاهدة أكثر من محاضرة واحدة.',
  maintenance_mode BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
INSERT INTO public.platform_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- (4) COURSES TABLE
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (price >= 0),
  grade_level TEXT NOT NULL DEFAULT '3' CHECK (grade_level IN ('1', '2', '3', 'all')),
  education_type TEXT NOT NULL DEFAULT 'general' CHECK (education_type IN ('general', 'azhar', 'languages', 'all')),
  is_bundle BOOLEAN NOT NULL DEFAULT false,
  is_free BOOLEAN NOT NULL DEFAULT false,
  is_suggested BOOLEAN NOT NULL DEFAULT false,
  validity_days INT NOT NULL DEFAULT 365 CHECK (validity_days > 0),
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- (5) MODULES TABLE
CREATE TABLE IF NOT EXISTS public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

-- (6) COURSE MODULES MAP TABLE
CREATE TABLE IF NOT EXISTS public.course_modules_map (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  sort_order INT NOT NULL DEFAULT 1,
  UNIQUE(course_id, module_id)
);
ALTER TABLE public.course_modules_map ENABLE ROW LEVEL SECURITY;

-- (7) LESSONS TABLE
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 1,
  required_pass_percentage INT NOT NULL DEFAULT 50 CHECK (required_pass_percentage BETWEEN 0 AND 100),
  publish_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- (8) EXAMS TABLE
CREATE TABLE IF NOT EXISTS public.exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  exam_type public.exam_type NOT NULL DEFAULT 'quiz',
  duration_minutes INT NOT NULL DEFAULT 30 CHECK (duration_minutes > 0),
  pass_percentage INT NOT NULL DEFAULT 50 CHECK (pass_percentage BETWEEN 0 AND 100),
  max_attempts INT DEFAULT NULL CHECK (max_attempts IS NULL OR max_attempts > 0),
  retake_cooldown_seconds INT NOT NULL DEFAULT 0 CHECK (retake_cooldown_seconds >= 0),
  shuffle_questions BOOLEAN NOT NULL DEFAULT false,
  allow_review_before_pass BOOLEAN NOT NULL DEFAULT false,
  min_score NUMERIC(6, 2) NOT NULL DEFAULT 0,
  avg_score NUMERIC(6, 2) NOT NULL DEFAULT 0,
  max_score NUMERIC(6, 2) NOT NULL DEFAULT 0,
  entries_count INT NOT NULL DEFAULT 0,
  completions_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

-- (9) LESSON ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.lesson_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  item_type public.lecture_item_type NOT NULL,
  r2_path_or_url TEXT,
  exam_id UUID REFERENCES public.exams(id) ON DELETE SET NULL,
  unlock_after_exam_id UUID REFERENCES public.exams(id) ON DELETE SET NULL,
  duration_seconds INT NOT NULL DEFAULT 0 CHECK (duration_seconds >= 0),
  sort_order INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
ALTER TABLE public.lesson_items ENABLE ROW LEVEL SECURITY;

-- (10) EXAM QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.exam_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  question_text TEXT,
  correct_option CHAR(1) NOT NULL CHECK (correct_option IN ('a', 'b', 'c', 'd')),
  points NUMERIC(6, 2) NOT NULL DEFAULT 1.00 CHECK (points > 0),
  sort_order INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;

-- (11) EXAM ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS public.exam_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'expired_submitted')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  submitted_at TIMESTAMPTZ,
  total_questions INT NOT NULL DEFAULT 0,
  solved_questions INT NOT NULL DEFAULT 0,
  correct_answers_count INT NOT NULL DEFAULT 0,
  score NUMERIC(6, 2) NOT NULL DEFAULT 0,
  score_percentage NUMERIC(6, 2) NOT NULL DEFAULT 0,
  passed BOOLEAN NOT NULL DEFAULT false,
  assigned_question_ids UUID[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;

-- (12) EXAM ATTEMPT ANSWERS TABLE
CREATE TABLE IF NOT EXISTS public.exam_attempt_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES public.exam_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.exam_questions(id) ON DELETE CASCADE,
  selected_option CHAR(1) CHECK (selected_option IS NULL OR selected_option IN ('a', 'b', 'c', 'd')),
  is_correct BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(attempt_id, question_id)
);
ALTER TABLE public.exam_attempt_answers ENABLE ROW LEVEL SECURITY;

-- (13) STUDENT MISTAKES BANK TABLE
CREATE TABLE IF NOT EXISTS public.student_mistakes_bank (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.exam_questions(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  source_type public.exam_type NOT NULL DEFAULT 'quiz',
  wrong_option CHAR(1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, question_id)
);
ALTER TABLE public.student_mistakes_bank ENABLE ROW LEVEL SECURITY;

-- (14) LESSON COMPLETIONS TABLE
CREATE TABLE IF NOT EXISTS public.lesson_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  watched_duration_seconds INT NOT NULL DEFAULT 0 CHECK (watched_duration_seconds >= 0),
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, lesson_id)
);
ALTER TABLE public.lesson_completions ENABLE ROW LEVEL SECURITY;

-- (15) ACTIVATION CODES TABLE
CREATE TABLE IF NOT EXISTS public.activation_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  price_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  is_used BOOLEAN NOT NULL DEFAULT false,
  used_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
ALTER TABLE public.activation_codes ENABLE ROW LEVEL SECURITY;

-- (16) CODE REDEMPTION ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS public.code_redemption_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  attempted_code TEXT NOT NULL,
  succeeded BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.code_redemption_attempts ENABLE ROW LEVEL SECURITY;

-- (17) PAYMENT RECEIPTS TABLE
CREATE TABLE IF NOT EXISTS public.payment_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (amount >= 0),
  payment_method public.payment_method NOT NULL DEFAULT 'vodafone_cash',
  sender_phone TEXT NOT NULL CHECK (sender_phone ~ '^01[0125][0-9]{8}$'),
  reference_number TEXT NOT NULL,
  receipt_image_r2_path TEXT NOT NULL,
  file_size_bytes INT NOT NULL DEFAULT 0 CHECK (file_size_bytes > 0 AND file_size_bytes <= 512000),
  grant_instant_access BOOLEAN NOT NULL DEFAULT true,
  status public.payment_status NOT NULL DEFAULT 'pending_review',
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_payment_receipts_reference_number UNIQUE (reference_number)
);
ALTER TABLE public.payment_receipts ENABLE ROW LEVEL SECURITY;

-- (18) COURSE ENROLLMENTS TABLE
CREATE TABLE IF NOT EXISTS public.course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrollment_method public.payment_method NOT NULL DEFAULT 'center_code',
  activation_code_id UUID REFERENCES public.activation_codes(id) ON DELETE SET NULL,
  payment_receipt_id UUID REFERENCES public.payment_receipts(id) ON DELETE SET NULL,
  status public.enrollment_status NOT NULL DEFAULT 'active',
  is_temporary_activation BOOLEAN NOT NULL DEFAULT false,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  UNIQUE(student_id, course_id)
);
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;

-- (19) STUDENT INVOICES TABLE
CREATE TABLE IF NOT EXISTS public.student_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  payment_method public.payment_method NOT NULL,
  amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  reference_number TEXT,
  status public.payment_status NOT NULL DEFAULT 'approved',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.student_invoices ENABLE ROW LEVEL SECURITY;

-- (20) MANUAL LESSON UNLOCKS & FORUM QUESTIONS & NOTIFICATIONS & AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.manual_lesson_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  unlocked_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, lesson_id)
);
ALTER TABLE public.manual_lesson_unlocks ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.forum_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  grade_level TEXT NOT NULL DEFAULT '3' CHECK (grade_level IN ('1', '2', '3')),
  question_text TEXT NOT NULL CHECK (char_length(trim(question_text)) >= 3),
  question_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'answered')),
  is_public BOOLEAN NOT NULL DEFAULT false,
  reply_text TEXT,
  reply_image_url TEXT,
  reply_voice_url TEXT,
  replied_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.forum_questions ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('all', 'grade', 'course', 'student')),
  target_grade_level TEXT,
  target_course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  target_student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  target_id UUID,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 3B. IDEMPOTENT MIGRATIONS
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS review_status TEXT NOT NULL DEFAULT 'pending_review';
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS education_type TEXT NOT NULL DEFAULT 'general';
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS is_free BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS is_suggested BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS allow_review_before_pass BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS max_attempts INT DEFAULT NULL;
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS retake_cooldown_seconds INT NOT NULL DEFAULT 0;
ALTER TABLE public.exam_attempts ADD COLUMN IF NOT EXISTS passed BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.exam_attempts ADD COLUMN IF NOT EXISTS total_questions INT NOT NULL DEFAULT 0;
ALTER TABLE public.exam_attempts ADD COLUMN IF NOT EXISTS solved_questions INT NOT NULL DEFAULT 0;
ALTER TABLE public.exam_attempts ADD COLUMN IF NOT EXISTS correct_answers_count INT NOT NULL DEFAULT 0;

DO $$ BEGIN
  ALTER TABLE public.exam_attempts DROP CONSTRAINT IF EXISTS exam_attempts_status_check;
  ALTER TABLE public.exam_attempts ADD CONSTRAINT exam_attempts_status_check CHECK (status IN ('in_progress', 'submitted', 'expired_submitted'));
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 4. INDEXES
CREATE INDEX IF NOT EXISTS idx_profiles_parent_phone ON public.profiles(parent_phone);
CREATE INDEX IF NOT EXISTS idx_login_sessions_user ON public.login_sessions(user_id, last_active_at DESC);
CREATE INDEX IF NOT EXISTS idx_course_modules_map_module ON public.course_modules_map(module_id);
CREATE INDEX IF NOT EXISTS idx_lessons_module ON public.lessons(module_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_exams_lesson ON public.exams(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_items_lesson ON public.lesson_items(lesson_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_lesson_items_unlock_exam ON public.lesson_items(unlock_after_exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_questions_exam ON public.exam_questions(exam_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_student_exam ON public.exam_attempts(student_id, exam_id, status);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_exam_finished ON public.exam_attempts(exam_id) WHERE status IN ('submitted', 'expired_submitted');
CREATE INDEX IF NOT EXISTS idx_attempt_answers_question ON public.exam_attempt_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_student_mistakes_filter ON public.student_mistakes_bank(student_id, source_type);
CREATE INDEX IF NOT EXISTS idx_lesson_completions_student ON public.lesson_completions(student_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_activation_codes_course ON public.activation_codes(course_id);
CREATE INDEX IF NOT EXISTS idx_activation_codes_used_by ON public.activation_codes(used_by);
CREATE INDEX IF NOT EXISTS idx_code_attempts_student_hourly ON public.code_redemption_attempts(student_id, created_at DESC) WHERE succeeded = false;
CREATE INDEX IF NOT EXISTS idx_receipts_student_hourly ON public.payment_receipts(student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enrollments_student_active ON public.course_enrollments(student_id, status);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON public.course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_receipt ON public.course_enrollments(payment_receipt_id);
CREATE INDEX IF NOT EXISTS idx_invoices_student ON public.student_invoices(student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_student_daily ON public.forum_questions(student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_public_grade ON public.forum_questions(grade_level, created_at DESC) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_notifications_targets ON public.notifications(target_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id, created_at DESC);

-- 5. SECURITY HELPERS & TRIGGERS
CREATE OR REPLACE FUNCTION public.has_admin_permission(p_permission TEXT)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.deleted_at IS NULL
      AND (
        p.role IN ('super_admin', 'admin')
        OR (p.role = 'assistant' AND COALESCE((p.permissions ->> p_permission)::BOOLEAN, false) = true)
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.sync_profile_role_to_auth_metadata()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF (TG_OP = 'INSERT') OR (NEW.role IS DISTINCT FROM OLD.role) OR (NEW.permissions IS DISTINCT FROM OLD.permissions) THEN
    UPDATE auth.users
    SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object(
      'role', NEW.role::text,
      'permissions', NEW.permissions
    )
    WHERE id = NEW.id;

    IF TG_OP = 'UPDATE' THEN
      INSERT INTO public.audit_logs (actor_id, action_type, target_id, details)
      VALUES (
        auth.uid(),
        'STAFF_ROLE_OR_PERMS_UPDATE',
        NEW.id,
        jsonb_build_object('old_role', OLD.role, 'new_role', NEW.role, 'old_perms', OLD.permissions, 'new_perms', NEW.permissions)
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_profile_role_to_jwt ON public.profiles;
CREATE TRIGGER trg_sync_profile_role_to_jwt
AFTER INSERT OR UPDATE OF role, permissions ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.sync_profile_role_to_auth_metadata();

CREATE OR REPLACE FUNCTION public.protect_profile_sensitive_columns()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  v_caller_role public.user_role;
BEGIN
  IF current_user = 'authenticated' THEN
    SELECT role INTO v_caller_role FROM public.profiles WHERE id = auth.uid() AND deleted_at IS NULL;

    -- 1. Role & permissions can ONLY be changed by a super_admin on ANOTHER user's row
    IF NEW.id = auth.uid() OR COALESCE(v_caller_role, 'student') <> 'super_admin' THEN
      NEW.role := OLD.role;
      NEW.permissions := OLD.permissions;
    END IF;

    -- 2. Prevent a super_admin frompromoting someone else to super_admin via client API
    IF NEW.role = 'super_admin' AND OLD.role <> 'super_admin' THEN
      NEW.role := OLD.role;
    END IF;

    -- 3. Student management fields can only be modified by staff with manage_students permission
    IF NOT public.has_admin_permission('manage_students') THEN
      NEW.is_verified_by_admin := OLD.is_verified_by_admin;
      NEW.review_status := OLD.review_status;
      NEW.instant_activation_banned := OLD.instant_activation_banned;
      NEW.phone := OLD.phone;
      NEW.parent_phone := OLD.parent_phone;
      NEW.grade_level := OLD.grade_level;
      NEW.education_type := OLD.education_type;
      NEW.created_at := OLD.created_at;
      NEW.deleted_at := OLD.deleted_at;
    END IF;
  END IF;

  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_columns ON public.profiles;
CREATE TRIGGER trg_protect_profile_columns
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_profile_sensitive_columns();

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_domain TEXT;
  v_email_phone TEXT;
  v_parent_phone TEXT;
  v_staff_role public.user_role := 'student';
  v_staff_perms JSONB := '{}'::jsonb;
BEGIN
  v_domain := LOWER(SPLIT_PART(COALESCE(NEW.email, ''), '@', 2));
  v_email_phone := SPLIT_PART(COALESCE(NEW.email, ''), '@', 1);

  IF (NEW.raw_app_meta_data ->> 'role') IN ('super_admin', 'admin', 'assistant')
     OR v_domain IN ('teacher.platform.local', 'staff.platform.local', 'admin.platform.local', 'ammar.local') THEN
    v_staff_role := CASE
      WHEN (NEW.raw_app_meta_data ->> 'role') IN ('super_admin', 'admin', 'assistant') THEN (NEW.raw_app_meta_data ->> 'role')::public.user_role
      ELSE 'super_admin'::public.user_role
    END;
    v_staff_perms := COALESCE(NEW.raw_app_meta_data -> 'permissions', '{"manage_students":true,"manage_courses":true,"manage_exams":true,"manage_payments":true,"manage_forum":true,"manage_settings":true}'::jsonb);
    IF v_email_phone !~ '^01[0125][0-9]{8}$' THEN
      v_email_phone := COALESCE(NEW.raw_app_meta_data ->> 'phone', NEW.raw_user_meta_data ->> 'phone');
    END IF;
    IF v_email_phone IS NULL OR v_email_phone !~ '^01[0125][0-9]{8}$' THEN
      v_email_phone := '010' || LPAD((MOD(ABS(HASHTEXT(NEW.id::text)), 100000000))::text, 8, '0');
    END IF;
    v_parent_phone := COALESCE(NEW.raw_user_meta_data ->> 'parent_phone', '01500000000');
    IF v_parent_phone = v_email_phone THEN
      v_parent_phone := '015' || LPAD((MOD(ABS(HASHTEXT(NEW.id::text || '_parent')), 100000000))::text, 8, '0');
    END IF;
  ELSE
    IF v_domain <> 'student.platform.local' OR v_email_phone !~ '^01[0125][0-9]{8}$' THEN
      RAISE EXCEPTION 'INVALID_REGISTRATION_EMAIL_DOMAIN: التسجيل متاح فقط عبر رقم الهاتف المصري المكون من 11 رقماً';
    END IF;

    IF (NEW.raw_user_meta_data ->> 'phone') IS NOT NULL AND (NEW.raw_user_meta_data ->> 'phone') <> v_email_phone THEN
      RAISE EXCEPTION 'PHONE_METADATA_MISMATCH: رقم الهاتف في البيانات يجب أن يتطابق تماماً مع رقم الحساب المسجل';
    END IF;

    v_parent_phone := REGEXP_REPLACE(COALESCE(NEW.raw_user_meta_data ->> 'parent_phone', ''), '\D', '', 'g');
    IF v_parent_phone !~ '^01[0125][0-9]{8}$' OR v_parent_phone = v_email_phone THEN
      RAISE EXCEPTION 'INVALID_PARENT_PHONE: يجب إدخال رقم هاتف ولي أمر صحيح ومختلف عن رقم الطالب';
    END IF;
  END IF;

  INSERT INTO public.profiles (
    id, full_name, phone, parent_phone, grade_level, education_type, governorate, gender, role, permissions
  )
  VALUES (
    NEW.id,
    COALESCE(NULLIF(trim(NEW.raw_user_meta_data ->> 'full_name'), ''), 'طالب جديد'),
    v_email_phone,
    v_parent_phone,
    CASE WHEN (NEW.raw_user_meta_data ->> 'grade_level') IN ('1', '2', '3') THEN (NEW.raw_user_meta_data ->> 'grade_level') ELSE '3' END,
    CASE WHEN (NEW.raw_user_meta_data ->> 'education_type') IN ('general', 'azhar', 'languages') THEN (NEW.raw_user_meta_data ->> 'education_type') ELSE 'general' END,
    COALESCE(NULLIF(trim(NEW.raw_user_meta_data ->> 'governorate'), ''), 'الإسكندرية'),
    CASE WHEN (NEW.raw_user_meta_data ->> 'gender') IN ('male', 'female') THEN (NEW.raw_user_meta_data ->> 'gender') ELSE 'male' END,
    v_staff_role,
    v_staff_perms
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

CREATE OR REPLACE FUNCTION public.enforce_payment_receipt_limits()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_actor_id UUID := auth.uid();
  v_hourly_count INT;
  v_is_banned BOOLEAN;
  v_course_price NUMERIC(10, 2);
BEGIN
  IF v_actor_id IS NULL THEN RAISE EXCEPTION 'UNAUTHORIZED'; END IF;
  NEW.student_id := v_actor_id;
  NEW.status := 'pending_review';

  PERFORM pg_advisory_xact_lock(hashtext('receipt_rate_limit_' || v_actor_id::text));

  IF NEW.file_size_bytes <= 0 OR NEW.file_size_bytes > 512000 THEN
    RAISE EXCEPTION 'IMAGE_TOO_LARGE: حجم صورة الإيصال يجب ألا يتجاوز 500 كيلوبايت';
  END IF;

  SELECT price INTO v_course_price FROM public.courses WHERE id = NEW.course_id AND deleted_at IS NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'COURSE_NOT_FOUND'; END IF;
  NEW.amount := v_course_price;

  IF EXISTS (
    SELECT 1 FROM public.course_enrollments
    WHERE student_id = v_actor_id AND course_id = NEW.course_id
      AND status = 'active' AND (expires_at IS NULL OR expires_at > NOW())
  ) THEN
    RAISE EXCEPTION 'ALREADY_ACTIVE_ENROLLED: أنت مشترك بالفعل باشتراك مفعل في هذا الكورس';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.payment_receipts
    WHERE student_id = v_actor_id AND status = 'pending_review'
  ) THEN
    RAISE EXCEPTION 'PENDING_RECEIPT_EXISTS: لديك إيصال دفع قيد المراجعة بالفعل، يرجى انتظار مراجعته قبل رفع إيصال آخر';
  END IF;

  SELECT COUNT(*) INTO v_hourly_count
  FROM public.payment_receipts
  WHERE student_id = v_actor_id AND created_at > (NOW() - INTERVAL '1 hour');

  IF v_hourly_count >= 3 THEN
    RAISE EXCEPTION 'RECEIPT_RATE_LIMIT: لقد تجاوزت الحد المسموح (3 إيصالات في الساعة)';
  END IF;

  SELECT COALESCE(instant_activation_banned, false) INTO v_is_banned
  FROM public.profiles WHERE id = v_actor_id;

  NEW.grant_instant_access := NOT v_is_banned;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_payment_receipt_limits ON public.payment_receipts;
CREATE TRIGGER trg_enforce_payment_receipt_limits
BEFORE INSERT ON public.payment_receipts
FOR EACH ROW EXECUTE FUNCTION public.enforce_payment_receipt_limits();

CREATE OR REPLACE FUNCTION public.grant_temp_enrollment_on_receipt()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.grant_instant_access = true THEN
    INSERT INTO public.course_enrollments (
      student_id, course_id, enrollment_method, payment_receipt_id, status, is_temporary_activation, enrolled_at, expires_at
    )
    VALUES (
      NEW.student_id, NEW.course_id, NEW.payment_method, NEW.id, 'temp_active', true, NOW(), NOW() + INTERVAL '24 hours'
    )
    ON CONFLICT (student_id, course_id) DO UPDATE
    SET status = 'temp_active',
        enrollment_method = EXCLUDED.enrollment_method,
        payment_receipt_id = NEW.id,
        is_temporary_activation = true,
        enrolled_at = NOW(),
        expires_at = NOW() + INTERVAL '24 hours'
    WHERE public.course_enrollments.status <> 'active'
       OR (public.course_enrollments.expires_at IS NOT NULL AND public.course_enrollments.expires_at <= NOW());
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_grant_temp_enrollment ON public.payment_receipts;
CREATE TRIGGER trg_grant_temp_enrollment
AFTER INSERT ON public.payment_receipts
FOR EACH ROW EXECUTE FUNCTION public.grant_temp_enrollment_on_receipt();

CREATE OR REPLACE FUNCTION public.handle_payment_receipt_review()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_validity_days INT;
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF OLD.status <> 'pending_review' THEN
      RAISE EXCEPTION 'RECEIPT_ALREADY_REVIEWED: تم حسم ومراجعة هذا الإيصال مسبقاً ولا يمكن تعديل حالته';
    END IF;

    NEW.reviewed_by := auth.uid();
    NEW.reviewed_at := NOW();

    SELECT COALESCE(validity_days, 365) INTO v_validity_days
    FROM public.courses WHERE id = NEW.course_id;

    IF NEW.status = 'approved' THEN
      INSERT INTO public.course_enrollments (
        student_id, course_id, enrollment_method, payment_receipt_id, status, is_temporary_activation, enrolled_at, expires_at
      )
      VALUES (
        NEW.student_id, NEW.course_id, NEW.payment_method, NEW.id, 'active', false, NOW(), NOW() + (v_validity_days * INTERVAL '1 day')
      )
      ON CONFLICT (student_id, course_id) DO UPDATE
      SET status = 'active',
          enrollment_method = EXCLUDED.enrollment_method,
          payment_receipt_id = NEW.id,
          is_temporary_activation = false,
          enrolled_at = NOW(),
          expires_at = NOW() + (v_validity_days * INTERVAL '1 day');

      INSERT INTO public.student_invoices (student_id, course_id, payment_method, amount, reference_number, status)
      VALUES (NEW.student_id, NEW.course_id, NEW.payment_method, NEW.amount, NEW.reference_number, 'approved');

      INSERT INTO public.notifications (title, body, target_type, target_student_id)
      VALUES ('تم تفعيل اشتراكك بنجاح 🎉', 'تم مراجعة وقبول إيصال الدفع الخاص بك وتفعيل الكورس نهائياً.', 'student', NEW.student_id);

    ELSIF NEW.status = 'rejected' THEN
      UPDATE public.course_enrollments
      SET status = 'revoked'
      WHERE payment_receipt_id = NEW.id AND is_temporary_activation = true AND status <> 'active';

      UPDATE public.profiles
      SET instant_activation_banned = true
      WHERE id = NEW.student_id;

      INSERT INTO public.notifications (title, body, target_type, target_student_id)
      VALUES ('تم رفض إيصال التحويل ⚠️', 'تم إيقاف التفعيل المؤقت للكورس لعدم صحة بيانات الإيصال المرفوع.', 'student', NEW.student_id);
    END IF;

    INSERT INTO public.audit_logs (actor_id, action_type, target_id, details)
    VALUES (auth.uid(), 'PAYMENT_RECEIPT_' || UPPER(NEW.status::text), NEW.id, jsonb_build_object('student_id', NEW.student_id, 'course_id', NEW.course_id, 'amount', NEW.amount));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_handle_payment_receipt_review ON public.payment_receipts;
CREATE TRIGGER trg_handle_payment_receipt_review
BEFORE UPDATE ON public.payment_receipts
FOR EACH ROW EXECUTE FUNCTION public.handle_payment_receipt_review();

CREATE OR REPLACE FUNCTION public.enforce_forum_question_limits()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_actor_id UUID := auth.uid();
  v_daily_count INT;
BEGIN
  IF v_actor_id IS NULL THEN RAISE EXCEPTION 'UNAUTHORIZED'; END IF;
  NEW.student_id := v_actor_id;
  NEW.is_public := false;
  NEW.status := 'pending';

  PERFORM pg_advisory_xact_lock(hashtext('forum_rate_limit_' || v_actor_id::text));

  SELECT COUNT(*) INTO v_daily_count
  FROM public.forum_questions
  WHERE student_id = v_actor_id AND created_at > (NOW() - INTERVAL '24 hours');

  IF v_daily_count >= 5 THEN
    RAISE EXCEPTION 'FORUM_RATE_LIMIT: لا يمكنك إرسال أكثر من 5 أسئلة خلال 24 ساعة';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_forum_question_limits ON public.forum_questions;
CREATE TRIGGER trg_enforce_forum_question_limits
BEFORE INSERT ON public.forum_questions
FOR EACH ROW EXECUTE FUNCTION public.enforce_forum_question_limits();

CREATE OR REPLACE FUNCTION public.regrade_question_after_key_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_exam_type public.exam_type;
  v_pass_pct INT;
BEGIN
  IF (NEW.correct_option IS DISTINCT FROM OLD.correct_option)
     OR (NEW.points IS DISTINCT FROM OLD.points)
     OR (NEW.deleted_at IS DISTINCT FROM OLD.deleted_at) THEN

    SELECT exam_type, COALESCE(pass_percentage, 50) INTO v_exam_type, v_pass_pct
    FROM public.exams WHERE id = NEW.exam_id;

    IF NEW.correct_option IS DISTINCT FROM OLD.correct_option THEN
      UPDATE public.exam_attempt_answers
      SET is_correct = COALESCE(selected_option = NEW.correct_option, false)
      WHERE question_id = NEW.id;
    END IF;

    WITH recalculated AS (
      SELECT
        ea.id AS attempt_id,
        ea.status AS attempt_status,
        COALESCE(SUM(CASE WHEN eaa.is_correct THEN eq.points ELSE 0 END), 0) AS new_score,
        COUNT(*) FILTER (WHERE eaa.is_correct = true)::INT AS new_correct_count,
        GREATEST(1, COALESCE(SUM(eq.points), 1)) AS total_points
      FROM public.exam_attempts ea
      JOIN public.exam_questions eq
        ON eq.exam_id = ea.exam_id
       AND eq.deleted_at IS NULL
       AND (cardinality(ea.assigned_question_ids) = 0 OR eq.id = ANY(ea.assigned_question_ids))
      LEFT JOIN public.exam_attempt_answers eaa
        ON eaa.attempt_id = ea.id AND eaa.question_id = eq.id
      WHERE ea.exam_id = NEW.exam_id AND ea.status IN ('submitted', 'expired_submitted')
      GROUP BY ea.id, ea.status
    )
    UPDATE public.exam_attempts ea
    SET score = r.new_score,
        correct_answers_count = r.new_correct_count,
        score_percentage = ROUND((r.new_score::NUMERIC / r.total_points::NUMERIC) * 100, 2),
        passed = (r.attempt_status = 'submitted' AND (r.new_score::NUMERIC * 100) >= (r.total_points::NUMERIC * v_pass_pct))
    FROM recalculated r WHERE ea.id = r.attempt_id;

    UPDATE public.exams e
    SET min_score = stats.min_s, avg_score = stats.avg_s, max_score = stats.max_s, completions_count = stats.comp_c
    FROM (
      SELECT COALESCE(MIN(score), 0) AS min_s, COALESCE(ROUND(AVG(score), 2), 0) AS avg_s, COALESCE(MAX(score), 0) AS max_s, COUNT(*)::INT AS comp_c
      FROM public.exam_attempts WHERE exam_id = NEW.exam_id AND status IN ('submitted', 'expired_submitted')
    ) stats
    WHERE e.id = NEW.exam_id;

    IF NEW.deleted_at IS NOT NULL THEN
      DELETE FROM public.student_mistakes_bank WHERE question_id = NEW.id;
    ELSE
      DELETE FROM public.student_mistakes_bank smb
      WHERE smb.question_id = NEW.id
        AND EXISTS (
          SELECT 1 FROM (
            SELECT DISTINCT ON (ea.student_id) ea.student_id, eaa.selected_option
            FROM public.exam_attempts ea
            JOIN public.exam_attempt_answers eaa ON eaa.attempt_id = ea.id AND eaa.question_id = NEW.id
            WHERE ea.exam_id = NEW.exam_id AND ea.status IN ('submitted', 'expired_submitted')
            ORDER BY ea.student_id, ea.submitted_at DESC NULLS LAST
          ) latest
          WHERE latest.student_id = smb.student_id AND latest.selected_option = NEW.correct_option
        );

      INSERT INTO public.student_mistakes_bank (student_id, question_id, exam_id, source_type, wrong_option, updated_at)
      SELECT latest.student_id, NEW.id, NEW.exam_id, v_exam_type, latest.selected_option, NOW()
      FROM (
        SELECT DISTINCT ON (ea.student_id) ea.student_id, eaa.selected_option
        FROM public.exam_attempts ea
        LEFT JOIN public.exam_attempt_answers eaa ON eaa.attempt_id = ea.id AND eaa.question_id = NEW.id
        WHERE ea.exam_id = NEW.exam_id AND ea.status IN ('submitted', 'expired_submitted')
        ORDER BY ea.student_id, ea.submitted_at DESC NULLS LAST
      ) latest
      WHERE latest.selected_option IS NULL OR latest.selected_option <> NEW.correct_option
      ON CONFLICT (student_id, question_id)
      DO UPDATE SET wrong_option = EXCLUDED.wrong_option, source_type = EXCLUDED.source_type, updated_at = NOW();
    END IF;

    INSERT INTO public.audit_logs (actor_id, action_type, target_id, details)
    VALUES (auth.uid(), 'REGRADE_QUESTION_CHANGE', NEW.id, jsonb_build_object('old_key', OLD.correct_option, 'new_key', NEW.correct_option, 'points', NEW.points, 'deleted_at', NEW.deleted_at));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_regrade_question ON public.exam_questions;
CREATE TRIGGER trg_regrade_question
AFTER UPDATE ON public.exam_questions
FOR EACH ROW EXECUTE FUNCTION public.regrade_question_after_key_change();

CREATE OR REPLACE FUNCTION public.log_manual_lesson_unlock_audit()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.unlocked_by := COALESCE(auth.uid(), NEW.unlocked_by);
    INSERT INTO public.audit_logs (actor_id, action_type, target_id, details)
    VALUES (
      COALESCE(auth.uid(), NEW.unlocked_by),
      'MANUAL_LESSON_UNLOCK_GRANTED',
      NEW.lesson_id,
      jsonb_build_object('student_id', NEW.student_id, 'lesson_id', NEW.lesson_id)
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (actor_id, action_type, target_id, details)
    VALUES (
      auth.uid(),
      'MANUAL_LESSON_UNLOCK_REVOKED',
      OLD.lesson_id,
      jsonb_build_object('student_id', OLD.student_id, 'lesson_id', OLD.lesson_id)
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_manual_lesson_unlocks ON public.manual_lesson_unlocks;
CREATE TRIGGER trg_audit_manual_lesson_unlocks
BEFORE INSERT OR DELETE ON public.manual_lesson_unlocks
FOR EACH ROW EXECUTE FUNCTION public.log_manual_lesson_unlock_audit();

CREATE OR REPLACE FUNCTION public.log_course_audit()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (actor_id, action_type, target_id, details)
    VALUES (auth.uid(), 'COURSE_CREATED', NEW.id, jsonb_build_object('title', NEW.title, 'price', NEW.price, 'is_bundle', NEW.is_bundle));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF (NEW.title IS DISTINCT FROM OLD.title) OR (NEW.price IS DISTINCT FROM OLD.price) OR (NEW.deleted_at IS DISTINCT FROM OLD.deleted_at) OR (NEW.is_published IS DISTINCT FROM OLD.is_published) THEN
      INSERT INTO public.audit_logs (actor_id, action_type, target_id, details)
      VALUES (auth.uid(), 'COURSE_UPDATED', NEW.id, jsonb_build_object('title', NEW.title, 'price', NEW.price, 'deleted_at', NEW.deleted_at, 'is_published', NEW.is_published));
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (actor_id, action_type, target_id, details)
    VALUES (auth.uid(), 'COURSE_DELETED', OLD.id, jsonb_build_object('title', OLD.title));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_courses ON public.courses;
CREATE TRIGGER trg_audit_courses
AFTER INSERT OR UPDATE OR DELETE ON public.courses
FOR EACH ROW EXECUTE FUNCTION public.log_course_audit();

-- 6. RLS POLICIES
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO authenticated
USING (id = (SELECT auth.uid()) OR (SELECT public.has_admin_permission('manage_students')));

DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE TO authenticated
USING (id = (SELECT auth.uid()) OR (SELECT public.has_admin_permission('manage_students')))
WITH CHECK (id = (SELECT auth.uid()) OR (SELECT public.has_admin_permission('manage_students')));

DROP POLICY IF EXISTS "sessions_select" ON public.login_sessions;
CREATE POLICY "sessions_select" ON public.login_sessions FOR SELECT TO authenticated
USING (user_id = (SELECT auth.uid()) OR (SELECT public.has_admin_permission('manage_students')));

DROP POLICY IF EXISTS "sessions_insert" ON public.login_sessions;
CREATE POLICY "sessions_insert" ON public.login_sessions FOR INSERT TO authenticated
WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "sessions_update" ON public.login_sessions;
CREATE POLICY "sessions_update" ON public.login_sessions FOR UPDATE TO authenticated
USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "settings_select" ON public.platform_settings;
CREATE POLICY "settings_select" ON public.platform_settings FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "settings_admin" ON public.platform_settings;
CREATE POLICY "settings_admin" ON public.platform_settings FOR ALL TO authenticated
USING ((SELECT public.has_admin_permission('manage_settings')));

DROP POLICY IF EXISTS "courses_select" ON public.courses;
CREATE POLICY "courses_select" ON public.courses FOR SELECT TO anon, authenticated
USING (deleted_at IS NULL AND (is_published = true OR (SELECT public.has_admin_permission('manage_courses'))));

DROP POLICY IF EXISTS "courses_admin" ON public.courses;
CREATE POLICY "courses_admin" ON public.courses FOR ALL TO authenticated
USING ((SELECT public.has_admin_permission('manage_courses')));

DROP POLICY IF EXISTS "modules_select" ON public.modules;
CREATE POLICY "modules_select" ON public.modules FOR SELECT TO anon, authenticated USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "modules_admin" ON public.modules;
CREATE POLICY "modules_admin" ON public.modules FOR ALL TO authenticated
USING ((SELECT public.has_admin_permission('manage_courses')));

DROP POLICY IF EXISTS "map_select" ON public.course_modules_map;
CREATE POLICY "map_select" ON public.course_modules_map FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "map_admin" ON public.course_modules_map;
CREATE POLICY "map_admin" ON public.course_modules_map FOR ALL TO authenticated
USING ((SELECT public.has_admin_permission('manage_courses')));

DROP POLICY IF EXISTS "lessons_select" ON public.lessons;
CREATE POLICY "lessons_select" ON public.lessons FOR SELECT TO anon, authenticated USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "lessons_admin" ON public.lessons;
CREATE POLICY "lessons_admin" ON public.lessons FOR ALL TO authenticated
USING ((SELECT public.has_admin_permission('manage_courses')));

DROP POLICY IF EXISTS "exams_select" ON public.exams;
CREATE POLICY "exams_select" ON public.exams FOR SELECT TO authenticated USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "exams_admin" ON public.exams;
CREATE POLICY "exams_admin" ON public.exams FOR ALL TO authenticated
USING ((SELECT public.has_admin_permission('manage_exams')));

DROP POLICY IF EXISTS "lesson_items_select" ON public.lesson_items;
CREATE POLICY "lesson_items_select" ON public.lesson_items FOR SELECT TO authenticated USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "lesson_items_admin" ON public.lesson_items;
CREATE POLICY "lesson_items_admin" ON public.lesson_items FOR ALL TO authenticated
USING ((SELECT public.has_admin_permission('manage_courses')));

DROP POLICY IF EXISTS "questions_admin_only" ON public.exam_questions;
CREATE POLICY "questions_admin_only" ON public.exam_questions FOR ALL TO authenticated
USING ((SELECT public.has_admin_permission('manage_exams')));

DROP POLICY IF EXISTS "attempts_select" ON public.exam_attempts;
CREATE POLICY "attempts_select" ON public.exam_attempts FOR SELECT TO authenticated
USING (student_id = (SELECT auth.uid()) OR (SELECT public.has_admin_permission('manage_exams')));

DROP POLICY IF EXISTS "answers_select" ON public.exam_attempt_answers;
CREATE POLICY "answers_select" ON public.exam_attempt_answers FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.exam_attempts ea
    WHERE ea.id = attempt_id AND (ea.student_id = (SELECT auth.uid()) OR (SELECT public.has_admin_permission('manage_exams')))
  )
);

DROP POLICY IF EXISTS "mistakes_select" ON public.student_mistakes_bank;
CREATE POLICY "mistakes_select" ON public.student_mistakes_bank FOR SELECT TO authenticated
USING (student_id = (SELECT auth.uid()) OR (SELECT public.has_admin_permission('manage_students')));

DROP POLICY IF EXISTS "completions_select" ON public.lesson_completions;
CREATE POLICY "completions_select" ON public.lesson_completions FOR SELECT TO authenticated
USING (student_id = (SELECT auth.uid()) OR (SELECT public.has_admin_permission('manage_students')));

DROP POLICY IF EXISTS "codes_admin_only" ON public.activation_codes;
CREATE POLICY "codes_admin_only" ON public.activation_codes FOR ALL TO authenticated
USING ((SELECT public.has_admin_permission('manage_payments')));

DROP POLICY IF EXISTS "code_attempts_admin_only" ON public.code_redemption_attempts;
CREATE POLICY "code_attempts_admin_only" ON public.code_redemption_attempts FOR SELECT TO authenticated
USING ((SELECT public.has_admin_permission('manage_payments')));

DROP POLICY IF EXISTS "receipts_select" ON public.payment_receipts;
CREATE POLICY "receipts_select" ON public.payment_receipts FOR SELECT TO authenticated
USING (student_id = (SELECT auth.uid()) OR (SELECT public.has_admin_permission('manage_payments')));

DROP POLICY IF EXISTS "receipts_insert" ON public.payment_receipts;
CREATE POLICY "receipts_insert" ON public.payment_receipts FOR INSERT TO authenticated
WITH CHECK (student_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "receipts_update" ON public.payment_receipts;
CREATE POLICY "receipts_update" ON public.payment_receipts FOR UPDATE TO authenticated
USING ((SELECT public.has_admin_permission('manage_payments')));

DROP POLICY IF EXISTS "enrollments_select" ON public.course_enrollments;
CREATE POLICY "enrollments_select" ON public.course_enrollments FOR SELECT TO authenticated
USING (student_id = (SELECT auth.uid()) OR (SELECT public.has_admin_permission('manage_students')) OR (SELECT public.has_admin_permission('manage_payments')));

DROP POLICY IF EXISTS "enrollments_admin" ON public.course_enrollments;
CREATE POLICY "enrollments_admin" ON public.course_enrollments FOR ALL TO authenticated
USING ((SELECT public.has_admin_permission('manage_payments')));

DROP POLICY IF EXISTS "invoices_select" ON public.student_invoices;
CREATE POLICY "invoices_select" ON public.student_invoices FOR SELECT TO authenticated
USING (student_id = (SELECT auth.uid()) OR (SELECT public.has_admin_permission('manage_payments')));

DROP POLICY IF EXISTS "unlocks_select" ON public.manual_lesson_unlocks;
CREATE POLICY "unlocks_select" ON public.manual_lesson_unlocks FOR SELECT TO authenticated
USING (student_id = (SELECT auth.uid()) OR (SELECT public.has_admin_permission('manage_students')));

DROP POLICY IF EXISTS "unlocks_admin" ON public.manual_lesson_unlocks;
CREATE POLICY "unlocks_admin" ON public.manual_lesson_unlocks FOR ALL TO authenticated
USING ((SELECT public.has_admin_permission('manage_students')));

DROP POLICY IF EXISTS "forum_select" ON public.forum_questions;
CREATE POLICY "forum_select" ON public.forum_questions FOR SELECT TO authenticated
USING (student_id = (SELECT auth.uid()) OR is_public = true OR (SELECT public.has_admin_permission('manage_forum')));

DROP POLICY IF EXISTS "forum_insert" ON public.forum_questions;
CREATE POLICY "forum_insert" ON public.forum_questions FOR INSERT TO authenticated
WITH CHECK (student_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "forum_update" ON public.forum_questions;
CREATE POLICY "forum_update" ON public.forum_questions FOR UPDATE TO authenticated
USING ((SELECT public.has_admin_permission('manage_forum')));

DROP POLICY IF EXISTS "notifications_select" ON public.notifications;
CREATE POLICY "notifications_select" ON public.notifications FOR SELECT TO authenticated
USING (
  target_type = 'all'
  OR target_student_id = (SELECT auth.uid())
  OR (target_type = 'grade' AND target_grade_level = (SELECT grade_level FROM public.profiles WHERE id = (SELECT auth.uid())))
  OR (target_type = 'course' AND EXISTS (
    SELECT 1 FROM public.course_enrollments ce
    WHERE ce.student_id = (SELECT auth.uid())
      AND ce.course_id = target_course_id
      AND ce.status IN ('active', 'temp_active')
      AND (ce.expires_at IS NULL OR ce.expires_at > NOW())
  ))
  OR (SELECT public.has_admin_permission('manage_students'))
);

DROP POLICY IF EXISTS "notifications_admin" ON public.notifications;
CREATE POLICY "notifications_admin" ON public.notifications FOR ALL TO authenticated
USING ((SELECT public.has_admin_permission('manage_students')));

DROP POLICY IF EXISTS "audit_admins_only" ON public.audit_logs;
CREATE POLICY "audit_admins_only" ON public.audit_logs FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid()) AND p.role IN ('super_admin', 'admin')
  )
);

-- 7. RPC FUNCTIONS
CREATE OR REPLACE FUNCTION public.is_lesson_unlocked_for_student(p_student_id UUID, p_lesson_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_course_id UUID;
  v_is_unlocked BOOLEAN := false;
BEGIN
  IF public.has_admin_permission('manage_courses') OR public.has_admin_permission('manage_exams') THEN
    RETURN true;
  END IF;

  IF EXISTS (SELECT 1 FROM public.manual_lesson_unlocks WHERE student_id = p_student_id AND lesson_id = p_lesson_id) THEN
    RETURN true;
  END IF;

  FOR v_course_id IN
    SELECT DISTINCT cmm.course_id
    FROM public.lessons l
    JOIN public.course_modules_map cmm ON cmm.module_id = l.module_id
    JOIN public.courses c ON c.id = cmm.course_id AND c.deleted_at IS NULL
    WHERE l.id = p_lesson_id AND l.deleted_at IS NULL
      AND (
        c.is_free = true
        OR EXISTS (
          SELECT 1 FROM public.course_enrollments ce
          WHERE ce.student_id = p_student_id
            AND ce.status IN ('active', 'temp_active')
            AND (ce.expires_at IS NULL OR ce.expires_at > NOW())
            AND (ce.payment_receipt_id IS NULL OR NOT EXISTS (SELECT 1 FROM public.payment_receipts pr WHERE pr.id = ce.payment_receipt_id AND pr.status = 'rejected'))
            AND (
              ce.course_id = c.id
              OR (
                EXISTS (SELECT 1 FROM public.courses cb WHERE cb.id = ce.course_id AND cb.is_bundle = true AND cb.deleted_at IS NULL)
                AND NOT EXISTS (
                  SELECT 1 FROM public.course_modules_map cmm_s
                  WHERE cmm_s.course_id = c.id
                    AND NOT EXISTS (SELECT 1 FROM public.course_modules_map cmm_b WHERE cmm_b.course_id = ce.course_id AND cmm_b.module_id = cmm_s.module_id)
                )
              )
            )
        )
      )
  LOOP
    WITH ordered_lessons AS (
      SELECT
        l2.id AS lesson_id,
        l2.publish_at,
        ROW_NUMBER() OVER (ORDER BY cmm2.sort_order ASC, l2.sort_order ASC) AS global_seq,
        LAG(l2.id) OVER (ORDER BY cmm2.sort_order ASC, l2.sort_order ASC) AS prev_lesson_id,
        LAG(COALESCE(l2.required_pass_percentage, 50)) OVER (ORDER BY cmm2.sort_order ASC, l2.sort_order ASC) AS prev_req_pct
      FROM public.course_modules_map cmm2
      JOIN public.modules m2 ON m2.id = cmm2.module_id AND m2.deleted_at IS NULL
      JOIN public.lessons l2 ON l2.module_id = m2.id AND l2.deleted_at IS NULL
      WHERE cmm2.course_id = v_course_id
    )
    SELECT
      CASE
        WHEN ol.publish_at IS NOT NULL AND ol.publish_at > NOW() THEN false
        WHEN ol.global_seq = 1 THEN true
        WHEN NOT EXISTS (
          SELECT 1 FROM public.exams req_exam
          WHERE req_exam.lesson_id = ol.prev_lesson_id
            AND req_exam.exam_type IN ('quiz', 'homework')
            AND req_exam.deleted_at IS NULL
            AND NOT EXISTS (
              SELECT 1 FROM public.exam_attempts ea
              WHERE ea.exam_id = req_exam.id
                AND ea.student_id = p_student_id
                AND ea.status = 'submitted'
                AND ea.passed = true
                AND ea.score_percentage >= GREATEST(ol.prev_req_pct, COALESCE(req_exam.pass_percentage, 50))
            )
        ) THEN true
        ELSE false
      END
    INTO v_is_unlocked
    FROM ordered_lessons ol
    WHERE ol.lesson_id = p_lesson_id;

    IF v_is_unlocked THEN
      RETURN true;
    END IF;
  END LOOP;

  RETURN false;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_student_dashboard_data()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_student_id UUID := auth.uid();
  v_profile RECORD;
  v_result JSONB;
BEGIN
  IF v_student_id IS NULL THEN RAISE EXCEPTION 'UNAUTHORIZED'; END IF;

  SELECT id, full_name, phone, parent_phone, grade_level, education_type, governorate, review_status, last_notifications_read_at, created_at
  INTO v_profile FROM public.profiles WHERE id = v_student_id AND deleted_at IS NULL;

  IF NOT FOUND THEN RAISE EXCEPTION 'PROFILE_NOT_FOUND'; END IF;

  SELECT jsonb_build_object(
    'profile', jsonb_build_object(
      'id', v_profile.id, 'full_name', v_profile.full_name, 'phone', v_profile.phone,
      'parent_phone', v_profile.parent_phone, 'grade_level', v_profile.grade_level,
      'education_type', v_profile.education_type, 'governorate', v_profile.governorate,
      'review_status', v_profile.review_status, 'created_at', v_profile.created_at
    ),
    'enrolled_courses', COALESCE((
      SELECT jsonb_agg(course_item ORDER BY course_item.enrolled_at DESC)
      FROM (
        SELECT c.id, c.title, c.thumbnail_url, c.is_bundle, ce.status AS enrollment_status, ce.enrolled_at, ce.expires_at, ce.is_temporary_activation
        FROM public.course_enrollments ce
        JOIN public.courses c ON c.id = ce.course_id
        WHERE ce.student_id = v_student_id
          AND ce.status IN ('active', 'temp_active')
          AND (ce.expires_at IS NULL OR ce.expires_at > NOW())
          AND (ce.payment_receipt_id IS NULL OR NOT EXISTS (SELECT 1 FROM public.payment_receipts pr WHERE pr.id = ce.payment_receipt_id AND pr.status = 'rejected'))
          AND c.deleted_at IS NULL
          AND NOT (
            c.is_bundle = false
            AND EXISTS (SELECT 1 FROM public.course_modules_map cmm_has WHERE cmm_has.course_id = c.id)
            AND EXISTS (
              SELECT 1 FROM public.course_enrollments ce_b
              JOIN public.courses cb ON cb.id = ce_b.course_id AND cb.is_bundle = true AND cb.deleted_at IS NULL
              WHERE ce_b.student_id = v_student_id AND ce_b.status IN ('active', 'temp_active')
                AND (ce_b.expires_at IS NULL OR ce_b.expires_at > NOW())
                AND NOT EXISTS (
                  SELECT 1 FROM public.course_modules_map cmm_s
                  WHERE cmm_s.course_id = c.id
                    AND NOT EXISTS (SELECT 1 FROM public.course_modules_map cmm_b WHERE cmm_b.course_id = cb.id AND cmm_b.module_id = cmm_s.module_id)
                )
            )
          )
      ) course_item
    ), '[]'::jsonb),
    'recent_video_progress', COALESCE((
      SELECT jsonb_agg(vp_row) FROM (
        SELECT l.id AS lesson_id, l.title AS lesson_title, lc.watched_duration_seconds, lc.completed_at
        FROM public.lesson_completions lc
        JOIN public.lessons l ON l.id = lc.lesson_id AND l.deleted_at IS NULL
        WHERE lc.student_id = v_student_id ORDER BY lc.completed_at DESC LIMIT 5
      ) vp_row
    ), '[]'::jsonb),
    'recent_exam_attempts', COALESCE((
      SELECT jsonb_agg(ea_row) FROM (
        SELECT ea.id AS attempt_id, e.title AS exam_title, e.exam_type, ea.score, ea.score_percentage, ea.passed, ea.submitted_at
        FROM public.exam_attempts ea
        JOIN public.exams e ON e.id = ea.exam_id AND e.deleted_at IS NULL
        WHERE ea.student_id = v_student_id AND ea.status IN ('submitted', 'expired_submitted') ORDER BY ea.submitted_at DESC LIMIT 5
      ) ea_row
    ), '[]'::jsonb),
    'notifications_summary', (
      SELECT jsonb_build_object(
        'unread_count', COUNT(*) FILTER (WHERE n.created_at > COALESCE(v_profile.last_notifications_read_at, v_profile.created_at))::INT,
        'latest_notification', (
          SELECT jsonb_build_object(
            'id', n2.id, 'title', n2.title, 'body', n2.body, 'created_at', n2.created_at,
            'is_read', (n2.created_at <= COALESCE(v_profile.last_notifications_read_at, v_profile.created_at))
          )
          FROM public.notifications n2
          WHERE (
            n2.target_type = 'all'
            OR (n2.target_type = 'grade' AND n2.target_grade_level = v_profile.grade_level)
            OR (n2.target_type = 'student' AND n2.target_student_id = v_student_id)
            OR (n2.target_type = 'course' AND EXISTS (
              SELECT 1 FROM public.course_enrollments ce2
              WHERE ce2.student_id = v_student_id AND ce2.course_id = n2.target_course_id
                AND ce2.status IN ('active', 'temp_active') AND (ce2.expires_at IS NULL OR ce2.expires_at > NOW())
            ))
          )
          ORDER BY n2.created_at DESC LIMIT 1
        )
      )
      FROM public.notifications n
      WHERE (
        n.target_type = 'all'
        OR (n.target_type = 'grade' AND n.target_grade_level = v_profile.grade_level)
        OR (n.target_type = 'student' AND n.target_student_id = v_student_id)
        OR (n.target_type = 'course' AND EXISTS (
          SELECT 1 FROM public.course_enrollments ce
          WHERE ce.student_id = v_student_id AND ce.course_id = n.target_course_id
            AND ce.status IN ('active', 'temp_active') AND (ce.expires_at IS NULL OR ce.expires_at > NOW())
        ))
      )
    ),
    'student_stats', jsonb_build_object(
      'completed_lessons_count', (SELECT COUNT(*)::INT FROM public.lesson_completions WHERE student_id = v_student_id),
      'mistakes_count', (SELECT COUNT(*)::INT FROM public.student_mistakes_bank WHERE student_id = v_student_id)
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_course_tree_with_locks(p_course_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_student_id UUID := auth.uid();
  v_is_enrolled BOOLEAN := false;
  v_result JSONB;
BEGIN
  IF v_student_id IS NULL THEN RAISE EXCEPTION 'UNAUTHORIZED'; END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.course_enrollments ce
    WHERE ce.student_id = v_student_id
      AND ce.status IN ('active', 'temp_active')
      AND (ce.expires_at IS NULL OR ce.expires_at > NOW())
      AND (ce.payment_receipt_id IS NULL OR NOT EXISTS (SELECT 1 FROM public.payment_receipts pr WHERE pr.id = ce.payment_receipt_id AND pr.status = 'rejected'))
      AND (
        ce.course_id = p_course_id
        OR (
          EXISTS (SELECT 1 FROM public.courses cb WHERE cb.id = ce.course_id AND cb.is_bundle = true AND cb.deleted_at IS NULL)
          AND EXISTS (SELECT 1 FROM public.course_modules_map cmm_has WHERE cmm_has.course_id = p_course_id)
          AND NOT EXISTS (
            SELECT 1 FROM public.course_modules_map cmm_s
            WHERE cmm_s.course_id = p_course_id
              AND NOT EXISTS (SELECT 1 FROM public.course_modules_map cmm_b WHERE cmm_b.course_id = ce.course_id AND cmm_b.module_id = cmm_s.module_id)
          )
        )
      )
  ) OR EXISTS (SELECT 1 FROM public.courses c WHERE c.id = p_course_id AND c.is_free = true)
    OR public.has_admin_permission('manage_courses')
  INTO v_is_enrolled;

  WITH ordered_lessons AS (
    SELECT
      cmm.module_id, m.title AS module_title, cmm.sort_order AS module_order,
      l.id AS lesson_id, l.title AS lesson_title, l.sort_order AS lesson_order, l.publish_at,
      ROW_NUMBER() OVER (ORDER BY cmm.sort_order ASC, l.sort_order ASC) AS global_seq,
      LAG(l.id) OVER (ORDER BY cmm.sort_order ASC, l.sort_order ASC) AS prev_lesson_id,
      LAG(COALESCE(l.required_pass_percentage, 50)) OVER (ORDER BY cmm.sort_order ASC, l.sort_order ASC) AS prev_required_pass_pct
    FROM public.course_modules_map cmm
    JOIN public.modules m ON m.id = cmm.module_id AND m.deleted_at IS NULL
    JOIN public.lessons l ON l.module_id = m.id AND l.deleted_at IS NULL
    WHERE cmm.course_id = p_course_id
  ),
  evaluated_lessons AS (
    SELECT ol.*,
      CASE
        WHEN public.has_admin_permission('manage_courses') THEN true
        WHEN NOT v_is_enrolled THEN false
        WHEN ol.publish_at IS NOT NULL AND ol.publish_at > NOW() AND NOT EXISTS (SELECT 1 FROM public.manual_lesson_unlocks mlu WHERE mlu.student_id = v_student_id AND mlu.lesson_id = ol.lesson_id) THEN false
        WHEN EXISTS (SELECT 1 FROM public.manual_lesson_unlocks mlu WHERE mlu.student_id = v_student_id AND mlu.lesson_id = ol.lesson_id) THEN true
        WHEN ol.global_seq = 1 THEN true
        WHEN NOT EXISTS (
          SELECT 1 FROM public.exams req_exam
          WHERE req_exam.lesson_id = ol.prev_lesson_id AND req_exam.exam_type IN ('quiz', 'homework') AND req_exam.deleted_at IS NULL
            AND NOT EXISTS (
              SELECT 1 FROM public.exam_attempts ea
              WHERE ea.exam_id = req_exam.id AND ea.student_id = v_student_id
                AND ea.status = 'submitted'
                AND ea.passed = true
                AND ea.score_percentage >= GREATEST(ol.prev_required_pass_pct, COALESCE(req_exam.pass_percentage, 50))
            )
        ) THEN true
        ELSE false
      END AS is_lesson_unlocked
    FROM ordered_lessons ol
  ),
  modules_grouped AS (
    SELECT el.module_id, el.module_title, el.module_order,
      jsonb_agg(
        jsonb_build_object(
          'lesson_id', el.lesson_id, 'title', el.lesson_title, 'is_unlocked', el.is_lesson_unlocked,
          'items', (
            SELECT COALESCE(jsonb_agg(
              jsonb_build_object(
                'item_id', li.id, 'item_type', li.item_type, 'title', li.title, 'exam_id', li.exam_id, 'duration_seconds', li.duration_seconds,
                'is_item_unlocked', (
                  (public.has_admin_permission('manage_courses') OR el.is_lesson_unlocked) AND (
                    li.unlock_after_exam_id IS NULL OR public.has_admin_permission('manage_courses') OR EXISTS (
                      SELECT 1 FROM public.exam_attempts ea
                      WHERE ea.exam_id = li.unlock_after_exam_id AND ea.student_id = v_student_id AND ea.status = 'submitted' AND ea.passed = true
                    )
                  )
                )
              ) ORDER BY li.sort_order ASC
            ), '[]'::jsonb)
            FROM public.lesson_items li WHERE li.lesson_id = el.lesson_id AND li.deleted_at IS NULL
          )
        ) ORDER BY el.lesson_order ASC
      ) AS lessons
    FROM evaluated_lessons el GROUP BY el.module_id, el.module_title, el.module_order
  )
  SELECT COALESCE(jsonb_agg(jsonb_build_object('module_id', mg.module_id, 'module_title', mg.module_title, 'lessons', mg.lessons) ORDER BY mg.module_order ASC), '[]'::jsonb)
  INTO v_result FROM modules_grouped mg;

  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_authorized_lesson_item_content(p_item_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_student_id UUID := auth.uid();
  v_item RECORD;
BEGIN
  IF v_student_id IS NULL THEN RAISE EXCEPTION 'UNAUTHORIZED'; END IF;

  SELECT id, lesson_id, title, item_type, r2_path_or_url, unlock_after_exam_id, duration_seconds
  INTO v_item
  FROM public.lesson_items
  WHERE id = p_item_id AND deleted_at IS NULL;

  IF NOT FOUND THEN RAISE EXCEPTION 'ITEM_NOT_FOUND'; END IF;

  IF NOT public.is_lesson_unlocked_for_student(v_student_id, v_item.lesson_id) THEN
    RAISE EXCEPTION 'LESSON_LOCKED: هذه المحاضرة مقفولة، يجب الاشتراك واجتياز متطلبات المحاضرة السابقة أولاً';
  END IF;

  IF v_item.unlock_after_exam_id IS NOT NULL AND NOT public.has_admin_permission('manage_courses') THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.exam_attempts ea
      WHERE ea.exam_id = v_item.unlock_after_exam_id
        AND ea.student_id = v_student_id
        AND ea.status = 'submitted'
        AND ea.passed = true
    ) THEN
      RAISE EXCEPTION 'SOLUTION_LOCKED: فيديو/ملف الحل يفتح فقط بعد تسليم واجتياز الكويز أو الواجب المرتبط به';
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'item_id', v_item.id,
    'title', v_item.title,
    'item_type', v_item.item_type,
    'r2_path_or_url', v_item.r2_path_or_url,
    'duration_seconds', v_item.duration_seconds
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_get_lesson_items_with_paths(p_lesson_id UUID)
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_admin_permission('manage_courses') THEN
    RAISE EXCEPTION 'FORBIDDEN_ADMIN_ONLY';
  END IF;

  RETURN COALESCE((
    SELECT jsonb_agg(row_to_json(li) ORDER BY li.sort_order ASC)
    FROM public.lesson_items li
    WHERE li.lesson_id = p_lesson_id AND li.deleted_at IS NULL
  ), '[]'::jsonb);
END;
$$;

CREATE OR REPLACE FUNCTION public.record_lesson_watch_completion(p_lesson_id UUID, p_course_id UUID, p_watched_seconds INT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_student_id UUID := auth.uid();
  v_max_duration INT;
  v_safe_seconds INT;
BEGIN
  IF v_student_id IS NULL THEN RAISE EXCEPTION 'UNAUTHORIZED'; END IF;

  IF NOT public.is_lesson_unlocked_for_student(v_student_id, p_lesson_id) THEN
    RAISE EXCEPTION 'LESSON_LOCKED';
  END IF;

  SELECT COALESCE(MAX(duration_seconds), 7200) INTO v_max_duration
  FROM public.lesson_items
  WHERE lesson_id = p_lesson_id AND item_type = 'video' AND deleted_at IS NULL;

  v_safe_seconds := LEAST(GREATEST(COALESCE(p_watched_seconds, 0), 0), GREATEST(v_max_duration, 1));

  INSERT INTO public.lesson_completions (student_id, lesson_id, course_id, watched_duration_seconds, completed_at)
  VALUES (v_student_id, p_lesson_id, p_course_id, v_safe_seconds, NOW())
  ON CONFLICT (student_id, lesson_id) DO UPDATE
  SET watched_duration_seconds = GREATEST(public.lesson_completions.watched_duration_seconds, EXCLUDED.watched_duration_seconds),
      course_id = COALESCE(EXCLUDED.course_id, public.lesson_completions.course_id),
      completed_at = NOW();

  RETURN jsonb_build_object('success', true, 'watched_duration_seconds', v_safe_seconds);
END;
$$;

CREATE OR REPLACE FUNCTION public.start_or_resume_exam(p_exam_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_student_id UUID := auth.uid();
  v_exam RECORD;
  v_attempt RECORD;
  v_question_ids UUID[];
  v_questions JSONB;
  v_Closed_count INT := 0;
  v_previous_attempts INT := 0;
  v_last_submitted_at TIMESTAMPTZ;
BEGIN
  IF v_student_id IS NULL THEN RAISE EXCEPTION 'UNAUTHORIZED'; END IF;

  PERFORM pg_advisory_xact_lock(hashtext('start_exam_' || v_student_id::text || '_' || p_exam_id::text));

  SELECT id, lesson_id, title, duration_minutes, pass_percentage, max_attempts, retake_cooldown_seconds, shuffle_questions, min_score, avg_score, max_score, entries_count, completions_count
  INTO v_exam FROM public.exams WHERE id = p_exam_id AND deleted_at IS NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'EXAM_NOT_FOUND'; END IF;

  IF v_exam.lesson_id IS NULL OR NOT public.is_lesson_unlocked_for_student(v_student_id, v_exam.lesson_id) THEN
    RAISE EXCEPTION 'EXAM_LESSON_LOCKED: لا يمكنك دخول هذا الامتحان قبل فتح المحاضرة الخاصة به';
  END IF;

  SELECT * INTO v_attempt FROM public.exam_attempts
  WHERE exam_id = p_exam_id AND student_id = v_student_id AND status = 'in_progress' AND expires_at > NOW()
  ORDER BY started_at DESC LIMIT 1;

  IF NOT FOUND THEN
    WITH closed AS (
      UPDATE public.exam_attempts
      SET status = 'expired_submitted', submitted_at = expires_at, passed = false
      WHERE exam_id = p_exam_id AND student_id = v_student_id AND status = 'in_progress' AND expires_at <= NOW()
      RETURNING id
    )
    SELECT COUNT(*)::INT INTO v_Closed_count FROM closed;

    IF v_Closed_count > 0 THEN
      UPDATE public.exams e
      SET min_score = stats.min_s, avg_score = stats.avg_s, max_score = stats.max_s, completions_count = stats.comp_c
      FROM (
        SELECT COALESCE(MIN(score), 0) AS min_s, COALESCE(ROUND(AVG(score), 2), 0) AS avg_s, COALESCE(MAX(score), 0) AS max_s, COUNT(*)::INT AS comp_c
        FROM public.exam_attempts WHERE exam_id = p_exam_id AND status IN ('submitted', 'expired_submitted')
      ) stats
      WHERE e.id = p_exam_id;
    END IF;

    SELECT COUNT(*)::INT, MAX(submitted_at)
    INTO v_previous_attempts, v_last_submitted_at
    FROM public.exam_attempts
    WHERE exam_id = p_exam_id AND student_id = v_student_id AND status IN ('submitted', 'expired_submitted');

    IF v_exam.max_attempts IS NOT NULL AND v_previous_attempts >= v_exam.max_attempts THEN
      RAISE EXCEPTION 'MAX_ATTEMPTS_REACHED: لقد استنفدت الحد الأقصى لمحاولات هذا الامتحان';
    END IF;

    IF v_exam.retake_cooldown_seconds > 0 AND v_last_submitted_at IS NOT NULL AND NOW() < (v_last_submitted_at + (v_exam.retake_cooldown_seconds * INTERVAL '1 second')) THEN
      RAISE EXCEPTION 'RETAKE_COOLDOWN_ACTIVE: يرجى الانتظار قليلاً قبل إعادة محاولة الامتحان';
    END IF;

    SELECT ARRAY_AGG(q.id ORDER BY CASE WHEN v_exam.shuffle_questions THEN RANDOM() ELSE q.sort_order::FLOAT END)
    INTO v_question_ids FROM public.exam_questions q WHERE q.exam_id = p_exam_id AND q.deleted_at IS NULL;

    IF v_question_ids IS NULL OR cardinality(v_question_ids) = 0 THEN
      RAISE EXCEPTION 'EXAM_HAS_NO_QUESTIONS: لم يتم إضافة أسئلة لهذا الامتحان بعد';
    END IF;

    INSERT INTO public.exam_attempts (exam_id, student_id, started_at, expires_at, total_questions, assigned_question_ids, status)
    VALUES (p_exam_id, v_student_id, NOW(), NOW() + (v_exam.duration_minutes * INTERVAL '1 minute'), cardinality(v_question_ids), v_question_ids, 'in_progress')
    RETURNING * INTO v_attempt;

    UPDATE public.exams SET entries_count = entries_count + 1 WHERE id = p_exam_id RETURNING entries_count INTO v_exam.entries_count;
  END IF;

  SELECT jsonb_agg(jsonb_build_object('id', q.id, 'image_url', q.image_url, 'question_text', q.question_text, 'points', q.points) ORDER BY u.ord ASC)
  INTO v_questions
  FROM UNNEST(v_attempt.assigned_question_ids) WITH ORDINALITY AS u(q_id, ord)
  JOIN public.exam_questions q ON q.id = u.q_id AND q.deleted_at IS NULL;

  RETURN jsonb_build_object(
    'attempt_id', v_attempt.id,
    'remaining_seconds', GREATEST(0, EXTRACT(EPOCH FROM (v_attempt.expires_at - NOW()))::INT),
    'questions', COALESCE(v_questions, '[]'::jsonb),
    'exam_stats', jsonb_build_object('min_score', v_exam.min_score, 'avg_score', v_exam.avg_score, 'max_score', v_exam.max_score, 'entries_count', v_exam.entries_count, 'completions_count', v_exam.completions_count)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.submit_exam_attempt(p_attempt_id UUID, p_answers JSONB)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_student_id UUID := auth.uid();
  v_attempt RECORD;
  v_exam_stats RECORD;
  v_score NUMERIC := 0;
  v_total NUMERIC := 1;
  v_pct NUMERIC := 0;
  v_solved_count INT := 0;
  v_correct_count INT := 0;
  v_passed BOOLEAN := false;
  v_final_status TEXT := 'submitted';
BEGIN
  IF v_student_id IS NULL THEN RAISE EXCEPTION 'UNAUTHORIZED'; END IF;

  SELECT ea.*, e.exam_type, COALESCE(e.pass_percentage, 50) AS pass_pct
  INTO v_attempt
  FROM public.exam_attempts ea JOIN public.exams e ON e.id = ea.exam_id
  WHERE ea.id = p_attempt_id AND ea.student_id = v_student_id FOR UPDATE OF ea;

  IF NOT FOUND OR v_attempt.status IN ('submitted', 'expired_submitted') THEN
    RAISE EXCEPTION 'INVALID_OR_ALREADY_SUBMITTED_ATTEMPT';
  END IF;

  IF NOW() > (v_attempt.expires_at + INTERVAL '60 seconds') THEN
    v_final_status := 'expired_submitted';
  END IF;

  INSERT INTO public.exam_attempt_answers (attempt_id, question_id, selected_option, is_correct)
  SELECT p_attempt_id, eq.id, ans.selected_option, COALESCE(ans.selected_option = eq.correct_option, false)
  FROM UNNEST(v_attempt.assigned_question_ids) AS u(q_id)
  JOIN public.exam_questions eq ON eq.id = u.q_id AND eq.deleted_at IS NULL
  LEFT JOIN LATERAL (
    SELECT CASE WHEN (item ->> 'selected_option') IN ('a', 'b', 'c', 'd') THEN (item ->> 'selected_option') ELSE NULL END AS selected_option
    FROM jsonb_array_elements(COALESCE(p_answers, '[]'::jsonb)) AS item
    WHERE (item ->> 'question_id')::UUID = eq.id LIMIT 1
  ) ans ON true
  ON CONFLICT (attempt_id, question_id) DO UPDATE SET selected_option = EXCLUDED.selected_option, is_correct = EXCLUDED.is_correct;

  SELECT
    COALESCE(SUM(CASE WHEN eaa.is_correct THEN eq.points ELSE 0 END), 0),
    GREATEST(1, COALESCE(SUM(eq.points), 1)),
    COUNT(*) FILTER (WHERE eaa.selected_option IS NOT NULL)::INT,
    COUNT(*) FILTER (WHERE eaa.is_correct = true)::INT
  INTO v_score, v_total, v_solved_count, v_correct_count
  FROM UNNEST(v_attempt.assigned_question_ids) AS u(q_id)
  JOIN public.exam_questions eq ON eq.id = u.q_id AND eq.deleted_at IS NULL
  LEFT JOIN public.exam_attempt_answers eaa ON eaa.attempt_id = p_attempt_id AND eaa.question_id = eq.id;

  v_pct := ROUND((v_score / v_total) * 100, 2);
  v_passed := (v_final_status = 'submitted' AND (v_score * 100) >= (v_total * v_attempt.pass_pct));

  UPDATE public.exam_attempts
  SET status = v_final_status,
      submitted_at = LEAST(NOW(), v_attempt.expires_at + INTERVAL '60 seconds'),
      solved_questions = v_solved_count,
      correct_answers_count = v_correct_count,
      score = v_score,
      score_percentage = v_pct,
      passed = v_passed
  WHERE id = p_attempt_id;

  UPDATE public.exams
  SET
    min_score = CASE WHEN completions_count = 0 THEN v_score ELSE LEAST(min_score, v_score) END,
    max_score = CASE WHEN completions_count = 0 THEN v_score ELSE GREATEST(max_score, v_score) END,
    avg_score = ROUND(((avg_score * completions_count) + v_score) / (completions_count + 1), 2),
    completions_count = completions_count + 1
  WHERE id = v_attempt.exam_id
  RETURNING min_score, avg_score, max_score, entries_count, completions_count INTO v_exam_stats;

  DELETE FROM public.student_mistakes_bank smb
  USING public.exam_attempt_answers eaa
  WHERE smb.student_id = v_student_id AND eaa.attempt_id = p_attempt_id AND smb.question_id = eaa.question_id AND eaa.is_correct = true;

  INSERT INTO public.student_mistakes_bank (student_id, question_id, exam_id, source_type, wrong_option, updated_at)
  SELECT v_student_id, eaa.question_id, v_attempt.exam_id, v_attempt.exam_type, eaa.selected_option, NOW()
  FROM public.exam_attempt_answers eaa
  WHERE eaa.attempt_id = p_attempt_id AND eaa.is_correct = false
  ON CONFLICT (student_id, question_id) DO UPDATE SET exam_id = EXCLUDED.exam_id, wrong_option = EXCLUDED.wrong_option, source_type = EXCLUDED.source_type, updated_at = NOW();

  RETURN jsonb_build_object(
    'score', v_score, 'score_percentage', v_pct, 'passed', v_passed,
    'solved_questions', v_solved_count, 'correct_answers_count', v_correct_count,
    'status', v_final_status,
    'exam_stats', jsonb_build_object('min_score', v_exam_stats.min_score, 'avg_score', v_exam_stats.avg_score, 'max_score', v_exam_stats.max_score, 'entries_count', v_exam_stats.entries_count, 'completions_count', v_exam_stats.completions_count)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.review_submitted_attempt(p_attempt_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_student_id UUID := auth.uid();
  v_attempt RECORD;
  v_exam RECORD;
  v_has_passed_exam BOOLEAN := false;
  v_can_reveal_answers BOOLEAN := false;
  v_req_pct INT := 50;
  v_items JSONB;
BEGIN
  SELECT * INTO v_attempt FROM public.exam_attempts
  WHERE id = p_attempt_id AND (student_id = v_student_id OR public.has_admin_permission('manage_exams'));

  IF NOT FOUND OR v_attempt.status NOT IN ('submitted', 'expired_submitted') THEN
    RAISE EXCEPTION 'ATTEMPT_NOT_SUBMITTED_YET';
  END IF;

  SELECT * INTO v_exam FROM public.exams WHERE id = v_attempt.exam_id;
  v_req_pct := COALESCE(v_exam.pass_percentage, 50);

  SELECT EXISTS (
    SELECT 1 FROM public.exam_attempts ea
    WHERE ea.exam_id = v_attempt.exam_id AND ea.student_id = v_attempt.student_id
      AND ea.status = 'submitted'
      AND ea.passed = true
  ) INTO v_has_passed_exam;

  v_can_reveal_answers := v_has_passed_exam OR COALESCE(v_exam.allow_review_before_pass, false) OR public.has_admin_permission('manage_exams');

  SELECT jsonb_agg(
    jsonb_build_object(
      'question_id', q.id,
      'image_url', q.image_url,
      'question_text', q.question_text,
      'selected_option', eaa.selected_option,
      'correct_option', CASE WHEN v_can_reveal_answers THEN q.correct_option ELSE NULL END,
      'is_correct', CASE WHEN v_can_reveal_answers THEN eaa.is_correct ELSE NULL END,
      'points', q.points
    ) ORDER BY u.ord ASC
  ) INTO v_items
  FROM UNNEST(v_attempt.assigned_question_ids) WITH ORDINALITY AS u(q_id, ord)
  JOIN public.exam_questions q ON q.id = u.q_id AND q.deleted_at IS NULL
  LEFT JOIN public.exam_attempt_answers eaa ON eaa.attempt_id = p_attempt_id AND eaa.question_id = q.id;

  RETURN jsonb_build_object(
    'attempt', row_to_json(v_attempt),
    'answers_revealed', v_can_reveal_answers,
    'message', CASE WHEN v_can_reveal_answers THEN NULL ELSE format('تظهر الإجابات الصحيحة النموذجية فور اجتيازك لنسبة النجاح المطلوبة (%s%%) في الوقت المحدد لمنع الغش قبل الإعادة', v_req_pct) END,
    'questions', COALESCE(v_items, '[]'::jsonb)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.redeem_activation_code(p_raw_code TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_student_id UUID := auth.uid();
  v_normalized_code TEXT;
  v_failed_count INT;
  v_code_row RECORD;
  v_validity_days INT;
BEGIN
  IF v_student_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'UNAUTHORIZED');
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('code_redeem_limit_' || v_student_id::text));

  SELECT COUNT(*) INTO v_failed_count
  FROM public.code_redemption_attempts
  WHERE student_id = v_student_id AND succeeded = false AND created_at > (NOW() - INTERVAL '1 hour');

  IF v_failed_count >= 5 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'CODE_BRUTE_FORCE_LOCKED',
      'message', 'لقد أدخلت أكواداً خاطئة 5 مرات، يرجى الانتظار ساعة قبل المحاولة مجدداً'
    );
  END IF;

  v_normalized_code := UPPER(REGEXP_REPLACE(TRANSLATE(COALESCE(p_raw_code, ''), '٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹', '01234567890123456789'), '\s+', '', 'g'));
  IF v_normalized_code = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'INVALID_CODE');
  END IF;

  SELECT id, course_id, is_used, used_by, expires_at, price_amount
  INTO v_code_row FROM public.activation_codes WHERE code = v_normalized_code AND deleted_at IS NULL FOR UPDATE;

  IF NOT FOUND OR v_code_row.is_used = true OR v_code_row.used_by IS NOT NULL OR (v_code_row.expires_at IS NOT NULL AND v_code_row.expires_at < NOW()) THEN
    INSERT INTO public.code_redemption_attempts (student_id, attempted_code, succeeded)
    VALUES (v_student_id, v_normalized_code, false);

    RETURN jsonb_build_object(
      'success', false,
      'error', 'INVALID_OR_USED_CODE',
      'remaining_attempts', GREATEST(0, 4 - v_failed_count),
      'message', 'كود التفعيل غير صحيح أو تم استخدامه مسبقاً'
    );
  END IF;

  INSERT INTO public.code_redemption_attempts (student_id, attempted_code, succeeded)
  VALUES (v_student_id, v_normalized_code, true);

  SELECT COALESCE(validity_days, 365) INTO v_validity_days FROM public.courses WHERE id = v_code_row.course_id;

  UPDATE public.activation_codes SET is_used = true, used_by = v_student_id, used_at = NOW() WHERE id = v_code_row.id;

  INSERT INTO public.course_enrollments (
    student_id, course_id, enrollment_method, activation_code_id, payment_receipt_id, status, is_temporary_activation, enrolled_at, expires_at
  )
  VALUES (
    v_student_id, v_code_row.course_id, 'center_code', v_code_row.id, NULL, 'active', false, NOW(), NOW() + (v_validity_days * INTERVAL '1 day')
  )
  ON CONFLICT (student_id, course_id) DO UPDATE
  SET status = 'active',
      enrollment_method = 'center_code',
      activation_code_id = v_code_row.id,
      payment_receipt_id = NULL,
      is_temporary_activation = false,
      enrolled_at = NOW(),
      expires_at = NOW() + (v_validity_days * INTERVAL '1 day');

  INSERT INTO public.student_invoices (student_id, course_id, payment_method, amount, reference_number, status)
  VALUES (v_student_id, v_code_row.course_id, 'center_code', v_code_row.price_amount, v_normalized_code, 'approved');

  RETURN jsonb_build_object('success', true, 'course_id', v_code_row.course_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_all_notifications_read()
RETURNS VOID LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.profiles SET last_notifications_read_at = NOW() WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_staff_auth_email(p_phone text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_email text;
BEGIN
  SELECT u.email INTO v_email
  FROM auth.users u
  JOIN public.profiles p ON p.id = u.id
  WHERE p.phone = p_phone
    AND p.role IN ('assistant', 'admin', 'super_admin')
    AND p.deleted_at IS NULL
  LIMIT 1;

  RETURN v_email;
END;
$$;

-- 8. GRANTS
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC, anon, authenticated;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC, anon, authenticated;

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

GRANT EXECUTE ON FUNCTION public.has_admin_permission(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_staff_auth_email(TEXT) TO anon, authenticated;
GRANT SELECT ON public.platform_settings, public.courses, public.modules, public.course_modules_map, public.lessons TO anon;

GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.login_sessions TO authenticated;
GRANT SELECT ON public.platform_settings, public.courses, public.modules, public.course_modules_map, public.lessons, public.exams TO authenticated;
GRANT SELECT ON public.exam_attempts, public.student_mistakes_bank, public.lesson_completions TO authenticated;
GRANT SELECT, INSERT ON public.payment_receipts, public.forum_questions TO authenticated;
GRANT SELECT ON public.course_enrollments, public.student_invoices, public.manual_lesson_unlocks, public.notifications, public.audit_logs, public.code_redemption_attempts TO authenticated;

GRANT SELECT (id, lesson_id, title, item_type, exam_id, unlock_after_exam_id, duration_seconds, sort_order, created_at, deleted_at)
  ON public.lesson_items TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.lesson_items TO authenticated;

GRANT SELECT (id, attempt_id, question_id, selected_option)
  ON public.exam_attempt_answers TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.courses, public.modules, public.course_modules_map, public.lessons, public.exams, public.exam_questions, public.activation_codes, public.payment_receipts, public.course_enrollments, public.manual_lesson_unlocks, public.forum_questions, public.notifications, public.platform_settings TO authenticated;

GRANT EXECUTE ON FUNCTION public.get_student_dashboard_data() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_course_tree_with_locks(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_authorized_lesson_item_content(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_lesson_items_with_paths(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_lesson_watch_completion(UUID, UUID, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.start_or_resume_exam(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_exam_attempt(UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.review_submitted_attempt(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_activation_code(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_all_notifications_read() TO authenticated;
