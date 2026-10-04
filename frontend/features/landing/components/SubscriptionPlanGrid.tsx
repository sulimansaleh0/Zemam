"use client";

import React from "react";
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { subscriptionPlans } from "../constants/subscription-data";

type SubscriptionPlanGridProps = {
  plans?: typeof subscriptionPlans;
};

export function SubscriptionPlanGrid({
  plans = subscriptionPlans,
}: SubscriptionPlanGridProps) {
  return (
    <div className="grid grid-cols-3 max-[920px]:grid-cols-1 items-stretch gap-7 max-w-[1100px] mx-auto pt-4 [direction:rtl]">
      {plans.map((plan) => {
        const isFeatured = plan.featured;

        return (
          <article
            key={plan.name}
            className={`relative flex flex-col rounded-[24px] p-8 transition-all duration-200 ${
              isFeatured
                ? "bg-[#041131] text-white shadow-[0_20px_45px_rgba(4,17,49,0.35)] ring-2 ring-[#195CF1] -translate-y-2 max-[920px]:translate-y-0"
                : "bg-white text-[#0F172A] border border-[#E2E8F4] shadow-sm hover:shadow-md hover:border-primary/40"
            }`}
          >
            {/* Top Most Popular Badge */}
            {isFeatured && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#195CF1] text-white text-[12px] font-black px-4 py-1 rounded-full shadow flex items-center gap-1.5 uppercase tracking-wide">
                <Sparkles size={13} className="fill-white" />
                <span>الأكثر طلباً</span>
              </div>
            )}

            {/* Plan Title & Audience */}
            <div className="mb-6">
              <h3
                className={`text-[22px] font-black m-0 ${
                  isFeatured ? "text-white" : "text-[#0F172A]"
                }`}
              >
                {plan.name}
              </h3>
              <p
                className={`text-[14px] mt-1.5 m-0 font-medium ${
                  isFeatured ? "text-[#94A3B8]" : "text-[#64748B]"
                }`}
              >
                {plan.audience}
              </p>
            </div>

            {/* Price Tag */}
            <div className="flex items-baseline gap-2 mb-6">
              <span
                className={`text-[44px] font-black tracking-tight leading-none ${
                  isFeatured ? "text-white" : "text-[#195CF1]"
                }`}
              >
                {plan.price}
              </span>
              {plan.currency && (
                <span
                  className={`text-[13px] font-bold ${
                    isFeatured ? "text-[#94A3B8]" : "text-[#64748B]"
                  }`}
                >
                  {plan.currency}
                </span>
              )}
            </div>

            {/* Divider */}
            <div
              className={`w-full h-px mb-6 ${
                isFeatured ? "bg-[#162858]" : "bg-[#F1F5F9]"
              }`}
            />

            {/* Features List */}
            <ul className="space-y-3.5 list-none p-0 m-0 mb-8 flex-1">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                      isFeatured
                        ? "bg-[#195CF1]/20 text-[#60A5FA]"
                        : "bg-[#195CF1]/10 text-primary"
                    }`}
                  >
                    <Check size={13} strokeWidth={3} />
                  </span>
                  <span
                    className={`text-[14px] font-medium leading-[1.5] ${
                      isFeatured ? "text-[#DDE6FA]" : "text-[#334155]"
                    }`}
                  >
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            {/* Action CTA Button */}
            <Link
              href="/login"
              className={`w-full py-3.5 px-6 rounded-xl text-center text-[15px] font-black transition-all duration-150 no-underline shadow-sm hover:shadow ${
                isFeatured
                  ? "bg-[#195CF1] text-white hover:bg-[#144AC8] hover:shadow-lg hover:shadow-[#195CF1]/25"
                  : "bg-[#041131] hover:bg-[#081B4B] text-white"
              }`}
            >
              {plan.cta}
            </Link>
          </article>
        );
      })}
    </div>
  );
}
