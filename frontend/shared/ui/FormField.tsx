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
      <div className="form-field">
        <label htmlFor={id} className="form-field__label">
          {label}
          {inputProps.required && (
            <span className="form-field__required" aria-hidden="true">
              {' '}*
            </span>
          )}
        </label>

        <div className="form-field__wrapper">
          {rightIcon && (
            <span className="form-field__icon form-field__icon--right" aria-hidden="true">
              {rightIcon}
            </span>
          )}

          <input
            ref={ref}
            id={id}
            aria-describedby={hasError ? `${id}-error` : hint ? `${id}-hint` : undefined}
            aria-invalid={hasError}
            className={cn(
              'form-field__input',
              Boolean(rightIcon) && 'form-field__input--with-right-icon',
              Boolean(leftAction) && 'form-field__input--with-left-action',
              hasError && 'form-field__input--error',
              className,
            )}
            {...inputProps}
          />

          {leftAction && (
            <span className="form-field__action">{leftAction}</span>
          )}
        </div>

        {hasError && (
          <p id={`${id}-error`} className="form-field__error" role="alert">
            {error}
          </p>
        )}

        {!hasError && hint && (
          <p id={`${id}-hint`} className="form-field__hint">
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
