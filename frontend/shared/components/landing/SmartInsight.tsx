import Image from "next/image";
import { FleetRouteLine } from "./FleetRouteLine";

const insights = [
  {
    title: "استهلاك الوقود",
    value: "12% ↓",
    description: "انخفاض التكاليف الإضافية",
    tone: "text-[#059669]",
  },
  {
    title: "أداء السائقين",
    value: "18% ↑",
    description: "تحسن في الالتزام بالسرعة",
    tone: "text-primary",
  },
  {
    title: "تنبيهات الصيانة المنجزة",
    value: "5",
    description: "معالجة الأعطال بشكل استباقي",
    tone: "text-[#b45309]",
  },
];

export function SmartInsight() {
  return (
    <section
      id="insights"
      className="relative isolate overflow-clip bg-[#edf5f2] py-24 max-[700px]:py-16 scroll-mt-24"
    >
      <FleetRouteLine placement="top" />
      <div className="w-full max-w-[1360px] mx-auto px-[72px] max-[1180px]:px-10 max-[700px]:px-6 max-[430px]:px-[18px] relative z-[1] grid grid-cols-2 max-[920px]:grid-cols-1 items-center gap-12">
        <div className="grid gap-6 p-8 max-[430px]:p-6 rounded-[24px] bg-white border border-[#94a3b8]/15 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 text-[12px] font-bold text-[#059669] bg-[#059669]/10 rounded-full border-0">
              تحديث مباشر
              <Image src="/figma/landing/live-dot.svg" alt="" width={8} height={8} />
            </span>
            <h2 className="text-ink text-[16px] font-bold m-0">رؤى الأسطول</h2>
          </div>

          <div className="grid gap-4">
            {insights.map((item) => (
              <div
                className="flex items-center justify-between text-right p-4 bg-[#f7faf9] border border-[#10202F]/10 rounded-xl"
                key={item.title}
              >
                <div>
                  <strong className={`block text-[18px] font-extrabold ${item.tone}`}>
                    {item.value}
                  </strong>
                  <p className="text-muted text-[13px] leading-[1.5] m-0">
                    {item.description}
                  </p>
                </div>
                <h3 className="text-ink text-[14px] font-semibold m-0">
                  {item.title}
                </h3>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 text-right">
          <h2 className="text-ink text-[38px] max-[700px]:text-[32px] font-extrabold leading-[1.28] tracking-[-0.018em] m-0">
            قرارات أفضل، بأسطول أكثر كفاءة
          </h2>
          <p className="text-muted text-[16px] leading-[1.7] max-w-[62ch] justify-self-end m-0">
            يساعدك زمام على اكتشاف المشاكل مبكرًا وفهم أداء الأسطول واتخاذ
            قرارات مبنية على البيانات.
          </p>
        </div>
      </div>
      <FleetRouteLine placement="bottom" />
    </section>
  );
}
