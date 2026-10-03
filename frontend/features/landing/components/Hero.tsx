import React from "react";
import Image from "next/image";
import Link from "next/link";
import { PrimaryButton } from "./PrimaryButton";

export function Hero() {
  return (
    <section
      id="hero"
      className="relative w-full overflow-hidden min-h-[660px] max-[920px]:min-h-[560px] flex items-center bg-[#F8FAF9] [direction:rtl]"
    >
      {/* Background Image: Full-width edge-to-edge across the entire screen width */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <Image
          src="/images/landing/hero-businessman.png"
          alt="زمام لإدارة الأساطيل الذكية"
          fill
          priority
          quality={100}
          className="object-cover object-left max-[1040px]:object-[22%_center] max-[640px]:object-[15%_center]"
        />

        {/* RTL Smooth Gradient Overlay: Solid off-white on the right for clear text reading, fading seamlessly to reveal businessman on the left */}
        <div className="absolute inset-0 bg-gradient-to-l from-[#F8FAF9] via-[#F8FAF9]/85 to-transparent to-[55%] max-[1040px]:from-[#F8FAF9]/95 max-[1040px]:via-[#F8FAF9]/90 max-[640px]:from-[#F8FAF9]/95 max-[640px]:to-[#F8FAF9]/80" />

        {/* Bottom soft gradient blend */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#F8FAF9] to-transparent pointer-events-none" />
      </div>

      {/* Hero Content Container: Full width with 10% horizontal padding so text begins at 10% */}
      <div className="relative z-10 w-full px-[10%] py-28 max-[700px]:py-16">
        <div className="max-w-[640px] text-right space-y-7">
          
          {/* Main Headline */}
          <h1 className="text-[#0F172A] text-[54px] max-[1180px]:text-[46px] max-[700px]:text-[34px] font-black leading-[1.2] tracking-tight m-0">
            سيطر على حركة{" "}
            <span className="relative inline-block text-primary">
              أسطولك
              <span className="absolute bottom-1.5 left-0 w-full h-[5px] bg-[#E06D28] rounded-full -z-1 opacity-85" />
            </span>{" "}
            بالكامل وقلص تكاليفك بذكاء
          </h1>

          {/* Subtitle */}
          <p className="text-[#334155] text-[19px] max-[700px]:text-[16px] leading-[1.8] m-0 font-medium max-w-[580px]">
            منصة ذكية متكاملة لإدارة وتتبع المركبات والمهام والصيانة اللحظية
            لتقليل استهلاك الوقود وزيادة الإنتاجية من لوحة تحكم واحدة.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <PrimaryButton href="/login" showArrow>
              ابدأ الآن مجاناً
            </PrimaryButton>
            <Link
              href="#how-it-works"
              className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl border border-gray-300 hover:border-primary text-[#0F172A] hover:text-primary bg-white/95 backdrop-blur-sm text-[15px] font-bold transition-all shadow-sm hover:shadow no-underline"
            >
              اكتشف كيف يعمل
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
