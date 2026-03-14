"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Globe, TrendingUp, Users } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type ProofMetricsProps = {
  liveProof?: {
    mode: "live" | "simulated";
    reason: string;
    metrics: {
      totalReviews: number;
      locales: number;
      mrrLiftPct: number;
      churnRiskPct: number;
      localeConfidence: number;
    };
  } | null;
};

const retentionTimeline = [
  { week: "W1", baseline: 62, withKivo: 66 },
  { week: "W2", baseline: 60, withKivo: 71 },
  { week: "W3", baseline: 58, withKivo: 75 },
  { week: "W4", baseline: 61, withKivo: 79 },
  { week: "W5", baseline: 59, withKivo: 82 },
  { week: "W6", baseline: 57, withKivo: 85 },
];

const frictionByMarket = [
  { market: "Japan", resolved: 72 },
  { market: "Germany", resolved: 61 },
  { market: "France", resolved: 56 },
  { market: "Spain", resolved: 49 },
];

export function ProofMetrics({ liveProof }: ProofMetricsProps) {
  const mode = liveProof?.mode ?? "simulated";
  const metrics = [
    {
      label: "Projected MRR Lift",
      value: `+${liveProof?.metrics.mrrLiftPct ?? 14.2}%`,
      sub: mode === "live" ? "Derived from your workspace evidence" : "When top localization friction is resolved",
      icon: TrendingUp,
      tone: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Churn Risk",
      value: `${liveProof?.metrics.churnRiskPct ?? 31}%`,
      sub: mode === "live" ? "Current risk index from live sentiment" : "Estimated benchmark risk before remediation",
      icon: Globe,
      tone: "text-blue-600 bg-blue-50",
    },
    {
      label: "Locale Confidence",
      value: `${liveProof?.metrics.localeConfidence ?? 88}%`,
      sub: mode === "live" ? "Translation confidence for cross-market comparability" : "Expected confidence with guided normalization",
      icon: Users,
      tone: "text-cyan-700 bg-cyan-50",
    },
    {
      label: "Signal Processing",
      value: liveProof?.metrics.totalReviews ? `${liveProof.metrics.totalReviews}` : "10k+",
      sub: mode === "live" ? `Live reviews across ${liveProof?.metrics.locales ?? 0} locales` : "Feedback items analyzed per month on Pro",
      icon: ArrowUpRight,
      tone: "text-blue-700 bg-blue-50",
    },
  ];

  return (
    <section className="kivo-section-light relative overflow-hidden py-24">
      <div className="absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-100/40 blur-[90px]" />
      <div className="container relative mx-auto px-4 md:px-6">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-3 text-sm font-semibold uppercase tracking-wide text-blue-700"
          >
            Proof Metrics
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl"
          >
            Localization quality is a growth lever, not a support afterthought
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
              className="kivo-card rounded-2xl border border-slate-200/70 bg-white p-5"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className={`rounded-xl p-2 ${metric.tone}`}>
                  <metric.icon className="h-4 w-4" />
                </span>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Observed</p>
              </div>
              <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">{metric.label}</p>
              <h3 className="mt-1 text-3xl font-bold text-slate-900">{metric.value}</h3>
              <p className="mt-2 text-xs text-slate-500">{metric.sub}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="kivo-card rounded-3xl border border-slate-200/70 bg-white p-6 md:p-8"
          >
            <div className="mb-5 flex flex-col gap-1">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">6-Week Outcome Simulation</p>
              <h3 className="text-xl font-bold text-slate-900">Retention lift after localization fixes</h3>
            </div>
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240}>
                <AreaChart data={retentionTimeline}>
                  <defs>
                    <linearGradient id="kivoRetention" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="week" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} width={26} />
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", borderColor: "#e2e8f0", fontSize: "12px" }}
                    formatter={(value, key) => {
                      const numeric = typeof value === "number" ? value : Number(value ?? 0);
                      return [`${numeric}%`, key === "withKivo" ? "With Kivo" : "Baseline"];
                    }}
                  />
                  <Area type="monotone" dataKey="baseline" stroke="#94a3b8" fill="#e2e8f0" fillOpacity={0.35} strokeWidth={2} />
                  <Area type="monotone" dataKey="withKivo" stroke="#2563eb" fill="url(#kivoRetention)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.28 }}
            className="kivo-card rounded-3xl border border-slate-200/70 bg-white p-6 md:p-8"
          >
            <div className="mb-5 flex flex-col gap-1">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Proof Of Impact</p>
              <h3 className="text-xl font-bold text-slate-900">Localization friction resolved by market</h3>
            </div>
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240}>
                <BarChart data={frictionByMarket}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="market" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} width={26} />
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", borderColor: "#e2e8f0", fontSize: "12px" }}
                    formatter={(value) => {
                      const numeric = typeof value === "number" ? value : Number(value ?? 0);
                      return [`${numeric}%`, "Resolved friction"];
                    }}
                  />
                  <Bar dataKey="resolved" fill="#2563eb" radius={[8, 8, 0, 0]} maxBarSize={52} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        <p className="mt-4 text-center text-xs text-slate-500">
          {mode === "live"
            ? liveProof?.reason || "Live proof mode active."
            : "Simulated benchmark based on multilingual SaaS datasets and Kivo guided-remediation scenarios."}
        </p>
      </div>
    </section>
  );
}
