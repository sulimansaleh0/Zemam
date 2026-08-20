import type { ServiceResult } from '../types/api.types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
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
}

/**
 * دالة مركزية لإرسال الطلبات للباك إند ومعالجة صيغة الرد الموحدة
 */
export async function sendRequest<T>(path: string, options: RequestOptions = {}): Promise<ServiceResult<T>> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, ...fetchOptions } = options;
  
  // AbortController for timeout if no custom signal is provided
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  const signal = fetchOptions.signal || controller.signal;

  try {
    const res = await fetch(`${BASE_URL}/${path}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      ...fetchOptions,
      signal,
    });

    clearTimeout(id);

    const text = await res.text();
    const body = text ? JSON.parse(text) : null;

    if (!res.ok) {
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
