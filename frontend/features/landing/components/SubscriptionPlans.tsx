import React from "react";
import { SubscriptionPlanGrid } from "./SubscriptionPlanGrid";

export function SubscriptionPlans() {
  return (
    <section
      id="pricing"
      className="bg-white py-24 max-[700px]:py-16 scroll-mt-20 [direction:rtl]"
      aria-labelledby="pricing-title"
    >
      <div className="w-full max-w-[1360px] mx-auto px-[72px] max-[1180px]:px-10 max-[700px]:px-6 max-[430px]:px-[18px]">
        {/* Section Header */}
        <div className="text-center max-w-[700px] mx-auto mb-12">
          <span className="text-primary text-[14px] font-bold tracking-wide block mb-2">
            باقات الاشتراك
          </span>
          <h2
            id="pricing-title"
            className="text-[#0F172A] text-[38px] max-[700px]:text-[30px] font-black leading-[1.3] m-0"
          >
            لماذا زمام هو{" "}
            <span className="relative inline-block text-primary">
              استثمارك الأذكى؟
              <span className="absolute bottom-1 left-0 w-full h-[4px] bg-[#E06D28] rounded-full -z-1 opacity-80" />
            </span>
          </h2>
          <p className="text-[#64748B] text-[16px] leading-[1.7] mt-3.5 m-0">
            خطط اشتراك مدروسة وشفافة تمنحك تحكماً شاملاً وعائداً مالياً مباشراً بدون عقود ملزمة أو تكاليف مستترة.
          </p>
        </div>

        <SubscriptionPlanGrid />
      </div>
    </section>
  );
}
