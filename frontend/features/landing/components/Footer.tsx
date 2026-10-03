import React from "react";
import Link from "next/link";
import { ZimamLogo } from "./ZimamLogo";

export function Footer() {
  return (
    <footer className="bg-[#0A5C55] text-white pt-16 pb-12 [direction:rtl]">
      <div className="w-full max-w-[1360px] mx-auto px-[72px] max-[1180px]:px-10 max-[700px]:px-6 max-[430px]:px-[18px]">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-4 max-[920px]:grid-cols-2 max-[550px]:grid-cols-1 gap-10 pb-12 border-b border-white/10">
          
          {/* Brand Col */}
          <div className="space-y-4 max-[920px]:col-span-2 max-[550px]:col-span-1">
            <ZimamLogo variant="light" />
            <p className="text-[14px] text-[#D1FAE5] leading-[1.7] max-w-[320px] font-medium">
              المنصة السحابية الرائدة لإدارة وتتبع حركة المركبات والمهام وترشيد الوقود بذكاء واحترافية.
            </p>
          </div>

          {/* Col 1: Links */}
          <div className="space-y-3">
            <h4 className="text-[16px] font-black text-white m-0 mb-4">
              المنصة
            </h4>
            <ul className="space-y-2.5 list-none p-0 m-0 text-[14px]">
              <li>
                <a href="#hero" className="text-[#A7F3D0] hover:text-white transition-colors no-underline">
                  الرئيسية
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="text-[#A7F3D0] hover:text-white transition-colors no-underline">
                  كيف يعمل
                </a>
              </li>
              <li>
                <a href="#insights" className="text-[#A7F3D0] hover:text-white transition-colors no-underline">
                  المميزات والرؤى
                </a>
              </li>
            </ul>
          </div>

          {/* Col 2: Services & Apps */}
          <div className="space-y-3">
            <h4 className="text-[16px] font-black text-white m-0 mb-4">
              الخدمات والتطبيقات
            </h4>
            <ul className="space-y-2.5 list-none p-0 m-0 text-[14px]">
              <li>
                <a href="#pricing" className="text-[#A7F3D0] hover:text-white transition-colors no-underline">
                  باقات الاشتراك
                </a>
              </li>
              <li>
                <a href="#driver-app" className="text-[#A7F3D0] hover:text-white transition-colors no-underline">
                  تطبيق زمام للسائق
                </a>
              </li>
              <li>
                <a href="#faq" className="text-[#A7F3D0] hover:text-white transition-colors no-underline">
                  الأسئلة الشائعة
                </a>
              </li>
              <li>
                <Link href="/login" className="text-[#A7F3D0] hover:text-white transition-colors no-underline">
                  تسجيل الدخول
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact & Support */}
          <div className="space-y-3">
            <h4 className="text-[16px] font-black text-white m-0 mb-4">
              الدعم والتواصل
            </h4>
            <p className="text-[14px] text-[#D1FAE5] m-0">
              المملكة العربية السعودية • الرياض
            </p>
            <p className="text-[14px] text-[#A7F3D0] m-0">
              support@zimam.sa
            </p>
            <div className="pt-2 flex items-center gap-3">
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
                aria-label="X (Twitter)"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
                aria-label="LinkedIn"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>

        </div>

        {/* Copyright Bar */}
        <div className="pt-8 flex items-center justify-between max-[600px]:flex-col max-[600px]:gap-3 text-[13px] text-[#A7F3D0]/80">
          <span>© 2026 زمام (ZIMAM). جميع الحقوق محفوظة.</span>
          <span>صُمم وطُوّر بدقة لخدمة قطاع النقل والخدمات اللوجستية</span>
        </div>
      </div>
    </footer>
  );
}
