import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const srcDir = path.join(projectRoot, 'src');
const schemaPath = path.join(projectRoot, 'supabase', 'schema.sql');

function walkDir(dir) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkDir(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

// ==============================================================================
// 1. Zero Hardcoded Mock Data Check
// ==============================================================================
test('Codebase Audit 1: Zero Hardcoded Mock Data in UI and No lms_preview_auth_user', () => {
  const allFiles = walkDir(srcDir);
  const forbiddenPatterns = [
    /\bconst\s+COURSES\b/,
    /\bconst\s+STUDENT_COURSES\b/,
    /\bconst\s+INITIAL_POSTS\b/,
    /\bconst\s+INITIAL_NOTIFICATIONS\b/,
    /\bINITIAL_NOTIFICATIONS\b/,
    /\blms_preview_auth_user\b/,
  ];

  const violations = [];

  for (const file of allFiles) {
    if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      const content = fs.readFileSync(file, 'utf8');
      const relPath = path.relative(projectRoot, file);

      // lms_preview_auth_user is forbidden in every file without exception
      if (content.includes('lms_preview_auth_user')) {
        violations.push({ file: relPath, pattern: 'lms_preview_auth_user' });
      }

      // Check UI files (excluding src/lib/data/ definitions) for forbidden mock arrays
      if (!relPath.startsWith(path.join('src', 'lib', 'data'))) {
        for (const pattern of forbiddenPatterns) {
          if (pattern.test(content)) {
            violations.push({ file: relPath, pattern: pattern.toString() });
          }
        }
      }
    }
  }

  assert.equal(
    violations.length,
    0,
    `Found forbidden hardcoded mock data or lms_preview_auth_user in: ${JSON.stringify(violations, null, 2)}`
  );
});

// ==============================================================================
// 2. Complete Route Tree Check (Auth, Student, 8 Admin Pages)
// ==============================================================================
test('Codebase Audit 2: Complete Route Tree (Auth, Student, and 8 Admin Pages)', () => {
  const requiredRoutes = [
    // Auth Routes
    'src/app/login/page.tsx',
    'src/app/register/page.tsx',

    // Student Routes
    'src/app/(student)/dashboard/page.tsx',
    'src/app/(student)/courses/page.tsx',
    'src/app/(student)/courses/[courseId]/page.tsx',
    'src/app/(student)/courses/[courseId]/subscribe/page.tsx',
    'src/app/(student)/courses/[courseId]/exam/[examId]/page.tsx',
    'src/app/(student)/forum/page.tsx',
    'src/app/(student)/account/page.tsx',

    // 8 Core Admin Dashboard Routes
    'src/app/(admin)/admin/page.tsx',
    'src/app/(admin)/admin/courses/page.tsx',
    'src/app/(admin)/admin/exams/page.tsx',
    'src/app/(admin)/admin/students/page.tsx',
    'src/app/(admin)/admin/payments/page.tsx',
    'src/app/(admin)/admin/forum/page.tsx',
    'src/app/(admin)/admin/notifications/page.tsx',
    'src/app/(admin)/admin/settings/page.tsx',

    // Extra staff & audit admin routes
    'src/app/(admin)/admin/staff/page.tsx',
    'src/app/(admin)/admin/audit-logs/page.tsx',
    'src/app/(admin)/admin/login/page.tsx',
  ];

  const missing = [];
  for (const route of requiredRoutes) {
    const full = path.join(projectRoot, route);
    if (!fs.existsSync(full)) {
      missing.push(route);
    }
  }

  assert.equal(missing.length, 0, `Missing required route pages: ${missing.join(', ')}`);
});

// ==============================================================================
// 3. Frontend RPC & Table Matching with supabase/schema.sql
// ==============================================================================
test('Codebase Audit 3: Exact RPC and Table Name Match with supabase/schema.sql', () => {
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  const allFiles = walkDir(srcDir);

  const rpcRegex = /\.rpc\(\s*['"]([^'"]+)['"]/g;
  const fromRegex = /\.from\(\s*['"]([^'"]+)['"]/g;

  const usedRpcs = new Set();
  const usedTables = new Set();

  for (const file of allFiles) {
    if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      const content = fs.readFileSync(file, 'utf8');
      let match;
      while ((match = rpcRegex.exec(content)) !== null) {
        usedRpcs.add(match[1]);
      }
      while ((match = fromRegex.exec(content)) !== null) {
        usedTables.add(match[1]);
      }
    }
  }

  const missingRpcs = [];
  for (const rpc of usedRpcs) {
    const fnRegex = new RegExp(`FUNCTION\\s+public\\.${rpc}\\b`, 'i');
    if (!fnRegex.test(schemaSql)) {
      missingRpcs.push(rpc);
    }
  }

  const missingTables = [];
  for (const tbl of usedTables) {
    const tblRegex = new RegExp(`CREATE TABLE[^;]*public\\.${tbl}\\b`, 'i');
    if (!tblRegex.test(schemaSql)) {
      missingTables.push(tbl);
    }
  }

  assert.equal(missingRpcs.length, 0, `Frontend RPCs not found in schema.sql: ${missingRpcs.join(', ')}`);
  assert.equal(missingTables.length, 0, `Frontend Tables not found in schema.sql: ${missingTables.join(', ')}`);
});

// ==============================================================================
// 4. Architecture Rules Compliance (prefetch={false}, server-only, feature isolation)
// ==============================================================================
test('Codebase Audit 4: Architecture Rules Compliance (prefetch, server-only, feature isolation)', () => {
  const allFiles = walkDir(srcDir);

  // A. All <Link> must have prefetch={false}
  for (const file of allFiles) {
    if (file.endsWith('.tsx')) {
      const content = fs.readFileSync(file, 'utf8');
      const linkMatches = content.match(/<Link\b[^>]*>/g);
      if (linkMatches) {
        for (const tag of linkMatches) {
          assert.ok(
            tag.includes('prefetch={false}'),
            `Found <Link> without prefetch={false} in ${path.relative(projectRoot, file)}: ${tag}`
          );
        }
      }
    }
  }

  // B. All files in src/lib/server/ must start with "import 'server-only';"
  const serverLibDir = path.join(srcDir, 'lib', 'server');
  const serverFiles = fs.readdirSync(serverLibDir, { withFileTypes: true });
  for (const sf of serverFiles) {
    if (sf.isFile() && (sf.name.endsWith('.ts') || sf.name.endsWith('.js'))) {
      const full = path.join(serverLibDir, sf.name);
      const content = fs.readFileSync(full, 'utf8').trim();
      assert.ok(
        content.startsWith("import 'server-only';"),
        `File ${path.relative(projectRoot, full)} must start with "import 'server-only';"`
      );
    }
  }

  // C. Feature Isolation (No cross-imports between src/features/*)
  const featuresDir = path.join(srcDir, 'features');
  const featureFolders = fs.readdirSync(featuresDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const feat of featureFolders) {
    const featFiles = walkDir(path.join(featuresDir, feat));
    for (const file of featFiles) {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        const content = fs.readFileSync(file, 'utf8');
        for (const other of featureFolders) {
          if (other !== feat) {
            const crossRegex = new RegExp(`from\\s+['"]@/features/${other}`, 'g');
            assert.ok(
              !crossRegex.test(content),
              `Cross-feature import detected: ${path.relative(projectRoot, file)} imports from @/features/${other}`
            );
          }
        }
      }
    }
  }
});

// ==============================================================================
// 5. Strict Line Count Rule: No file in src/ exceeds 250 lines
// ==============================================================================
test('Codebase Audit 5: Strict 250-line limit across all src/ files', () => {
  const allFiles = walkDir(srcDir);
  const oversized = [];

  for (const file of allFiles) {
    if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n').length;
      if (lines > 250) {
        oversized.push({ file: path.relative(projectRoot, file), lines });
      }
    }
  }

  assert.equal(
    oversized.length,
    0,
    `Files exceeding 250-line limit: ${JSON.stringify(oversized, null, 2)}`
  );
});

// ==============================================================================
// 6. Zero Barrel Files: No index.ts or index.tsx anywhere in src/
// ==============================================================================
test('Codebase Audit 6: Strict Zero Barrel Files in src/', () => {
  const allFiles = walkDir(srcDir);
  const barrels = [];

  for (const file of allFiles) {
    const base = path.basename(file).toLowerCase();
    if (base === 'index.ts' || base === 'index.tsx') {
      barrels.push(path.relative(projectRoot, file));
    }
  }

  assert.equal(barrels.length, 0, `Forbidden barrel files detected: ${barrels.join(', ')}`);
});
