import React from "react";
import Image from "next/image";
import { PrimaryButton } from "./PrimaryButton";
import { SecondaryButton } from "./SecondaryButton";

export function Hero() {
  return (
    <section
      id="hero"
      className="relative w-full overflow-hidden min-h-[500px] sm:min-h-[560px] lg:min-h-[660px] flex items-center bg-[#F8FAF9] [direction:rtl]"
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

      {/* Hero Content Container: Responsive padding for small screens and 10% on desktop */}
      <div className="relative z-10 w-full px-4 sm:px-6 md:px-10 lg:px-[10%] py-10 sm:py-16 md:py-20 lg:py-24">
        <div className="max-w-[640px] text-right space-y-3 sm:space-y-4 lg:space-y-6">
          
          {/* Main Headline */}
          <h1 className="text-[#0F172A] text-[26px] min-[380px]:text-[30px] sm:text-[38px] md:text-[46px] lg:text-[54px] font-black leading-[1.28] sm:leading-[1.2] tracking-tight m-0">
            سيطر على حركة{" "}
            <span className="relative inline-block text-primary">
              أسطولك
              <span className="absolute bottom-1.5 left-0 w-full h-[5px] bg-[#E06D28] rounded-full -z-1 opacity-85" />
            </span>{" "}
            بالكامل وقلص تكاليفك بذكاء
          </h1>

          {/* Subtitle */}
          <p className="text-[#334155] text-[15px] sm:text-[17px] md:text-[18px] lg:text-[19px] leading-[1.7] sm:leading-[1.8] m-0 font-medium max-w-[580px]">
            منصة ذكية متكاملة لإدارة وتتبع المركبات والمهام والصيانة اللحظية
            لتقليل استهلاك الوقود وزيادة الإنتاجية من لوحة تحكم واحدة.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5 pt-1">
            <PrimaryButton href="/login" showArrow>
              ابدأ الآن مجاناً
            </PrimaryButton>
            <SecondaryButton
              href="#how-it-works"
              className="bg-white/95 backdrop-blur-sm border-gray-300 hover:border-primary text-[#0F172A] hover:text-primary shadow-sm hover:shadow"
            >
              اكتشف كيف يعمل
            </SecondaryButton>
          </div>

        </div>
      </div>
    </section>
  );
}
