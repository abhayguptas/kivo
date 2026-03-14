"use client";

import { motion } from "framer-motion";
import { BarChart3, Globe, Languages, MessageSquareText, ShieldCheck, Sparkles, Target, Zap } from "lucide-react";

const features = [
  {
    title: "Market Risk Detection",
    description: "Cluster multilingual complaints into clear localization risks by region and product surface.",
    icon: Target,
    color: "rose",
  },
  {
    title: "Revenue Impact Modeling",
    description: "Estimate conversion and churn impact before prioritizing fixes so teams focus on what moves MRR.",
    icon: BarChart3,
    color: "emerald",
  },
  {
    title: "Realtime Ingestion",
    description: "Connect App Store, webhook, and support streams into one continuously updating intelligence layer.",
    icon: Globe,
    color: "blue",
  },
  {
    title: "AI Prioritization",
    description: "Turn thousands of reviews into concise executive summaries, roadmap actions, and opportunity queues.",
    icon: Sparkles,
    color: "indigo",
  },
  {
    title: "Locale Confidence Scoring",
    description: "Score every locale on sentiment, volume, and quality to identify where translation quality hurts growth.",
    icon: Languages,
    color: "sky",
  },
  {
    title: "Localized Response Ops",
    description: "Draft in your language and send culturally adapted replies back in the customer's native language.",
    icon: MessageSquareText,
    color: "amber",
  },
  {
    title: "Premium Conversion Gates",
    description: "Monetize insights with strategic usage limits and contextual upgrade prompts tied to business value.",
    icon: Zap,
    color: "violet",
  },
  {
    title: "Enterprise-Ready Security",
    description: "Secure-by-default architecture with audit-friendly workflows and scalable data isolation.",
    icon: ShieldCheck,
    color: "cyan",
  },
];

const colorMap: Record<string, string> = {
  blue: "bg-blue-500/12 text-blue-700",
  amber: "bg-amber-500/12 text-amber-700",
  emerald: "bg-emerald-500/12 text-emerald-700",
  indigo: "bg-blue-500/12 text-blue-700",
  sky: "bg-cyan-500/12 text-cyan-700",
  rose: "bg-blue-500/12 text-blue-700",
  violet: "bg-emerald-500/12 text-emerald-700",
  cyan: "bg-cyan-500/12 text-cyan-700",
};

export function Features() {
  return (
    <section id="features" className="kivo-section-light relative overflow-hidden py-32">
      <div className="absolute -right-24 top-0 h-[480px] w-[480px] rounded-full bg-blue-100/25 blur-[130px]" />
      <div className="absolute -left-24 bottom-0 h-[480px] w-[480px] rounded-full bg-emerald-100/25 blur-[130px]" />

      <div className="container relative mx-auto px-4 md:px-6">
        <div className="mx-auto mb-20 max-w-3xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-3 text-sm font-semibold uppercase tracking-wide text-blue-700"
          >
            Product Capabilities
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl"
          >
            Built for teams that localize as a growth function
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-xl leading-relaxed text-slate-600"
          >
            Kivo goes beyond translation. It surfaces what is broken by market, quantifies impact, and gives teams a clear path to fix it.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, duration: 0.45, ease: "easeOut" }}
            >
              <div className="kivo-card flex h-full flex-col items-start gap-4 rounded-[30px] border border-slate-200/70 p-8 transition-all duration-300 hover:-translate-y-2 hover:border-blue-300/50 hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)]">
                <div className={`rounded-2xl p-3 ${colorMap[feature.color]}`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-[19px] font-bold text-slate-900">{feature.title}</h3>
                <p className="text-[15px] leading-relaxed text-slate-600">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
