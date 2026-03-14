"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ModalPortal } from "@/components/ui/modal-portal";
import { 
  Zap, 
  Loader2, 
  TrendingUp, 
  TrendingDown, 
  Target,
  BrainCircuit,
  Lightbulb,
  ShieldAlert,
  Globe,
  Key
} from "lucide-react";
import { getUserStatus } from "@/app/actions/user";
import { generateFeedbackSummary, predictChurnRisk } from "@/app/actions/ai";
import { motion, AnimatePresence } from "framer-motion";

type UserRecord = {
  subscriptionTier: string;
  aiUsageCount: number;
};

type RegionBreakdown = {
  locale: string;
  sentiment: number;
  trend: "up" | "down" | "stable";
  volume: number;
};

type AiSummary = {
  summary: string;
  actionItems: string[];
  regionalBreakdown: RegionBreakdown[];
  glossarySuggestions: string[];
  remaining?: number | null;
};

type ChurnRisk = {
  id: string;
  author: string;
  issue: string;
  risk: "high" | "medium";
  locale: string;
};

export default function AiMetricsPage() {
  const [user, setUser] = useState<UserRecord | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<AiSummary | null>(null);
  const [churnRisk, setChurnRisk] = useState<ChurnRisk[]>([]);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [remainingTrials, setRemainingTrials] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const u = await getUserStatus();
      setUser(u);
      if (u?.subscriptionTier === "FREE") {
        setRemainingTrials(Math.max(0, 5 - (u.aiUsageCount || 0)));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRunAnalysis = async () => {
    setAiLoading(true);
    try {
      const [summaryRes, churnRes] = await Promise.all([
        generateFeedbackSummary(),
        predictChurnRisk()
      ]);
      
      if ("error" in summaryRes && (summaryRes.error === "TRIAL_EXHAUSTED" || summaryRes.error === "PREMIUM_REQUIRED")) {
        setIsUpgradeOpen(true);
        return;
      }

      if (!("error" in summaryRes)) {
        setAiSummary(summaryRes as AiSummary);
      }
      if ("atRisk" in churnRes && churnRes.atRisk) setChurnRisk(churnRes.atRisk as ChurnRisk[]);
      
      if (!("error" in summaryRes) && summaryRes.remaining !== undefined) {
        setRemainingTrials(summaryRes.remaining ?? null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-900">Premium AI Hub</h1>
            <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">Pro</span>
          </div>
          <p className="text-sm text-slate-500">Advanced multilingual intelligence powered by Lingo.dev & Kivo AI</p>
        </div>
        <div className="flex items-center gap-4">
          {user?.subscriptionTier === "FREE" && remainingTrials !== null && (
            <div className="hidden md:flex flex-col items-end">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Free Trials</p>
              <p className="text-sm font-bold text-blue-600">{remainingTrials} of 5 left</p>
            </div>
          )}
          <Button 
            onClick={handleRunAnalysis}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 px-6 h-11"
            disabled={aiLoading}
          >
            {aiLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
            Run Premium Analysis
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
            <CardHeader className="p-8 pb-0">
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <BrainCircuit className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Multilingual Sentiment Intelligence</span>
              </div>
              <CardTitle className="text-2xl">Executive Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              {aiSummary ? (
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 italic text-slate-700 leading-relaxed text-lg relative group">
                    <div className="absolute -top-3 -left-3 p-2 rounded-xl bg-blue-600 text-white shadow-lg group-hover:scale-110 transition-transform">
                      <Lightbulb className="h-4 w-4" />
                    </div>
                    {aiSummary.summary}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Actionable Roadmap</p>
                      {aiSummary.actionItems?.map((item: string, i: number) => (
                        <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-100 group hover:border-blue-200 transition-colors">
                          <div className="h-6 w-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
                            {i+1}
                          </div>
                          <p className="text-sm text-slate-600 leading-snug">{item}</p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Regional Sentiment Matrix</p>
                      <div className="space-y-2">
                        {aiSummary.regionalBreakdown?.map((region) => (
                          <div key={`${region.locale}-${region.volume}`} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold text-slate-700 uppercase">{region.locale}</span>
                              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-slate-200">
                                {region.trend === "up" ? <TrendingUp className="h-3 w-3 text-emerald-500" /> : <TrendingDown className="h-3 w-3 text-amber-500" />}
                                <span className={`text-[10px] font-bold ${region.trend === "up" ? "text-emerald-600" : "text-amber-600"}`}>
                                  {region.volume} pts
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${region.sentiment}%` }}
                                  className={`h-full ${region.sentiment > 80 ? "bg-emerald-500" : region.sentiment > 60 ? "bg-blue-500" : "bg-amber-500"}`}
                                />
                              </div>
                              <span className="text-xs font-bold text-slate-900">{region.sentiment}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center flex flex-col items-center justify-center">
                  <div className="p-4 rounded-full bg-blue-50 mb-4">
                    <Zap className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Insight Discovery Pending</h3>
                  <p className="text-slate-500 text-sm mt-2 max-w-[280px]">Connect your data sources and run the Premium AI Analysis to uncover global product patterns.</p>
                  <Button onClick={handleRunAnalysis} variant="outline" className="mt-8 rounded-xl border-slate-200 h-10 px-8">Execute Global Analysis</Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
              <CardHeader className="border-b border-slate-50 p-6 flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-amber-500" />
                  Churn Risk Signals
                </CardTitle>
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Reactive</span>
              </CardHeader>
              <CardContent className="p-0">
                {churnRisk.length > 0 ? (
                  <div className="divide-y divide-slate-50">
                    {churnRisk.slice(0, 3).map((risk) => (
                      <div key={risk.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${risk.risk === "high" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"}`}>
                            {risk.author[0]}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900">{risk.author}</p>
                            <p className="text-[10px] text-slate-500 truncate w-32">{risk.issue}</p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${risk.risk === "high" ? "bg-red-600 text-white" : "bg-amber-100 text-amber-700"}`}>
                          {risk.risk}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-10 text-center text-slate-400 text-xs italic">
                    All users seem healthy. Keep up the good work!
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
              <CardHeader className="border-b border-slate-50 p-6 flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="h-4 w-4 text-purple-600" />
                  Glossary Suggestions
                </CardTitle>
                <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">Lingo.dev</span>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-2">
                  {(aiSummary?.glossarySuggestions || ["Billing", "Subscription", "Translation"]).map((word) => (
                    <div key={word} className="flex items-center gap-2 p-2 px-3 rounded-xl bg-purple-50 border border-purple-100 text-[11px] font-bold text-purple-700">
                      <Key className="h-3 w-3" />
                      {word}
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-4 leading-relaxed">AI identified these recurring product-specific terms that may need glossary entries in Lingo.dev.</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-slate-900 text-white rounded-3xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.4),transparent)] opacity-50" />
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-2 text-blue-400">
                <Target className="h-5 w-5" />
                Growth Opportunity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 relative z-10">
              <div className="flex flex-col gap-1">
                <span className="text-4xl font-bold tracking-tight">+14.2%</span>
                <span className="text-xs text-slate-400">Projected MRR increase if localized friction is resolved.</span>
              </div>
              
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <p className="text-xs font-medium text-slate-300 mb-3 underline decoration-blue-500/50">Market Priority: Japan</p>
                <p className="text-[11px] text-slate-400 leading-relaxed italic">
                  Japanese users have 2.3x higher intent but 4x more abandonment during the billing process compared to EU.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Recommended Investment</p>
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span>Localization QC</span>
                  <span className="text-blue-400">High</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="w-[85%] h-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.8)]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-blue-600 text-white rounded-3xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                AI Roadmap Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 relative z-10">
              {[
                "Enhance Japanese character rendering",
                "Reduce first-byte latency in EU regions",
                "Add per-country glossary support",
                "Implement dark mode for all users"
              ].map((suggestion, i) => (
                <div key={i} className="p-3 rounded-xl bg-white/10 border border-white/10 text-xs font-medium backdrop-blur-md">
                  {suggestion}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white rounded-3xl">
            <CardHeader>
               <CardTitle className="text-lg">Premium Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Competitor Benchmarking", status: "Premium" },
                { label: "Predictive Churn Analysis", status: "Enterprise" },
                { label: "Custom Model Training", status: "Enterprise" }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-xs font-bold text-slate-700">{item.label}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">{item.status}</span>
                </div>
              ))}
              <Button className="w-full rounded-2xl bg-slate-900 h-11 text-xs font-bold mt-2">Explore Enterprise Hub</Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <AnimatePresence>
        {isUpgradeOpen && (
          <ModalPortal>
            <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsUpgradeOpen(false)}
                className="absolute inset-0 bg-slate-950/65 backdrop-blur-md"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative z-10 max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-[2rem] border border-white bg-white shadow-2xl"
              >
              <div className="h-32 bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
                <div className="p-4 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20">
                  <Zap className="h-10 w-10 text-white fill-white/20" />
                </div>
              </div>
              <div className="p-10 text-center">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Upgrade to Unlock Insights</h3>
                <p className="text-slate-500 mb-8 leading-relaxed">
                  You have used all 5 free AI analysis trials. Upgrade to Premium for unlimited analysis, deeper trends, and actionable roadmap items.
                </p>
                
                <div className="grid gap-4 mb-8">
                  {[
                    "Unlimited AI feedback analysis",
                    "Trend identification across 50+ languages",
                    "Priority sync for large applications",
                    "Custom roadmap & export features"
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-slate-600 font-medium bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="h-3 w-3 text-blue-600" />
                      </div>
                      {feature}
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-3">
                  <Button className="rounded-2xl h-14 text-base font-bold bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20 w-full">
                    Upgrade to Premium — $49/mo
                  </Button>
                  <Button variant="ghost" onClick={() => setIsUpgradeOpen(false)} className="rounded-2xl h-12 font-bold text-slate-400">
                    Maybe later
                  </Button>
                </div>
              </div>
              </motion.div>
            </div>
          </ModalPortal>
        )}
      </AnimatePresence>
    </div>
  );
}
