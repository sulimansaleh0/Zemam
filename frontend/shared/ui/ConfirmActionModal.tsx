'use client';

import React, { ReactNode } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Modal } from './Modal';

export interface ConfirmActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary' | 'success';
  icon?: React.ComponentType<{ className?: string }>;
  isPending?: boolean;
  disabled?: boolean;
  children?: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

const variantStyles = {
  danger: {
    btn: 'bg-rose-600 hover:bg-rose-700 text-white',
    iconBg: 'bg-rose-500/10 text-rose-500',
  },
  warning: {
    btn: 'bg-amber-600 hover:bg-amber-700 text-white',
    iconBg: 'bg-amber-500/10 text-amber-500',
  },
  primary: {
    btn: 'bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white',
    iconBg: 'bg-[var(--primary)]/10 text-[var(--primary)]',
  },
  success: {
    btn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  },
};

export function ConfirmActionModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  variant = 'danger',
  icon: Icon = AlertCircle,
  isPending = false,
  disabled = false,
  children,
  maxWidth = 'md',
}: ConfirmActionModalProps) {
  const styles = variantStyles[variant];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      icon={Icon}
      iconClassName={styles.iconBg}
      maxWidth={maxWidth}
      preventClose={isPending}
    >
      <div className="p-6 space-y-4">
        {children}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending || disabled}
            className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer ${styles.btn}`}
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
