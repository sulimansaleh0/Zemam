interface AuthHeaderProps {
  title: string;
  subtitle?: string;
}

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <div className="auth-header">
      <div className="auth-header__brand">
        <svg
          className="auth-header__logo"
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="36" height="36" rx="10" fill="var(--primary)" />
          <path
            d="M10 18L16 24L26 12"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="auth-header__brand-name">زمام</span>
      </div>

      <h1 className="auth-header__title">{title}</h1>
      {subtitle && <p className="auth-header__subtitle">{subtitle}</p>}
    </div>
  );
}
