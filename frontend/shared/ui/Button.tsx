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

const variantClasses = {
  primary: 'bg-primary hover:bg-primary-hover text-white shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/25 border border-primary',
  ghost:   'bg-transparent hover:bg-surface2 text-muted hover:text-text border border-transparent',
  danger:  'bg-danger/10 hover:bg-danger/20 text-danger border border-danger/20',
};

const sizeClasses = {
  sm: 'h-9 px-3 text-xs gap-1.5',
  md: 'h-11 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2.5',
};

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
          'inline-flex items-center justify-center font-bold transition-all duration-200 rounded-xl cursor-pointer select-none',
          'focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2',
          'disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      >
        {isLoading ? (
          <span className="animate-spin h-4 w-4 shrink-0 inline-flex items-center justify-center" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4">
              <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
            </svg>
          </span>
        ) : icon ? (
          <span className="shrink-0 inline-flex items-center">{icon}</span>
        ) : null}
        <span className={isLoading ? 'opacity-70' : ''}>{children}</span>
      </button>
    );
  },
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps };
