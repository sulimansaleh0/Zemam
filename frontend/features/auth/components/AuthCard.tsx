import type { ReactNode } from 'react';

export function AuthCard({ children }: { children: ReactNode }) {
  return <div className="auth-card">{children}</div>;
}
