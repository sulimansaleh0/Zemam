'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
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
    ({ type, title, message, duration = 4000 }: Omit<ToastMessage, 'id'>) => {
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
      className="toast-container"
      aria-live="polite"
      aria-atomic="false"
      role="region"
      aria-label="التنبيهات الإشعارات"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => onRemove(toast.id)} />
      ))}
    </div>
  );
}

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

  return (
    <div
      className={cn('toast', `toast--${toast.type}`)}
      role="status"
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
    >
      <div className="toast__icon" aria-hidden="true">
        {toast.type === 'success' && '✓'}
        {toast.type === 'error' && '✕'}
        {toast.type === 'warning' && '⚠'}
        {toast.type === 'info' && 'ℹ'}
      </div>

      <div className="toast__content">
        {toast.title && <div className="toast__title">{toast.title}</div>}
        <div className="toast__message">{toast.message}</div>
      </div>

      <button
        type="button"
        className="toast__close"
        onClick={onRemove}
        aria-label="إغلاق التنبيه"
      >
        ✕
      </button>
    </div>
  );
}
