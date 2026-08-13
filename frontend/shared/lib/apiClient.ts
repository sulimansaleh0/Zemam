// ============================================================
//  API Client — Centralized API Errors, 401/403 Handling, Timeout & Abort Controls
// ============================================================

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const DEFAULT_TIMEOUT_MS = 15_000;

if (!BASE_URL) {
  throw new Error('[apiClient] NEXT_PUBLIC_API_URL غير معرّف في .env.local');
}

export class ApiError extends Error {
  readonly status: number;
  readonly errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    if (response.status === 204) return undefined as T;
    return response.json() as Promise<T>;
  }

  const status = response.status;
  const body = (await response.json().catch(() => ({}))) as {
    message?: string;
    errors?: Record<string, string[]>;
  };

  if (status === 401) {
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      window.location.href = '/login?session=expired';
    }
    throw new ApiError(body.message ?? 'انتهت الجلسة، يرجى إعادة تسجيل الدخول', 401);
  }

  if (status === 403) {
    throw new ApiError(body.message ?? 'ليس لديك الصلاحية الكافية لإتمام هذه العملية', 403);
  }

  if (status === 404) {
    throw new ApiError(body.message ?? 'المورد المطلوب غير موجود في الخادم', 404);
  }

  if (status >= 500) {
    throw new ApiError('حدث خطأ داخل الخادم، يرجى المحاولة لاحقاً', status);
  }

  throw new ApiError(
    body.message ?? 'حدث خطأ غير متوقع في الطلب',
    status,
    body.errors,
  );
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort('timeout'), DEFAULT_TIMEOUT_MS);

  let signal = timeoutController.signal;

  if (options.signal) {
    if (typeof anySignal === 'function') {
      signal = anySignal([options.signal, timeoutController.signal]);
    } else {
      options.signal.addEventListener('abort', () => timeoutController.abort(options.signal?.reason));
    }
  }

  try {
    const response = await fetch(`${BASE_URL}/${endpoint}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options.headers,
      },
      ...options,
      signal,
    });

    return await handleResponse<T>(response);
  } catch (error: unknown) {
    if (error instanceof ApiError) throw error;

    if (error instanceof DOMException && error.name === 'AbortError') {
      if (timeoutController.signal.aborted && timeoutController.signal.reason === 'timeout') {
        throw new ApiError('انتهت مدة انتظار الخادم، يرجى إعادة المحاولة', 408);
      }
      throw new ApiError('تم إلغاء الطلب أثناء التنقل', 499);
    }

    throw new ApiError('تعذر الاتصال بالخادم، تحقق من اتصال شبكتك', 503);
  } finally {
    clearTimeout(timeoutId);
  }
}

function anySignal(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();
  for (const sig of signals) {
    if (sig.aborted) {
      controller.abort(sig.reason);
      break;
    }
    sig.addEventListener('abort', () => controller.abort(sig.reason), { once: true });
  }
  return controller.signal;
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { method: 'GET', ...options }),

  post: <T>(endpoint: string, body: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      ...options,
    }),

  patch: <T>(endpoint: string, body: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
      ...options,
    }),

  delete: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { method: 'DELETE', ...options }),
} as const;
