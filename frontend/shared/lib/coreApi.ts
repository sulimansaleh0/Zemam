import type { ServiceResult } from '../types/api.types';
import { API_PATHS } from '../constants/apiPaths';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
const DEFAULT_TIMEOUT_MS = 10000; // 10 seconds

function fallbackMessage(status: number): string {
  if (status === 400) return 'البيانات المُرسلة غير صحيحة';
  if (status === 401) return 'بيانات الدخول غير صحيحة';
  if (status === 403) return 'ليس لديك صلاحية لإتمام هذه العملية';
  if (status === 404) return 'المسار المطلوب غير موجود';
  if (status === 408) return 'انتهت مدة الانتظار، حاول مرة أخرى';
  if (status === 409) return 'هذا البريد الإلكتروني مسجل بالفعل';
  if (status === 422) return 'البيانات المُرسلة لا تطابق الصيغة المطلوبة';
  if (status === 429) return 'طلبات كثيرة جداً، حاول مرة أخرى لاحقاً';
  if (status >= 500) return 'حدث خطأ داخل الخادم، يرجى المحاولة لاحقاً';
  return 'حدث خطأ غير متوقع';
}

export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  _retry?: boolean;
}

let refreshPromise: Promise<boolean> | null = null;

async function executeRefreshToken(): Promise<boolean> {
  try {
    const url = BASE_URL ? `${BASE_URL}/${API_PATHS.AUTH.REFRESH_TOKEN}` : `/${API_PATHS.AUTH.REFRESH_TOKEN}`;
    const res = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function handleSilentRefresh(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = executeRefreshToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

/**
 * دالة مركزية لإرسال الطلبات للباك إند ومعالجة صيغة الرد الموحدة
 */
export async function sendRequest<T>(path: string, options: RequestOptions = {}): Promise<ServiceResult<T>> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, _retry = false, ...fetchOptions } = options;

  // AbortController for timeout if no custom signal is provided
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  const signal = fetchOptions.signal || controller.signal;

  try {
    const url = BASE_URL ? `${BASE_URL}/${path}` : `/${path}`;
    const res = await fetch(url, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      ...fetchOptions,
      signal,
    });

    clearTimeout(id);

    const text = await res.text();
    const body = text ? JSON.parse(text) : null;

    if (!res.ok) {
      const isAuthEndpoint =
        path.includes('auth/login') ||
        path.includes('auth/signup') ||
        path.includes('auth/logout') ||
        path.includes('auth/google') ||
        path.includes('auth/verify-email') ||
        path.includes('auth/verify-otp') ||
        path.includes('auth/reset-password') ||
        path.includes('auth/refresh-token');

      // اعتراض رد 401 وتجديد التوكن تلقائياً ثم إعادة تنفيذ الطلب
      if (res.status === 401 && !_retry && !isAuthEndpoint) {
        const refreshed = await handleSilentRefresh();
        if (refreshed) {
          return sendRequest<T>(path, { ...options, _retry: true });
        }
      }

      const msg = body?.msg ?? fallbackMessage(res.status);
      return { 
        success: false, 
        status: res.status, 
        message: msg,
        code: body?.code,
        fieldErrors: body?.errors,
      };
    }

    return {
      success: true,
      data: body as T,
      message: body?.msg ?? 'تمت العملية بنجاح',
    };
  } catch (error: unknown) {
    clearTimeout(id);
    
    // Check if the error is due to abort/timeout
    if (error instanceof Error && error.name === 'AbortError') {
      return { success: false, status: 408, message: 'انتهت مدة الانتظار، تأكد من سرعة اتصالك بالإنترنت' };
    }
    
    return { success: false, status: 0, message: 'تعذّر الاتصال بالخادم، تحقق من شبكتك' };
  }
}

/**
 * دالة مساعدة لطلبات POST
 */
export function postRequest<T>(path: string, body: unknown, options?: RequestOptions): Promise<ServiceResult<T>> {
  return sendRequest<T>(path, { method: 'POST', body: JSON.stringify(body), ...options });
}

/**
 * دالة مساعدة لطلبات PATCH
 */
export function patchRequest<T>(path: string, body: unknown, options?: RequestOptions): Promise<ServiceResult<T>> {
  return sendRequest<T>(path, { method: 'PATCH', body: JSON.stringify(body), ...options });
}

/**
 * دالة مساعدة لطلبات DELETE
 */
export function deleteRequest<T>(path: string, options?: RequestOptions): Promise<ServiceResult<T>> {
  return sendRequest<T>(path, { method: 'DELETE', ...options });
}

