"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { getAuthAwarePath } from "@/lib/auth-redirect";

type BillingCycle = "monthly" | "yearly";

type Tier = {
  name: string;
  subtitle: string;
  idealFor: string;
  monthlyPrice: number | null;
  yearlyPrice: number | null;
  badge?: string;
  highlight?: boolean;
  outcome: string;
  features: string[];
  cta: string;
};

const tiers: Tier[] = [
  {
    name: "Free",
    subtitle: "For validating multilingual demand",
    idealFor: "Indie teams and early-stage products",
    monthlyPrice: 0,
    yearlyPrice: 0,
    outcome: "See where localization breaks user trust before you scale.",
    features: [
      "2 connected apps",
      "Latest 200 reviews",
      "Top 5 locale intelligence",
      "5 AI analysis runs",
      "Basic sentiment overview",
    ],
    cta: "Start Free",
  },
  {
    name: "Pro",
    subtitle: "For product and growth teams shipping globally",
    idealFor: "Scaling SaaS teams with international revenue",
    monthlyPrice: 49,
    yearlyPrice: 39,
    badge: "Most Popular",
    highlight: true,
    outcome: "Prioritize high-impact fixes and recover conversion faster.",
    features: [
      "Unlimited historical reviews",
      "140+ locale intelligence coverage",
      "Unlimited AI executive briefs",
      "Opportunity scoring + impact model",
      "Priority market recommendations",
      "Realtime ingestion sync",
    ],
    cta: "Upgrade to Pro",
  },
  {
    name: "Scale",
    subtitle: "For multi-product and enterprise operations",
    idealFor: "Global orgs with complex localization workflows",
    monthlyPrice: 149,
    yearlyPrice: 119,
    outcome: "Unify global insights across products, teams, and regions.",
    features: [
      "Everything in Pro",
      "Advanced webhook throughput",
      "Dedicated glossary governance",
      "Custom compliance and SLA",
      "Team workflow controls",
      "Success architect onboarding",
    ],
    cta: "Talk to Sales",
  },
];

export function Pricing() {
  const [billing, setBilling] = useState<BillingCycle>("monthly");
  const { data: session } = useSession();
  const isAuthenticated = Boolean(session?.user);

  const pricing = useMemo(
    () =>
      tiers.map((tier) => {
        const value = billing === "monthly" ? tier.monthlyPrice : tier.yearlyPrice;
        return {
          ...tier,
          price: value,
        };
      }),
    [billing]
  );

  return (
    <section id="pricing" className="kivo-section-dark relative overflow-hidden py-32 text-white">
      <div className="absolute -left-12 top-20 h-[280px] w-[280px] rounded-full bg-blue-500/20 blur-[100px]" />
      <div className="absolute -right-8 bottom-12 h-[260px] w-[260px] rounded-full bg-emerald-400/20 blur-[100px]" />

      <div className="container relative mx-auto px-4 md:px-6">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-3 text-sm font-semibold uppercase tracking-wide text-blue-200"
          >
            Pricing
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-extrabold tracking-tight md:text-5xl"
          >
            Pricing built for measurable localization ROI
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-5 max-w-2xl text-lg text-slate-300"
          >
            Start free, prove impact, then scale into premium intelligence that protects retention and lifts conversion.
          </motion.p>

          <div className="mt-8 inline-flex rounded-full border border-white/20 bg-white/5 p-1">
            <button
              onClick={() => setBilling("monthly")}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                billing === "monthly" ? "bg-white text-slate-900" : "text-slate-300"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                billing === "yearly" ? "bg-white text-slate-900" : "text-slate-300"
              }`}
            >
              Yearly (Save 20%)
            </button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {pricing.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className={tier.highlight ? "md:-translate-y-2" : ""}
            >
              <div
                className={`flex h-full flex-col rounded-[28px] border p-7 ${
                  tier.highlight
                    ? "border-blue-300/55 bg-white/[0.11] shadow-[0_0_0_1px_rgba(96,165,250,0.32)]"
                    : "border-white/10 bg-white/[0.04]"
                }`}
              >
                <div className="mb-7">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-300">{tier.name}</p>
                    {tier.badge ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-300/20 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                        <Crown className="h-3 w-3" /> {tier.badge}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-sm text-slate-300">{tier.subtitle}</p>
                  <p className="mt-1 text-xs text-slate-400">{tier.idealFor}</p>
                  <div className="mt-4 flex items-end gap-1">
                    {tier.price === null ? (
                      <span className="text-4xl font-extrabold">Custom</span>
                    ) : (
                      <>
                        <span className="text-5xl font-extrabold">${tier.price}</span>
                        <span className="mb-2 text-sm text-slate-400">/mo</span>
                      </>
                    )}
                  </div>
                  {billing === "yearly" && tier.price !== null ? (
                    <p className="mt-1 text-xs text-emerald-300">Billed annually</p>
                  ) : null}
                </div>

                <div className="mb-5 rounded-xl border border-white/15 bg-white/[0.03] p-3 text-xs text-slate-200">
                  {tier.outcome}
                </div>

                <div className="flex-1 space-y-3">
                  {tier.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3 text-sm text-slate-200">
                      <span className="rounded-full bg-white/10 p-1">
                        <Check className="h-3.5 w-3.5 text-blue-300" />
                      </span>
                      {feature}
                    </div>
                  ))}
                </div>

                <Button
                    className={`mt-8 h-12 rounded-xl text-sm font-bold ${tier.highlight ? "kivo-primary-btn border-none" : "border border-white/20 bg-white/10 text-white hover:bg-white/15"}`}
                    onClick={() => {
                      window.location.href = getAuthAwarePath(isAuthenticated, "/login");
                    }}
                  >
                    {tier.cta}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-white/15 bg-white/[0.03] p-5 text-center text-sm text-slate-300">
          <p className="inline-flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-300" />
            Teams using Kivo typically surface top localization growth opportunities in under 30 minutes.
          </p>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 text-xs md:grid-cols-3">
          <div className="rounded-xl border border-white/15 bg-white/[0.03] p-3 text-slate-300">No credit card required on Free</div>
          <div className="rounded-xl border border-white/15 bg-white/[0.03] p-3 text-slate-300">Cancel anytime, no lock-in contracts</div>
          <div className="rounded-xl border border-white/15 bg-white/[0.03] p-3 text-slate-300">Powered by Lingo.dev translation engine</div>
        </div>
      </div>
    </section>
  );
}
