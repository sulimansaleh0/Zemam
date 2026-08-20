'use client';

import { forwardRef, useEffect, useRef, type HTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

interface GoogleButtonProps extends HTMLAttributes<HTMLDivElement> {
  label?: string;
  fullWidth?: boolean;
  isLoading?: boolean;
  onSuccess?: (credential: string) => void;
  onError?: (error: any) => void;
}

declare global {
  interface Window {
    google: any;
  }
}

const GoogleButton = forwardRef<HTMLDivElement, GoogleButtonProps>(
  (
    {
      label = 'تسجيل الدخول بواسطة Google',
      fullWidth = true,
      isLoading = false,
      onSuccess,
      onError,
      className,
      ...divProps
    },
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      // Initialize Google Sign-In button
      if (window.google && containerRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            callback: (response: any) => {
              if (response.credential) {
                onSuccess?.(response.credential);
              }
            },
          });

          window.google.accounts.id.renderButton(containerRef.current, {
            type: 'standard',
            size: 'large',
            text: 'signin_with',
            logo_alignment: 'left',
            width: '100%',
          });
        } catch (error) {
          console.error('Google Sign-In initialization error:', error);
          onError?.(error);
        }
      }
    }, [onSuccess, onError]);

    return (
      <div
        ref={(node) => {
          containerRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        className={cn('google-button-container', fullWidth && 'w-full', className)}
        {...divProps}
      />
    );
  },
);

GoogleButton.displayName = 'GoogleButton';

export { GoogleButton };
export type { GoogleButtonProps };
