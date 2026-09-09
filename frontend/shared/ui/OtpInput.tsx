'use client';

import {
  useRef,
  type ClipboardEvent,
  type KeyboardEvent,
  type ChangeEvent,
} from 'react';
import { cn } from '@/shared/lib/cn';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
}

export function OtpInput({
  length = 6,
  value = '',
  onChange,
  onComplete,
  disabled = false,
  error = false,
}: OtpInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const digits = Array.from({ length }, (_, i) => value[i] ?? '');

  const focusCell = (index: number) => {
    const target = inputsRef.current[index];
    if (target) {
      target.focus();
      target.select();
    }
  };

  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const digit = rawVal.replace(/\D/g, '').slice(-1);

    const nextDigits = [...digits];
    nextDigits[index] = digit;
    const nextValue = nextDigits.join('');

    onChange(nextValue);

    if (digit && index < length - 1) {
      focusCell(index + 1);
    }

    if (nextValue.length === length && onComplete) {
      onComplete(nextValue);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        focusCell(index - 1);
      }
    } else if (e.key === 'ArrowLeft') {
      if (index < length - 1) focusCell(index + 1);
    } else if (e.key === 'ArrowRight') {
      if (index > 0) focusCell(index - 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;

    onChange(pasted);
    const nextIndex = Math.min(pasted.length, length - 1);
    focusCell(nextIndex);

    if (pasted.length === length && onComplete) {
      onComplete(pasted);
    }
  };

  return (
    <div
      className="flex items-center justify-center gap-2 sm:gap-3 [direction:ltr] my-2"
      role="group"
      aria-label="رمز التحقق المكون من 6 أرقام"
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          disabled={disabled}
          aria-label={`الرقم ${index + 1}`}
          aria-invalid={error}
          className={cn(
            'w-11 h-13 sm:w-13 sm:h-14 text-center text-xl font-bold bg-surface border border-border text-text rounded-xl',
            'transition-all duration-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50',
            digit && 'border-primary/50 bg-surface2',
            error && 'border-danger text-danger focus:border-danger focus:ring-danger/20',
          )}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
        />
      ))}
    </div>
  );
}
