"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Globe, Sparkles } from "lucide-react";

const steps = [
  {
    step: "01",
    title: "Ingest Global Feedback",
    desc: "Connect stores and webhooks to capture multilingual signals in one stream.",
    icon: Globe,
  },
  {
    step: "02",
    title: "Normalize & Score",
    desc: "Lingo.dev-powered translation and AI scoring convert raw comments into comparable market insights.",
    icon: Sparkles,
  },
  {
    step: "03",
    title: "Prioritize Revenue Actions",
    desc: "Kivo ranks opportunities by risk, sentiment, and impact so teams execute the right fixes first.",
    icon: BarChart3,
  },
];

function IngestAnimation() {
  const flags = ["🇯🇵", "🇫🇷", "🇩🇪", "🇪🇸", "🇮🇳", "🇧🇷"];
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="grid grid-cols-3 gap-4">
        {flags.map((flag, index) => (
          <motion.div
            key={flag}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.12 }}
            className="kivo-card flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200/70 bg-white text-2xl shadow-sm"
          >
            {flag}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ScoreAnimation() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="space-y-4">
        {[88, 72, 65, 92].map((score, index) => (
          <div key={score} className="kivo-card w-64 rounded-xl border border-slate-200/70 bg-white p-3">
            <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Locale {index + 1}</span>
              <span>{score}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 1, delay: index * 0.2 }}
                className="h-full rounded-full bg-gradient-to-r from-[#315bf0] to-[#2f6d5a]"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActionAnimation() {
  return (
    <div className="flex h-full w-full items-center justify-center p-6">
      <div className="w-full max-w-xs space-y-3">
        {["Fix JA billing copy", "Resolve DE header overflow", "Automate FR recovery replies"].map((task, index) => (
          <motion.div
            key={task}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2 }}
            className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm font-medium text-emerald-900"
          >
            {task}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

const animations = [IngestAnimation, ScoreAnimation, ActionAnimation];

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  const ActiveAnimation = animations[activeStep];

  return (
    <section id="how-it-works" className="kivo-section-light relative overflow-hidden py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center gap-16 lg:flex-row">
          <div className="lg:w-1/2">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-3 text-sm font-semibold uppercase tracking-wide text-blue-700"
            >
              Workflow
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl"
            >
              From multilingual noise to prioritized growth actions
            </motion.h2>

            <div className="mt-10 space-y-4">
              {steps.map((step, index) => (
                <button
                  key={step.title}
                  onClick={() => setActiveStep(index)}
                  className={
                    activeStep === index
                      ? "kivo-card w-full rounded-2xl border border-blue-200 bg-white p-5 text-left shadow-xl shadow-blue-500/5"
                      : "w-full rounded-2xl border border-transparent bg-transparent p-5 text-left hover:bg-white/70"
                  }
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={
                        activeStep === index
                          ? "rounded-xl bg-gradient-to-r from-[#315bf0] to-[#2f6d5a] p-2.5 text-white"
                          : "rounded-xl bg-slate-100 p-2.5 text-slate-400"
                      }
                    >
                      <step.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{step.step}</span>
                        <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
                      </div>
                      <p className="text-sm text-slate-600">{step.desc}</p>
                    </div>
                    {activeStep === index ? <ArrowRight className="mt-1 h-4 w-4 text-emerald-600" /> : null}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="kivo-card relative mx-auto aspect-square w-full max-w-[460px] overflow-hidden rounded-[40px] border border-slate-200/70 bg-white shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-transparent to-emerald-50/35" />
              <div className="relative h-full w-full">
                <ActiveAnimation />
              </div>
              <div className="absolute bottom-0 left-0 right-0 flex h-16 items-end justify-center bg-gradient-to-t from-white via-white/80 to-transparent pb-4">
                <span className="text-sm font-bold text-slate-900">{steps[activeStep].title}</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
