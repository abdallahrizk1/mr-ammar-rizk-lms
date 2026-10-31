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

// IDs
const SUPER_ADMIN_ID = '00000000-0000-0000-0000-000000000001';
const ASSISTANT_ID = '00000000-0000-0000-0000-000000000002';
const STUDENT_ID = '00000000-0000-0000-0000-000000000003';

test('End-to-End Student Journey Simulation & Network Consumption Audit', async () => {
  const db = await createTestDb();

  // Metrics collector
  const metrics = {
    requestsCount: 0,
    totalBytes: 0,
    calls: [],
  };

  function recordCall(name, payload) {
    metrics.requestsCount++;
    const str = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const bytes = Buffer.byteLength(str, 'utf8');
    metrics.totalBytes += bytes;
    metrics.calls.push({ step: name, bytes });
  }

  // 1. Seed base users
  await db.exec(`
    INSERT INTO auth.users (id, email, raw_app_meta_data, raw_user_meta_data) VALUES
      ('${SUPER_ADMIN_ID}', 'admin@ammar.local', '{"role":"super_admin","phone":"01099999999"}'::jsonb, '{"full_name":"الأستاذ عمار رزق"}'::jsonb),
      ('${ASSISTANT_ID}', 'assistant@ammar.local', '{"role":"assistant","phone":"01088888888","permissions":{"manage_students": true, "manage_courses": true, "manage_exams": true, "manage_payments": true, "manage_forum": true, "manage_settings": true}}'::jsonb, '{"full_name":"المساعد أحمد"}'::jsonb);
  `);

  // Step 1: Student Registration (Domain 1)
  const studentEmail = '01012345678@student.platform.local';
  await db.exec(`
    INSERT INTO auth.users (id, email, raw_user_meta_data)
    VALUES ('${STUDENT_ID}', '${studentEmail}', '{"full_name":"أحمد محمود","parent_phone":"01098765432","grade_level":"3","education_type":"general","governorate":"القاهرة"}'::jsonb);
  `);

  const profileRes = await db.exec(`SELECT * FROM public.profiles WHERE id = '${STUDENT_ID}';`);
  const profile = profileRes[0].rows[0];
  assert.equal(profile.full_name, 'أحمد محمود');
  assert.equal(profile.review_status, 'pending_review');
  recordCall('Student Registration & Profile Ingestion', profile);

  // Step 2: Teacher Setup - Create Course, Module, 2 Lessons, Exam, Questions & Center Code
  const COURSE_ID = '11111111-1111-1111-1111-111111111111';
  const MODULE_ID = '22222222-2222-2222-2222-222222222222';
  const LESSON_1_ID = '33333333-3333-3333-3333-333333333331';
  const LESSON_2_ID = '33333333-3333-3333-3333-333333333332';
  const EXAM_ID = '44444444-4444-4444-4444-444444444441';
  const Q1_ID = '55555555-5555-5555-5555-555555555551';
  const Q2_ID = '55555555-5555-5555-5555-555555555552';
  const ACTIVATION_CODE = 'BIO-2027-EXCEL';

  await db.exec(`
    INSERT INTO public.courses (id, title, price, grade_level, education_type, is_published, validity_days)
    VALUES ('${COURSE_ID}', 'كورس الباب الأول: الدعامة والحركة', 350, '3', 'general', true, 180);

    INSERT INTO public.modules (id, title)
    VALUES ('${MODULE_ID}', 'الباب الأول');

    INSERT INTO public.course_modules_map (course_id, module_id, sort_order)
    VALUES ('${COURSE_ID}', '${MODULE_ID}', 1);

    INSERT INTO public.lessons (id, module_id, title, sort_order, required_pass_percentage)
    VALUES
      ('${LESSON_1_ID}', '${MODULE_ID}', 'المحاضرة 1: الدعامة في النبات', 1, 50),
      ('${LESSON_2_ID}', '${MODULE_ID}', 'المحاضرة 2: الدعامة في الإنسان', 2, 50);

    INSERT INTO public.exams (id, lesson_id, title, exam_type, duration_minutes, pass_percentage, shuffle_questions)
    VALUES ('${EXAM_ID}', '${LESSON_1_ID}', 'كويز المحاضرة 1: الدعامة في النبات', 'quiz', 20, 50, false);

    INSERT INTO public.exam_questions (id, exam_id, question_text, image_url, correct_option, points, sort_order)
    VALUES
      ('${Q1_ID}', '${EXAM_ID}', 'ما هي الدعامة الفسيولوجية؟', '/images/q1.webp', 'a', 1, 1),
      ('${Q2_ID}', '${EXAM_ID}', 'ما وظيفة الكيوتين في خلايا البشرة؟', '/images/q2.webp', 'b', 1, 2);

    INSERT INTO public.activation_codes (code, course_id, created_by, is_used)
    VALUES ('${ACTIVATION_CODE}', '${COURSE_ID}', '${SUPER_ADMIN_ID}', false);
  `);

  // Step 3: Student calls get_student_dashboard_data before enrolling
  const dash1 = await execAs(db, 'authenticated', STUDENT_ID, `SELECT public.get_student_dashboard_data() AS data;`);
  assert.equal(dash1.success, true);
  const dash1Data = dash1.rows[0].data;
  assert.equal(dash1Data.profile.full_name, 'أحمد محمود');
  assert.equal(dash1Data.enrolled_courses.length, 0);
  recordCall('get_student_dashboard_data (Pre-Enrollment)', dash1Data);

  // Step 4: Student redeems activation code
  const redeemRes = await execAs(db, 'authenticated', STUDENT_ID, `SELECT public.redeem_activation_code('${ACTIVATION_CODE}') AS data;`);
  assert.equal(redeemRes.success, true);
  assert.equal(redeemRes.rows[0].data.success, true);
  recordCall('redeem_activation_code', redeemRes.rows[0].data);

  // Step 5: Student calls get_student_dashboard_data after enrolling
  const dash2 = await execAs(db, 'authenticated', STUDENT_ID, `SELECT public.get_student_dashboard_data() AS data;`);
  assert.equal(dash2.success, true);
  const dash2Data = dash2.rows[0].data;
  assert.equal(dash2Data.enrolled_courses.length, 1);
  assert.equal(dash2Data.enrolled_courses[0].id, COURSE_ID);
  recordCall('get_student_dashboard_data (Post-Enrollment)', dash2Data);

  // Step 6: Student requests course tree with sequential locks
  const tree1 = await execAs(db, 'authenticated', STUDENT_ID, `SELECT public.get_course_tree_with_locks('${COURSE_ID}') AS tree;`);
  assert.equal(tree1.success, true);
  const tree1Modules = tree1.rows[0].tree;
  assert.equal(tree1Modules.length, 1);
  const lessons1 = tree1Modules[0].lessons;
  assert.equal(lessons1[0].lesson_id, LESSON_1_ID);
  assert.equal(lessons1[0].is_unlocked, true, 'Lecture 1 must be unlocked for enrolled student');
  assert.equal(lessons1[1].lesson_id, LESSON_2_ID);
  assert.equal(lessons1[1].is_unlocked, false, 'Lecture 2 must be locked before passing Lecture 1 quiz (50% threshold)');
  recordCall('get_course_tree_with_locks (Before Quiz)', tree1Modules);

  // Step 7: Student starts exam
  const startExamRes = await execAs(db, 'authenticated', STUDENT_ID, `SELECT public.start_or_resume_exam('${EXAM_ID}') AS exam;`);
  assert.equal(startExamRes.success, true);
  const examSession = startExamRes.rows[0].exam;
  assert.ok(examSession.attempt_id);
  assert.equal(examSession.questions.length, 2);
  assert.ok(examSession.remaining_seconds > 0);
  recordCall('start_or_resume_exam', examSession);

  // Step 8: Student submits attempt with 100% score (answers Q1=a, Q2=b)
  const answersJson = JSON.stringify([
    { question_id: Q1_ID, selected_option: 'a' },
    { question_id: Q2_ID, selected_option: 'b' },
  ]);
  const submitRes = await execAs(
    db,
    'authenticated',
    STUDENT_ID,
    `SELECT public.submit_exam_attempt('${examSession.attempt_id}'::uuid, '${answersJson}'::jsonb) AS result;`
  );
  assert.equal(submitRes.success, true);
  const submitResult = submitRes.rows[0].result;
  assert.equal(submitResult.passed, true);
  assert.equal(submitResult.score_percentage, 100);
  assert.equal(submitResult.correct_answers_count, 2);
  recordCall('submit_exam_attempt', submitResult);

  // Step 9: Student reviews submitted attempt
  const reviewRes = await execAs(db, 'authenticated', STUDENT_ID, `SELECT public.review_submitted_attempt('${examSession.attempt_id}'::uuid) AS review;`);
  assert.equal(reviewRes.success, true);
  const reviewData = reviewRes.rows[0].review;
  assert.equal(reviewData.answers_revealed, true, 'Answers revealed when passed');
  assert.equal(reviewData.questions.length, 2);
  recordCall('review_submitted_attempt', reviewData);

  // Step 10: Verify Lecture 2 is now automatically unlocked via sequential 50% lock
  const tree2 = await execAs(db, 'authenticated', STUDENT_ID, `SELECT public.get_course_tree_with_locks('${COURSE_ID}') AS tree;`);
  assert.equal(tree2.success, true);
  const lessons2 = tree2.rows[0].tree[0].lessons;
  assert.equal(lessons2[1].is_unlocked, true, 'Lecture 2 must unlock immediately after passing Lecture 1 quiz!');
  recordCall('get_course_tree_with_locks (After Passed Quiz)', tree2.rows[0].tree);

  // Step 11: Student Posts Question on Community Forum
  const POST_ID = '66666666-6666-6666-6666-666666666661';
  const postInsert = await execAs(
    db,
    'authenticated',
    STUDENT_ID,
    `INSERT INTO public.forum_questions (id, student_id, course_id, grade_level, question_text, is_public, status)
     VALUES ('${POST_ID}', '${STUDENT_ID}', '${COURSE_ID}', '3', 'هل ينمو جانب المحلاق الملامس للدعامة ببطء أم يتوقف؟', true, 'pending')
     RETURNING *;`
  );
  assert.equal(postInsert.success, true);
  recordCall('Forum: Student Question Post', postInsert.rows[0]);

  // Step 12: Teacher Replies with Text & Voice Note
  const teacherReply = await execAs(
    db,
    'authenticated',
    SUPER_ADMIN_ID,
    `UPDATE public.forum_questions
     SET reply_text = 'أهلاً بك يا أحمد، ينمو الجانب الملامس للدعامة ببطء بينما يستطيل الجانب البعيد بسرعة نتيجة تراكم الأوكسينات.',
         reply_voice_url = 'https://r2.ammar-rizk.com/audio/reply-01.m4a',
         reply_image_url = '/images/mechanics.webp',
         replied_at = NOW(),
         replied_by = '${SUPER_ADMIN_ID}',
         status = 'answered'
     WHERE id = '${POST_ID}'
     RETURNING *;`
  );
  assert.equal(teacherReply.success, true);
  recordCall('Forum: Teacher Text + Voice Note Reply', teacherReply.rows[0]);

  // Summary Metrics Analysis
  console.log('\n======================================================');
  console.log('📊 STUDENT JOURNEY NETWORK & BANDWIDTH AUDIT REPORT');
  console.log('======================================================');
  console.log(`Total Interactive API Calls: ${metrics.requestsCount}`);
  console.log(`Total Transferred Data: ${(metrics.totalBytes / 1024).toFixed(2)} KB (${metrics.totalBytes} bytes)`);
  console.log('Breakdown by Action:');
  metrics.calls.forEach((c, idx) => {
    console.log(`  ${idx + 1}. ${c.step}: ${c.bytes} bytes`);
  });
  console.log('======================================================\n');

  assert.ok(metrics.requestsCount >= 8, 'Must perform at least 8 interactive journey steps');
  assert.ok(metrics.totalBytes < 150 * 1024, 'Total payload size must be ultra-efficient (< 150KB for entire full journey)');
});
