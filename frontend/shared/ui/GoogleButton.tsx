'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

interface GoogleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  fullWidth?: boolean;
  isLoading?: boolean;
}

function GoogleGIcon() {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
      />
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
      />
      <path
        fill="#FBBC05"
        d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.4 0 15.2s.7 5.5 1.9 7.9l3.7-2.9c-.2-.7-.4-1.5-.4-2.3z"
      />
      <path
        fill="#34A853"
        d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 22.3 12 23z"
      />
    </svg>
  );
}

const GoogleButton = forwardRef<HTMLButtonElement, GoogleButtonProps>(
  (
    {
      label = 'تسجيل الدخول بواسطة Google',
      fullWidth = true,
      isLoading = false,
      onClick,
      className,
      ...buttonProps
    },
    ref,
  ) => {
    const handleGoogleAuth = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (onClick) {
        onClick(e);
        return;
      }
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      window.location.href = `${baseUrl}/auth/google`;
    };

    return (
      <button
        ref={ref}
        type="button"
        disabled={isLoading}
        aria-disabled={isLoading}
        aria-label={label}
        onClick={handleGoogleAuth}
        className={cn('btn-google', fullWidth && 'btn-google--full-width', className)}
        {...buttonProps}
      >
        <span className="btn-google__icon">
          <GoogleGIcon />
        </span>
        <span className="btn-google__label">{label}</span>
      </button>
    );
  },
);

GoogleButton.displayName = 'GoogleButton';

export { GoogleButton };
export type { GoogleButtonProps };
