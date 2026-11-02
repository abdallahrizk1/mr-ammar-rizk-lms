import { NextResponse, type NextRequest } from 'next/server';

const ADMIN_ROUTE_PERMISSIONS: Record<string, string> = {
  '/admin/payments': 'manage_payments',
  '/admin/exams': 'manage_exams',
  '/admin/courses': 'manage_courses',
  '/admin/students': 'manage_students',
  '/admin/forum': 'manage_forum',
  '/admin/settings': 'manage_settings',
};

const AUTH_REDIRECT_PATHS = new Set(['/', '/login', '/register']);

function cleanRawString(input: string): string {
  let str = input.trim();
  let changed = true;
  while (changed) {
    changed = false;
    if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
      str = str.slice(1, -1).trim();
      changed = true;
    }
    try {
      const decoded = decodeURIComponent(str);
      if (decoded !== str) {
        str = decoded.trim();
        changed = true;
      }
    } catch {}
  }
  return str;
}

function b64UrlToBytes(b64Url: string): Uint8Array {
  let cleaned = cleanRawString(b64Url);
  if (cleaned.startsWith('base64-')) cleaned = cleanRawString(cleaned.slice(7));
  const base64 = cleaned.replace(/-/g, '+').replace(/_/g, '/');
  const pad = (4 - (base64.length % 4)) % 4;
  const raw = atob(base64 + '='.repeat(pad));
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

function parseTokenFromRaw(combined: string): string | null {
  if (!combined) return null;
  const str = cleanRawString(combined);

  if (str.startsWith('base64-')) {
    try {
      const decoded = new TextDecoder().decode(b64UrlToBytes(str));
      const parsed = JSON.parse(decoded);
      if (parsed.access_token) return String(parsed.access_token).trim();
      if (parsed.session?.access_token) return String(parsed.session.access_token).trim();
      if (Array.isArray(parsed) && typeof parsed[0] === 'string') return parsed[0].trim();
    } catch {}
  }

  try {
    const parsed = JSON.parse(str);
    if (parsed.access_token) return String(parsed.access_token).trim();
    if (parsed.session?.access_token) return String(parsed.session.access_token).trim();
    if (Array.isArray(parsed) && typeof parsed[0] === 'string') return parsed[0].trim();
  } catch {}

  return str.split('.').length === 3 ? str : null;
}

function extractSupabaseTokens(request: NextRequest): string[] {
  const tokens: string[] = [];
  const addToken = (t: string | null) => {
    if (t && !tokens.includes(t)) tokens.push(t);
  };

  const allCookies = request.cookies.getAll();
  const baseNames: string[] = ['sb-icgggnrrtkaoqsfbwqnf-auth-token'];

  for (const cookie of allCookies) {
    if (cookie.name.includes('-auth-token')) {
      const dotIdx = cookie.name.lastIndexOf('.');
      const base = dotIdx > 0 && /^\d+$/.test(cookie.name.slice(dotIdx + 1)) ? cookie.name.slice(0, dotIdx) : cookie.name;
      if (!baseNames.includes(base)) baseNames.push(base);
    }
  }

  for (const baseName of baseNames) {
    const chunks: string[] = [];
    for (let i = 0; ; i++) {
      const chunk = request.cookies.get(`${baseName}.${i}`)?.value;
      if (!chunk) break;
      chunks.push(chunk);
    }
    if (chunks.length > 0) addToken(parseTokenFromRaw(chunks.join('')));
    const single = request.cookies.get(baseName)?.value;
    if (single && single.trim() !== '' && single !== '""') addToken(parseTokenFromRaw(single));
  }

  const directToken = request.cookies.get('sb-access-token')?.value;
  if (directToken) addToken(parseTokenFromRaw(directToken));
  return tokens;
}

async function verifyJwtOnEdge(token: string, secret?: string): Promise<Record<string, any> | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, signatureB64] = parts;
    const header = JSON.parse(new TextDecoder().decode(b64UrlToBytes(headerB64)));

    if (secret && header.alg === 'HS256') {
      const enc = new TextEncoder();
      const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
      const isValid = await crypto.subtle.verify('HMAC', key, b64UrlToBytes(signatureB64) as unknown as BufferSource, enc.encode(`${headerB64}.${payloadB64}`));
      if (!isValid) return null;
    }

    const payload = JSON.parse(new TextDecoder().decode(b64UrlToBytes(payloadB64)));
    if (payload.exp && payload.exp * 1000 <= Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

function getSafeStudentRedirect(param: string | null): string {
  if (!param || !param.startsWith('/') || param.startsWith('//') || param.startsWith('/\\')) {
    return '/dashboard';
  }
  const destPath = param.split(/[?#]/)[0].replace(/\/+$/, '') || '/';
  return AUTH_REDIRECT_PATHS.has(destPath) ? '/dashboard' : param;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cleanPath = pathname.replace(/\/+$/, '') || '/';

  // 1. Intercept marketing/auth landing routes: redirect authenticated users away from marketing
  if (AUTH_REDIRECT_PATHS.has(cleanPath)) {
    const tokens = extractSupabaseTokens(request);
    if (tokens.length > 0) {
      const secret = process.env.SUPABASE_JWT_SECRET;
      let hasStaff = false;
      let hasStudent = false;

      for (const token of tokens) {
        const payload = await verifyJwtOnEdge(token, secret);
        if (!payload) continue;
        const role = payload.app_metadata?.role || payload.user_metadata?.role;
        if (role === 'super_admin' || role === 'admin' || role === 'assistant') {
          hasStaff = true;
          break;
        }
        hasStudent = true;
      }

      const redirectParam = request.nextUrl.searchParams.get('redirect');
      if (hasStaff) {
        const dest = (redirectParam && redirectParam.startsWith('/admin') && !redirectParam.startsWith('/admin/login'))
          ? redirectParam
          : '/admin';
        return NextResponse.redirect(new URL(dest, request.url));
      }
      if (hasStudent) {
        return NextResponse.redirect(new URL(getSafeStudentRedirect(redirectParam), request.url));
      }
    }
    return NextResponse.next();
  }

  // 2. Allow admin login page to be accessed publicly without token
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // 3. Only guard /admin routes
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const tokens = extractSupabaseTokens(request);
  const secret = process.env.SUPABASE_JWT_SECRET;

  if (tokens.length === 0) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  let assistantUnauthorized: NextResponse | null = null;

  for (const token of tokens) {
    const payload = await verifyJwtOnEdge(token, secret);
    if (!payload) continue;

    const role = payload.app_metadata?.role || payload.user_metadata?.role;
    const permissions = payload.app_metadata?.permissions || {};

    if (role === 'super_admin' || role === 'admin') {
      return NextResponse.next();
    }

    if (role === 'assistant') {
      let authorized = true;
      for (const [prefix, permKey] of Object.entries(ADMIN_ROUTE_PERMISSIONS)) {
        if (pathname.startsWith(prefix) && permissions[permKey] !== true) {
          authorized = false;
          break;
        }
      }
      if (authorized) {
        return NextResponse.next();
      } else {
        assistantUnauthorized = NextResponse.redirect(new URL('/admin/unauthorized', request.url));
      }
    }
  }

  if (assistantUnauthorized) {
    return assistantUnauthorized;
  }

  const adminLoginUrl = new URL('/admin/login', request.url);
  adminLoginUrl.searchParams.set('redirect', pathname);
  return NextResponse.redirect(adminLoginUrl);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|mp3|mp4|m3u8|ts)$).*)',
  ],
};
