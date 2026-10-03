import React from "react";

const steps = [
  {
    number: "01",
    title: "أنشئ حساب أسطولك",
    description: "سجل بيانات شركتك وحدد الفروع وصلاحيات المديرين في خطوات معدودة.",
  },
  {
    number: "02",
    title: "أضف المركبات والسائقين",
    description: "اربط أجهزة التتبع (GPS) وأدخل بيانات سياراتك وعيّن السائقين والمهام.",
  },
  {
    number: "03",
    title: "ابدأ المراقبة والتحكم",
    description: "راقب المسارات المباشرة، تقارير استهلاك الوقود، وتنبيهات الصيانة فورياً.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-24 max-[700px]:py-16 bg-white scroll-mt-20 [direction:rtl]"
    >
      <div className="w-full max-w-[1360px] mx-auto px-[72px] max-[1180px]:px-10 max-[700px]:px-6 max-[430px]:px-[18px]">
        {/* Section Header */}
        <div className="text-center max-w-[700px] mx-auto mb-14">
          <span className="text-primary text-[14px] font-bold tracking-wide block mb-2">
            خطوات بسيطة
          </span>
          <h2 className="text-[#0F172A] text-[38px] max-[700px]:text-[30px] font-black leading-[1.3] m-0">
            ابدأ خلال{" "}
            <span className="relative inline-block text-primary">
              دقائق
              <span className="absolute bottom-1 left-0 w-full h-[4px] bg-[#E06D28] rounded-full -z-1 opacity-80" />
            </span>
          </h2>
          <p className="text-[#64748B] text-[16px] leading-[1.7] mt-3.5 m-0">
            لا حاجة لإجراءات معقدة؛ ابدأ تشغيل نظام إدارة أسطولك بثلاث خطوات سهلة ومباشرة.
          </p>
        </div>

        {/* 3 Step Cards Grid */}
        <div className="grid grid-cols-3 max-[920px]:grid-cols-1 gap-7">
          {steps.map((step) => (
            <article
              key={step.number}
              className="relative p-8 rounded-[20px] bg-[#F8FAF9] border border-[#E2E8F0] transition-all duration-200 hover:-translate-y-1.5 hover:shadow-lg hover:border-primary/40 hover:bg-white flex flex-col justify-between"
            >
              <div>
                {/* Step Number Tag */}
                <div className="w-12 h-12 rounded-xl bg-[#E6F4F1] border border-primary/20 flex items-center justify-center text-primary text-[20px] font-black mb-6">
                  {step.number}
                </div>

                <h3 className="text-[#0F172A] text-[20px] font-black mb-3">
                  {step.title}
                </h3>

                <p className="text-[#64748B] text-[15px] leading-[1.65] m-0">
                  {step.description}
                </p>
              </div>

              {/* Decorative top border accent */}
              <div className="w-10 h-1 bg-primary rounded-full mt-6 opacity-40" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
