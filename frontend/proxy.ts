import { NextResponse, type NextRequest } from 'next/server';

// ============================================================
//  Next.js Middleware — Protected Routes & URL Token Reset Guards
// ============================================================

const PROTECTED_ROUTES = [
  '/dashboard',
  '/vehicles',
  '/drivers',
  '/teams',
  '/managers',
  '/tasks',
  '/fuel',
  '/maintenance',
  '/settings',
  '/profile',
];
const AUTH_ROUTES = ['/login', '/signup', '/forgot-password'];

export function proxy(request: NextRequest) {
  try {
    const { pathname, searchParams } = request.nextUrl;

    const accessToken = request.cookies.get('token')?.value || request.cookies.get('access_token')?.value;
    const refreshToken = request.cookies.get('refreshToken')?.value;
    const resetCookieToken =
      request.cookies.get('resetPasswordToken')?.value ||
      request.cookies.get('reset_token')?.value ||
      request.cookies.get('reset_session')?.value;

    const hasSession = Boolean(accessToken || refreshToken);
    const isSessionExpiredParam = searchParams.get('session') === 'expired';

    const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
    const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

    // إذا كان المسار محمياً أو onboarding والمستخدم لا يملك كوكيز جلسة -> يوجه لصفحة الدخول
    if ((isProtectedRoute || pathname.startsWith('/onboarding')) && !hasSession) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // إذا تم التوجيه لصفحة الدخول بسبب انتهاء الجلسة، نحذف الكوكيز ونسمح بعرض صفحة الدخول
    if (isAuthRoute && isSessionExpiredParam) {
      const response = NextResponse.next();
      response.cookies.delete('token');
      response.cookies.delete('access_token');
      response.cookies.delete('refreshToken');
      return response;
    }

    // إذا كان المستخدم لديه جلسة وحاول فتح صفحات auth (login/signup) بشكل طبيعي دون انتهاء الجلسة
    if (isAuthRoute && hasSession) {
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
