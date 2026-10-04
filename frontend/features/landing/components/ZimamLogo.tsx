import React from "react";
import Image from "next/image";
import Link from "next/link";

export interface ZimamLogoProps {
  className?: string;
  variant?: "dark" | "light" | "auto";
  compact?: boolean;
  iconOnly?: boolean;
  withTagline?: boolean;
  href?: string;
}

export function ZimamLogo({
  className = "",
  variant = "auto",
  compact = false,
  iconOnly = false,
  withTagline = false,
  href = "/",
}: ZimamLogoProps) {
  // If icon-only is requested (for mobile nav, compact headers, or emblem avatars)
  if (iconOnly) {
    const iconSize = compact ? "w-[30px] h-[30px]" : "w-[36px] h-[36px]";
    const content = (
      <div className={`relative ${iconSize} shrink-0`}>
        <Image
          src="/images/landing/zimam-official-emblem.png?v=3"
          alt="زمام"
          fill
          className="object-contain"
          priority
          unoptimized
        />
      </div>
    );

    if (!href) {
      return <div className={`inline-flex items-center select-none ${className}`}>{content}</div>;
    }

    return (
      <Link
        href={href}
        className={`inline-flex items-center no-underline select-none transition-transform hover:scale-105 ${className}`}
        aria-label="زمام"
      >
        {content}
      </Link>
    );
  }

  // Choose asset files based on tagline flag
  const darkSrc = withTagline
    ? "/images/landing/zimam-official-dark.png?v=3"
    : "/images/landing/zimam-official-dark-compact.png?v=3";

  const lightSrc = withTagline
    ? "/images/landing/zimam-official-light.png?v=3"
    : "/images/landing/zimam-official-light-compact.png?v=3";

  // Dimensions
  const sizeClasses = withTagline
    ? compact
      ? "w-[145px] h-[38px]"
      : "w-[170px] h-[44px]"
    : compact
    ? "w-[125px] h-[28px]"
    : "w-[155px] h-[35px]";

  const renderImages = () => {
    if (variant === "light") {
      return (
        <Image
          src={lightSrc}
          alt="شعار زمام ZIMAM"
          fill
          className="object-contain"
          priority
          unoptimized
        />
      );
    }

    if (variant === "dark") {
      return (
        <Image
          src={darkSrc}
          alt="شعار زمام ZIMAM"
          fill
          className="object-contain"
          priority
          unoptimized
        />
      );
    }

    // Adaptive mode: Dark text on light background, White text on dark background
    return (
      <>
        <Image
          src={darkSrc}
          alt="شعار زمام ZIMAM"
          fill
          className="object-contain dark:hidden [data-theme=dark]_&:hidden"
          priority
          unoptimized
        />
        <Image
          src={lightSrc}
          alt="شعار زمام ZIMAM"
          fill
          className="object-contain hidden dark:block [data-theme=dark]_&:block"
          priority
          unoptimized
        />
      </>
    );
  };

  const content = (
    <div className={`relative ${sizeClasses} shrink-0`}>
      {renderImages()}
    </div>
  );

  if (!href) {
    return <div className={`inline-flex items-center select-none ${className}`}>{content}</div>;
  }

  return (
    <Link
      href={href}
      className={`inline-flex items-center no-underline select-none transition-opacity hover:opacity-90 ${className}`}
      aria-label="زمام"
    >
      {content}
    </Link>
  );
}
