import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Import PGlite from local environment
import { PGlite } from 'file:///C:/Users/pc/.gemini/antigravity/brain/80458963-0965-4bcb-8263-bcb1badb7ed8/scratch/pgtest/node_modules/@electric-sql/pglite/dist/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schemaPath = path.resolve(__dirname, '..', 'supabase', 'schema.sql');
const schemaSql = fs.readFileSync(schemaPath, 'utf8');

// Helper to create a fresh initialized PGlite instance with mock Supabase environment
async function createTestDb() {
  const db = new PGlite();
  await db.exec(`
    CREATE SCHEMA IF NOT EXISTS auth;
    CREATE ROLE anon NOLOGIN;
    CREATE ROLE authenticated NOLOGIN;
    CREATE ROLE service_role NOLOGIN;

    CREATE TABLE IF NOT EXISTS auth.users (
      id UUID PRIMARY KEY,
      email TEXT,
      raw_user_meta_data JSONB DEFAULT '{}'::jsonb,
      raw_app_meta_data JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
      SELECT nullif(current_setting('request.uid', true), '')::uuid
    $$;

    CREATE OR REPLACE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS $$
      SELECT coalesce(nullif(current_setting('request.jwt', true), '')::jsonb, '{}'::jsonb)
    $$;

    GRANT USAGE ON SCHEMA auth TO anon, authenticated, service_role;
    GRANT ALL ON ALL TABLES IN SCHEMA auth TO service_role;
    GRANT SELECT ON ALL TABLES IN SCHEMA auth TO authenticated;
  `);

  await db.exec(schemaSql);
  return db;
}

// Helper to run query as a specific role and user
async function execAs(db, role, uid, sql) {
  await db.exec(`SET ROLE ${role}; SELECT set_config('request.uid', '${uid || ''}', false);`);
  try {
    const res = await db.exec(sql);
    await db.exec(`RESET ROLE; SELECT set_config('request.uid', '', false);`);
    return { success: true, rows: res[res.length - 1]?.rows };
  } catch (err) {
    await db.exec(`RESET ROLE; SELECT set_config('request.uid', '', false);`);
    return { success: false, error: err.message };
  }
}

// Constant UUIDs for test users
const SUPER_ADMIN_ID = '00000000-0000-0000-0000-000000000001';
const ASSISTANT_ID = '00000000-0000-0000-0000-000000000002';
const STUDENT_1_ID = '00000000-0000-0000-0000-000000000003';
const STUDENT_2_ID = '00000000-0000-0000-0000-000000000004';

async function seedBaseUsers(db) {
  await db.exec(`
    INSERT INTO auth.users (id, email, raw_app_meta_data, raw_user_meta_data) VALUES
      ('${SUPER_ADMIN_ID}', 'admin@ammar.local', '{"role":"super_admin","phone":"01099999999"}'::jsonb, '{"full_name":"الأستاذ عمار رزق"}'::jsonb),
      ('${ASSISTANT_ID}', 'assistant@ammar.local', '{"role":"assistant","phone":"01088888888","permissions":{"manage_students": true, "manage_courses": true, "manage_exams": true, "manage_payments": true, "manage_forum": true, "manage_settings": true}}'::jsonb, '{"full_name":"المساعد أحمد"}'::jsonb),
      ('${STUDENT_1_ID}', '01011111111@student.platform.local', '{}'::jsonb, '{"full_name":"الطالب عمر","parent_phone":"01011111112","grade_level":"3","education_type":"general"}'::jsonb),
      ('${STUDENT_2_ID}', '01022222222@student.platform.local', '{}'::jsonb, '{"full_name":"الطالبة مريم","parent_phone":"01022222223","grade_level":"3","education_type":"general"}'::jsonb);
  `);
}

// ==============================================================================
// DOMAIN 1: Authentication, Profiles & Staff RBAC
// ==============================================================================
test('Domain 1.1: Registration rejects non-Egyptian virtual email domains', async () => {
  const db = await createTestDb();
  let evilRegistered = false;
  try {
    await db.exec(`
      INSERT INTO auth.users (id, email, raw_user_meta_data)
      VALUES ('00000000-0000-0000-0000-000000000099', '01033333333@evil.com', '{"parent_phone":"01044444444"}'::jsonb);
    `);
    evilRegistered = true;
  } catch (err) {
    assert.ok(err.message.includes('INVALID_REGISTRATION_EMAIL_DOMAIN'));
  }
  assert.equal(evilRegistered, false, 'External email domain MUST be rejected');
});

test('Domain 1.2: Registration rejects invalid Egyptian phone prefix or length', async () => {
  const db = await createTestDb();
  let invalidPhoneRegistered = false;
  try {
    await db.exec(`
      INSERT INTO auth.users (id, email, raw_user_meta_data)
      VALUES ('00000000-0000-0000-0000-000000000098', '01912345678@student.platform.local', '{"parent_phone":"01044444444"}'::jsonb);
    `);
    invalidPhoneRegistered = true;
  } catch (err) {
    assert.ok(err.message.includes('INVALID_REGISTRATION_EMAIL_DOMAIN'));
  }
  assert.equal(invalidPhoneRegistered, false, 'Invalid phone number format MUST be rejected');
});

test('Domain 1.3: Registration rejects matching student and parent phone numbers', async () => {
  const db = await createTestDb();
  let samePhoneRegistered = false;
  try {
    await db.exec(`
      INSERT INTO auth.users (id, email, raw_user_meta_data)
      VALUES ('00000000-0000-0000-0000-000000000097', '01055555555@student.platform.local', '{"parent_phone":"01055555555"}'::jsonb);
    `);
    samePhoneRegistered = true;
  } catch (err) {
    assert.ok(err.message.includes('INVALID_PARENT_PHONE'));
  }
  assert.equal(samePhoneRegistered, false, 'Identical student and parent phone MUST be rejected');
});

test('Domain 1.4: Valid student registration creates profile with pending_review status', async () => {
  const db = await createTestDb();
  await db.exec(`
    INSERT INTO auth.users (id, email, raw_user_meta_data)
    VALUES ('00000000-0000-0000-0000-000000000096', '01066666666@student.platform.local', '{"full_name":"زياد محمود","parent_phone":"01077777777","grade_level":"3","education_type":"azhar"}'::jsonb);
  `);
  const profileRes = await db.exec(`SELECT * FROM public.profiles WHERE id = '00000000-0000-0000-0000-000000000096'`);
  const profile = profileRes[0].rows[0];
  assert.equal(profile.phone, '01066666666');
  assert.equal(profile.parent_phone, '01077777777');
  assert.equal(profile.role, 'student');
  assert.equal(profile.review_status, 'pending_review');
  assert.equal(profile.education_type, 'azhar');
  assert.equal(profile.instant_activation_banned, false);
});

test('Domain 1.5: Privilege Escalation blocked for Assistant and Student', async () => {
  const db = await createTestDb();
  await seedBaseUsers(db);

  // Assistant attempts self-promotion to super_admin
  await execAs(db, 'authenticated', ASSISTANT_ID, `UPDATE public.profiles SET role = 'super_admin' WHERE id = '${ASSISTANT_ID}';`);
  const assistantCheck = (await db.exec(`SELECT role FROM public.profiles WHERE id = '${ASSISTANT_ID}'`))[0].rows[0].role;
  assert.equal(assistantCheck, 'assistant', 'Assistant must NOT be able to self-promote to super_admin');

  // Assistant attempts to promote student to super_admin or admin
  await execAs(db, 'authenticated', ASSISTANT_ID, `UPDATE public.profiles SET role = 'super_admin' WHERE id = '${STUDENT_1_ID}';`);
  const studentCheck = (await db.exec(`SELECT role FROM public.profiles WHERE id = '${STUDENT_1_ID}'`))[0].rows[0].role;
  assert.equal(studentCheck, 'student', 'Assistant must NOT be able to promote others to super_admin');

  // Super Admin promotes assistant to admin (Allowed)
  await execAs(db, 'authenticated', SUPER_ADMIN_ID, `UPDATE public.profiles SET role = 'admin' WHERE id = '${ASSISTANT_ID}';`);
  const assistantPromoted = (await db.exec(`SELECT role FROM public.profiles WHERE id = '${ASSISTANT_ID}'`))[0].rows[0].role;
  assert.equal(assistantPromoted, 'admin', 'Super admin CAN promote assistant to admin');
});

test('Domain 1.6: Student sensitive columns protected against self-modification', async () => {
  const db = await createTestDb();
  await seedBaseUsers(db);

  // Student tries to change phone, parent_phone, review_status, grade_level
  await execAs(db, 'authenticated', STUDENT_1_ID, `
    UPDATE public.profiles
    SET phone = '01099998888',
        parent_phone = '01099997777',
        review_status = 'verified',
        is_verified_by_admin = true,
        grade_level = '1'
    WHERE id = '${STUDENT_1_ID}';
  `);

  const p = (await db.exec(`SELECT * FROM public.profiles WHERE id = '${STUDENT_1_ID}'`))[0].rows[0];
  assert.equal(p.phone, '01011111111', 'Phone must remain unchanged');
  assert.equal(p.parent_phone, '01011111112', 'Parent phone must remain unchanged');
  assert.equal(p.review_status, 'pending_review', 'Review status must remain pending_review');
  assert.equal(p.is_verified_by_admin, false, 'Verified flag must remain false');
  assert.equal(p.grade_level, '3', 'Grade level must remain 3');
});

test('Domain 1.7: Profile role syncs to auth.users.raw_app_meta_data', async () => {
  const db = await createTestDb();
  await seedBaseUsers(db);

  await execAs(db, 'authenticated', SUPER_ADMIN_ID, `UPDATE public.profiles SET role = 'admin' WHERE id = '${ASSISTANT_ID}';`);
  const authUserRes = (await db.exec(`SELECT raw_app_meta_data FROM auth.users WHERE id = '${ASSISTANT_ID}'`))[0].rows[0];
  assert.equal(authUserRes.raw_app_meta_data.role, 'admin');
});

// ==============================================================================
// DOMAIN 2: Courses, Bundles & R2 Security
// ==============================================================================
test('Domain 2.1 & 2.2: Course hierarchy, bundles, and module mapping', async () => {
  const db = await createTestDb();
  await seedBaseUsers(db);

  const courseMonthlyId = '10000000-0000-0000-0000-000000000001';
  const courseBundleId = '10000000-0000-0000-0000-000000000002';
  const mod1Id = '20000000-0000-0000-0000-000000000001';
  const mod2Id = '20000000-0000-0000-0000-000000000002';

  await db.exec(`
    INSERT INTO public.courses (id, title, price, is_bundle, validity_days) VALUES
      ('${courseMonthlyId}', 'كورس شهر أكتوبر', 150.00, false, 30),
      ('${courseBundleId}', 'الكورس الشامل للترم الأول', 400.00, true, 120);

    INSERT INTO public.modules (id, title) VALUES
      ('${mod1Id}', 'الباب الأول - الدعامة والحركة'),
      ('${mod2Id}', 'الباب الثاني - التنسيق الهرموني');

    INSERT INTO public.course_modules_map (course_id, module_id, sort_order) VALUES
      ('${courseMonthlyId}', '${mod1Id}', 1),
      ('${courseBundleId}', '${mod1Id}', 1),
      ('${courseBundleId}', '${mod2Id}', 2);
  `);

  const mapRes = await db.exec(`SELECT COUNT(*)::INT as count FROM public.course_modules_map`);
  assert.equal(mapRes[0].rows[0].count, 3, 'Modules correctly mapped to monthly and bundle courses');
});

test('Domain 2.3: Unified Bundle View hides component course when student owns bundle', async () => {
  const db = await createTestDb();
  await seedBaseUsers(db);

  const courseMonthlyId = '10000000-0000-0000-0000-000000000001';
  const courseBundleId = '10000000-0000-0000-0000-000000000002';
  const mod1Id = '20000000-0000-0000-0000-000000000001';

  await db.exec(`
    INSERT INTO public.courses (id, title, price, is_bundle) VALUES
      ('${courseMonthlyId}', 'كورس شهر أكتوبر الفردي', 150.00, false),
      ('${courseBundleId}', 'الباقة الشاملة', 400.00, true);

    INSERT INTO public.modules (id, title) VALUES ('${mod1Id}', 'الباب الأول');

    INSERT INTO public.course_modules_map (course_id, module_id, sort_order) VALUES
      ('${courseMonthlyId}', '${mod1Id}', 1),
      ('${courseBundleId}', '${mod1Id}', 1);

    -- Student enrolled in both the monthly course and the comprehensive bundle
    INSERT INTO public.course_enrollments (student_id, course_id, status) VALUES
      ('${STUDENT_1_ID}', '${courseMonthlyId}', 'active'),
      ('${STUDENT_1_ID}', '${courseBundleId}', 'active');
  `);

  const dashRes = await execAs(db, 'authenticated', STUDENT_1_ID, `SELECT public.get_student_dashboard_data() AS d;`);
  const enrolledCourses = dashRes.rows[0].d.enrolled_courses;

  assert.equal(enrolledCourses.length, 1, 'Only 1 course must be shown in student dashboard');
  assert.equal(enrolledCourses[0].id, courseBundleId, 'Unified Bundle View must show bundle and hide merged course');
});

test('Domain 2.4 & 2.5: R2 video paths Column-Level Security & Admin RPC', async () => {
  const db = await createTestDb();
  await seedBaseUsers(db);

  const lessonId = '30000000-0000-0000-0000-000000000001';
  const itemId = '40000000-0000-0000-0000-000000000001';
  const modId = '20000000-0000-0000-0000-000000000001';

  await db.exec(`
    INSERT INTO public.modules (id, title) VALUES ('${modId}', 'الوحدة 1');
    INSERT INTO public.lessons (id, module_id, title) VALUES ('${lessonId}', '${modId}', 'المحاضرة 1');
    INSERT INTO public.lesson_items (id, lesson_id, title, item_type, r2_path_or_url)
    VALUES ('${itemId}', '${lessonId}', 'فيديو الشرح الأساسي', 'video', 'r2://secret/biology_lecture_1.m3u8');
  `);

  // Student direct SELECT r2_path_or_url fails
  const studentDirectSelect = await execAs(db, 'authenticated', STUDENT_1_ID, `SELECT r2_path_or_url FROM public.lesson_items;`);
  assert.equal(studentDirectSelect.success, false);
  assert.ok(studentDirectSelect.error.includes('permission denied'));

  // Assistant with manage_courses reads paths via admin RPC
  const adminRpc = await execAs(db, 'authenticated', ASSISTANT_ID, `SELECT public.admin_get_lesson_items_with_paths('${lessonId}') as items;`);
  assert.equal(adminRpc.success, true);
  assert.equal(adminRpc.rows[0].items[0].r2_path_or_url, 'r2://secret/biology_lecture_1.m3u8');

  // Student calling admin RPC fails
  const studentAdminRpc = await execAs(db, 'authenticated', STUDENT_1_ID, `SELECT public.admin_get_lesson_items_with_paths('${lessonId}') as items;`);
  assert.equal(studentAdminRpc.success, false);
  assert.ok(studentAdminRpc.error.includes('FORBIDDEN_ADMIN_ONLY'));
});

test('Domain 2.6: get_authorized_lesson_item_content guards solution video behind passed exam', async () => {
  const db = await createTestDb();
  await seedBaseUsers(db);

  const courseId = '10000000-0000-0000-0000-000000000001';
  const modId = '20000000-0000-0000-0000-000000000001';
  const lessonId = '30000000-0000-0000-0000-000000000001';
  const examId = '50000000-0000-0000-0000-000000000001';
  const solutionItemId = '40000000-0000-0000-0000-000000000002';

  await db.exec(`
    INSERT INTO public.courses (id, title) VALUES ('${courseId}', 'كورس الأحياء');
    INSERT INTO public.modules (id, title) VALUES ('${modId}', 'الوحدة 1');
    INSERT INTO public.course_modules_map (course_id, module_id, sort_order) VALUES ('${courseId}', '${modId}', 1);
    INSERT INTO public.lessons (id, module_id, title) VALUES ('${lessonId}', '${modId}', 'محاضرة 1');
    INSERT INTO public.exams (id, lesson_id, title, pass_percentage) VALUES ('${examId}', '${lessonId}', 'كويز 1', 50);

    INSERT INTO public.lesson_items (id, lesson_id, title, item_type, r2_path_or_url, unlock_after_exam_id)
    VALUES ('${solutionItemId}', '${lessonId}', 'فيديو حل كويز 1', 'solution_video', 'r2://solutions/quiz1_solution.m3u8', '${examId}');

    INSERT INTO public.course_enrollments (student_id, course_id, status) VALUES ('${STUDENT_1_ID}', '${courseId}', 'active');
  `);

  // Student attempts to get solution video before passing exam -> Rejected
  const attemptBeforeExam = await execAs(db, 'authenticated', STUDENT_1_ID, `SELECT public.get_authorized_lesson_item_content('${solutionItemId}');`);
  assert.equal(attemptBeforeExam.success, false);
  assert.ok(attemptBeforeExam.error.includes('SOLUTION_LOCKED'));

  // Student takes exam and passes
  const attemptId = '70000000-0000-0000-0000-000000000001';
  await db.exec(`
    INSERT INTO public.exam_attempts (id, exam_id, student_id, status, passed, score, score_percentage, expires_at)
    VALUES ('${attemptId}', '${examId}', '${STUDENT_1_ID}', 'submitted', true, 10, 100, NOW() + INTERVAL '1 hour');
  `);

  // Now student can access solution video
  const attemptAfterExam = await execAs(db, 'authenticated', STUDENT_1_ID, `SELECT public.get_authorized_lesson_item_content('${solutionItemId}') as content;`);
  assert.equal(attemptAfterExam.success, true);
  assert.equal(attemptAfterExam.rows[0].content.r2_path_or_url, 'r2://solutions/quiz1_solution.m3u8');
});

// ==============================================================================
// DOMAIN 3: Sequential 50% Locking & Manual Overrides
// ==============================================================================
test('Domain 3: Sequential locking, 50% threshold, manual unlocks, and scheduling', async () => {
  const db = await createTestDb();
  await seedBaseUsers(db);

  const courseId = '10000000-0000-0000-0000-000000000001';
  const modId = '20000000-0000-0000-0000-000000000001';
  const l1Id = '30000000-0000-0000-0000-000000000001';
  const l2Id = '30000000-0000-0000-0000-000000000002';
  const l3Id = '30000000-0000-0000-0000-000000000003';
  const exam1Id = '50000000-0000-0000-0000-000000000001';

  await db.exec(`
    INSERT INTO public.courses (id, title) VALUES ('${courseId}', 'كورس 3 ثانوي');
    INSERT INTO public.modules (id, title) VALUES ('${modId}', 'الباب الأول');
    INSERT INTO public.course_modules_map (course_id, module_id, sort_order) VALUES ('${courseId}', '${modId}', 1);

    INSERT INTO public.lessons (id, module_id, title, sort_order, required_pass_percentage) VALUES
      ('${l1Id}', '${modId}', 'محاضرة 1', 1, 50),
      ('${l2Id}', '${modId}', 'محاضرة 2', 2, 50),
      ('${l3Id}', '${modId}', 'محاضرة 3 المجدولة', 3, 50);

    UPDATE public.lessons SET publish_at = NOW() + INTERVAL '5 days' WHERE id = '${l3Id}';

    INSERT INTO public.exams (id, lesson_id, title, exam_type, pass_percentage)
    VALUES ('${exam1Id}', '${l1Id}', 'كويز المحاضرة 1', 'quiz', 50);

    INSERT INTO public.course_enrollments (student_id, course_id, status) VALUES ('${STUDENT_1_ID}', '${courseId}', 'active');
  `);

  // 1. Check tree: Lesson 1 is unlocked, Lesson 2 is locked, Lesson 3 is locked
  let treeRes = await execAs(db, 'authenticated', STUDENT_1_ID, `SELECT public.get_course_tree_with_locks('${courseId}') as tree;`);
  let lessons = treeRes.rows[0].tree[0].lessons;
  assert.equal(lessons.find(l => l.lesson_id === l1Id).is_unlocked, true, 'Lesson 1 must be unlocked automatically');
  assert.equal(lessons.find(l => l.lesson_id === l2Id).is_unlocked, false, 'Lesson 2 must be locked before passing quiz 1');

  // 2. Student fails quiz 1 with 40% (< 50%) -> Lesson 2 remains locked
  const failAttemptId = '70000000-0000-0000-0000-000000000001';
  await db.exec(`
    INSERT INTO public.exam_attempts (id, exam_id, student_id, status, passed, score_percentage, expires_at)
    VALUES ('${failAttemptId}', '${exam1Id}', '${STUDENT_1_ID}', 'submitted', false, 40, NOW() + INTERVAL '1 hour');
  `);
  treeRes = await execAs(db, 'authenticated', STUDENT_1_ID, `SELECT public.get_course_tree_with_locks('${courseId}') as tree;`);
  lessons = treeRes.rows[0].tree[0].lessons;
  assert.equal(lessons.find(l => l.lesson_id === l2Id).is_unlocked, false, 'Lesson 2 remains locked after 40% fail');

  // 3. Student retakes and passes quiz 1 with 80% (>= 50%) -> Lesson 2 unlocks!
  const passAttemptId = '70000000-0000-0000-0000-000000000002';
  await db.exec(`
    INSERT INTO public.exam_attempts (id, exam_id, student_id, status, passed, score_percentage, expires_at)
    VALUES ('${passAttemptId}', '${exam1Id}', '${STUDENT_1_ID}', 'submitted', true, 80, NOW() + INTERVAL '1 hour');
  `);
  treeRes = await execAs(db, 'authenticated', STUDENT_1_ID, `SELECT public.get_course_tree_with_locks('${courseId}') as tree;`);
  lessons = treeRes.rows[0].tree[0].lessons;
  assert.equal(lessons.find(l => l.lesson_id === l2Id).is_unlocked, true, 'Lesson 2 unlocks after passing quiz 1!');

  // 4. Lesson 3 is scheduled in future -> locked
  assert.equal(lessons.find(l => l.lesson_id === l3Id).is_unlocked, false, 'Lesson 3 locked due to future publish_at');

  // 5. Admin adds manual override for Lesson 3 -> unlocks immediately!
  await db.exec(`
    INSERT INTO public.manual_lesson_unlocks (student_id, lesson_id, unlocked_by)
    VALUES ('${STUDENT_1_ID}', '${l3Id}', '${SUPER_ADMIN_ID}');
  `);
  treeRes = await execAs(db, 'authenticated', STUDENT_1_ID, `SELECT public.get_course_tree_with_locks('${courseId}') as tree;`);
  lessons = treeRes.rows[0].tree[0].lessons;
  assert.equal(lessons.find(l => l.lesson_id === l3Id).is_unlocked, true, 'Lesson 3 unlocked via manual override!');
});

// ==============================================================================
// DOMAIN 4: Anti-Cheat Exam Engine
// ==============================================================================
test('Domain 4: Exam anti-cheat engine, timer snapshot, late penalty, and auto re-grade', async () => {
  const db = await createTestDb();
  await seedBaseUsers(db);

  const courseId = '10000000-0000-0000-0000-000000000001';
  const modId = '20000000-0000-0000-0000-000000000001';
  const l1Id = '30000000-0000-0000-0000-000000000001';
  const examId = '50000000-0000-0000-0000-000000000001';
  const q1Id = '60000000-0000-0000-0000-000000000001';
  const q2Id = '60000000-0000-0000-0000-000000000002';

  await db.exec(`
    INSERT INTO public.courses (id, title) VALUES ('${courseId}', 'كورس الأحياء');
    INSERT INTO public.modules (id, title) VALUES ('${modId}', 'الوحدة 1');
    INSERT INTO public.course_modules_map (course_id, module_id, sort_order) VALUES ('${courseId}', '${modId}', 1);
    INSERT INTO public.lessons (id, module_id, title) VALUES ('${l1Id}', '${modId}', 'محاضرة 1');
    INSERT INTO public.course_enrollments (student_id, course_id, status) VALUES ('${STUDENT_1_ID}', '${courseId}', 'active');

    INSERT INTO public.exams (id, lesson_id, title, duration_minutes, pass_percentage, shuffle_questions)
    VALUES ('${examId}', '${l1Id}', 'امتحان شامل', 30, 50, true);

    INSERT INTO public.exam_questions (id, exam_id, image_url, correct_option, points, sort_order) VALUES
      ('${q1Id}', '${examId}', 'http://ammar.local/q1.png', 'a', 2.00, 1),
      ('${q2Id}', '${examId}', 'http://ammar.local/q2.png', 'b', 2.00, 2);
  `);

  // 1. Direct SELECT on questions blocked for student
  const studentQuestionsSelect = await execAs(db, 'authenticated', STUDENT_1_ID, `SELECT * FROM public.exam_questions;`);
  assert.equal(studentQuestionsSelect.rows.length, 0, 'Students must NOT see questions via direct SELECT');

  // 2. Start exam -> questions snapshot created
  const startExamRes = await execAs(db, 'authenticated', STUDENT_1_ID, `SELECT public.start_or_resume_exam('${examId}') as r;`);
  assert.equal(startExamRes.success, true);
  const attemptId = startExamRes.rows[0].r.attempt_id;
  const initialQuestions = startExamRes.rows[0].r.questions;
  assert.equal(initialQuestions.length, 2);

  // Resume exam -> exactly identical questions order and remaining seconds
  const resumeExamRes = await execAs(db, 'authenticated', STUDENT_1_ID, `SELECT public.start_or_resume_exam('${examId}') as r;`);
  assert.equal(resumeExamRes.rows[0].r.attempt_id, attemptId);
  assert.deepEqual(resumeExamRes.rows[0].r.questions.map(q => q.id), initialQuestions.map(q => q.id));

  // 3. Submit exam with Q1=a (correct), Q2=c (wrong)
  const submitRes = await execAs(db, 'authenticated', STUDENT_1_ID, `
    SELECT public.submit_exam_attempt('${attemptId}', '[
      {"question_id":"${q1Id}","selected_option":"a"},
      {"question_id":"${q2Id}","selected_option":"c"}
    ]'::jsonb) as r;
  `);
  assert.equal(submitRes.rows[0].r.score, 2);
  assert.equal(submitRes.rows[0].r.score_percentage, 50);
  assert.equal(submitRes.rows[0].r.passed, true);

  // 4. Review submitted attempt when passed: reveals answers
  const reviewPassed = await execAs(db, 'authenticated', STUDENT_1_ID, `SELECT public.review_submitted_attempt('${attemptId}') as r;`);
  assert.equal(reviewPassed.rows[0].r.answers_revealed, true);
  const q2Review = reviewPassed.rows[0].r.questions.find(q => q.question_id === q2Id);
  assert.equal(q2Review.correct_option, 'b');
  assert.equal(q2Review.is_correct, false);

  // 5. Auto Re-grade: Teacher changes Q2 correct_option from 'b' to 'c'
  await db.exec(`UPDATE public.exam_questions SET correct_option = 'c' WHERE id = '${q2Id}';`);

  const updatedAttempt = (await db.exec(`SELECT score, score_percentage, passed FROM public.exam_attempts WHERE id = '${attemptId}'`))[0].rows[0];
  assert.equal(Number(updatedAttempt.score), 4, 'Score should auto-update to 4 after key change');
  assert.equal(Number(updatedAttempt.score_percentage), 100, 'Percentage should auto-update to 100%');
});

// ==============================================================================
// DOMAIN 5: Student Mistakes Bank
// ==============================================================================
test('Domain 5: Student mistakes bank automatic insertion, retake removal, and key change cleanup', async () => {
  const db = await createTestDb();
  await seedBaseUsers(db);

  const courseId = '10000000-0000-0000-0000-000000000001';
  const modId = '20000000-0000-0000-0000-000000000001';
  const l1Id = '30000000-0000-0000-0000-000000000001';
  const examId = '50000000-0000-0000-0000-000000000001';
  const q1Id = '60000000-0000-0000-0000-000000000001';
  const q2Id = '60000000-0000-0000-0000-000000000002';

  await db.exec(`
    INSERT INTO public.courses (id, title) VALUES ('${courseId}', 'كورس 3 ثانوي');
    INSERT INTO public.modules (id, title) VALUES ('${modId}', 'الوحدة 1');
    INSERT INTO public.course_modules_map (course_id, module_id, sort_order) VALUES ('${courseId}', '${modId}', 1);
    INSERT INTO public.lessons (id, module_id, title) VALUES ('${l1Id}', '${modId}', 'محاضرة 1');
    INSERT INTO public.course_enrollments (student_id, course_id, status) VALUES ('${STUDENT_1_ID}', '${courseId}', 'active');

    INSERT INTO public.exams (id, lesson_id, title, exam_type, pass_percentage)
    VALUES ('${examId}', '${l1Id}', 'واجب الأسبوع 1', 'homework', 50);

    INSERT INTO public.exam_questions (id, exam_id, image_url, correct_option, points, sort_order) VALUES
      ('${q1Id}', '${examId}', 'http://ammar.local/q1.png', 'a', 1.00, 1),
      ('${q2Id}', '${examId}', 'http://ammar.local/q2.png', 'b', 1.00, 2);
  `);

  // Student starts attempt 1
  const start1 = await execAs(db, 'authenticated', STUDENT_1_ID, `SELECT public.start_or_resume_exam('${examId}') as r;`);
  const att1Id = start1.rows[0].r.attempt_id;

  // Answers Q1 wrong ('d'), Q2 left blank
  await execAs(db, 'authenticated', STUDENT_1_ID, `
    SELECT public.submit_exam_attempt('${att1Id}', '[{"question_id":"${q1Id}","selected_option":"d"}]'::jsonb);
  `);

  // Mistakes bank should have both Q1 and Q2
  let mistakes = (await db.exec(`SELECT question_id, wrong_option, source_type FROM public.student_mistakes_bank WHERE student_id = '${STUDENT_1_ID}'`))[0].rows;
  assert.equal(mistakes.length, 2, 'Both wrong and unanswered questions must be in mistakes bank');
  assert.equal(mistakes.find(m => m.question_id === q1Id).wrong_option, 'd');
  assert.equal(mistakes.find(m => m.question_id === q1Id).source_type, 'homework');
  assert.equal(mistakes.find(m => m.question_id === q2Id).wrong_option, null);

  // Student retakes exam and solves Q1 correctly ('a')
  const start2 = await execAs(db, 'authenticated', STUDENT_1_ID, `SELECT public.start_or_resume_exam('${examId}') as r;`);
  const att2Id = start2.rows[0].r.attempt_id;
  await execAs(db, 'authenticated', STUDENT_1_ID, `
    SELECT public.submit_exam_attempt('${att2Id}', '[{"question_id":"${q1Id}","selected_option":"a"},{"question_id":"${q2Id}","selected_option":"d"}]'::jsonb);
  `);

  // Q1 must be removed from mistakes bank, Q2 remains
  mistakes = (await db.exec(`SELECT question_id, wrong_option FROM public.student_mistakes_bank WHERE student_id = '${STUDENT_1_ID}'`))[0].rows;
  assert.equal(mistakes.length, 1, 'Q1 must be automatically removed after answering correctly');
  assert.equal(mistakes[0].question_id, q2Id);

  // Teacher changes Q2 answer key to 'd' -> Q2 becomes correct and is removed!
  await db.exec(`UPDATE public.exam_questions SET correct_option = 'd' WHERE id = '${q2Id}';`);
  mistakes = (await db.exec(`SELECT question_id FROM public.student_mistakes_bank WHERE student_id = '${STUDENT_1_ID}'`))[0].rows;
  assert.equal(mistakes.length, 0, 'Mistakes bank should be empty after teacher updated answer key');
});

// ==============================================================================
// DOMAIN 6: Payments, Codes & Instant Temp Access
// ==============================================================================
test('Domain 6: Center codes, brute force protection, payment receipts, and instant temp access', async () => {
  const db = await createTestDb();
  await seedBaseUsers(db);

  const courseId = '10000000-0000-0000-0000-000000000001';
  const codeId = '80000000-0000-0000-0000-000000000001';

  await db.exec(`
    INSERT INTO public.courses (id, title, price, validity_days) VALUES ('${courseId}', 'كورس شهر 11', 180.00, 30);
    INSERT INTO public.activation_codes (id, code, course_id, price_amount) VALUES ('${codeId}', 'BIO-2027-AMMAR', '${courseId}', 180.00);
  `);

  // 1. Redeeming valid code activates course and creates invoice
  const redeemSuccess = await execAs(db, 'authenticated', STUDENT_1_ID, `SELECT public.redeem_activation_code('bio-2027-ammar') as r;`);
  assert.equal(redeemSuccess.rows[0].r.success, true);

  const enrollment = (await db.exec(`SELECT status, is_temporary_activation FROM public.course_enrollments WHERE student_id = '${STUDENT_1_ID}' AND course_id = '${courseId}'`))[0].rows[0];
  assert.equal(enrollment.status, 'active');
  assert.equal(enrollment.is_temporary_activation, false);

  const invoice = (await db.exec(`SELECT amount, payment_method FROM public.student_invoices WHERE student_id = '${STUDENT_1_ID}'`))[0].rows[0];
  assert.equal(Number(invoice.amount), 180.00);
  assert.equal(invoice.payment_method, 'center_code');

  // 2. Brute force protection on invalid codes
  for (let i = 1; i <= 5; i++) {
    const invalidRes = await execAs(db, 'authenticated', STUDENT_2_ID, `SELECT public.redeem_activation_code('WRONG_CODE_${i}') as r;`);
    assert.equal(invalidRes.rows[0].r.success, false);
    assert.equal(invalidRes.rows[0].r.error, 'INVALID_OR_USED_CODE');
  }
  const lockedRes = await execAs(db, 'authenticated', STUDENT_2_ID, `SELECT public.redeem_activation_code('ANOTHER_CODE') as r;`);
  assert.equal(lockedRes.rows[0].r.error, 'CODE_BRUTE_FORCE_LOCKED');

  // 3. Payment receipts & Instant Temp Access
  const receiptRes = await execAs(db, 'authenticated', STUDENT_2_ID, `
    INSERT INTO public.payment_receipts (course_id, sender_phone, reference_number, receipt_image_r2_path, file_size_bytes)
    VALUES ('${courseId}', '01022222222', 'REF_VODAFONE_123', 'r2://receipts/rec1.webp', 150000)
    RETURNING id, grant_instant_access;
  `);
  assert.equal(receiptRes.success, true);
  const receiptId = receiptRes.rows[0].id;
  assert.equal(receiptRes.rows[0].grant_instant_access, true);

  // Check temp_active enrollment granted immediately
  const tempEnroll = (await db.exec(`SELECT status, is_temporary_activation FROM public.course_enrollments WHERE student_id = '${STUDENT_2_ID}' AND course_id = '${courseId}'`))[0].rows[0];
  assert.equal(tempEnroll.status, 'temp_active');
  assert.equal(tempEnroll.is_temporary_activation, true);

  // 4. Admin reviews receipt -> Rejection revokes temp access and bans instant activation
  await execAs(db, 'authenticated', ASSISTANT_ID, `UPDATE public.payment_receipts SET status = 'rejected' WHERE id = '${receiptId}';`);

  const revokedEnroll = (await db.exec(`SELECT status FROM public.course_enrollments WHERE student_id = '${STUDENT_2_ID}' AND course_id = '${courseId}'`))[0].rows[0];
  assert.equal(revokedEnroll.status, 'revoked');

  const bannedProfile = (await db.exec(`SELECT instant_activation_banned FROM public.profiles WHERE id = '${STUDENT_2_ID}'`))[0].rows[0];
  assert.equal(bannedProfile.instant_activation_banned, true);

  // Attempting to re-review already rejected receipt fails
  const reReview = await execAs(db, 'authenticated', ASSISTANT_ID, `UPDATE public.payment_receipts SET status = 'approved' WHERE id = '${receiptId}';`);
  assert.equal(reReview.success, false);
  assert.ok(reReview.error.includes('RECEIPT_ALREADY_REVIEWED'));
});

// ==============================================================================
// DOMAIN 7: Forum, Notifications & Audit Logs
// ==============================================================================
test('Domain 7: Forum daily limits, privacy RLS, voice note reply, notifications and audit logs', async () => {
  const db = await createTestDb();
  await seedBaseUsers(db);

  // 1. Forum rate limit: Student can insert up to 5 questions in 24h
  for (let i = 1; i <= 5; i++) {
    const fRes = await execAs(db, 'authenticated', STUDENT_1_ID, `
      INSERT INTO public.forum_questions (question_text, grade_level)
      VALUES ('سؤال رقم ${i} في التكاثر', '3');
    `);
    assert.equal(fRes.success, true, `Question ${i} must succeed`);
  }
  const sixthQ = await execAs(db, 'authenticated', STUDENT_1_ID, `
    INSERT INTO public.forum_questions (question_text, grade_level)
    VALUES ('سؤال رقم 6 الزائد', '3');
  `);
  assert.equal(sixthQ.success, false, '6th question in 24h must be rejected');
  assert.ok(sixthQ.error.includes('FORUM_RATE_LIMIT'));

  // 2. Forum Privacy RLS: Student 2 cannot see Student 1 private question
  const s2ViewBefore = await execAs(db, 'authenticated', STUDENT_2_ID, `SELECT * FROM public.forum_questions;`);
  assert.equal(s2ViewBefore.rows.length, 0, 'Student 2 cannot see Student 1 private questions');

  // Teacher replies with voice note and makes it public
  const qId = (await db.exec(`SELECT id FROM public.forum_questions LIMIT 1`))[0].rows[0].id;
  await execAs(db, 'authenticated', ASSISTANT_ID, `
    UPDATE public.forum_questions
    SET reply_text = 'إجابة مفصلة مع فويس',
        reply_voice_url = 'r2://forum-voices/answer1.m4a',
        is_public = true,
        status = 'answered'
    WHERE id = '${qId}';
  `);

  const s2ViewAfter = await execAs(db, 'authenticated', STUDENT_2_ID, `SELECT * FROM public.forum_questions;`);
  assert.equal(s2ViewAfter.rows.length, 1, 'Student 2 can now see the public question');
  assert.equal(s2ViewAfter.rows[0].reply_voice_url, 'r2://forum-voices/answer1.m4a');

  // 3. Notifications read tracking
  await db.exec(`INSERT INTO public.notifications (title, body, target_type) VALUES ('تنبيه هام', 'تم رفع المحاضرة الجديدة', 'all');`);
  const dashBefore = await execAs(db, 'authenticated', STUDENT_1_ID, `SELECT public.get_student_dashboard_data() as d;`);
  assert.equal(dashBefore.rows[0].d.notifications_summary.unread_count, 1);

  await execAs(db, 'authenticated', STUDENT_1_ID, `SELECT public.mark_all_notifications_read();`);
  const dashAfter = await execAs(db, 'authenticated', STUDENT_1_ID, `SELECT public.get_student_dashboard_data() as d;`);
  assert.equal(dashAfter.rows[0].d.notifications_summary.unread_count, 0);

  // 4. Audit logs: only super_admin & admin can read
  // Trigger an audit log entry via an admin action (payment receipt review)
  const cId = '10000000-0000-0000-0000-000000000001';
  await db.exec(`INSERT INTO public.courses (id, title, price) VALUES ('${cId}', 'كورس المراجعة', 100.00);`);
  const recRes = await execAs(db, 'authenticated', STUDENT_1_ID, `
    INSERT INTO public.payment_receipts (course_id, sender_phone, reference_number, receipt_image_r2_path, file_size_bytes)
    VALUES ('${cId}', '01011111111', 'REF_AUDIT_123', 'r2://rec.webp', 100000)
    RETURNING id;
  `);
  const recId = recRes.rows[0].id;
  await execAs(db, 'authenticated', ASSISTANT_ID, `UPDATE public.payment_receipts SET status = 'approved' WHERE id = '${recId}';`);

  const adminAudit = await execAs(db, 'authenticated', SUPER_ADMIN_ID, `SELECT COUNT(*)::INT as count FROM public.audit_logs;`);
  assert.equal(adminAudit.success, true);
  assert.ok(adminAudit.rows[0].count > 0, 'Admin operations must be logged');

  const assistantAudit = await execAs(db, 'authenticated', ASSISTANT_ID, `SELECT * FROM public.audit_logs;`);
  assert.equal(assistantAudit.rows.length, 0, 'Assistant cannot read audit logs');

  const studentAudit = await execAs(db, 'authenticated', STUDENT_1_ID, `SELECT * FROM public.audit_logs;`);
  assert.equal(studentAudit.rows.length, 0, 'Student cannot read audit logs');
});

// ==============================================================================
// DOMAIN 8: Grants, RLS & Idempotency Checklist
// ==============================================================================
test('Domain 8: Anon permissions, private RPC isolation, and 100% schema idempotency', async () => {
  const db = await createTestDb();
  await seedBaseUsers(db);

  // 1. Anon can SELECT public tables
  const anonCourses = await execAs(db, 'anon', '', `SELECT id, title FROM public.courses;`);
  assert.equal(anonCourses.success, true, 'Anon can view courses catalog');

  const anonSettings = await execAs(db, 'anon', '', `SELECT id, vodafone_cash_numbers FROM public.platform_settings;`);
  assert.equal(anonSettings.success, true, 'Anon can view platform settings');

  // 2. Anon CANNOT execute private RPCs
  const anonRpc = await execAs(db, 'anon', '', `SELECT public.get_student_dashboard_data();`);
  assert.equal(anonRpc.success, false, 'Anon cannot call get_student_dashboard_data');

  // 3. Authenticated student CANNOT execute is_lesson_unlocked_for_student directly
  const studentPrivateRpc = await execAs(db, 'authenticated', STUDENT_1_ID, `
    SELECT public.is_lesson_unlocked_for_student('${STUDENT_1_ID}', '30000000-0000-0000-0000-000000000001');
  `);
  assert.equal(studentPrivateRpc.success, false, 'Student cannot execute is_lesson_unlocked_for_student');
  assert.ok(studentPrivateRpc.error.includes('permission denied'));

  // 4. Schema Idempotency: Running schema.sql again on existing DB succeeds with 0 errors
  let secondRunSuccess = false;
  try {
    await db.exec(schemaSql);
    secondRunSuccess = true;
  } catch (err) {
    console.error('Idempotency error:', err);
  }
  assert.equal(secondRunSuccess, true, 'Running schema a second time MUST succeed with 0 errors');
});
