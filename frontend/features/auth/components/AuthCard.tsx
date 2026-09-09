import type { ReactNode } from 'react';

export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <div className="w-full rounded-2xl bg-surface border border-border p-6 sm:p-8 shadow-sm">
      {children}
    </div>
  );
}
