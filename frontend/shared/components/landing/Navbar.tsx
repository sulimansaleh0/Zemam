"use client";

import Image from "next/image";
import React, { useState } from "react";
import Link from "next/link";
import { PrimaryButton } from "./PrimaryButton";
import { landingNavLinks } from "./landing-config";

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      className="flex items-center gap-3 col-start-3 max-[920px]:col-start-2 justify-self-end text-white no-underline"
      aria-label="زمام"
    >
      <span
        className={`inline-flex items-center justify-center bg-primary ${
          compact ? "w-6 h-6 rounded-[6px]" : "w-9 h-9 rounded-[9px]"
        }`}
      >
        <Image
          src="/figma/landing/shield-check.svg"
          alt=""
          width={compact ? 14 : 20}
          height={compact ? 14 : 20}
          className={compact ? "w-3.5 h-3.5" : "w-5 h-5"}
        />
      </span>
      <span
        className={`text-ink font-extrabold leading-none ${
          compact ? "text-[20px]" : "text-[24px]"
        }`}
      >
        زمام
      </span>
    </Link>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-[14px] border-b border-[#10202F]/10">
      <nav
        className="grid grid-cols-[1fr_auto_1fr] max-[920px]:grid-cols-[auto_1fr] items-center w-full max-w-[1360px] h-[76px] mx-auto px-[72px] max-[1180px]:px-10 max-[700px]:px-6 max-[430px]:px-[18px] [direction:ltr]"
        aria-label="القائمة الرئيسية"
      >
        <div className="flex items-center gap-6 col-start-1 justify-self-start max-[920px]:hidden [direction:ltr]">
          <PrimaryButton href="/login" showArrow>
            ابدأ الآن
          </PrimaryButton>
          <Link
            href="/login"
            className="text-muted hover:text-primary whitespace-nowrap text-[14px] font-medium transition-colors duration-180 focus-visible:outline-2 focus-visible:outline-blue-300 focus-visible:outline-offset-4 focus-visible:rounded"
          >
            تسجيل الدخول
          </Link>
        </div>

        <div
          className="flex items-center gap-7 col-start-2 justify-self-center max-[920px]:hidden [direction:rtl]"
          aria-label="روابط الصفحة"
        >
          {landingNavLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`whitespace-nowrap text-[14px] font-medium transition-colors duration-180 focus-visible:outline-2 focus-visible:outline-blue-300 focus-visible:outline-offset-4 focus-visible:rounded ${
                link.href === "#hero"
                  ? "text-primary font-bold"
                  : "text-muted hover:text-primary"
              }`}
              aria-current={link.href === "#hero" ? "page" : undefined}
            >
              {link.label}
            </a>
          ))}
        </div>

        <Logo />

        <button
          type="button"
          className="hidden max-[920px]:flex flex-col justify-center items-center gap-[5px] col-start-1 justify-self-start w-11 h-10 px-2.5 bg-white/70 border border-[#10202F]/15 rounded-lg cursor-pointer"
          aria-controls="mobile-navigation"
          aria-expanded={open}
          aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="block w-5 h-0.5 bg-ink rounded-full" />
          <span className="block w-5 h-0.5 bg-ink rounded-full" />
          <span className="block w-5 h-0.5 bg-ink rounded-full" />
        </button>
      </nav>

      <div
        id="mobile-navigation"
        className={`border-t border-[#10202F]/15 bg-white/95 px-6 pt-4 pb-6 shadow-[0_14px_28px_rgba(16,32,47,0.08)] ${
          open ? "grid gap-3" : "hidden"
        }`}
      >
        {landingNavLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="text-text font-bold py-2.5 no-underline hover:text-primary transition-colors"
            onClick={() => setOpen(false)}
          >
            {link.label}
          </a>
        ))}
        <Link
          href="/login"
          className="text-text font-bold py-2.5 no-underline hover:text-primary transition-colors"
          onClick={() => setOpen(false)}
        >
          تسجيل الدخول
        </Link>
        <PrimaryButton
          href="/login"
          showArrow
          fullWidth
          onClick={() => setOpen(false)}
        >
          ابدأ الآن
        </PrimaryButton>
      </div>
    </header>
  );
}

export { Logo };
