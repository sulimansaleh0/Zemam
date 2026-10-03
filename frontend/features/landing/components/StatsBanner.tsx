import React from "react";

const stats = [
  {
    value: "+5,600",
    label: "مركبة مدارة بذكاء",
    subtext: "عبر مختلف القطاعات في المملكة",
  },
  {
    value: "99.4%",
    label: "دقة التتبع والجاهزية",
    subtext: "مزامنة لحظية ثانية بثانية",
  },
  {
    value: "18%",
    label: "متوسط توفير الوقود",
    subtext: "تقليص مباشر في مصاريف التشغيل",
  },
  {
    value: "24/7",
    label: "متابعة ودعم مستمر",
    subtext: "تنبيهات فورية واستجابة سريعة",
  },
];

export function StatsBanner() {
  return (
    <section
      aria-label="إحصائيات المنصة"
      className="w-full bg-[#0A5C55] text-white py-12 px-6 relative overflow-hidden"
    >
      {/* Subtle background glow effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.08),_transparent_70%)] pointer-events-none" />

      <div className="max-w-[1360px] mx-auto grid grid-cols-4 max-[920px]:grid-cols-2 max-[500px]:grid-cols-1 gap-8 text-center relative z-1 [direction:rtl]">
        {stats.map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-center justify-center space-y-1.5"
          >
            <span className="text-[44px] max-[700px]:text-[36px] font-black tracking-tight text-white font-sans">
              {item.value}
            </span>
            <span className="text-[17px] font-bold text-[#D1FAE5]">
              {item.label}
            </span>
            <span className="text-[13px] text-[#A7F3D0]/80">
              {item.subtext}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
