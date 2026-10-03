import React from "react";
import Image from "next/image";
import Link from "next/link";

interface ZimamLogoProps {
  className?: string;
  variant?: "dark" | "light";
  compact?: boolean;
}

export function ZimamLogo({
  className = "",
  variant = "dark",
  compact = false,
}: ZimamLogoProps) {
  const isLight = variant === "light";
  const logoSrc = isLight
    ? "/images/landing/zimam-logo-white-transparent.png"
    : "/images/landing/zimam-logo-transparent.png";

  return (
    <Link
      href="/"
      className={`inline-flex items-center no-underline select-none transition-opacity hover:opacity-90 ${className}`}
      aria-label="زمام - الصفحة الرئيسية"
    >
      <div className={`relative ${compact ? "w-[110px] h-[36px]" : "w-[136px] h-[46px]"}`}>
        <Image
          src={logoSrc}
          alt="شعار زمام ZIMAM"
          fill
          className="object-contain"
          priority
        />
      </div>
    </Link>
  );
}
