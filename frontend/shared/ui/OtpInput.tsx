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
      className="otp-input"
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
            'otp-input__cell',
            digit && 'otp-input__cell--filled',
            error && 'otp-input__cell--error',
          )}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
        />
      ))}
    </div>
  );
}
