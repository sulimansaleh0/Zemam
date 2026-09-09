import { SubscriptionPlanGrid } from "./SubscriptionPlanGrid";

export function SubscriptionPlans() {
  return (
    <section id="pricing" className="bg-bg py-[76px] max-[700px]:py-16 scroll-mt-24" dir="rtl" aria-labelledby="pricing-title">
      <div className="w-full max-w-[1360px] mx-auto px-[72px] max-[1180px]:px-10 max-[700px]:px-6 max-[430px]:px-[18px]">
        <div className="text-center max-w-[700px] mx-auto">
          <span className="relative inline-block text-primary text-[13px] font-bold mb-3.5 pb-[7px] after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-7 after:h-0.5 after:bg-primary after:rounded-full">
            الاشتراكات
          </span>
          <h2 id="pricing-title" className="text-ink text-[38px] max-[700px]:text-[32px] font-extrabold leading-[1.28] tracking-[-0.018em] m-0">
            اختر الخطة المناسبة لأسطولك
          </h2>
          <p className="text-muted text-[16px] max-[700px]:text-[14px] leading-[1.7] mt-3 m-0">
            خطط مرنة تساعدك على إدارة أسطولك بالطريقة التي تناسب احتياجاتك.
          </p>
        </div>
        <SubscriptionPlanGrid />
      </div>
    </section>
  );
}
