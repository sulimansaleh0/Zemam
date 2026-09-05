interface AuthHeaderProps {
  title: string;
  subtitle?: string;
}

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <div className="w-full text-right mb-6">
      <div className="inline-flex items-center gap-2.5 mb-3">
        <div className="w-9 h-9 rounded-[10px] bg-primary flex items-center justify-center shadow-md shadow-primary/20">
          <svg
            className="w-5 h-5"
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 18L16 24L26 12"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className="text-xl font-extrabold text-text leading-none">زمام</span>
      </div>

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
