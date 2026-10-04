interface AuthHeaderProps {
  title: string;
  subtitle?: string;
}

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <div className="w-full text-right mb-6">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight m-0 mb-2">
        {title}
      </h1>
      {subtitle && (
        <p className="text-sm text-muted leading-relaxed m-0">
          {subtitle}
        </p>
      )}
    </div>
  );
}
