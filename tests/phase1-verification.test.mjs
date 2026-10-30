import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  normalizeDigits,
  normalizePhoneNumber,
  sanitizePhoneInput,
  isValidEgyptianPhone,
  normalizeActivationCode,
  phoneToVirtualEmail,
} from '../src/lib/utils/input-normalizer.ts';
import { validateUploadedWebpFile } from '../src/lib/server/image-security.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const srcDir = path.join(projectRoot, 'src');

// 1. Architecture Rules Test: Max 250 lines per file
test('Architectural Rule 1: No file in src/ exceeds 250 lines', () => {
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

// 2. Architecture Rules Test: Zero Barrel Files (no index.ts or index.tsx)
test('Architectural Rule 2: No barrel files (index.ts / index.tsx) in src/', () => {
  function checkNoBarrel(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        checkNoBarrel(fullPath);
      } else if (entry.isFile()) {
        const lower = entry.name.toLowerCase();
        assert.notEqual(
          lower,
          'index.ts',
          `Barrel file detected: ${path.relative(projectRoot, fullPath)}. Barrel files are strictly forbidden!`
        );
        assert.notEqual(
          lower,
          'index.tsx',
          `Barrel file detected: ${path.relative(projectRoot, fullPath)}. Barrel files are strictly forbidden!`
        );
      }
    }
  }

  checkNoBarrel(srcDir);
});

// 3. Architecture Rules Test: Server-only files isolation
test('Architectural Rule 3: All files in src/lib/server/ start with server-only', () => {
  const serverDir = path.join(srcDir, 'lib', 'server');
  if (fs.existsSync(serverDir)) {
    const files = fs.readdirSync(serverDir);
    for (const file of files) {
      if (file.endsWith('.ts')) {
        const fullPath = path.join(serverDir, file);
        const content = fs.readFileSync(fullPath, 'utf8');
        assert.ok(
          content.includes("import 'server-only'") || content.includes('import "server-only"'),
          `Server file ${file} MUST contain import 'server-only' to protect secret keys from leaking to client!`
        );
      }
    }
  }
});

// 4. Architecture Rules Test: No Cross-Feature Imports (features/A must not import features/B)
test('Architectural Rule 4: Strict Feature Isolation - No cross-feature imports', () => {
  const featuresDir = path.join(srcDir, 'features');
  if (fs.existsSync(featuresDir)) {
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
  }
});

// 5. Input Normalizer Logic Verification (testing actual src/lib/utils/input-normalizer.ts)
test('Input Normalizer: sanitizePhoneInput allows typing + and spaces while cleaning', () => {
  assert.equal(sanitizePhoneInput('+'), '+');
  assert.equal(sanitizePhoneInput('+2'), '+2');
  assert.equal(sanitizePhoneInput('+201012345678'), '01012345678');
  assert.equal(sanitizePhoneInput('٠١٠ 1234 5678'), '01012345678');
  assert.equal(sanitizePhoneInput('00201198765432'), '01198765432');
});

test('Input Normalizer: Arabic and Eastern-Indic digits converted to ASCII', () => {
  assert.equal(normalizeDigits('٠١٢٣٤٥٦٧٨٩'), '0123456789');
  assert.equal(normalizeDigits('۰۱۲۳۴۵۶۷۸۹'), '0123456789');
  assert.equal(normalizeDigits('رقم ٠١٠١٢٣٤٥٦٧٨'), 'رقم 01012345678');
  assert.equal(normalizeDigits(''), '');
});

test('Input Normalizer: Phone numbers cleaned from prefixes and spaces', () => {
  assert.equal(normalizePhoneNumber('  +201012345678  '), '01012345678');
  assert.equal(normalizePhoneNumber('00201198765432'), '01198765432');
  assert.equal(normalizePhoneNumber('201234567890'), '01234567890');
  assert.equal(normalizePhoneNumber('٠١٥١٢٣٤٥٦٧٨'), '01512345678');
  assert.equal(normalizePhoneNumber('1012345678'), '01012345678');
});

test('Input Normalizer: Egyptian phone validity rules', () => {
  assert.equal(isValidEgyptianPhone('01012345678'), true);
  assert.equal(isValidEgyptianPhone('01112345678'), true);
  assert.equal(isValidEgyptianPhone('01212345678'), true);
  assert.equal(isValidEgyptianPhone('01512345678'), true);

  // Invalid networks & lengths
  assert.equal(isValidEgyptianPhone('01312345678'), false);
  assert.equal(isValidEgyptianPhone('01412345678'), false);
  assert.equal(isValidEgyptianPhone('0101234567'), false);
  assert.equal(isValidEgyptianPhone('010123456789'), false);
  assert.equal(isValidEgyptianPhone('abcdefghijk'), false);
  assert.equal(isValidEgyptianPhone(''), false);
});

test('Input Normalizer: Activation codes uppercase and trimmed', () => {
  assert.equal(normalizeActivationCode('  bio-٢٠٢٧-pass  '), 'BIO-2027-PASS');
  assert.equal(normalizeActivationCode('code 123 456'), 'CODE123456');
});

test('Input Normalizer: Virtual Email generator for Supabase Auth', () => {
  assert.equal(phoneToVirtualEmail('01012345678'), '01012345678@student.platform.local');
  assert.equal(phoneToVirtualEmail('+201198765432'), '01198765432@student.platform.local');
});

// 6. Server Magic Bytes WebP Validator Logic Verification (testing actual src/lib/server/image-security.ts)
test('Asset Verification: Teacher photo and brand logo exist in public/images/', () => {
  const teacherImg = path.join(projectRoot, 'public', 'images', 'teacher-ammar.jpg');
  const logoImg = path.join(projectRoot, 'public', 'images', 'logo-ammar.png');
  assert.ok(fs.existsSync(teacherImg), 'Teacher photo must exist in public/images/');
  assert.ok(fs.existsSync(logoImg), 'Logo must exist in public/images/');
  assert.ok(fs.statSync(teacherImg).size > 1000, 'Teacher photo must be non-empty');
  assert.ok(fs.statSync(logoImg).size > 1000, 'Logo must be non-empty');
});

test('Image Security: Rejects oversized images (> 500KB)', async () => {
  const oversizedData = new Uint8Array(501 * 1024);
  const oversizedFile = new File([oversizedData], 'large.webp', { type: 'image/webp' });
  await assert.rejects(() => validateUploadedWebpFile(oversizedFile), /PAYLOAD_TOO_LARGE/);
});

test('Image Security: Rejects non-WebP or fake files', async () => {
  const fakeBytes = new Uint8Array([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b]);
  const fakeFile = new File([fakeBytes], 'fake.webp', { type: 'image/webp' });
  await assert.rejects(() => validateUploadedWebpFile(fakeFile), /INVALID_MAGIC_BYTES/);
});

test('Image Security: Accepts valid WebP with RIFF + WEBP header under 500KB', async () => {
  const validHeader = new Uint8Array(20);
  validHeader[0] = 0x52; validHeader[1] = 0x49; validHeader[2] = 0x46; validHeader[3] = 0x46; // RIFF
  validHeader[8] = 0x57; validHeader[9] = 0x45; validHeader[10] = 0x42; validHeader[11] = 0x50; // WEBP

  const validFile = new File([validHeader], 'valid.webp', { type: 'image/webp' });
  const result = await validateUploadedWebpFile(validFile);
  assert.ok(result instanceof Uint8Array);
  assert.equal(result.byteLength, 20);
});

// 7. Video Player Component Rules: showWatermark=false default
test('Video Player Rule: showWatermark is false by default in CrossPlatformHlsPlayer', () => {
  const playerFile = path.join(srcDir, 'features', 'video-player', 'CrossPlatformHlsPlayer.tsx');
  const content = fs.readFileSync(playerFile, 'utf8');
  assert.ok(
    content.includes('showWatermark = false'),
    'CrossPlatformHlsPlayer must set showWatermark = false by default as required!'
  );
});

// 8. Mobile Safari iOS Auto-Zoom Prevention Rule (Font Size >= 16px)
test('UX Rule: CSS contains mobile 16px rule for input fields to prevent iOS auto-zoom', () => {
  const cssFile = path.join(srcDir, 'app', 'globals.css');
  const content = fs.readFileSync(cssFile, 'utf8');
  assert.ok(
    content.includes('font-size: 16px !important') || content.includes('16px'),
    'globals.css must enforce 16px font-size for mobile inputs to prevent iOS Safari auto-zoom!'
  );
});

// 9. Architectural Rule: Mandatory prefetch={false} on all <Link> components
test('Architectural Rule 5: All <Link> components must specify prefetch={false}', () => {
  function checkLinks(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        checkLinks(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.jsx'))) {
        const content = fs.readFileSync(fullPath, 'utf8');
        // Match <Link ...> tags that don't have prefetch={false}
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

// 10. Edge Middleware Security & Safe Decoding Rule
test('Middleware Rule: Middleware uses safe base64url decoding with TextDecoder', () => {
  const middlewareFile = path.join(srcDir, 'middleware.ts');
  const content = fs.readFileSync(middlewareFile, 'utf8');
  assert.ok(
    content.includes('b64UrlToBytes') && content.includes('TextDecoder'),
    'middleware.ts must use b64UrlToBytes and TextDecoder to safely decode base64- cookie chunks without throwing!'
  );
  assert.ok(
    !content.includes("atob(combined.replace('base64-', ''))"),
    'middleware.ts must not call raw atob directly on base64- cookies without url-safe handling!'
  );
});


