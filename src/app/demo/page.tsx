"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Crown,
  Globe,
  Lock,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { batchTranslateFeedback } from "@/app/actions/translate";
import { completeDemo, getUserStatus } from "@/app/actions/user";

type ScenarioFeedback = {
  id: number;
  sourceLocale: string;
  sourceText: string;
  translatedText: string;
  sentiment: "positive" | "negative" | "mixed";
  user: string;
  market: string;
};

const baseFeedback: ScenarioFeedback[] = [
  {
    id: 1,
    sourceLocale: "ja",
    sourceText: "請求画面の翻訳が分かりにくく、途中で解約しました。",
    translatedText: "Billing screen translation was unclear, so I churned during checkout.",
    sentiment: "negative",
    user: "Aiko M.",
    market: "Japan",
  },
  {
    id: 2,
    sourceLocale: "de",
    sourceText: "Die App ist stark, aber einige Überschriften sind abgeschnitten.",
    translatedText: "The app is strong, but some translated headers are clipped.",
    sentiment: "mixed",
    user: "Jonas R.",
    market: "Germany",
  },
  {
    id: 3,
    sourceLocale: "fr",
    sourceText: "Le support est rapide, mais le paiement échoue souvent.",
    translatedText: "Support is fast, but payment fails too often.",
    sentiment: "negative",
    user: "Claire D.",
    market: "France",
  },
  {
    id: 4,
    sourceLocale: "es",
    sourceText: "Gran producto, aunque la versión móvil tarda en cargar.",
    translatedText: "Great product, though mobile load time is slow.",
    sentiment: "mixed",
    user: "Diego S.",
    market: "Spain",
  },
];

const trendData = [
  { label: "W1", reviews: 120, sentiment: 58 },
  { label: "W2", reviews: 135, sentiment: 61 },
  { label: "W3", reviews: 148, sentiment: 65 },
  { label: "W4", reviews: 167, sentiment: 68 },
  { label: "W5", reviews: 185, sentiment: 73 },
  { label: "W6", reviews: 214, sentiment: 78 },
];

const localeImpactData = [
  { locale: "JA", impact: 7.2 },
  { locale: "FR", impact: 4.9 },
  { locale: "DE", impact: 3.6 },
  { locale: "ES", impact: 2.7 },
  { locale: "PT", impact: 2.1 },
];

const freeLocaleCoverage = [
  { name: "Unlocked (Top 5)", value: 5, color: "#315bf0" },
  { name: "Locked", value: 135, color: "#cbd5e1" },
];

const fullLocaleCoverage = [
  { name: "Unlocked", value: 140, color: "#315bf0" },
];

const scenarioSteps = [
  "Ingest multilingual feedback",
  "Normalize with Lingo.dev translation",
  "Generate risk and impact analytics",
  "Unlock premium opportunity board",
];

export default function DemoPage() {
  const router = useRouter();
  const [stage, setStage] = useState<0 | 1 | 2 | 3>(0);
  const [feedback, setFeedback] = useState<ScenarioFeedback[]>(baseFeedback);
  const [translating, setTranslating] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [narrativeMode, setNarrativeMode] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkAccess = async () => {
      try {
        const user = await getUserStatus();

        if (!mounted) return;

        if (!user) {
          router.replace("/login");
          return;
        }

        if (user.hasCompletedDemo) {
          router.replace("/dashboard");
          return;
        }

        setCheckingAccess(false);
      } catch (error) {
        console.error("Failed to verify demo access", error);
        if (mounted) router.replace("/login");
      }
    };

    void checkAccess();

    return () => {
      mounted = false;
    };
  }, [router]);

  const metrics = useMemo(() => {
    const total = feedback.length;
    const negatives = feedback.filter((item) => item.sentiment === "negative").length;

    return {
      total,
      negatives,
      opportunities: [
        { market: "Japan", impact: 7.2, issue: "Billing localization confusion" },
        { market: "France", impact: 4.9, issue: "Payment method messaging mismatch" },
        { market: "Germany", impact: 3.6, issue: "UI copy overflow in headers" },
      ],
    };
  }, [feedback]);

  const handleTranslate = async () => {
    setTranslating(true);
    try {
      const payload = feedback.map((item) => ({ text: item.sourceText, sourceLocale: item.sourceLocale }));
      const result = await batchTranslateFeedback(payload, "en");

      const normalized = feedback.map((item, index) => ({
        ...item,
        translatedText: (result[index] as { text?: string })?.text || item.translatedText,
      }));

      setFeedback(normalized);
      setStage(1);
    } catch (error) {
      console.error(error);
      setStage(1);
    } finally {
      setTranslating(false);
    }
  };

  const handleUnlockPremium = async () => {
    setUnlocking(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setUnlocking(false);
    setStage(3);
  };

  const handleFinish = async () => {
    await completeDemo();
    router.push("/dashboard");
  };

  const runNarrative = async () => {
    if (narrativeMode) return;
    setNarrativeMode(true);
    try {
      if (stage === 0) {
        await handleTranslate();
      }
      await new Promise((resolve) => setTimeout(resolve, 30000));
      setStage((prev) => (prev < 2 ? 2 : prev));
      await new Promise((resolve) => setTimeout(resolve, 30000));
      await handleUnlockPremium();
    } finally {
      setNarrativeMode(false);
    }
  };

  if (checkingAccess) {
    return (
      <div className="kivo-section-light flex min-h-screen items-center justify-center">
        <div className="kivo-card rounded-2xl border border-slate-200/70 bg-white px-6 py-4 text-sm font-medium text-slate-600 shadow-sm">
          Preparing your guided demo...
        </div>
      </div>
    );
  }

  return (
    <div className="kivo-section-light min-h-screen p-4 md:p-6">
      <div className="kivo-surface mx-auto max-w-6xl space-y-7 rounded-[30px] p-5 md:p-7">
        <section className="kivo-hero-gradient relative overflow-hidden rounded-3xl border border-slate-200/70 p-7 text-white shadow-[0_24px_70px_rgba(17,32,73,0.26)]">
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-emerald-300/25 blur-3xl" />
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-100">
                <Sparkles className="mr-2 h-3.5 w-3.5" /> Guided Premium Simulation
              </p>
              <h1 className="text-3xl font-bold">Kivo Revenue Intelligence Demo</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-100/90">
                Story flow: ingest global feedback, normalize with Lingo.dev, quantify market risk, then unlock premium playbooks.
              </p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-emerald-100">
                Translation fidelity powered by Lingo.dev for cross-market comparability
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={runNarrative}
                disabled={narrativeMode}
                variant="outline"
                className="kivo-secondary-btn rounded-xl"
              >
                {narrativeMode ? "Running 90s story..." : "Start 90s Narrative"}
              </Button>
              {stage === 0 ? (
                <Button
                  onClick={handleTranslate}
                  disabled={translating}
                  className="kivo-primary-btn rounded-xl"
                >
                  {translating ? "Normalizing..." : "Step 1: Normalize Feedback"}
                  {translating ? null : <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              ) : null}

              {stage >= 1 && stage < 2 ? (
                <Button onClick={() => setStage(2)} className="kivo-primary-btn rounded-xl">
                  Step 2: Build Analytics <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : null}

              {stage === 3 ? (
                <Button onClick={handleFinish} className="kivo-primary-btn rounded-xl">
                  Finish Demo <CheckCircle2 className="ml-2 h-4 w-4" />
                </Button>
              ) : null}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="kivo-card rounded-2xl border-slate-200/70 bg-white lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-700" /> Multilingual Inbox
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {feedback.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-200/70 bg-white/75 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Badge variant="outline" className="kivo-pill border-slate-200 text-xs uppercase text-slate-600">
                      {item.sourceLocale}
                    </Badge>
                    <span className="text-xs font-semibold text-slate-500">{item.market}</span>
                    <span className="text-xs text-slate-400">{item.user}</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{stage > 0 ? item.translatedText : item.sourceText}</p>
                  {stage > 0 ? <p className="mt-2 text-xs italic text-slate-500">Original: {item.sourceText}</p> : null}
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="kivo-card rounded-2xl border-slate-200/70 bg-white">
              <CardHeader>
                <CardTitle className="text-base">Live Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="rounded-lg border border-slate-200/70 bg-white/75 p-3 flex items-center justify-between">
                  <span className="text-slate-500">Feedback processed</span>
                  <span className="font-bold text-slate-900">{metrics.total}</span>
                </div>
                <div className="rounded-lg border border-slate-200/70 bg-white/75 p-3 flex items-center justify-between">
                  <span className="text-slate-500">Negative signals</span>
                  <span className="font-bold text-red-600">{metrics.negatives}</span>
                </div>
                <div className="rounded-lg border border-slate-200/70 bg-white/75 p-3 flex items-center justify-between">
                  <span className="text-slate-500">Projected MRR lift</span>
                  <span className="font-bold text-emerald-600">+14.2%</span>
                </div>
              </CardContent>
            </Card>

            <Card className="kivo-card rounded-2xl border-slate-200/70 bg-white">
              <CardHeader>
                <CardTitle className="text-base">Stage Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                {scenarioSteps.map((label, index) => (
                  <div key={label} className="flex items-center gap-2 rounded-lg border border-slate-200/70 bg-white/75 px-3 py-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${stage >= index ? "bg-emerald-500" : "bg-slate-300"}`} />
                    <span className="text-slate-600">{label}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {stage >= 2 ? (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <Card className="kivo-card rounded-2xl border-slate-200/70 bg-white lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4 text-blue-700" /> Review Volume and Sentiment Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={260}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis
                        yAxisId="left"
                        tick={{ fill: "#64748b", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        width={28}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        domain={[50, 85]}
                        tick={{ fill: "#64748b", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        width={28}
                      />
                      <Tooltip
                        contentStyle={{ borderRadius: "12px", borderColor: "#e2e8f0", fontSize: "12px" }}
                        formatter={(value, key) => {
                          const numeric = typeof value === "number" ? value : Number(value ?? 0);
                          if (key === "sentiment") return [`${value} / 100`, "Sentiment index"];
                          return [numeric, "Reviews"];
                        }}
                      />
                      <Line yAxisId="left" type="monotone" dataKey="reviews" stroke="#0f172a" strokeWidth={2.5} dot={false} />
                      <Line yAxisId="right" type="monotone" dataKey="sentiment" stroke="#315bf0" strokeWidth={2.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="kivo-card rounded-2xl border-slate-200/70 bg-white">
              <CardHeader>
                <CardTitle className="text-base">Free Tier Coverage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p className="text-slate-600">
                  Free workspace unlocks only top 5 locales by review volume. Premium reveals full 140+ locale intelligence.
                </p>
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={180}>
                    <PieChart>
                      <Tooltip
                        contentStyle={{ borderRadius: "12px", borderColor: "#e2e8f0", fontSize: "12px" }}
                        formatter={(value, key) => {
                          const numeric = typeof value === "number" ? value : Number(value ?? 0);
                          return [`${numeric}`, String(key)];
                        }}
                      />
                      <Pie
                        data={stage === 3 ? fullLocaleCoverage : freeLocaleCoverage}
                        innerRadius={50}
                        outerRadius={74}
                        dataKey="value"
                        stroke="none"
                        label={({ value }) => `${value}`}
                      >
                        {(stage === 3 ? fullLocaleCoverage : freeLocaleCoverage).map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="rounded-lg border border-slate-200/70 bg-white/75 p-3 text-xs text-slate-500">
                  {stage === 3 ? "Premium unlocked: all supported locales are now available." : "135 locales remain locked on free tier."}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {stage >= 2 ? (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <Card className="kivo-card rounded-2xl border-slate-200/70 bg-white lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="h-4 w-4 text-blue-700" /> Opportunity Impact by Locale
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[240px] w-full">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240}>
                    <BarChart data={stage === 3 ? localeImpactData : localeImpactData.slice(0, 2)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="locale" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} width={26} />
                      <Tooltip
                        contentStyle={{ borderRadius: "12px", borderColor: "#e2e8f0", fontSize: "12px" }}
                        formatter={(value) => {
                          const numeric = typeof value === "number" ? value : Number(value ?? 0);
                          return [`+${numeric}%`, "Projected lift"];
                        }}
                      />
                      <Bar dataKey="impact" fill="#315bf0" radius={[8, 8, 0, 0]} maxBarSize={50} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="kivo-card rounded-2xl border-slate-200/70 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4 text-blue-700" /> Premium Unlock
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-slate-600">
                  Free plan shows only top opportunities. Premium unlocks full locale board, impact model, and execution roadmap.
                </p>

                <div className="space-y-2 text-xs">
                  <div>
                    <div className="mb-1 flex items-center justify-between text-slate-500">
                      <span>AI runs</span>
                      <span>{stage === 3 ? "Unlimited" : "5 / 5"}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div className={`h-2 rounded-full ${stage === 3 ? "w-full bg-emerald-500" : "w-full bg-amber-500"}`} />
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between text-slate-500">
                      <span>Locale insights</span>
                      <span>{stage === 3 ? "140 / 140" : "5 / 140"}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div className={`h-2 rounded-full ${stage === 3 ? "w-full bg-emerald-500" : "w-[4%] bg-blue-600"}`} />
                    </div>
                  </div>
                </div>

                {stage !== 3 ? (
                  <Button onClick={handleUnlockPremium} disabled={unlocking} className="kivo-primary-btn w-full rounded-xl">
                    {unlocking ? <Zap className="mr-2 h-4 w-4 animate-pulse" /> : <Crown className="mr-2 h-4 w-4" />} Simulate Premium Unlock
                  </Button>
                ) : (
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-emerald-700">
                    Premium insights unlocked. Full impact board is now visible.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : null}

        {stage >= 2 ? (
          <Card className="kivo-card rounded-2xl border-slate-200/70 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-4 w-4 text-blue-700" /> Prioritized Opportunity Board
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {metrics.opportunities.map((opportunity, index) => {
                const locked = stage !== 3 && index > 0;

                return (
                  <div
                    key={opportunity.market}
                    className={`rounded-xl border p-4 ${
                      locked ? "border-slate-200 bg-slate-50/60" : "border-emerald-200 bg-emerald-50/60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{opportunity.market}</p>
                        <p className="text-xs text-slate-500">{opportunity.issue}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold uppercase text-slate-400">Projected Lift</p>
                        <p className="text-lg font-bold text-emerald-600">+{opportunity.impact}%</p>
                      </div>
                    </div>
                    {locked ? (
                      <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[10px] font-bold uppercase text-slate-500">
                        <Lock className="h-3 w-3" /> Premium only
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
