'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ElementType;
  iconClassName?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | string;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  preventClose?: boolean;
  className?: string;
  dialogClassName?: string;
  headerClassName?: string;
  customHeader?: React.ReactNode;
  'aria-labelledby'?: string;
}

const MAX_WIDTH_MAP: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  icon: Icon,
  iconClassName = 'bg-[var(--zd-blue)]/10 text-[var(--zd-blue)]',
  children,
  maxWidth = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  preventClose = false,
  className,
  dialogClassName,
  headerClassName,
  customHeader,
  'aria-labelledby': ariaLabelledBy,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !preventClose) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEscape, preventClose, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && closeOnOverlayClick && !preventClose) {
      onClose();
    }
  };

  const maxWidthClass = MAX_WIDTH_MAP[maxWidth] || maxWidth;

  return (
    <div
      onClick={handleOverlayClick}
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200',
        className
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby={ariaLabelledBy}
    >
      <div
        className={cn(
          'relative w-full overflow-hidden rounded-2xl border border-[var(--zd-line)] bg-[var(--zd-surface)] shadow-2xl animate-in zoom-in-95 duration-200 text-[var(--zd-text)]',
          maxWidthClass,
          dialogClassName
        )}
      >
        {customHeader ? (
          customHeader
        ) : title ? (
          <div
            className={cn(
              'flex items-center justify-between border-b border-[var(--zd-line)] px-6 py-4 bg-[var(--zd-surface-2)]/30',
              headerClassName
            )}
          >
            <div className="flex items-center gap-3">
              {Icon && (
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-xl',
                    iconClassName
                  )}
                >
                  <Icon className="h-4.5 w-4.5" />
                </div>
              )}
              <div>
                <h2 className="text-[15px] font-bold text-[var(--zd-text)]">
                  {title}
                </h2>
                {description && (
                  <p className="mt-0.5 text-[10px] text-[var(--zd-muted)]">
                    {description}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={preventClose}
              aria-label="إغلاق النافذة"
              className="zd-focus rounded-lg p-1.5 text-[var(--zd-muted)] transition-colors hover:bg-[var(--zd-surface-2)] hover:text-[var(--zd-text)] disabled:opacity-50 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : null}

        {children}
      </div>
    </div>
  );
}
