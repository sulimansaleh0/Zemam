import React from "react";

const steps = [
  {
    number: "01",
    title: "أنشئ حساب شركتك",
    description: "سجل بريدك الإلكتروني وجهز مساحتك الخاصة",
    tooltip: "أنشئ حساب شركتك لبدء إدارة أسطولك.",
  },
  {
    number: "02",
    title: "أضف المركبات والسائقين",
    description: "ادخل بيانات مركباتك وفريق العمل بسهولة",
    tooltip: "أضف المركبات والسائقين لتجهيز بيانات الأسطول.",
  },
  {
    number: "03",
    title: "ابدأ إدارة أسطولك",
    description: "تابع كل شيء من لوحة تحكم واحدة بذكاء",
    tooltip: "ابدأ المتابعة والتحكم من لوحة واحدة.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="pt-[88px] pb-[104px] max-[700px]:py-16 scroll-mt-24">
      <div className="w-full max-w-[1360px] mx-auto px-[72px] max-[1180px]:px-10 max-[700px]:px-6 max-[430px]:px-[18px]">
        <h2 className="text-center text-ink text-[38px] max-[700px]:text-[32px] font-extrabold leading-[1.28] tracking-[-0.018em] m-0">
          ابدأ خلال دقائق
        </h2>
        <div className="grid grid-cols-3 max-[920px]:grid-cols-2 max-[700px]:grid-cols-1 gap-5 mt-12">
          {steps.map((step) => (
            <article
              aria-describedby={`step-tooltip-${step.number}`}
              className="group relative cursor-default text-right z-[1] rounded-[14px] border border-[#94a3b8]/20 p-[30px] max-[430px]:p-6 transition-all duration-180 ease-out hover:-translate-y-1.5 hover:bg-[#F0F7F5] hover:border-primary/35 hover:shadow-[0_14px_28px_rgba(15,118,110,0.1)] focus-visible:outline-none focus-visible:-translate-y-1.5 focus-visible:bg-[#F0F7F5] focus-visible:border-primary/35 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:shadow-[0_14px_28px_rgba(15,118,110,0.1)] before:content-[''] before:absolute before:top-0 before:right-[30px] before:w-[42px] before:h-[3px] before:bg-primary before:rounded-full motion-reduce:transition-none motion-reduce:hover:transform-none"
              key={step.number}
              role="group"
              tabIndex={0}
            >
              <strong className="block text-primary text-[32px] font-extrabold mb-4 leading-none">
                {step.number}
              </strong>
              <h3 className="text-ink text-[18px] font-bold m-0 mb-2">
                {step.title}
              </h3>
              <p className="text-muted text-[14px] leading-[1.5] m-0">
                {step.description}
              </p>
              <span
                className="absolute top-[calc(100%+10px)] left-1/2 -translate-x-1/2 -translate-y-1 group-hover:translate-y-0 group-focus-visible:translate-y-0 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 invisible group-hover:visible group-focus-visible:visible pointer-events-none z-[4] w-max max-w-[240px] max-[700px]:max-w-[min(260px,100vw-64px)] rounded-lg bg-ink text-white p-2.5 text-right text-[13px] leading-[1.5] shadow-lg transition-all duration-180 motion-reduce:transition-none"
                id={`step-tooltip-${step.number}`}
                role="tooltip"
              >
                {step.tooltip}
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
