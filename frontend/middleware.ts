import { NextResponse, type NextRequest } from 'next/server';

// ============================================================
//  Next.js Middleware — Protected Routes, Role Guards & Sessions
// ============================================================

const ADMIN_PROTECTED_ROUTES = [
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
  '/gps',
];

const AUTH_ROUTES = ['/login', '/signup', '/forgot-password'];

function decodeJwtPayload(token: string): { role?: string; companyId?: string; _id?: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
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

    const tokenPayload = accessToken ? decodeJwtPayload(accessToken) : null;
    const userRole = tokenPayload?.role?.toLowerCase();
    const isDriver = userRole === 'driver';

    const isAdminRoute = ADMIN_PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
    const isDriverRoute = pathname.startsWith('/driver') && !pathname.startsWith('/driver/login');
    const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

    // 1. إذا كان المسار محمياً (إداري أو سائق أو onboarding) والمستخدم لا يملك جلسة -> يوجه لصفحة الدخول
    if ((isAdminRoute || isDriverRoute || pathname.startsWith('/onboarding')) && !hasSession) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // 2. إذا تم التوجيه لصفحة الدخول بسبب انتهاء الجلسة، نحذف الكوكيز ونسمح بعرض صفحة الدخول
    if (isAuthRoute && isSessionExpiredParam) {
      const response = NextResponse.next();
      response.cookies.delete('token');
      response.cookies.delete('access_token');
      response.cookies.delete('refreshToken');
      return response;
    }

    // 3. منع السائق من دخول صفحات لوحة تحكم الإدارة وتوجيهه لبوابته
    if (isAdminRoute && hasSession && isDriver) {
      const driverUrl = request.nextUrl.clone();
      driverUrl.pathname = '/driver';
      driverUrl.search = '';
      return NextResponse.redirect(driverUrl);
    }

    // 4. إذا كان المستخدم لديه جلسة وحاول فتح صفحات auth (login/signup) بشكل طبيعي دون انتهاء الجلسة
    if (isAuthRoute && hasSession) {
      const targetUrl = request.nextUrl.clone();
      targetUrl.pathname = isDriver ? '/driver' : '/dashboard';
      targetUrl.search = '';
      return NextResponse.redirect(targetUrl);
    }

    // 5. حماية صفحات استعادة كلمة المرور
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
    console.error('Middleware execution failed:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|icons/.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?)$).*)',
  ],
};
