'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react';
import { cn } from '@/shared/lib/cn';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type, title, message, duration = 4500 }: Omit<ToastMessage, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, title, message, duration }]);
    },
    [],
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('[useToast] must be used inside <ToastProvider>');
  }
  return context;
}

function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}) {
  return (
    <div
      className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      aria-live="polite"
      aria-atomic="false"
      role="region"
      aria-label="التنبيهات والإشعارات"
      dir="rtl"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => onRemove(toast.id)} />
      ))}
    </div>
  );
}

const TOAST_CONFIG: Record<
  ToastType,
  {
    icon: React.ElementType;
    containerClass: string;
    iconClass: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    containerClass:
      'bg-emerald-950/95 border-emerald-500/30 text-emerald-50 shadow-emerald-950/50',
    iconClass: 'text-emerald-400 bg-emerald-500/15',
  },
  error: {
    icon: AlertCircle,
    containerClass:
      'bg-rose-950/95 border-rose-500/30 text-rose-50 shadow-rose-950/50',
    iconClass: 'text-rose-400 bg-rose-500/15',
  },
  warning: {
    icon: AlertTriangle,
    containerClass:
      'bg-amber-950/95 border-amber-500/30 text-amber-50 shadow-amber-950/50',
    iconClass: 'text-amber-400 bg-amber-500/15',
  },
  info: {
    icon: Info,
    containerClass:
      'bg-blue-950/95 border-blue-500/30 text-blue-50 shadow-blue-950/50',
    iconClass: 'text-blue-400 bg-blue-500/15',
  },
};

function ToastItem({
  toast,
  onRemove,
}: {
  toast: ToastMessage;
  onRemove: () => void;
}) {
  useEffect(() => {
    if (!toast.duration) return;
    const timer = setTimeout(onRemove, toast.duration);
    return () => clearTimeout(timer);
  }, [toast.duration, onRemove]);

  const config = TOAST_CONFIG[toast.type] || TOAST_CONFIG.info;
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'pointer-events-auto relative flex items-start gap-3 p-4 rounded-2xl border shadow-xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-3 duration-200 text-right',
        config.containerClass
      )}
      role="status"
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
    >
      <div className={cn('p-1.5 rounded-xl shrink-0 mt-0.5', config.iconClass)}>
        <Icon className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0 pr-1">
        {toast.title && (
          <h5 className="text-xs font-bold leading-tight mb-1 text-white">
            {toast.title}
          </h5>
        )}
        <p className="text-xs leading-relaxed text-zinc-200 break-words font-medium">
          {toast.message}
        </p>
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
        aria-label="إغلاق التنبيه"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
