'use client';

import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
  rightIcon?: ReactNode;
  leftAction?: ReactNode;
  hint?: string;
}

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ id, label, error, rightIcon, leftAction, hint, className, ...inputProps }, ref) => {
    const hasError = Boolean(error);

    return (
      <div className="w-full flex flex-col">
        <label htmlFor={id} className="block text-xs font-semibold text-text mb-1.5">
          {label}
          {inputProps.required && (
            <span className="text-danger mr-0.5" aria-hidden="true">
              *
            </span>
          )}
        </label>

        <div className="relative flex items-center w-full">
          {rightIcon && (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none flex items-center justify-center" aria-hidden="true">
              {rightIcon}
            </span>
          )}

          <input
            ref={ref}
            id={id}
            aria-describedby={hasError ? `${id}-error` : hint ? `${id}-hint` : undefined}
            aria-invalid={hasError}
            className={cn(
              'w-full h-11 bg-surface border border-border rounded-xl text-sm text-text placeholder:text-muted/60',
              'transition-all duration-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
              'disabled:opacity-50 disabled:bg-surface2',
              Boolean(rightIcon) ? 'pr-10' : 'pr-3.5',
              Boolean(leftAction) ? 'pl-10' : 'pl-3.5',
              hasError && 'border-danger focus:border-danger focus:ring-danger/20',
              className,
            )}
            {...inputProps}
          />

          {leftAction && (
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-muted hover:text-text cursor-pointer">
              {leftAction}
            </span>
          )}
        </div>

        {hasError && (
          <p id={`${id}-error`} className="text-xs text-danger font-medium mt-1.5 flex items-center gap-1" role="alert">
            {error}
          </p>
        )}

        {!hasError && hint && (
          <p id={`${id}-hint`} className="text-xs text-muted mt-1.5">
            {hint}
          </p>
        )}
      </div>
    );
  },
);

FormField.displayName = 'FormField';

export { FormField };
export type { FormFieldProps };
