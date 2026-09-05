"use client";

import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "../hooks/motion";
import { subscriptionPlans } from "../constants/subscription-data";

type SubscriptionPlanGridProps = {
  plans?: typeof subscriptionPlans;
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function SubscriptionPlanGrid({ plans = subscriptionPlans }: SubscriptionPlanGridProps) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <motion.div
      className="grid grid-cols-3 max-[920px]:grid-cols-2 max-[700px]:grid-cols-1 items-stretch gap-5 max-w-[1040px] mx-auto mt-[42px] max-[700px]:mt-[34px] pt-3.5"
      initial={reducedMotion ? false : "hidden"}
      whileInView={reducedMotion ? undefined : "visible"}
      viewport={{ once: true, amount: 0.15 }}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
    >
      {plans.map((plan, index) => (
        <motion.article
          className={`relative flex flex-col min-h-[390px] p-7 rounded-[20px] bg-white border border-[#10202F]/15 shadow-sm transition-all duration-180 ease-out hover:border-primary/45 hover:shadow-lg [&:last-child]:max-[920px]:col-span-full [&:last-child]:max-[920px]:justify-self-center [&:last-child]:max-[920px]:w-[calc(50%-10px)] [&:last-child]:max-[700px]:w-auto [&:last-child]:max-[700px]:col-auto motion-reduce:transition-none ${
            plan.featured
              ? "border-primary shadow-[0_16px_34px_-24px_rgba(15,118,110,0.34)] -mt-2 mb-2 max-[920px]:my-0"
              : ""
          }`}
          key={plan.name}
          variants={cardVariants}
          transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          whileHover={reducedMotion ? undefined : { y: -4 }}
        >
          {plan.featured && (
            <span className="self-start px-[11px] py-1.5 mb-4 text-[11px] font-extrabold text-white bg-primary rounded-full">
              الأكثر شعبية
            </span>
          )}
          <div>
            <h3 className="text-ink text-[21px] font-extrabold m-0">
              {plan.name}
            </h3>
            <p className="text-muted text-[13px] mt-2 m-0">
              {plan.audience}
            </p>
          </div>
          <div className="flex items-baseline gap-2 min-h-[48px] my-7" aria-label={`سعر ${plan.name}`}>
            <strong
              className={`text-primary font-extrabold leading-none ${
                index === 0
                  ? "text-[30px] tracking-[-0.02em]"
                  : "text-[42px] tracking-[-0.04em]"
              }`}
            >
              {plan.price}
            </strong>
            {plan.currency && (
              <span className="text-muted text-[11px] leading-[1.3] max-w-[76px]">
                {plan.currency}
              </span>
            )}
          </div>
          <div className="w-full h-px bg-[#10202F]/15 mb-[22px]" />
          <ul className="grid gap-3 list-none p-0 m-0 mb-7" aria-label={`مزايا ${plan.name}`}>
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2.5 text-text text-[13px] leading-[1.45]">
                <Check aria-hidden="true" size={16} strokeWidth={2.5} className="text-primary shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <a
            className="mt-auto flex items-center justify-center min-h-[46px] px-4 py-2.5 text-[14px] font-extrabold text-white bg-primary hover:bg-primary-hover border border-primary hover:border-primary-hover rounded-[10px] no-underline transition-all duration-180 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-[3px] motion-reduce:transition-none"
            href="/login"
          >
            {plan.cta}
          </a>
        </motion.article>
      ))}
    </motion.div>
  );
}
