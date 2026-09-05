import { PrimaryButton } from "./PrimaryButton";
import { SecondaryButton } from "./SecondaryButton";
import { AnimatedBackground } from "./AnimatedBackground";
import { FeatureOrbit } from "./FeatureOrbit";

export function Hero() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden isolate min-h-[600px] max-[1180px]:min-h-[570px] max-[920px]:min-h-0 bg-[radial-gradient(620px_360px_at_18%_28%,rgba(15,118,110,0.12),transparent_72%)] bg-bg after:content-[''] after:absolute after:inset-0 after:pointer-events-none after:z-1 after:bg-[radial-gradient(680px_330px_at_50%_48%,rgba(246,248,247,0.98)_0%,rgba(246,248,247,0.94)_40%,rgba(246,248,247,0.62)_62%,transparent_100%)] max-[700px]:after:bg-[radial-gradient(330px_300px_at_50%_46%,rgba(246,248,247,0.99)_0%,rgba(246,248,247,0.96)_54%,rgba(246,248,247,0.56)_76%,transparent_100%)]"
    >
      <AnimatedBackground />
      <div className="w-full max-w-[1360px] mx-auto px-[72px] max-[1180px]:px-10 max-[700px]:px-6 max-[430px]:px-[18px] relative z-[2] isolate grid grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] max-[1180px]:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] max-[920px]:grid-cols-1 items-center min-h-[600px] max-[1180px]:min-h-[570px] max-[920px]:min-h-0 pt-[30px] pb-[38px] max-[1180px]:py-6 max-[1180px]:pb-[30px] max-[920px]:pt-[68px] max-[920px]:pb-[76px] max-[700px]:pt-14 max-[700px]:pb-16 gap-7 max-[1180px]:gap-[18px]">
        <div className="relative z-[3] isolate flex flex-col items-start max-[920px]:items-center text-right max-[920px]:text-center gap-5 max-[700px]:gap-[18px] max-w-[620px] max-[920px]:mx-auto w-full min-w-0 [direction:rtl] before:content-[''] before:absolute before:-inset-x-[72px] before:-inset-y-[54px] max-[700px]:before:-inset-x-7 max-[700px]:before:-inset-y-[34px] before:pointer-events-none before:z-0 before:bg-[radial-gradient(ellipse_at_center,rgba(246,248,247,0.98)_0%,rgba(246,248,247,0.94)_46%,rgba(246,248,247,0.68)_72%,rgba(246,248,247,0)_100%)] [&>*]:relative [&>*]:z-[1]">
          <p className="inline-flex text-primary text-[13px] font-bold pb-2 border-b-2 border-primary/30 animate-hero-reveal [animation-delay:40ms]">
            إدارة أسطولك بذكاء
          </p>
          <h1 className="text-ink text-[56px] max-[1180px]:text-[46px] max-[700px]:text-[32px] max-[430px]:text-[29px] font-extrabold leading-[1.18] tracking-[-0.025em] max-w-[720px] m-0 animate-hero-reveal [animation-delay:110ms]">
            إدارة أسطولك بذكاء،
            <span className="text-primary block">من مكان واحد</span>
          </h1>
          <p className="text-muted text-[16px] leading-[1.7] max-[700px]:leading-[1.65] max-w-[600px] m-0 animate-hero-reveal [animation-delay:180ms]">
            زمام منصة ذكية تساعدك على إدارة المركبات والسائقين والصيانة والوقود
            والمهام والتتبع بسهولة، من لوحة تحكم واحدة.
          </p>
          <div className="flex items-center justify-start max-[920px]:justify-center gap-3.5 max-[700px]:gap-3 w-full [direction:rtl] max-[700px]:flex-col max-[700px]:items-stretch max-[520px]:[&>*]:w-full animate-hero-reveal [animation-delay:250ms]">
            <PrimaryButton href="/login">ابدأ الآن</PrimaryButton>
            <SecondaryButton href="#features">استكشف المنصة</SecondaryButton>
          </div>
          <p className="text-muted text-[13px] leading-[1.5] m-0 animate-hero-reveal [animation-delay:320ms]">
            كل ما تحتاجه لإدارة أسطولك في مكان واحد
          </p>
        </div>

        <div
          id="features"
          className="relative z-[3] isolate grid justify-items-center content-center w-full min-w-0 max-[920px]:max-w-[620px] max-[920px]:mx-auto"
          aria-label="مزايا إدارة الأسطول"
        >
          <FeatureOrbit showSignals={false} />
        </div>
      </div>
    </section>
  );
}
