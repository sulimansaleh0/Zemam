'use client';

import { useMemo } from 'react';

interface PasswordStrengthProps {
  password?: string;
}

interface StrengthRule {
  id: string;
  label: string;
  test: (pw: string) => boolean;
}

const RULES: StrengthRule[] = [
  { id: 'min8', label: '8 أحرف على الأقل', test: (pw) => pw.length >= 8 },
  { id: 'uppercase', label: 'حرف كبير (A-Z)', test: (pw) => /[A-Z]/.test(pw) },
  { id: 'lowercase', label: 'حرف صغير (a-z)', test: (pw) => /[a-z]/.test(pw) },
  { id: 'number', label: 'رقم واحد (0-9)', test: (pw) => /[0-9]/.test(pw) },
];

export function PasswordStrength({ password = '' }: PasswordStrengthProps) {
  const { score, passedRules } = useMemo(() => {
    if (!password) return { score: 0, passedRules: new Set<string>() };
    const passed = new Set<string>();
    for (const rule of RULES) {
      if (rule.test(password)) passed.add(rule.id);
    }
    return { score: passed.size, passedRules: passed };
  }, [password]);

  if (!password) return null;

  const strengthClass =
    score === 0 ? 'empty' : score === 1 ? 'weak' : score === 2 ? 'fair' : score === 3 ? 'strong' : 'very-strong';

  const strengthText =
    score === 0 ? '' : score === 1 ? 'ضعيفة جداً' : score === 2 ? 'مقبولة' : score === 3 ? 'قوية' : 'ممتازة 🔒';

  return (
    <div className="password-strength" aria-live="polite">
      <div className="password-strength__bars">
        {[1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className={`password-strength__bar ${
              index <= score
                ? `password-strength__bar--${strengthClass}`
                : 'password-strength__bar--empty'
            }`}
          />
        ))}
      </div>

      <div className={`password-strength__label password-strength__label--${strengthClass}`}>
        {strengthText}
      </div>

      <ul className="password-strength__rules">
        {RULES.map((rule) => {
          const isPassed = passedRules.has(rule.id);
          return (
            <li
              key={rule.id}
              className={`password-strength__rule ${
                isPassed
                  ? 'password-strength__rule--passed'
                  : 'password-strength__rule--failed'
              }`}
            >
              <span>{isPassed ? '✓' : '○'}</span>
              <span>{rule.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
