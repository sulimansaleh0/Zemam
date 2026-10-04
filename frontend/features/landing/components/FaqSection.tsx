"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: "كيف يساعد نظام زمام في تقليل استهلاك الوقود وتكاليف الأسطول؟",
    answer:
      "يوفر زمام تتبعاً لحظياً دقيقاً لمسارات المركبات مع رصد التوقفات غير المبررة والسرعات الزائدة، ويقدم اقتراحات مسارات أقصر، مما يقلل الهدر بنسبة تصل إلى 18% شهرياً.",
  },
  {
    question: "هل يدعم النظام مختلف أنواع المركبات والشاحنات؟",
    answer:
      "نعم، زمام مصمم ليتوافق مع جميع أنواع الأساطيل، سواء كانت سيارات نقل خفيف، حافلات، شاحنات ثقيلة، أو دراجات التوصيل، مع دعم أجهزة GPS القياسية وOBD.",
  },
  {
    question: "كيف يتم ربط وتركيب أجهزة التتبع مع المنصة؟",
    answer:
      "عملية الربط سهلة للغاية؛ يمكنك إما استخدام أجهزة التتبع المعتمدة عبر منفذ OBD السريع (Plug & Play) أو تثبيت جهاز التتبع المخفي عبر فنيي شبكتنا المعتمدة خلال دقائق.",
  },
  {
    question: "هل يتوفر تطبيق جوال مخصص للسائقين؟",
    answer:
      "نعم، تطبيق زمام للسائق متوفر مجاناً على أنظمة iOS و Android، ويسمح للسائق باستلام المهام اليومية، إثبات التسليم الرقمي، والتواصل الفوري مع مسؤولي الأسطول.",
  },
  {
    question: "هل يمكنني تجربة المنصة مجاناً قبل الاشتراك؟",
    answer:
      "بالتأكيد، نوفر باقة مجانية تتيح لك تجربة إدارة وتتبع ما يصل إلى 3 مركبات بكامل الخصائص الأساسية ودون الحاجة لإدخال بيانات بطاقة ائتمانية.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      id="faq"
      className="py-24 max-[700px]:py-16 bg-[#F8FAF9] scroll-mt-20 [direction:rtl]"
      aria-label="الأسئلة الشائعة"
    >
      <div className="w-full max-w-[1360px] mx-auto px-[72px] max-[1180px]:px-10 max-[700px]:px-6 max-[430px]:px-[18px]">
        {/* Section Header */}
        <div className="text-center max-w-[700px] mx-auto mb-14">
          <span className="text-primary text-[14px] font-bold tracking-wide block mb-2">
            الأسئلة الشائعة
          </span>
          <h2 className="text-[#0F172A] text-[38px] max-[700px]:text-[28px] font-black leading-[1.3] m-0">
            إجابات واضحة{" "}
            <span className="relative inline-block text-primary">
              وشاملة
              <span className="absolute bottom-1 left-0 w-full h-[4px] bg-[#E06D28] rounded-full -z-1 opacity-80" />
            </span>
          </h2>
          <p className="text-[#64748B] text-[16px] leading-[1.7] mt-3.5 m-0">
            كل ما يدور بذهنك حول منصة زمام وكيف يمكنها تحويل طريقة إدارتك لأسطولك.
          </p>
        </div>

        {/* Accordion List */}
        <div className="max-w-[860px] mx-auto space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-sm transition-all duration-200 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  className="w-full flex items-center justify-between p-6 text-right cursor-pointer bg-transparent border-none focus-visible:outline-2 focus-visible:outline-primary"
                  aria-expanded={isOpen}
                >
                  <span className="text-[17px] max-[600px]:text-[15px] font-bold text-[#0F172A]">
                    {faq.question}
                  </span>
                  <span
                    className={`shrink-0 ml-4 w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-200 ${
                      isOpen
                        ? "bg-[#195CF1]/10 text-primary rotate-180"
                        : "bg-[#F1F5F9] text-[#64748B]"
                    }`}
                  >
                    <ChevronDown size={18} strokeWidth={2.5} />
                  </span>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-[#475569] text-[15px] leading-[1.7] border-t border-[#F8FAF9]">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
