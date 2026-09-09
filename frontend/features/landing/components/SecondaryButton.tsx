import React from "react";

interface SecondaryButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

export function SecondaryButton({
  href,
  children,
  className = "",
  onClick,
}: SecondaryButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center gap-2 min-h-[46px] max-[520px]:min-h-[44px] px-[22px] max-[520px]:px-[18px] text-[14px] font-bold leading-none whitespace-nowrap rounded-[10px] no-underline transition-all duration-180 ease-out active:translate-y-0 focus-visible:outline-2 focus-visible:outline-blue-600/90 focus-visible:outline-offset-[3px] motion-reduce:transition-none bg-white/60 border border-[#10202F]/15 text-[#10202F] hover:bg-white hover:border-primary/35 hover:text-primary hover:shadow-[0_8px_18px_rgba(16,32,47,0.06)] hover:-translate-y-px cursor-pointer";

  const classes = [baseClasses, className].filter(Boolean).join(" ");

  return (
    <a href={href} className={classes} onClick={onClick}>
      <span>{children}</span>
    </a>
  );
}
