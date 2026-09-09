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
        };
      };
    };
  }
}

const GoogleButton = forwardRef<HTMLDivElement, GoogleButtonProps>(
  (
    {
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

    // الاحتفاظ بأحدث المراجع للدوال دون إعادة تشغيل الـ useEffect
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

          const isDark =
            typeof document !== 'undefined' &&
            document.documentElement.getAttribute('data-theme') !== 'light';

          window.google.accounts.id.renderButton(buttonRef.current, {
            type: 'standard',
            theme: isDark ? 'filled_black' : 'outline',
            size: 'large',
            text: 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'left',
            width: buttonRef.current.offsetWidth || 380,
            locale: 'ar',
          });

          isRenderedRef.current = true;
          setIsMounted(true);
        } catch (error) {
          console.error('Google Sign-In initialization error:', error);
          onErrorRef.current?.(error);
        }
      }

      // إذا كان السكريبت محملاً فوراً
      if (window.google?.accounts?.id) {
        renderGoogleButton();
      } else {
        // في حال تأخر تحميل السكريبت، نفحصه بفترة زمنية قصيرة دون التسبب بـ Layout Shift
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

    return (
      <div
        ref={(node) => {
          if (typeof ref === 'function') ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        className={cn(
          'relative w-full h-[44px] min-h-[44px] max-h-[44px] flex items-center justify-center overflow-hidden rounded-xl border border-border bg-surface select-none',
          fullWidth && 'w-full',
          className,
        )}
        {...divProps}
      >
        {/* Skeleton أثناء انتظار تهيئة زر جوجل */}
        {!isMounted && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 text-xs text-muted font-medium bg-surface">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span>جاري تهيئة Google...</span>
          </div>
        )}

        {/* الحاوية التي يقوم Google بحقن الـ iframe بداخلها */}
        <div
          ref={buttonRef}
          className={cn(
            'w-full flex justify-center items-center transition-opacity duration-200',
            !isMounted && 'opacity-0',
          )}
        />

        {/* شاشة التحميل فوق الزر عند إرسال الطلب لمنع النقر المتكرر والحركة */}
        {isLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center gap-2.5 bg-surface/90 backdrop-blur-[2px] transition-all">
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
