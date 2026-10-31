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

// User IDs
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
// 1. اختبار منع المساعد من ترقية نفسه (Privilege Escalation Test)
// ==============================================================================
test('Adversarial 1: Privilege Escalation blocked for Assistant and Student', async () => {
  const db = await createTestDb();
  await seedBaseUsers(db);

  // Assistant with manage_students attempts self-promotion to super_admin
  await execAs(db, 'authenticated', ASSISTANT_ID, `UPDATE public.profiles SET role = 'super_admin' WHERE id = '${ASSISTANT_ID}';`);
  const assistantCheck = (await db.exec(`SELECT role FROM public.profiles WHERE id = '${ASSISTANT_ID}'`))[0].rows[0].role;
  assert.equal(assistantCheck, 'assistant', 'Assistant must NOT be able to self-promote to super_admin');

  // Assistant attempts to promote student to super_admin
  await execAs(db, 'authenticated', ASSISTANT_ID, `UPDATE public.profiles SET role = 'super_admin' WHERE id = '${STUDENT_1_ID}';`);
  const studentCheck = (await db.exec(`SELECT role FROM public.profiles WHERE id = '${STUDENT_1_ID}'`))[0].rows[0].role;
  assert.equal(studentCheck, 'student', 'Assistant must NOT be able to promote others to super_admin');
});

// ==============================================================================
// 2. اختبار وصول الزائر لصفحة الكورسات العامة (Anon Public Courses Test)
// ==============================================================================
test('Adversarial 2: Anon user can query public published courses without function permission denied', async () => {
  const db = await createTestDb();
  await seedBaseUsers(db);

  const courseId = '10000000-0000-0000-0000-000000000001';
  await db.exec(`
    INSERT INTO public.courses (id, title, price, is_published)
    VALUES ('${courseId}', 'كورس الأحياء العام', 250.00, true);
  `);

  const anonQuery = await execAs(db, 'anon', '', `SELECT id, title, price FROM public.courses WHERE is_published = true;`);
  assert.equal(anonQuery.success, true, 'Anon query must succeed');
  assert.equal(anonQuery.rows.length, 1);
  assert.equal(anonQuery.rows[0].title, 'كورس الأحياء العام');
  assert.equal(Number(anonQuery.rows[0].price), 250.00);
});

// ==============================================================================
// 3. اختبار عزل روابط الفيديوهات والملفات (Column-Level R2 Path Protection)
// ==============================================================================
test('Adversarial 3: Column-Level R2 Path Protection and Lesson / Solution Lock Guard', async () => {
  const db = await createTestDb();
  await seedBaseUsers(db);

  const courseId = '10000000-0000-0000-0000-000000000001';
  const modId = '20000000-0000-0000-0000-000000000001';
  const l1Id = '30000000-0000-0000-0000-000000000001';
  const l2Id = '30000000-0000-0000-0000-000000000002';
  const examId = '50000000-0000-0000-0000-000000000001';
  const solItemId = '40000000-0000-0000-0000-000000000001';
  const l2ItemId = '40000000-0000-0000-0000-000000000002';

  await db.exec(`
    INSERT INTO public.courses (id, title) VALUES ('${courseId}', 'كورس الأحياء');
    INSERT INTO public.modules (id, title) VALUES ('${modId}', 'الوحدة 1');
    INSERT INTO public.course_modules_map (course_id, module_id, sort_order) VALUES ('${courseId}', '${modId}', 1);
    INSERT INTO public.lessons (id, module_id, title, sort_order) VALUES
      ('${l1Id}', '${modId}', 'محاضرة 1', 1),
      ('${l2Id}', '${modId}', 'محاضرة 2', 2);

    INSERT INTO public.exams (id, lesson_id, title, exam_type, pass_percentage)
    VALUES ('${examId}', '${l1Id}', 'كويز 1', 'quiz', 50);

    INSERT INTO public.lesson_items (id, lesson_id, title, item_type, r2_path_or_url, unlock_after_exam_id)
    VALUES ('${solItemId}', '${l1Id}', 'فيديو حل كويز 1', 'solution_video', 'r2://secret/sol1.m3u8', '${examId}');

    INSERT INTO public.lesson_items (id, lesson_id, title, item_type, r2_path_or_url)
    VALUES ('${l2ItemId}', '${l2Id}', 'شرح محاضرة 2', 'video', 'r2://secret/lec2.m3u8');

    INSERT INTO public.course_enrollments (student_id, course_id, status) VALUES ('${STUDENT_1_ID}', '${courseId}', 'active');
  `);

  // Direct column SELECT on r2_path_or_url rejected
  const directSelect = await execAs(db, 'authenticated', STUDENT_1_ID, `SELECT r2_path_or_url FROM public.lesson_items;`);
  assert.equal(directSelect.success, false);
  assert.ok(directSelect.error.includes('permission denied'));

  // Calling get_authorized_lesson_item_content on solution video before passing exam rejected
  const solBefore = await execAs(db, 'authenticated', STUDENT_1_ID, `SELECT public.get_authorized_lesson_item_content('${solItemId}');`);
  assert.equal(solBefore.success, false);
  assert.ok(solBefore.error.includes('SOLUTION_LOCKED'));

  // Calling on locked lesson 2 before passing lesson 1 exam rejected
  const l2Before = await execAs(db, 'authenticated', STUDENT_1_ID, `SELECT public.get_authorized_lesson_item_content('${l2ItemId}');`);
  assert.equal(l2Before.success, false);
  assert.ok(l2Before.error.includes('LESSON_LOCKED'));

  // Student takes exam and passes
  const attId = '70000000-0000-0000-0000-000000000001';
  await db.exec(`
    INSERT INTO public.exam_attempts (id, exam_id, student_id, status, passed, score, score_percentage, expires_at)
    VALUES ('${attId}', '${examId}', '${STUDENT_1_ID}', 'submitted', true, 10, 100, NOW() + INTERVAL '1 hour');
  `);

  // Now solution video succeeds
  const solAfter = await execAs(db, 'authenticated', STUDENT_1_ID, `SELECT public.get_authorized_lesson_item_content('${solItemId}') as r;`);
  assert.equal(solAfter.success, true);
  assert.equal(solAfter.rows[0].r.r2_path_or_url, 'r2://secret/sol1.m3u8');

  // And lesson 2 content succeeds
  const l2After = await execAs(db, 'authenticated', STUDENT_1_ID, `SELECT public.get_authorized_lesson_item_content('${l2ItemId}') as r;`);
  assert.equal(l2After.success, true);
  assert.equal(l2After.rows[0].r.r2_path_or_url, 'r2://secret/lec2.m3u8');
});

// ==============================================================================
// 4. اختبار عداد تخمين أكواد الشحن (Code Brute-Force Lockout Test)
// ==============================================================================
test('Adversarial 4: Code Brute-Force Lockout Test (5 failed attempts recorded, 6th attempt locked)', async () => {
  const db = await createTestDb();
  await seedBaseUsers(db);

  const courseId = '10000000-0000-0000-0000-000000000001';
  const codeId = '80000000-0000-0000-0000-000000000001';
  await db.exec(`
    INSERT INTO public.courses (id, title, price, validity_days) VALUES ('${courseId}', 'كورس المراجعة', 200.00, 30);
    INSERT INTO public.activation_codes (id, code, course_id, price_amount) VALUES ('${codeId}', 'VALID-CODE-2027', '${courseId}', 200.00);
    DELETE FROM public.code_redemption_attempts WHERE student_id = '${STUDENT_1_ID}';
  `);

  // 5 wrong attempts
  for (let i = 1; i <= 5; i++) {
    const res = await execAs(db, 'authenticated', STUDENT_1_ID, `SELECT public.redeem_activation_code('WRONG-CODE-${i}') as r;`);
    assert.equal(res.rows[0].r.success, false);
    assert.equal(res.rows[0].r.error, 'INVALID_OR_USED_CODE');
  }

  // Check 5 failed attempts persisted in code_redemption_attempts
  const attempts = (await db.exec(`SELECT COUNT(*)::INT as count FROM public.code_redemption_attempts WHERE student_id = '${STUDENT_1_ID}' AND succeeded = false;`))[0].rows[0].count;
  assert.equal(attempts, 5, 'All 5 failed attempts must be preserved without rollback');

  // 6th attempt with VALID code is locked
  const lockedRes = await execAs(db, 'authenticated', STUDENT_1_ID, `SELECT public.redeem_activation_code('VALID-CODE-2027') as r;`);
  assert.equal(lockedRes.rows[0].r.success, false);
  assert.equal(lockedRes.rows[0].r.error, 'CODE_BRUTE_FORCE_LOCKED');
});

// ==============================================================================
// 5. اختبار منع غش الامتحان بتسليم ورقة فارغة أو تجربة الاختيارات (Anti-Answer Harvesting Test)
// ==============================================================================
test('Adversarial 5: Anti-Answer Harvesting Test (Failed exam hides answers, direct column SELECT denied)', async () => {
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

    INSERT INTO public.exams (id, lesson_id, title, exam_type, pass_percentage)
    VALUES ('${examId}', '${l1Id}', 'امتحان تجريبي', 'quiz', 50);

    INSERT INTO public.exam_questions (id, exam_id, image_url, correct_option, points, sort_order) VALUES
      ('${q1Id}', '${examId}', 'http://ammar.local/q1.png', 'a', 2.00, 1),
      ('${q2Id}', '${examId}', 'http://ammar.local/q2.png', 'b', 2.00, 2);
  `);

  // Student starts exam
  const startRes = await execAs(db, 'authenticated', STUDENT_1_ID, `SELECT public.start_or_resume_exam('${examId}') as r;`);
  const attemptId = startRes.rows[0].r.attempt_id;

  // Student submits 0% (answers wrong)
  const submitRes = await execAs(db, 'authenticated', STUDENT_1_ID, `
    SELECT public.submit_exam_attempt('${attemptId}', '[
      {"question_id":"${q1Id}","selected_option":"c"},
      {"question_id":"${q2Id}","selected_option":"d"}
    ]'::jsonb) as r;
  `);
  assert.equal(submitRes.rows[0].r.passed, false);
  assert.equal(submitRes.rows[0].r.score, 0);

  // Student calls review_submitted_attempt: correct_option and is_correct MUST be NULL
  const reviewRes = await execAs(db, 'authenticated', STUDENT_1_ID, `SELECT public.review_submitted_attempt('${attemptId}') as r;`);
  assert.equal(reviewRes.rows[0].r.answers_revealed, false);
  for (const q of reviewRes.rows[0].r.questions) {
    assert.equal(q.correct_option, null, 'correct_option must be NULL when exam is failed');
    assert.equal(q.is_correct, null, 'is_correct must be NULL when exam is failed');
  }

  // Student direct SELECT is_correct from exam_attempt_answers rejected with permission denied
  const directSelect = await execAs(db, 'authenticated', STUDENT_1_ID, `SELECT is_correct FROM public.exam_attempt_answers;`);
  assert.equal(directSelect.success, false);
  assert.ok(directSelect.error.includes('permission denied'));
});

// ==============================================================================
// 6. اختبار انتهاء وقت الامتحان (Late Submission Lock Test)
// ==============================================================================
test('Adversarial 6: Late Submission Lock Test (> expires_at + 60s forced expired_submitted, passed=false, next lecture locked)', async () => {
  const db = await createTestDb();
  await seedBaseUsers(db);

  const courseId = '10000000-0000-0000-0000-000000000001';
  const modId = '20000000-0000-0000-0000-000000000001';
  const l1Id = '30000000-0000-0000-0000-000000000001';
  const l2Id = '30000000-0000-0000-0000-000000000002';
  const examId = '50000000-0000-0000-0000-000000000001';
  const q1Id = '60000000-0000-0000-0000-000000000001';
  const expiredAttemptId = '70000000-0000-0000-0000-000000000099';

  await db.exec(`
    INSERT INTO public.courses (id, title) VALUES ('${courseId}', 'كورس 3 ثانوي');
    INSERT INTO public.modules (id, title) VALUES ('${modId}', 'الوحدة 1');
    INSERT INTO public.course_modules_map (course_id, module_id, sort_order) VALUES ('${courseId}', '${modId}', 1);
    INSERT INTO public.lessons (id, module_id, title, sort_order) VALUES
      ('${l1Id}', '${modId}', 'محاضرة 1', 1),
      ('${l2Id}', '${modId}', 'محاضرة 2', 2);
    INSERT INTO public.course_enrollments (student_id, course_id, status) VALUES ('${STUDENT_1_ID}', '${courseId}', 'active');

    INSERT INTO public.exams (id, lesson_id, title, exam_type, pass_percentage)
    VALUES ('${examId}', '${l1Id}', 'كويز المحاضرة 1', 'quiz', 50);

    INSERT INTO public.exam_questions (id, exam_id, image_url, correct_option, points, sort_order)
    VALUES ('${q1Id}', '${examId}', 'http://ammar.local/q1.png', 'a', 5.00, 1);

    -- Attempt expired 10 minutes ago
    INSERT INTO public.exam_attempts (id, exam_id, student_id, started_at, expires_at, total_questions, assigned_question_ids, status)
    VALUES ('${expiredAttemptId}', '${examId}', '${STUDENT_1_ID}', NOW() - INTERVAL '40 minutes', NOW() - INTERVAL '10 minutes', 1, ARRAY['${q1Id}'::UUID], 'in_progress');
  `);

  // Student submits correct answer ('a') but late (> expires_at + 60s)
  const lateSubmit = await execAs(db, 'authenticated', STUDENT_1_ID, `
    SELECT public.submit_exam_attempt('${expiredAttemptId}', '[{"question_id":"${q1Id}","selected_option":"a"}]'::jsonb) as r;
  `);

  assert.equal(lateSubmit.rows[0].r.status, 'expired_submitted');
  assert.equal(lateSubmit.rows[0].r.passed, false, 'Late submission must forcibly set passed = false even if 100% correct');

  // Verify next lecture (l2) remains locked
  const tree = await execAs(db, 'authenticated', STUDENT_1_ID, `SELECT public.get_course_tree_with_locks('${courseId}') as t;`);
  const lessons = tree.rows[0].t[0].lessons;
  const l2 = lessons.find(l => l.lesson_id === l2Id);
  assert.equal(l2.is_unlocked, false, 'Second lecture MUST stay locked after late expired exam submission');
});

// ==============================================================================
// 7. اختبار إعادة التصحيح التلقائي وبنك "غلطاتي" (Auto Re-grade & Mistakes Bank Cleanup)
// ==============================================================================
test('Adversarial 7: Auto Re-grade and Mistakes Bank Cleanup on correct retake and key change', async () => {
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
      ('${q1Id}', '${examId}', 'http://ammar.local/q1.png', 'a', 2.00, 1),
      ('${q2Id}', '${examId}', 'http://ammar.local/q2.png', 'b', 2.00, 2);
  `);

  // Student takes exam: answers Q1 wrong ('c') and leaves Q2 blank
  const start1 = await execAs(db, 'authenticated', STUDENT_1_ID, `SELECT public.start_or_resume_exam('${examId}') as r;`);
  const att1Id = start1.rows[0].r.attempt_id;
  await execAs(db, 'authenticated', STUDENT_1_ID, `
    SELECT public.submit_exam_attempt('${att1Id}', '[{"question_id":"${q1Id}","selected_option":"c"}]'::jsonb);
  `);

  // Both Q1 and Q2 should be in student_mistakes_bank
  let mistakes = (await db.exec(`SELECT question_id, wrong_option FROM public.student_mistakes_bank WHERE student_id = '${STUDENT_1_ID}'`))[0].rows;
  assert.equal(mistakes.length, 2, 'Both wrong and unanswered questions must be in mistakes bank');

  // Retake exam: solves Q1 correctly ('a'), answers Q2 wrong ('d')
  const start2 = await execAs(db, 'authenticated', STUDENT_1_ID, `SELECT public.start_or_resume_exam('${examId}') as r;`);
  const att2Id = start2.rows[0].r.attempt_id;
  await execAs(db, 'authenticated', STUDENT_1_ID, `
    SELECT public.submit_exam_attempt('${att2Id}', '[{"question_id":"${q1Id}","selected_option":"a"},{"question_id":"${q2Id}","selected_option":"d"}]'::jsonb);
  `);

  // Q1 must be removed, Q2 remains
  mistakes = (await db.exec(`SELECT question_id, wrong_option FROM public.student_mistakes_bank WHERE student_id = '${STUDENT_1_ID}'`))[0].rows;
  assert.equal(mistakes.length, 1, 'Q1 removed after answering correctly on retake');
  assert.equal(mistakes[0].question_id, q2Id);

  // Teacher changes Q2 answer key to 'd' -> auto re-grade cleans Q2 from mistakes bank!
  await db.exec(`UPDATE public.exam_questions SET correct_option = 'd' WHERE id = '${q2Id}';`);
  mistakes = (await db.exec(`SELECT question_id FROM public.student_mistakes_bank WHERE student_id = '${STUDENT_1_ID}'`))[0].rows;
  assert.equal(mistakes.length, 0, 'Mistakes bank completely clean after teacher key change');

  // Check attempt score re-evaluated
  const reGradedAttempt = (await db.exec(`SELECT score, score_percentage, passed FROM public.exam_attempts WHERE id = '${att2Id}'`))[0].rows[0];
  assert.equal(Number(reGradedAttempt.score), 4);
  assert.equal(Number(reGradedAttempt.score_percentage), 100);
  assert.equal(reGradedAttempt.passed, true);
});

// ==============================================================================
// 8. اختبار التفعيل المؤقت الفوري وحظر المتلاعبين (Instant Temp Access & Fraud Ban + UPSERT Approval)
// ==============================================================================
test('Adversarial 8: Instant Temp Access, Pending Lock, Fraud Ban, and UPSERT Activation Approval', async () => {
  const db = await createTestDb();
  await seedBaseUsers(db);

  const courseId = '10000000-0000-0000-0000-000000000001';
  await db.exec(`
    INSERT INTO public.courses (id, title, price, validity_days) VALUES ('${courseId}', 'كورس الأحياء', 300.00, 45);
  `);

  // Student uploads receipt 1 -> gets temp_active
  const rec1Res = await execAs(db, 'authenticated', STUDENT_2_ID, `
    INSERT INTO public.payment_receipts (course_id, sender_phone, reference_number, receipt_image_r2_path, file_size_bytes)
    VALUES ('${courseId}', '01022222222', 'REF_VODAFONE_101', 'r2://receipts/rec101.webp', 120000)
    RETURNING id, grant_instant_access;
  `);
  assert.equal(rec1Res.success, true);
  const rec1Id = rec1Res.rows[0].id;
  assert.equal(rec1Res.rows[0].grant_instant_access, true);

  const tempEnroll = (await db.exec(`SELECT status, is_temporary_activation FROM public.course_enrollments WHERE student_id = '${STUDENT_2_ID}' AND course_id = '${courseId}'`))[0].rows[0];
  assert.equal(tempEnroll.status, 'temp_active');
  assert.equal(tempEnroll.is_temporary_activation, true);

  // Student attempts to upload 2nd receipt while 1st is pending_review -> Rejected
  const rec2Attempt = await execAs(db, 'authenticated', STUDENT_2_ID, `
    INSERT INTO public.payment_receipts (course_id, sender_phone, reference_number, receipt_image_r2_path, file_size_bytes)
    VALUES ('${courseId}', '01022222222', 'REF_VODAFONE_102', 'r2://receipts/rec102.webp', 120000);
  `);
  assert.equal(rec2Attempt.success, false);
  assert.ok(rec2Attempt.error.includes('PENDING_RECEIPT_EXISTS'));

  // Admin rejects receipt 1 -> status becomes revoked and student instant_activation_banned = true
  await execAs(db, 'authenticated', ASSISTANT_ID, `UPDATE public.payment_receipts SET status = 'rejected' WHERE id = '${rec1Id}';`);

  const revokedEnroll = (await db.exec(`SELECT status FROM public.course_enrollments WHERE student_id = '${STUDENT_2_ID}' AND course_id = '${courseId}'`))[0].rows[0];
  assert.equal(revokedEnroll.status, 'revoked');

  const bannedProfile = (await db.exec(`SELECT instant_activation_banned FROM public.profiles WHERE id = '${STUDENT_2_ID}'`))[0].rows[0];
  assert.equal(bannedProfile.instant_activation_banned, true);

  // Banned student uploads a real receipt 2 later (grant_instant_access is false)
  const rec3Res = await execAs(db, 'authenticated', STUDENT_2_ID, `
    INSERT INTO public.payment_receipts (course_id, sender_phone, reference_number, receipt_image_r2_path, file_size_bytes)
    VALUES ('${courseId}', '01022222222', 'REF_VODAFONE_REAL', 'r2://receipts/rec_real.webp', 120000)
    RETURNING id, grant_instant_access;
  `);
  assert.equal(rec3Res.success, true);
  const rec3Id = rec3Res.rows[0].id;
  assert.equal(rec3Res.rows[0].grant_instant_access, false, 'Banned student must NOT receive instant activation');

  // Admin approves real receipt -> trigger does UPSERT to activate course for validity_days
  await execAs(db, 'authenticated', ASSISTANT_ID, `UPDATE public.payment_receipts SET status = 'approved' WHERE id = '${rec3Id}';`);

  const approvedEnroll = (await db.exec(`SELECT status, is_temporary_activation, expires_at > NOW() AS is_valid FROM public.course_enrollments WHERE student_id = '${STUDENT_2_ID}' AND course_id = '${courseId}'`))[0].rows[0];
  assert.equal(approvedEnroll.status, 'active', 'Course enrollment must be updated to active via UPSERT');
  assert.equal(approvedEnroll.is_temporary_activation, false);
  assert.equal(approvedEnroll.is_valid, true);
});

// ==============================================================================
// 9. اختبار حصة أسئلة المنتدى (Forum 5 Questions / 24h Rate Limit)
// ==============================================================================
test('Adversarial 9: Forum 5 Questions in 24h limit (default is_public=false, 6th question rejected)', async () => {
  const db = await createTestDb();
  await seedBaseUsers(db);

  // Student inserts 5 questions in forum
  for (let i = 1; i <= 5; i++) {
    const fRes = await execAs(db, 'authenticated', STUDENT_1_ID, `
      INSERT INTO public.forum_questions (question_text, grade_level)
      VALUES ('سؤال رقم ${i} في الهرمونات النباتية', '3')
      RETURNING id, is_public, status;
    `);
    assert.equal(fRes.success, true);
    assert.equal(fRes.rows[0].is_public, false, 'Forum question must default to is_public = false');
    assert.equal(fRes.rows[0].status, 'pending');
  }

  // 6th question within 24h rejected
  const sixthRes = await execAs(db, 'authenticated', STUDENT_1_ID, `
    INSERT INTO public.forum_questions (question_text, grade_level)
    VALUES ('السؤال السادس الممنوع تجاوزه', '3');
  `);
  assert.equal(sixthRes.success, false);
  assert.ok(sixthRes.error.includes('FORUM_RATE_LIMIT'));
});

// ==============================================================================
// 10. اختبار منع حجز رقم هاتف طالب آخر عند التسجيل (Email Domain & Phone Spoofing Guard)
// ==============================================================================
test('Adversarial 10: Email Domain & Phone Spoofing Guard (Rejects external domain & matching parent phone)', async () => {
  const db = await createTestDb();

  // Attempt 1: External email domain (e.g. gmail.com) rejected
  let gmailSuccess = false;
  try {
    await db.exec(`
      INSERT INTO auth.users (id, email, raw_user_meta_data)
      VALUES ('00000000-0000-0000-0000-000000000099', '01012345678@gmail.com', '{"parent_phone":"01099999999"}'::jsonb);
    `);
    gmailSuccess = true;
  } catch (err) {
    assert.ok(err.message.includes('INVALID_REGISTRATION_EMAIL_DOMAIN'));
  }
  assert.equal(gmailSuccess, false, 'External email domain (@gmail.com) MUST be rejected');

  // Attempt 2: Parent phone matches student phone rejected
  let samePhoneSuccess = false;
  try {
    await db.exec(`
      INSERT INTO auth.users (id, email, raw_user_meta_data)
      VALUES ('00000000-0000-0000-0000-000000000098', '01012345678@student.platform.local', '{"parent_phone":"01012345678"}'::jsonb);
    `);
    samePhoneSuccess = true;
  } catch (err) {
    assert.ok(err.message.includes('INVALID_PARENT_PHONE'));
  }
  assert.equal(samePhoneSuccess, false, 'Parent phone matching student phone MUST be rejected');
});
