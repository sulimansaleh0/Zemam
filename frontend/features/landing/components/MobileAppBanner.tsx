import React from "react";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";

export function MobileAppBanner() {
  const highlights = [
    "استلام وتحديث مهام التوصيل بضغطة زر واحدة",
    "تتبع حي للمسارات وإثبات التسليم الرقمي الفوري",
    "تنبيهات فورية بالصيانة وحالة المركبة ومستوى الوقود",
  ];

  return (
    <section
      id="driver-app"
      className="relative w-full overflow-hidden min-h-[660px] max-[920px]:min-h-[580px] flex items-center bg-[#F4F7FE] scroll-mt-20 [direction:rtl]"
      aria-label="تطبيق زمام للسائق"
    >
      {/* Background Image: Full-width edge-to-edge across the entire screen like Hero */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <Image
          src="/images/landing/driver-app-bg-clean.png"
          alt="تطبيق زمام للسائق"
          fill
          priority={false}
          quality={100}
          className="object-cover object-left max-[1040px]:object-[18%_center] max-[640px]:object-[10%_center]"
        />

        {/* RTL Smooth Gradient Overlay: Fades from solid ambient tone on the right for clear text reading, to transparent on the left revealing phones */}
        <div className="absolute inset-0 bg-gradient-to-l from-[#F4F7FE] via-[#F4F7FE]/85 to-transparent to-[55%] max-[1040px]:from-[#F4F7FE]/95 max-[1040px]:via-[#F4F7FE]/90 max-[640px]:from-[#F4F7FE]/95 max-[640px]:to-[#F4F7FE]/85" />

        {/* Soft edge blendings */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#F4F7FE] to-transparent pointer-events-none" />
      </div>

      {/* Content Container: Full width with 10% horizontal padding matching Hero & Navbar */}
      <div className="relative z-10 w-full px-[10%] py-28 max-[700px]:py-16">
        <div className="max-w-[620px] text-right space-y-7">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-[#195CF1] text-[14px] font-extrabold shadow-xs border border-[#195CF1]/25">
            <span>تطبيق الجوال للسائقين • iOS & Android</span>
          </div>

          {/* Headline */}
          <h2 className="text-[#0F172A] text-[52px] max-[1180px]:text-[42px] max-[700px]:text-[32px] font-black leading-[1.2] tracking-tight m-0">
            كل مزامنة أسطولك في{" "}
            <span className="relative inline-block text-primary">
              تطبيق واحد
              <span className="absolute bottom-1.5 left-0 w-full h-[5px] bg-[#E06D28] rounded-full -z-1 opacity-85" />
            </span>
          </h2>

          {/* Subtitle */}
          <p className="text-[#334155] text-[19px] max-[700px]:text-[16px] leading-[1.8] m-0 font-medium max-w-[580px]">
            تتبع، مهام، وتنبيهات لحظية... بالتحكم في يد سائقيك لرفع كفاءة التوصيل وتوثيق التسليمات بأعلى درجات الدقة والاحترافية.
          </p>

          {/* Feature bullets */}
          <div className="space-y-3 pt-1">
            {highlights.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-primary shrink-0" />
                <span className="text-[16px] max-[700px]:text-[14px] font-bold text-[#1E293B]">
                  {item}
                </span>
              </div>
            ))}
          </div>

          {/* Download Badges: Directly aligned on the right under the text */}
          <div className="flex flex-wrap items-center justify-start gap-4 pt-3">
            {/* App Store */}
            <a
              href="#"
              className="inline-flex items-center gap-3.5 px-6 py-3 rounded-2xl bg-[#041131] hover:bg-[#081B4B] text-white transition-all duration-200 shadow-md hover:shadow-xl hover:-translate-y-0.5 no-underline [direction:ltr]"
              aria-label="تحميل من App Store"
            >
              <svg className="w-7 h-7 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 1.01-2.87-1 .04-2.14.67-2.77 1.42-.56.65-.99 1.7-0.88 2.73 1.11.09 2.03-.53 2.64-1.28z" />
              </svg>
              <div className="text-left leading-tight">
                <span className="block text-[10px] uppercase text-gray-300 tracking-wider">
                  Download on
                </span>
                <span className="block text-[15px] font-black">
                  App Store
                </span>
              </div>
            </a>

            {/* Google Play */}
            <a
              href="#"
              className="inline-flex items-center gap-3.5 px-6 py-3 rounded-2xl bg-[#041131] hover:bg-[#081B4B] text-white transition-all duration-200 shadow-md hover:shadow-xl hover:-translate-y-0.5 no-underline [direction:ltr]"
              aria-label="تحميل من Google Play"
            >
              <svg className="w-7 h-7 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M3.609 1.814L13.793 12 3.61 22.186c-.328-.31-.518-.748-.518-1.233V3.047c0-.485.19-.923.517-1.233zM15.207 13.414l2.428 2.428-11.758 6.784 9.33-9.212zm0-2.828L5.877 1.374l11.758 6.784-2.428 2.428zm1.414 1.414l3.146 1.814c.78.45.78 1.18 0 1.63l-3.146 1.814-1.996-1.996 1.996-1.996z" />
              </svg>
              <div className="text-left leading-tight">
                <span className="block text-[10px] uppercase text-gray-300 tracking-wider">
                  GET IT ON
                </span>
                <span className="block text-[15px] font-black">
                  Google Play
                </span>
              </div>
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}
