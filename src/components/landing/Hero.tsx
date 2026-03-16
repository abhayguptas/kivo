"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Globe2, Sparkles, Languages, Activity, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { getAuthAwarePath } from "@/lib/auth-redirect";
import { useEffect, useState } from "react";

const showcaseCards = [
  {
    flag: "🇯🇵",
    locale: "Japanese",
    nativeLabel: "Original Review",
    nativeText: "支払い画面が遅くて、購入を完了できませんでした。",
    englishText: "Checkout is slow, and users fail to complete purchases.",
    signal: "Checkout friction",
    impact: "+6.4% conversion lift potential",
    accent: "blue",
  },
  {
    flag: "🇩🇪",
    locale: "German",
    nativeLabel: "Original Review",
    nativeText: "Die Übersetzung im Abo-Bereich ist unklar und wirkt unzuverlässig.",
    englishText: "Subscription copy feels unclear and reduces trust.",
    signal: "Retention risk",
    impact: "-12% churn risk if unresolved",
    accent: "emerald",
  },
  {
    flag: "🇮🇳",
    locale: "Hindi",
    nativeLabel: "Original Review",
    nativeText: "ऐप अच्छा है, लेकिन भुगतान विकल्प भारतीय उपयोगकर्ताओं के लिए सीमित हैं।",
    englishText: "Great app, but payment options are limited for India users.",
    signal: "Market expansion opportunity",
    impact: "+14.2% MRR opportunity",
    accent: "amber",
  },
] as const;

export function Hero() {
  const { data: session } = useSession();
  const isAuthenticated = Boolean(session?.user);
  const [activeCard, setActiveCard] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActiveCard((prev) => (prev + 1) % showcaseCards.length);
    }, 2800);
    return () => window.clearInterval(id);
  }, []);

  const toStart = () => {
    window.location.href = getAuthAwarePath(isAuthenticated, "/login");
  };
  const toDemo = () => {
    window.location.href = getAuthAwarePath(isAuthenticated, "/demo");
  };

  return (
    <section className="kivo-section-light relative flex min-h-screen flex-col justify-center overflow-hidden pb-24 pt-32 md:pb-32 md:pt-40">
      {/* Super Premium Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Abstract Mesh Gradients */}
        <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full bg-blue-400/20 blur-[120px]" />
        <div className="absolute right-[-10%] top-[20%] h-[60%] w-[40%] rounded-full bg-emerald-400/12 blur-[150px]" />
        <div className="absolute bottom-[-20%] left-[20%] h-[50%] w-[60%] rounded-full bg-blue-600/10 blur-[150px]" />
        
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      <div className="container relative mx-auto px-4 md:px-6 text-center z-10 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center w-full max-w-5xl"
        >
          <a
            href="https://lingo.dev"
            target="_blank"
            rel="noreferrer"
            className="kivo-pill mb-8 inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium text-slate-700 backdrop-blur-md transition-all hover:bg-white/90"
          >
            <Sparkles className="mr-2 h-4 w-4 text-blue-700" />
            <span>Powered by <strong className="text-slate-900">Lingo.dev</strong> Engine</span>
          </a>

          <h1 className="max-w-5xl text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
            Turn multilingual feedback into
            {" "}
            <br className="hidden md:block" />
            <span className="animate-gradient bg-gradient-to-r from-[#315bf0] via-[#2f6d5a] to-[#315bf0] bg-[length:200%_auto] bg-clip-text text-transparent">
              revenue decisions.
            </span>
          </h1>

          <p className="mt-8 max-w-2xl text-lg md:text-xl text-slate-600 leading-relaxed">
            Kivo pinpoints localization friction across markets, estimates impact on churn and conversion, and gives your team a prioritized action roadmap.
          </p>

          <div className="mt-8 w-full max-w-3xl rounded-3xl border border-slate-200/70 bg-white/70 p-5 text-left shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">From translation to decisions</p>
              <span className="inline-flex w-fit items-center rounded-full border border-blue-200/70 bg-blue-50/70 px-3 py-1 text-[11px] font-semibold text-blue-700">
                Normalization powered by Lingo.dev
              </span>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              {[
                "Normalize feedback across 140+ locales (comparability)",
                "Quantify risk/opportunity by locale with evidence",
                "Generate a prioritized roadmap with impact framing",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2 rounded-2xl border border-slate-200/70 bg-white/75 p-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                  <p className="text-sm font-medium leading-snug text-slate-700">{item}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs font-semibold text-slate-500">
              Not a ticketing tool. Kivo complements Jira, Linear, and Zendesk by prioritizing what to fix next and why.
            </p>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row gap-4 items-center justify-center w-full">
            <Button size="lg" className="kivo-primary-btn h-14 rounded-full px-8 text-base font-semibold transition-all" onClick={toStart}>
              Start Free Intelligence <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="kivo-pill h-14 rounded-full border-slate-200 px-8 text-base font-medium text-slate-700 transition-all hover:bg-white/95" onClick={toDemo}>
              <Globe2 className="mr-2 h-5 w-5 text-slate-500" />
              View Guided Demo
            </Button>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-slate-600">
            <span className="kivo-pill rounded-full border border-blue-200/70 bg-blue-50/70 px-3 py-1">+14.2% projected MRR lift</span>
            <span className="kivo-pill rounded-full border border-slate-200/80 px-3 py-1">140+ locales on premium</span>
            <span className="kivo-pill rounded-full border border-slate-200/80 px-3 py-1">Top-5 locale insights on free</span>
          </div>
        </motion.div>

        {/* Floating Abstract UI Elements to fill space */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-4xl mt-20"
        >
          <div className="pointer-events-none absolute inset-x-10 -bottom-10 z-0 h-20 rounded-full bg-[radial-gradient(circle_at_center,rgba(40,98,255,0.16),rgba(255,255,255,0)_72%)] blur-2xl" />
          
          <div className="relative z-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {showcaseCards.map((card, index) => {
              const isActive = activeCard === index;
              const accentClasses =
                card.accent === "emerald"
                  ? "from-emerald-500/10 to-emerald-100/0 border-emerald-200/60"
                  : card.accent === "amber"
                    ? "from-amber-500/10 to-amber-100/0 border-amber-200/60"
                    : "from-blue-500/10 to-blue-100/0 border-blue-200/60";

              const badgeClasses =
                card.accent === "emerald"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200/80"
                  : card.accent === "amber"
                    ? "bg-amber-50 text-amber-700 border-amber-200/80"
                    : "bg-blue-50 text-blue-700 border-blue-200/80";

              const iconClasses =
                card.accent === "emerald"
                  ? "text-emerald-600"
                  : card.accent === "amber"
                    ? "text-amber-600"
                    : "text-blue-600";

              return (
                <motion.article
                  key={card.locale}
                  initial={{ opacity: 0, y: 28 }}
                  animate={{
                    opacity: 1,
                    y: isActive ? -6 : 0,
                    rotate: index === 1 ? 0 : index === 0 ? -1.4 : 1.4,
                  }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className={`kivo-card relative flex min-h-[292px] flex-col rounded-3xl border bg-gradient-to-b ${accentClasses} p-5 text-left backdrop-blur-xl`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-white/70 bg-white/90 shadow-sm">
                        <span className="text-xl">{card.flag}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{card.locale}</p>
                        <p className="text-[11px] text-slate-500">{card.nativeLabel}</p>
                      </div>
                    </div>
                    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${badgeClasses}`}>
                      Live
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-3.5">
                      <p className="text-[13px] leading-snug text-slate-700">{card.nativeText}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Languages className={`h-4 w-4 ${iconClasses}`} />
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200/80">
                        <motion.div
                          key={`progress-${activeCard}-${card.locale}`}
                          initial={{ x: "-100%" }}
                          animate={{ x: isActive ? ["-100%", "0%"] : "-100%" }}
                          transition={{ duration: 0.55, ease: "easeOut" }}
                          className={`h-full w-full ${
                            card.accent === "emerald"
                              ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
                              : card.accent === "amber"
                                ? "bg-gradient-to-r from-amber-400 to-amber-600"
                                : "bg-gradient-to-r from-blue-400 to-blue-600"
                          }`}
                        />
                      </div>
                    </div>

                    <motion.div
                      animate={{ opacity: isActive ? 1 : 0.8, y: isActive ? 0 : 2 }}
                      transition={{ duration: 0.35 }}
                      className="rounded-2xl border border-slate-200/80 bg-slate-50/95 p-3.5"
                    >
                      <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-400">English Insight</p>
                      <p className="mt-1 text-[13px] leading-snug text-slate-800">{card.englishText}</p>
                    </motion.div>
                  </div>

                  <div className="mt-auto pt-4">
                    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/80 p-3">
                      <div className="space-y-0.5">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{card.signal}</p>
                        <p className="text-xs font-semibold text-slate-700">{card.impact}</p>
                      </div>
                      {card.accent === "emerald" ? (
                        <Activity className={`h-4 w-4 ${iconClasses}`} />
                      ) : (
                        <ShieldCheck className={`h-4 w-4 ${iconClasses}`} />
                      )}
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
