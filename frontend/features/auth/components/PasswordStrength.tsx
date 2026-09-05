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
  { id: 'symbol', label: 'رمز خاص (!@#$%^&*...)', test: (pw) => /[^A-Za-z0-9]/.test(pw) },
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

  const barColor =
    score <= 2
      ? 'bg-danger'
      : score === 3
      ? 'bg-warning'
      : score === 4
      ? 'bg-primary'
      : 'bg-success';

  const textColor =
    score <= 2
      ? 'text-danger'
      : score === 3
      ? 'text-warning'
      : score === 4
      ? 'text-primary'
      : 'text-success';

  const strengthText =
    score === 0
      ? ''
      : score <= 2
      ? 'ضعيفة'
      : score === 3
      ? 'مقبولة'
      : score === 4
      ? 'قوية'
      : 'ممتازة ✓';

  return (
    <div className="w-full mt-2" aria-live="polite">
      <div className="flex gap-1.5 my-2">
        {[1, 2, 3, 4, 5].map((index) => (
          <div
            key={index}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              index <= score ? barColor : 'bg-border'
            }`}
          />
        ))}
      </div>

      {strengthText && (
        <div className={`text-xs font-bold mb-2.5 ${textColor}`}>
          {strengthText}
        </div>
      )}

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 list-none p-0 m-0 text-xs">
        {RULES.map((rule) => {
          const isPassed = passedRules.has(rule.id);
          return (
            <li
              key={rule.id}
              className={`flex items-center gap-1.5 transition-colors ${
                isPassed ? 'text-success font-medium' : 'text-muted'
              }`}
            >
              <span className="shrink-0">{isPassed ? '✓' : '○'}</span>
              <span>{rule.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
