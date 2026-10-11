'use client';

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export interface ErrorAlertProps {
  title?: string;
  error?: Error | unknown;
  onRetry?: () => void;
  className?: string;
}

export function ErrorAlert({
  title = 'حدث خطأ أثناء تحميل البيانات',
  error,
  onRetry,
  className = '',
}: ErrorAlertProps) {
  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
      ? error
      : 'تعذر الاتصال بالخادم، يرجى المحاولة مرة أخرى لاحقاً';

  return (
    <div
      dir="rtl"
      className={`flex items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs text-rose-400 animate-in fade-in duration-150 ${className}`}
    >
      <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
      <div className="flex-1 min-w-0">
        <p className="font-bold text-rose-300">{title}</p>
        <p className="mt-0.5 opacity-80 truncate">{errorMessage}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="flex items-center gap-1.5 shrink-0 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 px-3 py-1.5 font-bold transition text-rose-300 cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>إعادة المحاولة</span>
        </button>
      )}
    </div>
  );
}
