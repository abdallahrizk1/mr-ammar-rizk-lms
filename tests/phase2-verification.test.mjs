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
test('Student Storage: Implements mistake removal by questionId, batch removal, and exam submissions persistence', () => {
  const storageFile = path.join(srcDir, 'lib', 'utils', 'student-storage.ts');
  const content = fs.readFileSync(storageFile, 'utf8');
  assert.ok(content.includes('removeMistakeByQuestionId'), 'removeMistakeByQuestionId must exist');
  assert.ok(content.includes('removeMistakesByIds'), 'removeMistakesByIds must exist for multi-question mistake exams');
  assert.ok(content.includes('recordExamSubmission'), 'recordExamSubmission must exist');
  assert.ok(content.includes('recordWatchHistory'), 'recordWatchHistory must exist');
  assert.ok(content.includes('addStoredForumPost'), 'addStoredForumPost must exist');
});

// 13. Mistakes Bank Smart Summary & Question Count Selector
test('Mistakes Bank: Shows mistake count summary first, allows choosing custom question count, and has button to browse answers', () => {
  const mistakesBankFile = path.join(srcDir, 'features', 'account', 'MistakesBankTab.tsx');
  const content = fs.readFileSync(mistakesBankFile, 'utf8');
  assert.ok(content.includes('تحب تمتحن على كم سؤال'), 'Must ask student how many questions they want to be tested on');
  assert.ok(content.includes('type="number"'), 'Must allow custom question count input');
  assert.ok(content.includes('safePage'), 'Must clamp pagination page when mistakes are deleted');
  assert.ok(content.includes('مشاهدة الأسئلة والإجابات الصحيحة'), 'Must provide a secondary button to browse wrong questions and correct answers');
  assert.ok(content.includes("useState<'summary' | 'browse'>('summary')"), 'Must default to summary view instead of dumping all questions at once');
});

// 14. Pagination (10 per page) across all tables and lists
test('Pagination: All tables and lists implement 10-per-page PaginationControls', () => {
  const filesRequiringPagination = [
    path.join(srcDir, 'features', 'account', 'WatchHistoryTab.tsx'),
    path.join(srcDir, 'features', 'account', 'ProfileAndBillingTab.tsx'),
    path.join(srcDir, 'features', 'account', 'SecurityAndSessionsTab.tsx'),
    path.join(srcDir, 'features', 'account', 'QuizResultsTab.tsx'),
    path.join(srcDir, 'features', 'account', 'HomeworkResultsTab.tsx'),
    path.join(srcDir, 'features', 'account', 'MistakesBankTab.tsx'),
    path.join(srcDir, 'app', '(student)', 'forum', 'page.tsx'),
  ];

  for (const file of filesRequiringPagination) {
    const content = fs.readFileSync(file, 'utf8');
    assert.ok(
      content.includes('PaginationControls') && content.includes('PAGE_SIZE = 10'),
      `File ${path.relative(projectRoot, file)} must use PaginationControls with PAGE_SIZE = 10`
    );
  }
});

// 15. PDFs & Answer Key Files: External Open, Full View, and Direct Download
test('PDFs & Solution Files: Supports opening externally, full view, and downloading across courses and account modals', () => {
  const lectureItemContent = fs.readFileSync(path.join(srcDir, 'features', 'courses', 'LectureItem.tsx'), 'utf8');
  const solutionsContent = fs.readFileSync(path.join(srcDir, 'features', 'courses', 'LectureSolutionsBlock.tsx'), 'utf8');
  const pdfModalContent = fs.readFileSync(path.join(srcDir, 'features', 'courses', 'PdfViewerModal.tsx'), 'utf8');
  const answerReviewContent = fs.readFileSync(path.join(srcDir, 'features', 'account', 'AnswerReviewModal.tsx'), 'utf8');

  assert.ok(lectureItemContent.includes('فتح خارجياً'), 'LectureItem must allow opening PDF externally');
  assert.ok(solutionsContent.includes('فتح خارجياً') && solutionsContent.includes('عرض كامل') && solutionsContent.includes('تحميل'), 'LectureSolutionsBlock must allow full view, external open, and download for answer keys');
  assert.ok(pdfModalContent.includes('فتح خارجياً') && pdfModalContent.includes('عرض كامل'), 'PdfViewerModal must support full-window toggle and external open');
  assert.ok(answerReviewContent.includes('فتح خارجياً') && answerReviewContent.includes('عرض كامل') && answerReviewContent.includes('تحميل'), 'AnswerReviewModal must support full view, external open, and download');
});

// 16. Zero Native Browser Alerts or Confirms (In-App Notifications Only)
test('In-App Notifications: Zero native window.alert or window.confirm calls in src/', () => {
  function checkNoBrowserPopups(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        checkNoBrowserPopups(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
        const content = fs.readFileSync(fullPath, 'utf8');
        assert.ok(
          !/\b(window\.)?alert\s*\(/.test(content),
          `Forbidden native alert() found in ${path.relative(projectRoot, fullPath)}`
        );
        assert.ok(
          !/\b(window\.)?confirm\s*\(/.test(content),
          `Forbidden native confirm() found in ${path.relative(projectRoot, fullPath)}`
        );
      }
    }
  }
  checkNoBrowserPopups(srcDir);
});

// 17. Video Player Controls & Playback
test('Video Player Controls: Seek bar, speed, skip buttons, volume, and fullscreen', () => {
  const controlsFile = path.join(srcDir, 'features', 'video-player', 'VideoPlayerControls.tsx');
  const playerFile = path.join(srcDir, 'features', 'video-player', 'CrossPlatformHlsPlayer.tsx');
  const controlsContent = fs.readFileSync(controlsFile, 'utf8');
  const playerContent = fs.readFileSync(playerFile, 'utf8');

  assert.ok(controlsContent.includes('type="range"'), 'VideoPlayerControls must have an interactive range seek bar');
  assert.ok(
    controlsContent.includes('SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2]') ||
    controlsContent.includes('SPEED_OPTIONS = [0.75, 1, 1.25, 1.5, 2]'),
    'Must support playback speed options (0.5x to 2x)'
  );
  assert.ok(controlsContent.includes('-10s') && controlsContent.includes('+10s'), 'Must support -10s and +10s skip buttons');
  assert.ok(!playerContent.includes('DEMO_DURATION_SEC'), 'Must eliminate hardcoded DEMO_DURATION_SEC limit');
  assert.ok(playerContent.includes('onDurationChange') && playerContent.includes('onTimeUpdate'), 'Must dynamically sync real video duration and time updates');
  assert.ok(playerContent.includes('useVideoGestures') && playerContent.includes('DoubleTapRippleOverlay'), 'Must support YouTube-style double-tap seeking with ripple feedback');
  const gesturesFile = path.join(srcDir, 'features', 'video-player', 'useVideoGestures.ts');
  assert.ok(fs.existsSync(gesturesFile), 'useVideoGestures hook must exist');
  const rippleFile = path.join(srcDir, 'features', 'video-player', 'DoubleTapRippleOverlay.tsx');
  assert.ok(fs.existsSync(rippleFile), 'DoubleTapRippleOverlay component must exist');
  const rippleContent = fs.readFileSync(rippleFile, 'utf8');
  assert.ok(rippleContent.includes('-10 ثوانٍ') && rippleContent.includes('+10 ثوانٍ'), 'Double tap feedback must display -10 ثوانٍ and +10 ثوانٍ indicators');
  assert.ok(playerContent.includes('muted={isMuted}'), 'Must bind muted={isMuted} on <video> element');
  assert.ok(playerContent.includes('fullscreenchange'), 'Must sync fullscreen state on Escape key');
  assert.ok(controlsContent.includes('flex-nowrap'), 'Controls row must not wrap');
  assert.ok(controlsContent.includes('left-1/2 -translate-x-1/2'), 'Speed menu must be centered above button');
  assert.ok(controlsContent.includes('fixed inset-0 z-40 bg-transparent'), 'Must render click-outside backdrop for open popups');
  assert.ok(playerContent.includes('playsInline') && playerContent.includes('webkit-playsinline'), 'Video element must support iOS inline playback');
  assert.ok(playerContent.includes('webkitEnterFullscreen'), 'Video player must support iOS Safari fullscreen fallback');
  assert.ok(playerContent.includes('isEnded'), 'Player must track video completion for smooth replay');
  assert.ok(playerContent.includes('handleKeyDown'), 'Player must support desktop keyboard shortcuts');

  // Verify Removal of all Clutter from Video Frame and Course Page
  const coursePageFile = path.join(srcDir, 'app', '(student)', 'courses', '[courseId]', 'page.tsx');
  const coursePageContent = fs.readFileSync(coursePageFile, 'utf8');
  assert.ok(!playerContent.includes('منصة أ/ عمار'), 'Player must remove platform watermark badge from video frame');
  assert.ok(!playerContent.includes('animate-pulse'), 'Player must remove distracting pulse animations over video');
  assert.ok(!coursePageContent.includes('وضع السينما العريض'), 'Course page must remove cinema wide toggle');
  assert.ok(!coursePageContent.includes('مشغل احترافي متعدد السرعات'), 'Course page must remove sparkles clutter text');
  // Verify formatVideoTime edge cases
  assert.ok(controlsContent.includes('formatVideoTime(sec: number)'), 'Must export formatVideoTime function');
  const formatMatch = controlsContent.match(/function formatVideoTime\(sec: number\): string \{([\s\S]*?)\n\}/);
  assert.ok(formatMatch, 'formatVideoTime implementation must exist');
  function formatVideoTime(sec) {
    const safe = Math.max(0, Math.floor(Number.isFinite(sec) ? sec : 0));
    const mins = Math.floor(safe / 60);
    const secs = safe % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  assert.equal(formatVideoTime(0), '00:00');
  assert.equal(formatVideoTime(59), '00:59');
  assert.equal(formatVideoTime(60), '01:00');
  assert.equal(formatVideoTime(125), '02:05');
  assert.equal(formatVideoTime(-5), '00:00');
  assert.equal(formatVideoTime(NaN), '00:00');
});

// 18. Video Player Mobile Responsiveness & YouTube Gestures
test('Video Player Mobile Responsiveness & YouTube Gestures: 320px–768px fit & Double-Tap Seeker', () => {
  const controlsFile = path.join(srcDir, 'features', 'video-player', 'VideoPlayerControls.tsx');
  const playerFile = path.join(srcDir, 'features', 'video-player', 'CrossPlatformHlsPlayer.tsx');
  const gesturesFile = path.join(srcDir, 'features', 'video-player', 'useVideoGestures.ts');
  const rippleFile = path.join(srcDir, 'features', 'video-player', 'DoubleTapRippleOverlay.tsx');

  const controlsContent = fs.readFileSync(controlsFile, 'utf8');
  const playerContent = fs.readFileSync(playerFile, 'utf8');
  const gesturesContent = fs.readFileSync(gesturesFile, 'utf8');
  const rippleContent = fs.readFileSync(rippleFile, 'utf8');

  // 1. Mobile compact classes preventing horizontal clipping on 320px-425px & popover containment
  assert.ok(controlsContent.includes('gap-0.5') && controlsContent.includes('h-7'), 'Controls must use compact sizes (h-7, gap-0.5) for narrow viewports');
  assert.ok(controlsContent.includes('text-[9px]'), 'Controls must use ultra-compact 9px text for narrow viewports');
  assert.ok(controlsContent.includes('hidden lg:block'), 'Volume slider must be hidden below lg to avoid clipping at 768px with open sidebar');
  assert.ok(controlsContent.includes('max-h-32'), 'Speed and quality popups must be constrained on mobile (max-h-32) to prevent clipping in 16:9 frame');

  // 2. YouTube double tap gestures & single-tap conflict prevention
  assert.ok(playerContent.includes('touch-manipulation'), 'Player container must specify touch-manipulation to eliminate mobile double-tap zoom delay');
  assert.ok(gesturesContent.includes('lastTapTimeRef.current < 280'), 'Gestures hook must detect double-tap within 280ms threshold');
  assert.ok(gesturesContent.includes("side === 'left' ? -10 : 10"), 'Gestures hook must skip -10s on left side and +10s on right side');
  assert.ok(gesturesContent.includes('clearTimeout(singleTapTimeoutRef.current)'), 'Double-tap must cancel single-tap timer to prevent pause/play flicker');

  // 3. Visual ripple indicator
  assert.ok(rippleContent.includes('-10 ثوانٍ') && rippleContent.includes('+10 ثوانٍ'), 'Ripple overlay must show -10 ثوانٍ and +10 ثوانٍ');

  // 4. Real duration sync & iOS Safari full-screen event support
  assert.ok(!playerContent.includes('DEMO_DURATION_SEC'), 'Must not have hardcoded demo duration');
  assert.ok(playerContent.includes('onLoadedMetadata') && playerContent.includes('onDurationChange') && playerContent.includes('onTimeUpdate'), 'Must sync real duration through native video events');
  assert.ok(playerContent.includes('webkitbeginfullscreen') && playerContent.includes('webkitendfullscreen'), 'Must bind iOS Safari webkitbeginfullscreen & webkitendfullscreen on video element');

  // 5. Mobile non-fullscreen speed/quality button hiding and clean floating badge
  assert.ok(
    controlsContent.includes("isFullscreen ? 'block' : 'hidden sm:block'"),
    'Speed and quality buttons must be hidden on mobile when not fullscreen, but visible in fullscreen or on sm screens'
  );
  assert.ok(
    !rippleContent.includes('bg-emerald-500/15'),
    'DoubleTapRippleOverlay must not use full-height split-screen tint that cuts video in half'
  );
  assert.ok(
    playerContent.includes('backBufferLength: 90'),
    'Hls player must configure backBufferLength of at least 90s for instant smooth seeking'
  );

  // 6. Fast buffering, HLS error recovery, preload auto, and seek stability
  assert.ok(playerContent.includes('preload="auto"'), 'Video element must specify preload="auto" for fast buffering');
  assert.ok(playerContent.includes('recoverMediaError'), 'Hls player must handle fatal media errors with recoverMediaError()');
  assert.ok(playerContent.includes('isBuffering'), 'Player must track buffering state for responsive feedback');
  assert.ok(playerContent.includes('lastSeekTimestampRef.current >= 450'), 'Timeupdate must not overwrite target position during active seek');
});
