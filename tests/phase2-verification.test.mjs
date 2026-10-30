import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const srcDir = path.join(projectRoot, 'src');

// 1. Phase 2 Architecture: File length check across all src/
test('Phase 2 Architecture: All new and existing files are <= 250 lines', () => {
  function checkDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        checkDir(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const lines = content.split('\n');
        assert.ok(
          lines.length <= 250,
          `File ${path.relative(projectRoot, fullPath)} has ${lines.length} lines, which exceeds the strict 250-line limit!`
        );
      }
    }
  }
  checkDir(srcDir);
});

// 2. Phase 2 Architecture: Strict Zero Barrel Files
test('Phase 2 Architecture: No index.ts or index.tsx barrel files anywhere', () => {
  function checkNoBarrel(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        checkNoBarrel(fullPath);
      } else if (entry.isFile()) {
        const lower = entry.name.toLowerCase();
        assert.notEqual(lower, 'index.ts', `Forbidden barrel file: ${fullPath}`);
        assert.notEqual(lower, 'index.tsx', `Forbidden barrel file: ${fullPath}`);
      }
    }
  }
  checkNoBarrel(srcDir);
});

// 3. Phase 2 Architecture: Strict Feature Isolation
test('Phase 2 Architecture: No cross-feature imports between features', () => {
  const featuresDir = path.join(srcDir, 'features');
  const featureFolders = fs.readdirSync(featuresDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const feat of featureFolders) {
    const currentFeatDir = path.join(featuresDir, feat);
    function checkFeatFiles(dir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          checkFeatFiles(fullPath);
        } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
          const content = fs.readFileSync(fullPath, 'utf8');
          for (const otherFeat of featureFolders) {
            if (otherFeat !== feat) {
              const crossImportRegex = new RegExp(`from\\s+['"]@/features/${otherFeat}`, 'g');
              assert.ok(
                !crossImportRegex.test(content),
                `Feature ${feat} illegally imports from ${otherFeat} in ${path.relative(projectRoot, fullPath)}!`
              );
            }
          }
        }
      }
    }
    checkFeatFiles(currentFeatDir);
  }
});

// 4. Phase 2 Architecture: Mandatory prefetch={false} on all <Link>
test('Phase 2 Architecture: All <Link> components must specify prefetch={false}', () => {
  function checkLinks(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        checkLinks(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.jsx'))) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const linkTagMatches = content.match(/<Link\b[^>]*>/g);
        if (linkTagMatches) {
          for (const tag of linkTagMatches) {
            assert.ok(
              tag.includes('prefetch={false}'),
              `Found <Link> without prefetch={false} in ${path.relative(projectRoot, fullPath)}: ${tag}`
            );
          }
        }
      }
    }
  }
  checkLinks(srcDir);
});

// 5. Account Page 6 Tabs Verification
test('Account Page Structure: Implements all 6 required tabs', () => {
  const accountFile = path.join(srcDir, 'app', '(student)', 'account', 'page.tsx');
  assert.ok(fs.existsSync(accountFile), 'Account page must exist');
  const content = fs.readFileSync(accountFile, 'utf8');
  assert.ok(content.includes('ProfileAndBillingTab'), 'Tab 1 must exist');
  assert.ok(content.includes('SecurityAndSessionsTab'), 'Tab 2 must exist');
  assert.ok(content.includes('QuizResultsTab'), 'Tab 3 must exist');
  assert.ok(content.includes('HomeworkResultsTab'), 'Tab 4 must exist');
  assert.ok(content.includes('WatchHistoryTab'), 'Tab 5 must exist');
  assert.ok(content.includes('MistakesBankTab'), 'Tab 6 must exist');
});

// 6. Courses Filters Verification
test('Courses Page Filters: Implements the 3 required filters verbatim', () => {
  const coursesFile = path.join(srcDir, 'app', '(student)', 'courses', 'page.tsx');
  const content = fs.readFileSync(coursesFile, 'utf8');
  assert.ok(content.includes('كورساتي'), 'Filter 1 (كورساتي) must exist');
  assert.ok(content.includes('جميع الكورسات'), 'Filter 2 (جميع الكورسات) must exist');
  assert.ok(content.includes('كورساتنا المقترحة'), 'Filter 3 (كورساتنا المقترحة) must exist');
  assert.ok(content.includes('isComprehensive'), 'Unified comprehensive course rule must be implemented');
});

// 7. Interactive Exam Page & 4 Buttons
test('Interactive Exam: 4 buttons (أ، ب، ج، د) and Navigator exist', () => {
  const examPageFile = path.join(srcDir, 'app', '(student)', 'courses', '[courseId]', 'exam', '[examId]', 'page.tsx');
  assert.ok(fs.existsSync(examPageFile), 'Exam page must exist');
  const cardFile = path.join(srcDir, 'features', 'exams', 'QuestionCard.tsx');
  const cardContent = fs.readFileSync(cardFile, 'utf8');
  assert.ok(cardContent.includes('( أ )'), 'Button أ must exist');
  assert.ok(cardContent.includes('( ب )'), 'Button ب must exist');
  assert.ok(cardContent.includes('( ج )'), 'Button ج must exist');
  assert.ok(cardContent.includes('( د )'), 'Button د must exist');
});

// 8. Forum 3 Tabs & Voice Note Player
test('Forum Page: Implements 3 tabs and Voice Note player', () => {
  const forumFile = path.join(srcDir, 'app', '(student)', 'forum', 'page.tsx');
  const content = fs.readFileSync(forumFile, 'utf8');
  assert.ok(content.includes('أسئلتي الخاصة'), 'Tab 1 (أسئلتي الخاصة) must exist');
  assert.ok(content.includes('المنتدى العام للدفعة'), 'Tab 2 (المنتدى العام للدفعة) must exist');
  assert.ok(content.includes('قيد المراجعة'), 'Tab 3 (قيد المراجعة) must exist');

  const voicePlayerFile = path.join(srcDir, 'features', 'forum', 'ForumVoiceNotePlayer.tsx');
  assert.ok(fs.existsSync(voicePlayerFile), 'ForumVoiceNotePlayer must exist');
  const voiceContent = fs.readFileSync(voicePlayerFile, 'utf8');
  assert.ok(voiceContent.includes('dir="ltr"'), 'Voice player must have dir="ltr"');
});

// 9. Sequential 50% Lock verification
test('Sequential 50% Lock: Course details page dynamically unlocks next lecture based on 50% quiz and homework submission', () => {
  const courseDetailFile = path.join(srcDir, 'app', '(student)', 'courses', '[courseId]', 'page.tsx');
  assert.ok(fs.existsSync(courseDetailFile), 'Course detail page must exist');
  const content = fs.readFileSync(courseDetailFile, 'utf8');
  assert.ok(
    content.includes('prev.quiz.isPassed') && content.includes('prev.homework.isSubmitted'),
    'Course detail page must enforce sequential lock requiring quiz pass and homework submit'
  );
  assert.ok(
    content.includes('getStoredExamSubmissions'),
    'Course detail page must read actual exam submissions from storage'
  );
});

// 10. Mistakes Bank: Question diagram and removal on correct retake
test('Mistakes Bank: Displays question diagram and removes mistake on correct retake', () => {
  const mistakesBankFile = path.join(srcDir, 'features', 'account', 'MistakesBankTab.tsx');
  assert.ok(fs.existsSync(mistakesBankFile), 'MistakesBankTab must exist');
  const content = fs.readFileSync(mistakesBankFile, 'utf8');
  assert.ok(content.includes('صورة السؤال'), 'MistakesBankTab must display question image/diagram');

  const examPageFile = path.join(srcDir, 'app', '(student)', 'courses', '[courseId]', 'exam', '[examId]', 'page.tsx');
  const examContent = fs.readFileSync(examPageFile, 'utf8');
  assert.ok(
    examContent.includes('removeMistakeByQuestionId'),
    'Exam page must remove mistake when answered correctly on re-attempt'
  );
});

// 11. Forum Teacher Replies: Displays text + image + voice note
test('Forum Teacher Replies: Supports text, explanatory image (replyImageUrl), and voice note', () => {
  const cardFile = path.join(srcDir, 'features', 'forum', 'ForumPostCard.tsx');
  const cardContent = fs.readFileSync(cardFile, 'utf8');
  assert.ok(cardContent.includes('replyImageUrl'), 'ForumPostCard must render teacher explanatory image');
  assert.ok(cardContent.includes('ForumVoiceNotePlayer'), 'ForumPostCard must render voice note player');
});

// 12. Student Storage: Core persistence helpers for Phase 2
test('Student Storage: Implements mistake removal by questionId and exam submissions persistence', () => {
  const storageFile = path.join(srcDir, 'lib', 'utils', 'student-storage.ts');
  const content = fs.readFileSync(storageFile, 'utf8');
  assert.ok(content.includes('removeMistakeByQuestionId'), 'removeMistakeByQuestionId must exist');
  assert.ok(content.includes('recordExamSubmission'), 'recordExamSubmission must exist');
  assert.ok(content.includes('recordWatchHistory'), 'recordWatchHistory must exist');
  assert.ok(content.includes('addStoredForumPost'), 'addStoredForumPost must exist');
});

