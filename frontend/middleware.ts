import { NextResponse, type NextRequest } from 'next/server';

// ============================================================
//  Next.js Middleware — Protected Routes & URL Token Reset Guards
// ============================================================

const PROTECTED_ROUTES = ['/dashboard', '/vehicles', '/settings', '/profile'];
const AUTH_ROUTES = ['/login', '/signup', '/forgot-password'];

function getJwtCompanyId(token?: string): string | null {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload);
    return parsed.companyId || null;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  const accessToken = request.cookies.get('token')?.value || request.cookies.get('access_token')?.value;
  const resetCookieToken =
    request.cookies.get('resetPasswordToken')?.value ||
    request.cookies.get('reset_token')?.value ||
    request.cookies.get('reset_session')?.value;

  const isAuthenticated = Boolean(accessToken);
  const companyId = getJwtCompanyId(accessToken);
  const hasCompany = Boolean(companyId);

  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // 1. إذا كان المسار محمياً أو onboarding والمستخدم غير مسجل أصلاً -> يوجه للـ login
  if ((isProtectedRoute || pathname.startsWith('/onboarding')) && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', encodeURIComponent(pathname));
    return NextResponse.redirect(loginUrl);
  }

  // 2. إذا كان المستخدم مسجل ولكن بدون شركة (يحتاج Onboarding) وحاول فتح الـ dashboard أو غيرها -> يوجه لـ /onboarding
  if (isAuthenticated && !hasCompany) {
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }
  }

  // 3. إذا كان المستخدم مسجل ومعه شركة وحاول فتح صفحة /onboarding -> يوجه لـ /dashboard
  if (isAuthenticated && hasCompany) {
    if (pathname.startsWith('/onboarding')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // 4. إذا كان مسجلاً وحاول فتح صفحات auth عادية (login/signup)
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL(hasCompany ? '/dashboard' : '/onboarding', request.url));
  }

  if (pathname.startsWith('/verify-code')) {
    const hasEmailParam = Boolean(searchParams.get('email'));
    if (!hasEmailParam && !resetCookieToken) {
      return NextResponse.redirect(new URL('/forgot-password', request.url));
    }
  }

  if (pathname.startsWith('/reset-password')) {
    if (!resetCookieToken) {
      return NextResponse.redirect(new URL('/forgot-password', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
