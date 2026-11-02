import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const { NextRequest, NextResponse } = require('next/server');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const middlewareFile = path.resolve(__dirname, '..', 'src', 'middleware.ts');
const middlewareCode = fs.readFileSync(middlewareFile, 'utf8');

const transpiled = ts.transpileModule(middlewareCode, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

const customModule = { exports: {} };
const evalFn = new Function('require', 'module', 'exports', 'NextResponse', transpiled);
evalFn((mod) => (mod === 'next/server' ? { NextResponse, NextRequest } : require(mod)), customModule, customModule.exports, NextResponse);

const { middleware } = customModule.exports;

function createMockJwt(headerObj, payloadObj) {
  const enc = (obj) => {
    const jsonStr = JSON.stringify(obj);
    const utf8Bytes = new TextEncoder().encode(jsonStr);
    let bin = '';
    for (let i = 0; i < utf8Bytes.length; i++) {
      bin += String.fromCharCode(utf8Bytes[i]);
    }
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };
  return `${enc(headerObj)}.${enc(payloadObj)}.mock_signature`;
}

function encodeToSupabaseCookie(sessionData) {
  const jsonStr = JSON.stringify(sessionData);
  const utf8Bytes = new TextEncoder().encode(jsonStr);
  let bin = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    bin += String.fromCharCode(utf8Bytes[i]);
  }
  const b64Url = btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `base64-${b64Url}`;
}

test('Middleware: permits public access to /admin/login without cookies', async () => {
  const req = new NextRequest('http://localhost:3000/admin/login');
  const res = await middleware(req);
  assert.equal(res.status, 200);
});

test('Middleware: redirects unauthenticated request on /admin to /admin/login with 307', async () => {
  const req = new NextRequest('http://localhost:3000/admin');
  const res = await middleware(req);
  assert.equal(res.status, 307);
  const location = res.headers.get('location');
  assert.ok(location?.includes('/admin/login?redirect=%2Fadmin'));
});

test('Middleware: successfully authorizes super_admin with chunked cookies (.0 and .1)', async () => {
  const jwt = createMockJwt(
    { alg: 'ES256', typ: 'JWT' },
    {
      sub: '483e8921-ce56-428e-835e-0001056dde01',
      exp: Math.floor(Date.now() / 1000) + 3600,
      app_metadata: { role: 'super_admin' },
      user_metadata: { full_name: 'الأستاذ عمار رزق' },
    }
  );

  const fullCookieValue = encodeToSupabaseCookie({ access_token: jwt });
  const half = Math.floor(fullCookieValue.length / 2);
  const chunk0 = fullCookieValue.slice(0, half);
  const chunk1 = fullCookieValue.slice(half);

  const req = new NextRequest('http://localhost:3000/admin', {
    headers: {
      cookie: `sb-icgggnrrtkaoqsfbwqnf-auth-token.0=${chunk0}; sb-icgggnrrtkaoqsfbwqnf-auth-token.1=${chunk1}`,
    },
  });

  const res = await middleware(req);
  assert.equal(res.status, 200);
});

test('Middleware: handles collision between empty base cookie and chunked cookies', async () => {
  const jwt = createMockJwt(
    { alg: 'ES256', typ: 'JWT' },
    {
      sub: '483e8921-ce56-428e-835e-0001056dde02',
      exp: Math.floor(Date.now() / 1000) + 3600,
      app_metadata: { role: 'admin' },
      user_metadata: { full_name: 'أدمن المنصة' },
    }
  );

  const fullCookieValue = encodeToSupabaseCookie({ access_token: jwt });
  const chunk0 = fullCookieValue.slice(0, 100);
  const chunk1 = fullCookieValue.slice(100);

  const req = new NextRequest('http://localhost:3000/admin/courses', {
    headers: {
      cookie: `sb-icgggnrrtkaoqsfbwqnf-auth-token=""; sb-icgggnrrtkaoqsfbwqnf-auth-token.0=${chunk0}; sb-icgggnrrtkaoqsfbwqnf-auth-token.1=${chunk1}`,
    },
  });

  const res = await middleware(req);
  assert.equal(res.status, 200);
});

test('Middleware: supports quoted and URL-encoded cookie values', async () => {
  const jwt = createMockJwt(
    { alg: 'ES256', typ: 'JWT' },
    {
      sub: '483e8921-ce56-428e-835e-0001056dde03',
      exp: Math.floor(Date.now() / 1000) + 3600,
      app_metadata: { role: 'super_admin' },
    }
  );

  const fullCookieValue = encodeToSupabaseCookie({ access_token: jwt });
  const quotedEncoded = encodeURIComponent(`"${fullCookieValue}"`);

  const req = new NextRequest('http://localhost:3000/admin/settings', {
    headers: {
      cookie: `sb-icgggnrrtkaoqsfbwqnf-auth-token=${quotedEncoded}`,
    },
  });

  const res = await middleware(req);
  assert.equal(res.status, 200);
});

test('Middleware: rejects expired tokens and redirects to /admin/login', async () => {
  const expiredJwt = createMockJwt(
    { alg: 'ES256', typ: 'JWT' },
    {
      sub: '483e8921-ce56-428e-835e-0001056dde04',
      exp: Math.floor(Date.now() / 1000) - 300,
      app_metadata: { role: 'super_admin' },
    }
  );

  const fullCookieValue = encodeToSupabaseCookie({ access_token: expiredJwt });
  const req = new NextRequest('http://localhost:3000/admin', {
    headers: {
      cookie: `sb-icgggnrrtkaoqsfbwqnf-auth-token=${fullCookieValue}`,
    },
  });

  const res = await middleware(req);
  assert.equal(res.status, 307);
  assert.ok(res.headers.get('location')?.includes('/admin/login'));
});

test('Middleware: rejects non-staff roles (e.g., student) from accessing /admin', async () => {
  const studentJwt = createMockJwt(
    { alg: 'ES256', typ: 'JWT' },
    {
      sub: '483e8921-ce56-428e-835e-0001056dde05',
      exp: Math.floor(Date.now() / 1000) + 3600,
      app_metadata: { role: 'student' },
    }
  );

  const fullCookieValue = encodeToSupabaseCookie({ access_token: studentJwt });
  const req = new NextRequest('http://localhost:3000/admin', {
    headers: {
      cookie: `sb-icgggnrrtkaoqsfbwqnf-auth-token=${fullCookieValue}`,
    },
  });

  const res = await middleware(req);
  assert.equal(res.status, 307);
  assert.ok(res.headers.get('location')?.includes('/admin/login'));
});

test('Middleware: permits super_admin when both student single cookie and admin chunked cookies coexist', async () => {
  const studentJwt = createMockJwt(
    { alg: 'ES256', typ: 'JWT' },
    {
      sub: 'student-id-1',
      exp: Math.floor(Date.now() / 1000) + 3600,
      app_metadata: { role: 'student' },
    }
  );
  const adminJwt = createMockJwt(
    { alg: 'ES256', typ: 'JWT' },
    {
      sub: 'admin-id-1',
      exp: Math.floor(Date.now() / 1000) + 3600,
      app_metadata: { role: 'super_admin' },
      user_metadata: { full_name: 'الأستاذ عمار رزق' },
    }
  );

  const studentCookie = encodeToSupabaseCookie({ access_token: studentJwt });
  const adminFull = encodeToSupabaseCookie({ access_token: adminJwt });
  const half = Math.floor(adminFull.length / 2);
  const chunk0 = adminFull.slice(0, half);
  const chunk1 = adminFull.slice(half);

  const req = new NextRequest('http://localhost:3000/admin', {
    headers: {
      cookie: `sb-icgggnrrtkaoqsfbwqnf-auth-token=${studentCookie}; sb-icgggnrrtkaoqsfbwqnf-auth-token.0=${chunk0}; sb-icgggnrrtkaoqsfbwqnf-auth-token.1=${chunk1}`,
    },
  });

  const res = await middleware(req);
  assert.equal(res.status, 200);
});

test('Middleware: enforces assistant RBAC permissions correctly', async () => {
  const assistantJwt = createMockJwt(
    { alg: 'ES256', typ: 'JWT' },
    {
      sub: 'assistant-id-1',
      exp: Math.floor(Date.now() / 1000) + 3600,
      app_metadata: {
        role: 'assistant',
        permissions: { manage_courses: true, manage_settings: false },
      },
    }
  );

  const fullCookieValue = encodeToSupabaseCookie({ access_token: assistantJwt });

  // 1. Permitted route: /admin/courses
  const allowedReq = new NextRequest('http://localhost:3000/admin/courses', {
    headers: {
      cookie: `sb-icgggnrrtkaoqsfbwqnf-auth-token=${fullCookieValue}`,
    },
  });
  const allowedRes = await middleware(allowedReq);
  assert.equal(allowedRes.status, 200);

  // 2. Forbidden route: /admin/settings
  const forbiddenReq = new NextRequest('http://localhost:3000/admin/settings', {
    headers: {
      cookie: `sb-icgggnrrtkaoqsfbwqnf-auth-token=${fullCookieValue}`,
    },
  });
  const forbiddenRes = await middleware(forbiddenReq);
  assert.equal(forbiddenRes.status, 307);
  assert.ok(forbiddenRes.headers.get('location')?.includes('/admin/unauthorized'));
});

test('Middleware: permits unauthenticated access to /, /login, and /register with 200', async () => {
  for (const path of ['/', '/login', '/register']) {
    const req = new NextRequest(`http://localhost:3000${path}`);
    const res = await middleware(req);
    assert.equal(res.status, 200, `Expected 200 for ${path}`);
  }
});

test('Middleware: redirects authenticated student on /, /login, /register to /dashboard with 307', async () => {
  const studentJwt = createMockJwt(
    { alg: 'ES256', typ: 'JWT' },
    {
      sub: 'student-auth-redirect-1',
      exp: Math.floor(Date.now() / 1000) + 3600,
      app_metadata: { role: 'student' },
    }
  );
  const cookieValue = encodeToSupabaseCookie({ access_token: studentJwt });

  for (const path of ['/', '/login', '/register']) {
    const req = new NextRequest(`http://localhost:3000${path}`, {
      headers: { cookie: `sb-icgggnrrtkaoqsfbwqnf-auth-token=${cookieValue}` },
    });
    const res = await middleware(req);
    assert.equal(res.status, 307, `Expected 307 for ${path}`);
    assert.ok(res.headers.get('location')?.endsWith('/dashboard'), `Expected redirect to /dashboard for ${path}`);
  }
});

test('Middleware: respects redirect param for authenticated student but ignores auth pages', async () => {
  const studentJwt = createMockJwt(
    { alg: 'ES256', typ: 'JWT' },
    {
      sub: 'student-auth-redirect-2',
      exp: Math.floor(Date.now() / 1000) + 3600,
      app_metadata: { role: 'student' },
    }
  );
  const cookieValue = encodeToSupabaseCookie({ access_token: studentJwt });

  // 1. Valid custom redirect param -> redirects to /courses
  const customReq = new NextRequest('http://localhost:3000/login?redirect=%2Fcourses', {
    headers: { cookie: `sb-icgggnrrtkaoqsfbwqnf-auth-token=${cookieValue}` },
  });
  const customRes = await middleware(customReq);
  assert.equal(customRes.status, 307);
  assert.ok(customRes.headers.get('location')?.endsWith('/courses'));

  // 2. Auth redirect param (e.g. /login or /) -> falls back to /dashboard
  const selfReq = new NextRequest('http://localhost:3000/login?redirect=%2Flogin', {
    headers: { cookie: `sb-icgggnrrtkaoqsfbwqnf-auth-token=${cookieValue}` },
  });
  const selfRes = await middleware(selfReq);
  assert.equal(selfRes.status, 307);
  assert.ok(selfRes.headers.get('location')?.endsWith('/dashboard'));
});

test('Middleware: redirects authenticated admin/assistant on /, /login, /register to /admin with 307', async () => {
  const adminJwt = createMockJwt(
    { alg: 'ES256', typ: 'JWT' },
    {
      sub: 'admin-auth-redirect-1',
      exp: Math.floor(Date.now() / 1000) + 3600,
      app_metadata: { role: 'admin' },
    }
  );
  const cookieValue = encodeToSupabaseCookie({ access_token: adminJwt });

  for (const path of ['/', '/login', '/register']) {
    const req = new NextRequest(`http://localhost:3000${path}`, {
      headers: { cookie: `sb-icgggnrrtkaoqsfbwqnf-auth-token=${cookieValue}` },
    });
    const res = await middleware(req);
    assert.equal(res.status, 307, `Expected 307 for ${path}`);
    assert.ok(res.headers.get('location')?.endsWith('/admin'), `Expected redirect to /admin for ${path}`);
  }
});

test('Middleware: permits access to / for visitor with expired student token', async () => {
  const expiredJwt = createMockJwt(
    { alg: 'ES256', typ: 'JWT' },
    {
      sub: 'student-expired-1',
      exp: Math.floor(Date.now() / 1000) - 300,
      app_metadata: { role: 'student' },
    }
  );
  const cookieValue = encodeToSupabaseCookie({ access_token: expiredJwt });
  const req = new NextRequest('http://localhost:3000/', {
    headers: { cookie: `sb-icgggnrrtkaoqsfbwqnf-auth-token=${cookieValue}` },
  });
  const res = await middleware(req);
  assert.equal(res.status, 200);
});

test('Middleware: redirects to /admin on / when both student and admin cookies coexist', async () => {
  const studentJwt = createMockJwt(
    { alg: 'ES256', typ: 'JWT' },
    {
      sub: 'student-coexist-1',
      exp: Math.floor(Date.now() / 1000) + 3600,
      app_metadata: { role: 'student' },
    }
  );
  const adminJwt = createMockJwt(
    { alg: 'ES256', typ: 'JWT' },
    {
      sub: 'admin-coexist-1',
      exp: Math.floor(Date.now() / 1000) + 3600,
      app_metadata: { role: 'super_admin' },
    }
  );

  const studentCookie = encodeToSupabaseCookie({ access_token: studentJwt });
  const adminCookie = encodeToSupabaseCookie({ access_token: adminJwt });

  const req = new NextRequest('http://localhost:3000/', {
    headers: {
      cookie: `sb-icgggnrrtkaoqsfbwqnf-auth-token=${studentCookie}; sb-icgggnrrtkaoqsfbwqnf-auth-token.0=${adminCookie}`,
    },
  });

  const res = await middleware(req);
  assert.equal(res.status, 307);
  assert.ok(res.headers.get('location')?.endsWith('/admin'));
});

test('Middleware: safely decodes quoted base64- cookie without corrupting payload', async () => {
  const studentJwt = createMockJwt(
    { alg: 'ES256', typ: 'JWT' },
    {
      sub: 'student-quoted-base64',
      exp: Math.floor(Date.now() / 1000) + 3600,
      app_metadata: { role: 'student' },
    }
  );
  const cookieValue = encodeToSupabaseCookie({ access_token: studentJwt });
  const quoted = `"${cookieValue}"`;

  const req = new NextRequest('http://localhost:3000/', {
    headers: { cookie: `sb-icgggnrrtkaoqsfbwqnf-auth-token=${quoted}` },
  });
  const res = await middleware(req);
  assert.equal(res.status, 307);
  assert.ok(res.headers.get('location')?.endsWith('/dashboard'));
});

test('Middleware: handles trailing slashes on auth routes (/login/ and /register/)', async () => {
  const studentJwt = createMockJwt(
    { alg: 'ES256', typ: 'JWT' },
    {
      sub: 'student-slash-test',
      exp: Math.floor(Date.now() / 1000) + 3600,
      app_metadata: { role: 'student' },
    }
  );
  const cookieValue = encodeToSupabaseCookie({ access_token: studentJwt });

  for (const path of ['/login/', '/register/', '/login///']) {
    const req = new NextRequest(`http://localhost:3000${path}`, {
      headers: { cookie: `sb-icgggnrrtkaoqsfbwqnf-auth-token=${cookieValue}` },
    });
    const res = await middleware(req);
    assert.equal(res.status, 307, `Expected 307 redirect for ${path}`);
    assert.ok(res.headers.get('location')?.endsWith('/dashboard'));
  }
});

test('Middleware: prevents redirect loop on /login?redirect=/login/ or /register/ or /?test=1', async () => {
  const studentJwt = createMockJwt(
    { alg: 'ES256', typ: 'JWT' },
    {
      sub: 'student-loop-prevention',
      exp: Math.floor(Date.now() / 1000) + 3600,
      app_metadata: { role: 'student' },
    }
  );
  const cookieValue = encodeToSupabaseCookie({ access_token: studentJwt });

  const loopUrls = [
    'http://localhost:3000/login?redirect=%2Flogin%2F',
    'http://localhost:3000/login?redirect=%2Fregister%2F',
    'http://localhost:3000/login?redirect=%2F%3Ftest%3D1',
    'http://localhost:3000/login?redirect=%2F%2Fevil.com',
    'http://localhost:3000/login?redirect=%2F%5C%5Cevil.com',
  ];

  for (const url of loopUrls) {
    const req = new NextRequest(url, {
      headers: { cookie: `sb-icgggnrrtkaoqsfbwqnf-auth-token=${cookieValue}` },
    });
    const res = await middleware(req);
    assert.equal(res.status, 307);
    assert.ok(
      res.headers.get('location')?.endsWith('/dashboard'),
      `Expected safe fallback to /dashboard for malicious/loop url: ${url}`
    );
  }
});

test('Middleware: redirects admin to safe admin redirect destination', async () => {
  const adminJwt = createMockJwt(
    { alg: 'ES256', typ: 'JWT' },
    {
      sub: 'admin-redirect-param',
      exp: Math.floor(Date.now() / 1000) + 3600,
      app_metadata: { role: 'admin' },
    }
  );
  const cookieValue = encodeToSupabaseCookie({ access_token: adminJwt });

  const req = new NextRequest('http://localhost:3000/login?redirect=%2Fadmin%2Fpayments', {
    headers: { cookie: `sb-icgggnrrtkaoqsfbwqnf-auth-token=${cookieValue}` },
  });
  const res = await middleware(req);
  assert.equal(res.status, 307);
  assert.ok(res.headers.get('location')?.endsWith('/admin/payments'));
});


