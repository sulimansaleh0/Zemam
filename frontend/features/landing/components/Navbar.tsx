"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PrimaryButton } from "./PrimaryButton";
import { ZimamLogo } from "./ZimamLogo";
import { landingNavLinks } from "../constants/landing-config";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-[#E2E8F0]">
      <nav
        className="w-full h-[78px] px-[10%] flex items-center justify-between [direction:rtl]"
        aria-label="القائمة الرئيسية"
      >
        {/* Right side in RTL: Brand Logo starts at 10% */}
        <div className="flex items-center">
          <ZimamLogo />
        </div>

        {/* Center: Navigation Links */}
        <div
          className="hidden min-[1040px]:flex items-center gap-7"
          aria-label="روابط الصفحة"
        >
          {landingNavLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[#475569] hover:text-primary whitespace-nowrap text-[14px] font-bold transition-colors duration-150 no-underline"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Left side in RTL: Auth Buttons */}
        <div className="hidden min-[1040px]:flex items-center gap-4 [direction:rtl]">
          <Link
            href="/login"
            className="text-[#475569] hover:text-primary text-[14px] font-bold px-3 py-2 transition-colors duration-150 no-underline"
          >
            تسجيل الدخول
          </Link>
          <PrimaryButton href="/login" showArrow>
            ابدأ الآن
          </PrimaryButton>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          className="flex min-[1040px]:hidden flex-col justify-center items-center gap-1.5 w-10 h-10 p-2 rounded-lg bg-gray-50 border border-gray-200 cursor-pointer"
          aria-controls="mobile-navigation"
          aria-expanded={open}
          aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
          onClick={() => setOpen((value) => !value)}
        >
          <span
            className={`block w-5 h-0.5 bg-[#0F172A] rounded-full transition-transform ${
              open ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`block w-5 h-0.5 bg-[#0F172A] rounded-full transition-opacity ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-5 h-0.5 bg-[#0F172A] rounded-full transition-transform ${
              open ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </button>
      </nav>

      {/* Mobile Drawer */}
      {open && (
        <div
          id="mobile-navigation"
          className="min-[1040px]:hidden bg-white border-t border-gray-100 px-[10%] py-6 shadow-xl [direction:rtl]"
        >
          <div className="flex flex-col gap-4">
            {landingNavLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-[#334155] hover:text-primary text-[15px] font-bold py-1.5 transition-colors no-underline"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
              <Link
                href="/login"
                className="text-center py-2.5 text-[#334155] font-bold text-[14px] rounded-lg border border-gray-200"
              >
                تسجيل الدخول
              </Link>
              <Link
                href="/login"
                className="text-center py-2.5 bg-primary text-white font-bold text-[14px] rounded-lg"
              >
                ابدأ الآن
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export { ZimamLogo as Logo };
