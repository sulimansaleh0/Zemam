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
      className="w-full bg-[#041131] text-[#F4F7FE] py-14 px-6 relative overflow-hidden border-y border-[#162858]"
    >
      {/* Subtle brand blue glow effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(25,92,241,0.22),_transparent_70%)] pointer-events-none" />

      <div className="max-w-[1360px] mx-auto grid grid-cols-4 max-[920px]:grid-cols-2 max-[500px]:grid-cols-1 gap-8 text-center relative z-1 [direction:rtl]">
        {stats.map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-center justify-center space-y-1.5"
          >
            <span className="text-[46px] max-[700px]:text-[36px] font-black tracking-tight text-[#F4F7FE] font-sans">
              {item.value}
            </span>
            <span className="text-[17px] font-bold text-[#DDE6FA]">
              {item.label}
            </span>
            <span className="text-[13px] text-[#94A3B8]">
              {item.subtext}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
