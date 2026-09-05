"use client";

import { motion } from "framer-motion";
import { BellRing, Gauge, Route } from "lucide-react";
import { fleetFeatures } from "../constants/feature-data";
import { usePrefersReducedMotion } from "../hooks/motion";

type FeatureOrbitProps = {
  showSignals?: boolean;
};

const orbitRotation = [0, 60, 120, 180, 240, 300, 360];
const counterRotation = [0, -60, -120, -180, -240, -300, -360];
const orbitTransition = {
  duration: 18,
  ease: "linear" as const,
  repeat: Infinity,
  repeatType: "loop" as const,
};
const entryEase = [0.16, 1, 0.3, 1] as const;

export function FeatureOrbit({ showSignals = true }: FeatureOrbitProps) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div className="flex flex-col items-center w-full">
      <motion.div
        aria-label="مزايا إدارة الأسطول"
        className="relative mx-auto aspect-square w-full max-w-[550px] max-[1180px]:max-w-[520px] max-[700px]:max-w-[540px] rounded-full bg-[radial-gradient(circle_at_center,rgba(15,118,110,0.05),transparent_62%)]"
        initial={reducedMotion ? false : { opacity: 0, scale: 0.96 }}
        role="list"
        whileInView={reducedMotion ? undefined : { opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.22 }}
      >
        <motion.div
          aria-hidden="true"
          className="absolute inset-[10%] rounded-full border-2 border-dashed border-primary/25 bg-white/30 shadow-[inset_0_0_0_1px_rgba(37,99,235,0.04)]"
          animate={reducedMotion ? undefined : { rotate: orbitRotation }}
          transition={orbitTransition}
        >
          <div className="absolute inset-[16%] rounded-full border border-primary/10" />
          <div className="absolute inset-[31%] rounded-full border border-primary/10" />
        </motion.div>

        <div className="absolute left-1/2 top-1/2 z-10 flex h-32 w-32 sm:h-36 sm:w-36 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full px-4 text-center text-base font-bold text-white bg-primary shadow-lg">
          إدارة الأسطول
        </div>

        <motion.div
          className="pointer-events-none absolute inset-[10%]"
          animate={reducedMotion ? undefined : { rotate: orbitRotation }}
          transition={orbitTransition}
        >
          {fleetFeatures.map((feature, index) => {
            const angle = (index * 360) / fleetFeatures.length - 90;
            const radians = (angle * Math.PI) / 180;
            const left = 50 + Math.cos(radians) * 42;
            const top = 50 + Math.sin(radians) * 42;
            const Icon = feature.icon;
            const entryDelay = index * 0.1;
            const tooltipId = `feature-tooltip-${index}`;

            return (
              <div
                className="absolute"
                key={feature.title}
                role="listitem"
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <motion.div
                  aria-describedby={tooltipId}
                  aria-label={feature.title}
                  className="group pointer-events-auto relative rounded-2xl border border-[#10202F]/15 bg-white/95 p-3 sm:p-4 max-[430px]:p-2.5 text-center shadow-md backdrop-blur-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary hover:border-primary/40 transition-colors cursor-pointer"
                  initial={
                    reducedMotion
                      ? false
                      : { opacity: 0, scale: 0.82, y: 14, rotate: 0 }
                  }
                  animate={
                    reducedMotion
                      ? { opacity: 1, scale: 1, y: 0, rotate: 0 }
                      : {
                          opacity: 1,
                          scale: 1,
                          y: 0,
                          rotate: counterRotation,
                        }
                  }
                  transition={
                    reducedMotion
                      ? { duration: 0 }
                      : {
                          rotate: orbitTransition,
                          opacity: {
                            delay: entryDelay,
                            duration: 0.52,
                            ease: entryEase,
                          },
                          scale: {
                            delay: entryDelay,
                            duration: 0.52,
                            ease: entryEase,
                          },
                          y: {
                            delay: entryDelay,
                            duration: 0.52,
                            ease: entryEase,
                          },
                        }
                  }
                  whileFocus={reducedMotion ? undefined : { scale: 1.06 }}
                  whileHover={reducedMotion ? undefined : { scale: 1.06 }}
                  tabIndex={0}
                >
                  <motion.span
                    aria-hidden="true"
                    className="mx-auto mb-1.5 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"
                    whileFocus={reducedMotion ? undefined : { rotate: 6, scale: 1.1 }}
                    whileHover={reducedMotion ? undefined : { rotate: 6, scale: 1.1 }}
                  >
                    <Icon size={22} strokeWidth={1.9} />
                  </motion.span>
                  <span className="block whitespace-nowrap text-[13px] max-[430px]:text-[12px] font-bold text-ink leading-[1.35]">
                    {feature.title}
                  </span>
                  <span
                    className="absolute top-[calc(100%+10px)] left-1/2 -translate-x-1/2 -translate-y-1 group-hover:translate-y-0 group-focus-visible:translate-y-0 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 invisible group-hover:visible group-focus-visible:visible pointer-events-none z-20 w-max max-w-[190px] min-w-[150px] max-[520px]:max-w-[170px] max-[520px]:min-w-[132px] rounded-[10px] bg-ink border border-white/10 p-2.5 max-[520px]:p-2 text-right text-[11px] max-[520px]:text-[10px] font-medium leading-[1.55] text-white shadow-[0_12px_24px_rgba(16,32,47,0.16)] transition-all duration-180 before:content-[''] before:absolute before:-top-1.5 before:left-[calc(50%-5px)] before:w-0 before:h-0 before:border-x-[5px] before:border-x-transparent before:border-b-[5px] before:border-b-ink motion-reduce:transition-none"
                    id={tooltipId}
                    role="tooltip"
                  >
                    {feature.description}
                  </span>
                </motion.div>
              </div>
            );
          })}
        </motion.div>
      </motion.div>

      {showSignals && (
        <div
          className="flex flex-wrap items-center justify-center gap-2 max-[520px]:flex-col max-[520px]:items-stretch mt-2.5 max-w-[620px] max-[520px]:max-w-[280px]"
          aria-label="مزايا المنصة الرئيسية"
        >
          <div className="inline-flex items-center justify-center gap-1.5 min-h-[30px] px-2.5 py-1 text-[10px] leading-[1.35] text-muted rounded-full bg-white/70 border border-primary/15 [&>svg]:text-primary [&>svg]:shrink-0">
            <Gauge aria-hidden="true" size={18} strokeWidth={1.9} />
            <span>رؤية موحدة لأسطولك</span>
          </div>
          <div className="inline-flex items-center justify-center gap-1.5 min-h-[30px] px-2.5 py-1 text-[10px] leading-[1.35] text-muted rounded-full bg-white/70 border border-primary/15 [&>svg]:text-primary [&>svg]:shrink-0">
            <BellRing aria-hidden="true" size={18} strokeWidth={1.9} />
            <span>تنبيهات في الوقت المناسب</span>
          </div>
          <div className="inline-flex items-center justify-center gap-1.5 min-h-[30px] px-2.5 py-1 text-[10px] leading-[1.35] text-muted rounded-full bg-white/70 border border-primary/15 [&>svg]:text-primary [&>svg]:shrink-0">
            <Route aria-hidden="true" size={18} strokeWidth={1.9} />
            <span>متابعة أسهل للعمليات</span>
          </div>
        </div>
      )}
    </div>
  );
}
