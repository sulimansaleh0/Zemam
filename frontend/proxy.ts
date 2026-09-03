import { NextResponse, type NextRequest } from 'next/server';

// ============================================================
//  Next.js Middleware — Protected Routes & URL Token Reset Guards
// ============================================================

const PROTECTED_ROUTES = ['/dashboard', '/vehicles', '/drivers', '/teams', '/managers', '/settings', '/profile'];
const AUTH_ROUTES = ['/login', '/signup', '/forgot-password'];

export function proxy(request: NextRequest) {
  try {
    const { pathname, searchParams } = request.nextUrl;

    const accessToken = request.cookies.get('token')?.value || request.cookies.get('access_token')?.value;
    const resetCookieToken =
      request.cookies.get('resetPasswordToken')?.value ||
      request.cookies.get('reset_token')?.value ||
      request.cookies.get('reset_session')?.value;

    const isAuthenticated = Boolean(accessToken);
    const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
    const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

    // إذا كان المسار محمياً أو onboarding والمستخدم غير مسجل -> يوجه للـ login
    if ((isProtectedRoute || pathname.startsWith('/onboarding')) && !isAuthenticated) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // إذا كان المستخدم مسجلاً وحاول فتح صفحات auth (login/signup)
    if (isAuthRoute && isAuthenticated) {
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = '/dashboard';
      dashboardUrl.search = '';
      return NextResponse.redirect(dashboardUrl);
    }

    if (pathname.startsWith('/verify-code')) {
      const hasEmailParam = Boolean(searchParams.get('email'));
      if (!hasEmailParam && !resetCookieToken) {
        const forgotUrl = request.nextUrl.clone();
        forgotUrl.pathname = '/forgot-password';
        return NextResponse.redirect(forgotUrl);
      }
    }

    if (pathname.startsWith('/reset-password')) {
      if (!resetCookieToken) {
        const forgotUrl = request.nextUrl.clone();
        forgotUrl.pathname = '/forgot-password';
        return NextResponse.redirect(forgotUrl);
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Proxy execution failed:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
