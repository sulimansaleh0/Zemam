import { FeatureOrbit } from "./FeatureOrbit";

export function Features() {
  return (
    <section
      id="features"
      dir="rtl"
      className="relative isolate overflow-hidden py-16 max-[700px]:py-14 bg-[radial-gradient(520px_300px_at_12%_30%,rgba(15,118,110,0.08),transparent_72%),radial-gradient(460px_340px_at_88%_72%,rgba(5,150,105,0.055),transparent_74%)] bg-bg scroll-mt-24 before:content-[''] before:absolute before:-left-[4%] before:-right-[4%] before:top-[23%] max-[700px]:before:top-[18%] before:h-px before:pointer-events-none before:opacity-70 max-[700px]:before:opacity-50 before:-rotate-3 before:bg-[linear-gradient(90deg,transparent_4%,rgba(15,118,110,0.14)_26%,rgba(37,99,235,0.1)_54%,rgba(15,118,110,0.12)_76%,transparent_96%)] after:content-[''] after:absolute after:-right-[270px] max-[700px]:after:-right-[210px] after:top-[14%] max-[700px]:after:top-[18%] after:w-[520px] max-[700px]:after:w-[340px] after:h-[520px] max-[700px]:after:h-[340px] after:rounded-full after:border after:border-primary/10 after:opacity-65 after:pointer-events-none"
    >
      <div className="w-full max-w-[1360px] mx-auto px-[72px] max-[1180px]:px-10 max-[700px]:px-6 max-[430px]:px-[18px] relative z-[1]">
        <div className="grid justify-items-center gap-2.5 max-w-[600px] mx-auto text-center mb-6">
          <h2 className="text-ink text-[34px] max-[700px]:text-[30px] font-extrabold leading-[1.35] tracking-[-0.018em] m-0">
            كل ما تحتاجه لإدارة أسطولك
          </h2>
          <p className="text-muted text-[14px] max-[700px]:text-[13px] leading-[1.7] max-w-[520px] m-0">
            أدوات متكاملة تساعدك على متابعة أسطولك واتخاذ قرارات أفضل.
          </p>
        </div>
        <FeatureOrbit />
      </div>
    </section>
  );
}

export { FeatureOrbit };
