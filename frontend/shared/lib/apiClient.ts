// ============================================================
//  API Client — Universal Backend Error Parser (Supports NestJS, Express, Laravel, FastAPI, Django, Spring)
// ============================================================

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const DEFAULT_TIMEOUT_MS = 15_000;

if (!BASE_URL) {
  throw new Error('[apiClient] NEXT_PUBLIC_API_URL غير معرّف في .env.local');
}

export class ApiError extends Error {
  readonly status: number;
  readonly errors?: Record<string, string[] | string>;

  constructor(message: string, status: number, errors?: Record<string, string[] | string>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

// دالة عالمية لاستخراج نص الرسالة من أي هيكلية أخطاء خادم (NestJS, Express, Django, Laravel, Spring)
function parseErrorMessage(body: unknown): string | undefined {
  if (!body || typeof body !== 'object') return undefined;

  const data = body as Record<string, unknown>;

  // 1. message كـ string أو Array (مثل NestJS ValidationPipe)
  if (typeof data.message === 'string') return data.message;
  if (Array.isArray(data.message)) {
    return data.message.map((m) => (typeof m === 'string' ? m : JSON.stringify(m))).join(' - ');
  }

  // 2. error كـ string أو Object
  if (typeof data.error === 'string') return data.error;
  if (data.error && typeof data.error === 'object') {
    const errObj = data.error as Record<string, unknown>;
    if (typeof errObj.message === 'string') return errObj.message;
  }

  // 3. detail كـ string أو Array (مثل FastAPI / Django)
  if (typeof data.detail === 'string') return data.detail;
  if (Array.isArray(data.detail)) {
    return data.detail
      .map((d) => (typeof d === 'object' && d !== null ? (d as Record<string, unknown>).msg || (d as Record<string, unknown>).message || JSON.stringify(d) : String(d)))
      .join(' - ');
  }

  return undefined;
}

// استخراج أخطاء الحقول المحددة (Field-level errors)
function parseFieldErrors(body: unknown): Record<string, string[] | string> | undefined {
  if (!body || typeof body !== 'object') return undefined;
  const data = body as Record<string, unknown>;

  if (data.errors && typeof data.errors === 'object') {
    return data.errors as Record<string, string[] | string>;
  }
  return undefined;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    if (response.status === 204) return undefined as T;
    return response.json() as Promise<T>;
  }

  const status = response.status;
  const body = await response.json().catch(() => ({}));

  const backendMessage = parseErrorMessage(body);
  const fieldErrors = parseFieldErrors(body);

  if (status === 401) {
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      window.location.href = '/login?session=expired';
    }
    throw new ApiError(backendMessage ?? 'انتهت الجلسة، يرجى إعادة تسجيل الدخول', 401, fieldErrors);
  }

  if (status === 403) {
    throw new ApiError(backendMessage ?? 'ليس لديك الصلاحية الكافية لإتمام هذه العملية', 403, fieldErrors);
  }

  if (status === 404) {
    throw new ApiError(backendMessage ?? 'المورد المطلوب غير موجود في الخادم', 404, fieldErrors);
  }

  if (status >= 500) {
    throw new ApiError(backendMessage ?? 'حدث خطأ داخل الخادم، يرجى المحاولة لاحقاً', status, fieldErrors);
  }

  throw new ApiError(
    backendMessage ?? 'حدث خطأ في طلب البيانات من الخادم',
    status,
    fieldErrors,
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
        throw new ApiError('انتهت مدة انتظار الخادم (Timeout)، يرجى إعادة المحاولة', 408);
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
