import React from "react";
import Image from "next/image";
import { CheckCircle2, Activity, Gauge, Fuel, AlertTriangle } from "lucide-react";

export function SmartInsight() {
  const points = [
    "تنبيهات فورية عند السرعة الزائدة أو الخروج عن المسار المحدد.",
    "مراقبة دقيقة لمستوى استهلاك الوقود وكشف أي هدر غير مبرر.",
    "تقارير أداء شاملة لكل مركبة وسائق لاتخاذ قرارات تشغيلية مدروسة.",
    "جدولة دورية ومؤتمتة لعمليات الصيانة وتغيير الزيت والإطارات.",
  ];

  return (
    <section
      id="insights"
      className="py-24 max-[700px]:py-16 bg-[#F8FAF9] scroll-mt-20 [direction:rtl]"
    >
      <div className="w-full max-w-[1360px] mx-auto px-[72px] max-[1180px]:px-10 max-[700px]:px-6 max-[430px]:px-[18px]">
        <div className="grid grid-cols-2 max-[920px]:grid-cols-1 items-center gap-12">
          
          {/* Right Column: Text & Features & Social proof */}
          <div className="space-y-6 text-right">
            <span className="text-primary text-[14px] font-bold tracking-wide block">
              رؤى ذكية وفورية
            </span>

            <h2 className="text-[#0F172A] text-[38px] max-[700px]:text-[30px] font-black leading-[1.3] m-0">
              أسطولك يتحدث...{" "}
              <span className="relative inline-block text-primary">
                استمع إليه بذكاء
                <span className="absolute bottom-1 left-0 w-full h-[4px] bg-[#E06D28] rounded-full -z-1 opacity-80" />
              </span>
            </h2>

            <p className="text-[#64748B] text-[17px] leading-[1.7] m-0 font-medium">
              لوحة تحكم ذكية تعرض لك كافة تفاصيل الرحلات، استهلاك الوقود، وسلوك السائقين في لحظتها لتتخذ قراراتك التشغيلية بثقة واحترافية.
            </p>

            {/* Checklist */}
            <div className="space-y-3.5 pt-2">
              {points.map((pt, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-primary shrink-0 mt-1" />
                  <span className="text-[15px] font-semibold text-[#334155] leading-[1.5]">
                    {pt}
                  </span>
                </div>
              ))}
            </div>

            {/* Social Proof Stack */}
            <div className="pt-6 border-t border-[#E2E8F0] flex items-center gap-4">
              <div className="flex -space-x-2 space-x-reverse overflow-hidden">
                <span className="inline-block h-10 w-10 rounded-full ring-2 ring-white bg-[#0F766E] text-white text-[12px] font-bold flex items-center justify-center">
                  أ.م
                </span>
                <span className="inline-block h-10 w-10 rounded-full ring-2 ring-white bg-[#0A5C55] text-white text-[12px] font-bold flex items-center justify-center">
                  خ.ع
                </span>
                <span className="inline-block h-10 w-10 rounded-full ring-2 ring-white bg-[#2563EB] text-white text-[12px] font-bold flex items-center justify-center">
                  س.ح
                </span>
                <span className="inline-block h-10 w-10 rounded-full ring-2 ring-white bg-[#D97706] text-white text-[12px] font-bold flex items-center justify-center">
                  م.س
                </span>
              </div>
              <div>
                <span className="block text-[14px] font-extrabold text-[#0F172A]">
                  أكثر من +500 شركة
                </span>
                <span className="block text-[12px] text-[#64748B] font-medium">
                  تعتمد على زمام لإدارة وتتبع أساطيلها يومياً
                </span>
              </div>
            </div>
          </div>

          {/* Left Column: Live Fleet Dashboard Card */}
          <div className="relative flex justify-center">
            <div className="w-full max-w-[480px] bg-white rounded-[24px] border border-[#E2E8F0] shadow-[0_20px_45px_rgba(15,118,110,0.08)] p-6 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#F1F5F9]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
                  <span className="text-[14px] font-bold text-[#0F172A]">
                    حالة المركبات اللحظية
                  </span>
                </div>
                <span className="text-[12px] font-extrabold text-primary bg-[#E6F4F1] px-2.5 py-1 rounded-full">
                  مباشر الآن
                </span>
              </div>

              {/* Vehicle 1 */}
              <div className="p-3.5 rounded-xl bg-[#F8FAF9] border border-[#E2E8F0] hover:border-primary/40 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-[#E6F4F1] text-primary flex items-center justify-center font-bold text-[12px]">
                      01
                    </span>
                    <div>
                      <h4 className="text-[14px] font-black text-[#0F172A] m-0">
                        تويوتا هايلكس (أ ب ج 1234)
                      </h4>
                      <span className="text-[12px] text-[#64748B]">
                        السائق: فهد السالم • طريق الملك فهد
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-[#DCFCE7] text-[#15803D]">
                    متحركة (85 كم/س)
                  </span>
                </div>
              </div>

              {/* Vehicle 2 */}
              <div className="p-3.5 rounded-xl bg-[#F8FAF9] border border-[#E2E8F0] hover:border-primary/40 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-[#E6F4F1] text-primary flex items-center justify-center font-bold text-[12px]">
                      02
                    </span>
                    <div>
                      <h4 className="text-[14px] font-black text-[#0F172A] m-0">
                        شاحنة إيسوزو (د هـ و 5678)
                      </h4>
                      <span className="text-[12px] text-[#64748B]">
                        السائق: أحمد المنصور • المنطقة الصناعية
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-[#FEF3C7] text-[#B45309]">
                    توقف تفريغ (12 د)
                  </span>
                </div>
              </div>

              {/* Vehicle 3 */}
              <div className="p-3.5 rounded-xl bg-[#F8FAF9] border border-[#E2E8F0] hover:border-primary/40 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-[#E6F4F1] text-primary flex items-center justify-center font-bold text-[12px]">
                      03
                    </span>
                    <div>
                      <h4 className="text-[14px] font-black text-[#0F172A] m-0">
                        فان بضائع (س ص ع 9101)
                      </h4>
                      <span className="text-[12px] text-[#64748B]">
                        السائق: سامي الحربي • حي العليا
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-[#DCFCE7] text-[#15803D]">
                    متحركة (60 كم/س)
                  </span>
                </div>
              </div>

              {/* Quick Metrics Bar at bottom of card */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#F1F5F9] text-center">
                <div className="p-2 rounded-lg bg-[#F8FAF9]">
                  <span className="block text-[11px] text-[#64748B]">
                    معدل السرعة
                  </span>
                  <strong className="block text-[14px] font-black text-[#0F172A]">
                    72 كم/س
                  </strong>
                </div>
                <div className="p-2 rounded-lg bg-[#F8FAF9]">
                  <span className="block text-[11px] text-[#64748B]">
                    الوقود الموفر
                  </span>
                  <strong className="block text-[14px] font-black text-[#15803D]">
                    142 لتر
                  </strong>
                </div>
                <div className="p-2 rounded-lg bg-[#F8FAF9]">
                  <span className="block text-[11px] text-[#64748B]">
                    الالتزام
                  </span>
                  <strong className="block text-[14px] font-black text-primary">
                    98.5%
                  </strong>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
