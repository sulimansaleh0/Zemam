'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  icon?: ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      isLoading = false,
      icon,
      children,
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        aria-disabled={disabled || isLoading}
        className={cn(
          'btn',
          `btn--${variant}`,
          `btn--${size}`,
          fullWidth && 'btn--full-width',
          className,
        )}
        {...props}
      >
        {isLoading ? (
          <span className="btn__spinner" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
            </svg>
          </span>
        ) : icon ? (
          <span className="btn__icon">{icon}</span>
        ) : null}
        <span className={isLoading ? 'btn__label--loading' : ''}>{children}</span>
      </button>
    );
  },
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps };
