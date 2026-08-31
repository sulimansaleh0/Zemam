'use client';

import { forwardRef, useEffect, useRef, type HTMLAttributes } from 'react';
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

    useEffect(() => {
      // Initialize Google Sign-In button
      if (window.google?.accounts?.id && buttonRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            callback: (response: GoogleCredentialResponse) => {
              if (response.credential) {
                onSuccess?.(response.credential);
              }
            },
          });

          window.google.accounts.id.renderButton(buttonRef.current, {
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
          buttonRef.current = node;
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
