import { NextResponse, type NextRequest } from 'next/server';

// ============================================================
//  Next.js Middleware — Protected Routes & URL Token Reset Guards
// ============================================================

const PROTECTED_ROUTES = ['/dashboard', '/vehicles', '/settings', '/profile'];
const AUTH_ROUTES = ['/login', '/signup', '/forgot-password'];

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  const accessToken = request.cookies.get('token')?.value || request.cookies.get('access_token')?.value;
  const resetCookieToken = request.cookies.get('reset_token')?.value || request.cookies.get('reset_session')?.value;
  const urlToken = searchParams.get('token');

  const isAuthenticated = Boolean(accessToken);
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', encodeURIComponent(pathname));
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (pathname.startsWith('/verify-code')) {
    const hasEmailParam = Boolean(searchParams.get('email'));
    if (!hasEmailParam && !urlToken && !resetCookieToken) {
      return NextResponse.redirect(new URL('/forgot-password', request.url));
    }
  }

  if (pathname.startsWith('/reset-password')) {
    if (!urlToken && !resetCookieToken) {
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
