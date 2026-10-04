'use client';

import { forwardRef, useEffect, useRef, useState, type HTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

interface GoogleCredentialResponse {
  credential?: string;
  select_by?: string;
}

interface GoogleButtonProps extends HTMLAttributes<HTMLDivElement> {
  label?: string;
  fullWidth?: boolean;
  isLoading?: boolean;
  onSuccess?: (credential: string) => void;
  onError?: (error: unknown) => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id?: string; callback: (response: GoogleCredentialResponse) => void }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export function GoogleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

const GoogleButton = forwardRef<HTMLDivElement, GoogleButtonProps>(
  (
    {
      label = "المتابعة باستخدام Google",
      fullWidth = true,
      isLoading = false,
      onSuccess,
      onError,
      className,
      ...divProps
    },
    ref,
  ) => {
    const buttonRef = useRef<HTMLDivElement | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const isRenderedRef = useRef(false);

    const onSuccessRef = useRef(onSuccess);
    const onErrorRef = useRef(onError);

    useEffect(() => {
      onSuccessRef.current = onSuccess;
      onErrorRef.current = onError;
    });

    useEffect(() => {
      if (isRenderedRef.current) return;

      function renderGoogleButton() {
        if (!buttonRef.current || isRenderedRef.current) return;
        if (!window.google?.accounts?.id) return;

        try {
          const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
          if (!clientId) {
            console.warn('[GoogleButton] NEXT_PUBLIC_GOOGLE_CLIENT_ID is missing');
            return;
          }

          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: (response: GoogleCredentialResponse) => {
              if (response.credential) {
                onSuccessRef.current?.(response.credential);
              }
            },
          });

          window.google.accounts.id.renderButton(buttonRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'left',
            width: 400,
            locale: 'ar',
          });

          isRenderedRef.current = true;
          setIsMounted(true);
        } catch (error) {
          console.error('Google Sign-In initialization error:', error);
          onErrorRef.current?.(error);
        }
      }

      if (window.google?.accounts?.id) {
        renderGoogleButton();
      } else {
        const intervalId = setInterval(() => {
          if (window.google?.accounts?.id) {
            clearInterval(intervalId);
            renderGoogleButton();
          }
        }, 50);

        const timeoutId = setTimeout(() => {
          clearInterval(intervalId);
        }, 4000);

        return () => {
          clearInterval(intervalId);
          clearTimeout(timeoutId);
        };
      }
    }, []);

    const handleContainerClick = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.prompt();
        } catch {
          // fallback
        }
      }
    };

    return (
      <div
        ref={(node) => {
          if (typeof ref === 'function') ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        onClick={handleContainerClick}
        className={cn(
          'group relative w-full h-[46px] flex items-center justify-center gap-3 px-4 rounded-xl border border-border bg-surface hover:bg-surface2 text-text font-bold text-sm shadow-xs hover:shadow transition-all duration-150 active:scale-[0.99] select-none cursor-pointer overflow-hidden',
          fullWidth && 'w-full',
          className,
        )}
        {...divProps}
      >
        {/* Visible Native Google Button Design */}
        <div className="flex items-center justify-center gap-3 w-full pointer-events-none">
          <GoogleIcon className="w-5 h-5 shrink-0" />
          <span className="text-text font-bold text-sm tracking-normal">
            {label}
          </span>
        </div>

        {/* Hidden Transparent Google Overlay that catches the click */}
        <div
          ref={buttonRef}
          aria-hidden="true"
          className="absolute inset-0 w-full h-full opacity-0 overflow-hidden cursor-pointer z-10 flex items-center justify-center scale-125"
        />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center gap-2.5 bg-surface/95 backdrop-blur-[2px] transition-all">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-xs font-bold text-text">جاري تسجيل الدخول عبر Google...</span>
          </div>
        )}
      </div>
    );
  },
);

GoogleButton.displayName = 'GoogleButton';

export { GoogleButton };
export type { GoogleButtonProps };
