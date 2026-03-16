"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import {
  AlertCircle,
  Apple,
  ChevronRight,
  Database,
  Globe,
  Loader2,
  Lock,
  Plus,
  Sparkles,
  Star,
  Trash2,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ModalPortal } from "@/components/ui/modal-portal";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  connectApp,
  disconnectApp,
  getDashboardAnalytics,
  getFeedback,
  getUserStatus,
} from "@/app/actions/user";
import { generateFeedbackSummary, translateReview } from "@/app/actions/ai";

type AppRecord = {
  id: string;
  name: string;
  sourceType: string;
  lastSyncedAt?: string | null;
  lastSyncStatus?: string;
  lastSyncPages?: number;
  lastSyncFetched?: number;
  lastSyncInserted?: number;
  lastSyncMessage?: string | null;
  _count: {
    feedback: number;
  };
};

type UserRecord = {
  id: string;
  name: string | null;
  subscriptionTier: string;
  analystLanguage: string;
  aiUsageCount: number;
  apps: AppRecord[];
  hasCompletedDemo: boolean;
};

type FeedbackItem = {
  id: string;
  source: string;
  sourceLocale: string;
  originalText: string;
  translatedText: string | null;
  sentiment: string | null;
  rating: number | null;
  authorName: string | null;
  createdAt: Date;
  appId: string | null;
  app?: {
    name: string;
  };
};

type LocaleMeta = {
  code: string;
  name: string;
};

type DayTrend = {
  date: string;
  reviews: number;
  positive: number;
  negative: number;
  mixed: number;
  neutral: number;
};

type LocaleDistribution = {
  locale: string;
  count: number;
  sentimentScore: number;
};

type AppMix = {
  name: string;
  count: number;
};

type Opportunity = {
  id: string;
  locale: string;
  priority: "high" | "medium" | "low";
  impact: number;
  headline: string;
};

type DecisionOpportunity = {
  id: string;
  locale: string;
  headline: string;
  impactPct: number;
  confidence: number;
  evidence: string[];
  ownerHint: string;
  priority: "high" | "medium" | "low";
  expectedLift: number;
};

type DashboardAnalytics = {
  kpis: {
    totalReviews: number;
    positivityScore: number;
    avgRating: number;
    languages: number;
    negativeCount: number;
  };
  trends: {
    reviewsByDay: DayTrend[];
    sentimentByDay: DayTrend[];
  };
  distributions: {
    ratingDistribution: Array<{ rating: string; count: number }>;
    localeDistribution: LocaleDistribution[];
    appMix: AppMix[];
  };
  opportunities: Opportunity[];
  opportunitiesTop3: DecisionOpportunity[];
  proof: {
    mode: "live" | "simulated";
    reason: string;
    metrics: {
      mrrLiftPct: number;
      churnRiskPct: number;
      retentionLiftPts: number;
    };
  };
  limits: {
    aiUsage: number;
    aiLimit: number | null;
    appsUsed: number;
    appLimit: number | null;
    unlockedLocales: string[];
    lockedLocales: string[];
    topLocales: string[];
    allLocales: LocaleMeta[];
  };
};

type FeedbackResponse = {
  feedback: FeedbackItem[];
  total: number;
  hasMore: boolean;
  isLimited: boolean;
};

const COLORS = ["#4f7cff", "#2ec27e", "#23a6d5", "#90be3f", "#7c6cf2", "#ff7a59"];

const sentimentClasses: Record<string, { icon: typeof TrendingUp; color: string; bg: string }> = {
  positive: { icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
  negative: { icon: TrendingDown, color: "text-red-600", bg: "bg-red-50" },
  mixed: { icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-50" },
  neutral: { icon: TrendingDown, color: "text-slate-500", bg: "bg-slate-50" },
};

function formatShortDate(isoDate: string): string {
  const date = new Date(isoDate);
  return `${date.getDate()}/${date.getMonth() + 1}`;
}

function priorityBadge(priority: "high" | "medium" | "low") {
  if (priority === "high") return "bg-red-100 text-red-700";
  if (priority === "medium") return "bg-amber-100 text-amber-700";
  return "bg-emerald-100 text-emerald-700";
}

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<UserRecord | null>(null);
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalFeedback, setTotalFeedback] = useState(0);
  const [isLimited, setIsLimited] = useState(false);
  const [activeAppId, setActiveAppId] = useState<string | "all">("all");
  const [selectedLocale, setSelectedLocale] = useState<string>("all");
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [upgradeTitle, setUpgradeTitle] = useState("Upgrade to Premium");
  const [upgradeMessage, setUpgradeMessage] = useState(
    "Unlock unlimited locale intelligence, deeper trends, and premium automation."
  );
  const [newAppId, setNewAppId] = useState("");
  const [sourceType, setSourceType] = useState<"appstore" | "playstore">("appstore");
  const [syncing, setSyncing] = useState<string | null>(null);
  const [translatingReview, setTranslatingReview] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState<{
    summary: string;
    actionItems: string[];
    opportunities?: Array<{ title: string; impact: number }>;
    projectedImpact?: { mrrLiftPct: number };
    remaining?: number | null;
  } | null>(null);

  const exportOpportunityBrief = useCallback(() => {
    if (!analytics?.opportunitiesTop3?.length) return;

    const now = new Date();
    const lines: string[] = [
      "# Kivo Opportunity Brief",
      "",
      `Generated: ${now.toISOString()}`,
      `Proof mode: ${analytics.proof.mode}`,
      "",
      "Kivo is not a ticketing tool. It complements Jira/Linear/Zendesk by turning multilingual feedback into decision-grade priorities.",
      "",
      "## Top Opportunities",
      "",
    ];

    analytics.opportunitiesTop3.forEach((opportunity, index) => {
      lines.push(`### ${index + 1}. ${opportunity.headline}`);
      lines.push(`- Locale: ${opportunity.locale.toUpperCase()}`);
      lines.push(`- Priority: ${opportunity.priority}`);
      lines.push(`- Confidence: ${opportunity.confidence}%`);
      lines.push(`- Impact: +${opportunity.impactPct}% (expected lift +${opportunity.expectedLift}%)`);
      lines.push(`- Owner hint: ${opportunity.ownerHint}`);
      lines.push("");
      lines.push("Evidence:");
      opportunity.evidence.forEach((point) => lines.push(`- ${point}`));
      lines.push("");
    });

    lines.push("## Next Step");
    lines.push("Paste these opportunities into Jira/Linear and assign owners. Re-run Kivo after shipping changes to validate trend movement by locale.");
    lines.push("");
    lines.push("Powered by Lingo.dev (translation normalization for cross-locale comparability).");

    const content = lines.join("\n");
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kivo-opportunity-brief-${now.toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [analytics]);

  const openUpgrade = useCallback((title: string, message: string) => {
    setUpgradeTitle(title);
    setUpgradeMessage(message);
    setIsUpgradeOpen(true);
  }, []);

  const fetchDashboard = useCallback(
    async (isLoadMore = false) => {
      if (!isLoadMore) setLoading(true);
      try {
        const currentPage = isLoadMore ? page + 1 : 1;
        const [userRes, feedbackRes, analyticsRes] = await Promise.all([
          getUserStatus(),
          getFeedback(activeAppId === "all" ? undefined : activeAppId, currentPage, 20),
          getDashboardAnalytics(activeAppId === "all" ? undefined : activeAppId, "30d"),
        ]);

        if (!userRes) {
          router.push("/login");
          return;
        }

        if (!userRes.hasCompletedDemo) {
          router.push("/demo");
          return;
        }

        if ("error" in analyticsRes) {
          console.error("Analytics failed", analyticsRes.error);
          return;
        }

        const typedUser = userRes as UserRecord;
        const typedFeedback = feedbackRes as FeedbackResponse;
        const typedAnalytics = analyticsRes as DashboardAnalytics;

        setUser(typedUser);
        setAnalytics(typedAnalytics);

        setFeedback((prev) => (isLoadMore ? [...prev, ...typedFeedback.feedback] : typedFeedback.feedback));
        setHasMore(typedFeedback.hasMore);
        setTotalFeedback(typedFeedback.total);
        setIsLimited(typedFeedback.isLimited);
        setPage(currentPage);

        if (selectedLocale !== "all" && typedAnalytics.limits.lockedLocales.includes(selectedLocale)) {
          setSelectedLocale("all");
        }
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        if (!isLoadMore) setLoading(false);
      }
    },
    [activeAppId, page, router, selectedLocale]
  );

  useEffect(() => {
    fetchDashboard(false);
  }, [activeAppId, fetchDashboard]);

  useEffect(() => {
    if (!analytics?.opportunitiesTop3?.length) {
      setSelectedOpportunityId(null);
      return;
    }
    if (!selectedOpportunityId || !analytics.opportunitiesTop3.some((item) => item.id === selectedOpportunityId)) {
      setSelectedOpportunityId(analytics.opportunitiesTop3[0].id);
    }
  }, [analytics, selectedOpportunityId]);

  const visibleFeedback = useMemo(() => {
    let scoped = feedback;

    if (selectedLocale !== "all") {
      scoped = scoped.filter((item) => item.sourceLocale === selectedLocale);
    }

    if (selectedOpportunityId && analytics?.opportunitiesTop3?.length) {
      const selected = analytics.opportunitiesTop3.find((item) => item.id === selectedOpportunityId);
      if (selected && selectedLocale === "all") {
        scoped = scoped.filter((item) => item.sourceLocale === selected.locale);
      }
    }

    return scoped;
  }, [analytics?.opportunitiesTop3, feedback, selectedLocale, selectedOpportunityId]);

  const localeCountLabel = useMemo(() => {
    if (!analytics) return "";
    return `${analytics.limits.unlockedLocales.length}/${analytics.limits.allLocales.length} locales unlocked`;
  }, [analytics]);

  const handleLocaleClick = (locale: string, locked: boolean) => {
    if (locked && user?.subscriptionTier === "FREE") {
      openUpgrade(
        `Unlock ${locale.toUpperCase()} intelligence`,
        "Free plan includes top 5 locales by workspace volume. Upgrade to unlock all supported markets and cross-locale opportunities."
      );
      return;
    }
    setSelectedLocale(locale);
  };

  const handleConnect = async () => {
    if (!newAppId) return;
    setSyncing("connecting");
    try {
      const res = await connectApp(sourceType, newAppId);
      if (res.error === "LIMIT_REACHED") {
        setIsConnectOpen(false);
        openUpgrade(
          "App connection limit reached",
          "Free plan supports 2 connected apps. Upgrade to connect unlimited products and unify global signals in one workspace."
        );
        return;
      }

      if (res.error === "ALREADY_CONNECTED") {
        setIsConnectOpen(false);
        openUpgrade(
          "Source already connected",
          "This source is already synced. Upgrade to enable premium monitoring and real-time anomaly alerts."
        );
        return;
      }

      setIsConnectOpen(false);
      setNewAppId("");
      await fetchDashboard(false);
    } catch (error) {
      console.error(error);
    } finally {
      setSyncing(null);
    }
  };

  const handleAiRun = async () => {
    setAiLoading(true);
    try {
      const res = await generateFeedbackSummary(activeAppId === "all" ? undefined : activeAppId);
      if ("error" in res && (res.error === "TRIAL_EXHAUSTED" || res.error === "PREMIUM_REQUIRED")) {
        openUpgrade(
          "Premium AI limit reached",
          "Unlock unlimited analysis runs, projected impact modeling, and multilingual action prioritization."
        );
        return;
      }
      if (!("error" in res)) {
        setAiSummary({
          summary: res.summary,
          actionItems: res.actionItems,
          opportunities: res.opportunities?.map((item) => ({ title: item.title, impact: item.impact })),
          projectedImpact: res.projectedImpact,
          remaining: res.remaining ?? null,
        });
      }
      await fetchDashboard(false);
    } catch (error) {
      console.error(error);
    } finally {
      setAiLoading(false);
    }
  };

  const handleTranslate = async (reviewId: string) => {
    setTranslatingReview(reviewId);
    try {
      const res = await translateReview(reviewId);
      if ("success" in res && res.success) {
        setFeedback((prev) =>
          prev.map((item) => (item.id === reviewId ? { ...item, translatedText: res.translatedText ?? item.translatedText } : item))
        );
      }
    } catch (error) {
      console.error(error);
    } finally {
      setTranslatingReview(null);
    }
  };

  const handleDisconnect = async (appId: string) => {
    setSyncing(appId);
    try {
      await disconnectApp(appId);
      await fetchDashboard(false);
    } catch (error) {
      console.error(error);
    } finally {
      setSyncing(null);
    }
  };

  if (loading || !analytics) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center">
        <Loader2 className="mb-4 h-10 w-10 animate-spin text-blue-600" />
        <p className="text-sm font-medium text-slate-500">Building your global intelligence board...</p>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-gradient-to-br from-[#0f1e46] via-[#1a2f6f] to-[#2f6d5a] p-7 text-white shadow-[0_24px_70px_rgba(17,32,73,0.26)]">
        <div className="absolute -right-8 -top-8 h-44 w-44 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="absolute -left-12 bottom-0 h-40 w-40 rounded-full bg-blue-200/20 blur-3xl" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-100">
              <Sparkles className="mr-2 h-3 w-3" /> Premium Intelligence Layer
            </p>
            <h1 className="text-3xl font-bold tracking-tight">Global Revenue Signal Center</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-100/90">
              Identify localization friction, prioritize the highest-impact fixes, and unlock growth by market.
            </p>
            <p className="mt-2 inline-flex items-center rounded-full border border-white/20 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-100">
              Powered by Lingo.dev · Proof mode: {analytics.proof.mode}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsConnectOpen(true)}
              variant="outline"
              className="rounded-xl border-white/30 bg-white/10 text-white hover:bg-white/20"
            >
              <Plus className="mr-2 h-4 w-4" /> Connect App
            </Button>
            <Button onClick={handleAiRun} disabled={aiLoading} className="rounded-xl bg-emerald-300 text-emerald-950 hover:bg-emerald-200">
              {aiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />} Run AI
              Intelligence
            </Button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Reviews", value: analytics.kpis.totalReviews, hint: "30 day capture" },
          { label: "Positivity Score", value: `${analytics.kpis.positivityScore}%`, hint: "weighted by sentiment" },
          { label: "Avg Rating", value: analytics.kpis.avgRating.toFixed(1), hint: "across all active sources" },
          { label: "Active Languages", value: analytics.kpis.languages, hint: localeCountLabel },
        ].map((metric) => (
          <Card key={metric.label} className="kivo-card rounded-2xl border-slate-200/70">
            <CardContent className="p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{metric.label}</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">{metric.value}</h2>
              <p className="mt-2 text-xs text-slate-500">{metric.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="kivo-card rounded-2xl border-slate-200/70">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Plan Utilization</CardTitle>
          <CardDescription>Strategic trial usage with premium growth prompts</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            {
              label: "AI Runs",
              value: `${analytics.limits.aiUsage}${analytics.limits.aiLimit ? `/${analytics.limits.aiLimit}` : ""}`,
              percent:
                analytics.limits.aiLimit && analytics.limits.aiLimit > 0
                  ? Math.min(100, (analytics.limits.aiUsage / analytics.limits.aiLimit) * 100)
                  : 28,
            },
            {
              label: "Locales",
              value: `${analytics.limits.unlockedLocales.length}/${analytics.limits.allLocales.length}`,
              percent: (analytics.limits.unlockedLocales.length / analytics.limits.allLocales.length) * 100,
            },
            {
              label: "Connected Apps",
              value: `${analytics.limits.appsUsed}${analytics.limits.appLimit ? `/${analytics.limits.appLimit}` : ""}`,
              percent:
                analytics.limits.appLimit && analytics.limits.appLimit > 0
                  ? Math.min(100, (analytics.limits.appsUsed / analytics.limits.appLimit) * 100)
                  : 34,
            },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-slate-200/70 bg-white/75 p-4">
              <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
                <span>{item.label}</span>
                <span className="text-slate-700">{item.value}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-gradient-to-r from-[#4f7cff] to-[#2ec27e]" style={{ width: `${item.percent}%` }} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="kivo-card rounded-2xl border-slate-200/70">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Proof Metrics</CardTitle>
          <CardDescription>{analytics.proof.reason}</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200/70 bg-white/75 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Projected MRR lift</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600">+{analytics.proof.metrics.mrrLiftPct}%</p>
          </div>
          <div className="rounded-xl border border-slate-200/70 bg-white/75 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Churn risk index</p>
            <p className="mt-1 text-2xl font-bold text-amber-600">{analytics.proof.metrics.churnRiskPct}%</p>
          </div>
          <div className="rounded-xl border border-slate-200/70 bg-white/75 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Retention lift</p>
            <p className="mt-1 text-2xl font-bold text-blue-700">+{analytics.proof.metrics.retentionLiftPts} pts</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="kivo-card rounded-2xl border-slate-200/70 xl:col-span-2">
          <CardHeader>
            <CardTitle>Review Volume Trend</CardTitle>
            <CardDescription>Daily intake and sentiment movement</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.trends.reviewsByDay}>
                <defs>
                  <linearGradient id="reviewsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f7cff" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#4f7cff" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
                <XAxis dataKey="date" tickFormatter={formatShortDate} fontSize={11} stroke="#64748b" />
                <YAxis fontSize={11} stroke="#64748b" />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: "1px solid #cbd5e1", fontSize: 12 }}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Area type="monotone" dataKey="reviews" stroke="#4f7cff" strokeWidth={2.4} fill="url(#reviewsGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="kivo-card rounded-2xl border-slate-200/70">
          <CardHeader>
            <CardTitle>Locale Distribution</CardTitle>
            <CardDescription>Usage split by source language</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={analytics.distributions.localeDistribution.slice(0, 6)} dataKey="count" nameKey="locale" innerRadius={58} outerRadius={96}>
                  {analytics.distributions.localeDistribution.slice(0, 6).map((entry, index) => (
                    <Cell key={`${entry.locale}-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #cbd5e1", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="kivo-card rounded-2xl border-slate-200/70 xl:col-span-2">
          <CardHeader>
            <CardTitle>Sentiment Trend</CardTitle>
            <CardDescription>Positive vs negative movement by day</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.trends.sentimentByDay}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
                <XAxis dataKey="date" tickFormatter={formatShortDate} fontSize={11} stroke="#64748b" />
                <YAxis fontSize={11} stroke="#64748b" />
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #cbd5e1", fontSize: 12 }} />
                <Line dataKey="positive" type="monotone" stroke="#2ec27e" strokeWidth={2.2} dot={false} />
                <Line dataKey="negative" type="monotone" stroke="#ef4444" strokeWidth={2.2} dot={false} />
                <Line dataKey="mixed" type="monotone" stroke="#ff9f43" strokeWidth={2.2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="kivo-card rounded-2xl border-slate-200/70">
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
            <CardDescription>Quality spread across ratings</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.distributions.ratingDistribution}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
                <XAxis dataKey="rating" fontSize={11} stroke="#64748b" />
                <YAxis fontSize={11} stroke="#64748b" />
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #cbd5e1", fontSize: 12 }} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} fill="#4f7cff" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="kivo-card rounded-2xl border-slate-200/70">
        <CardHeader>
          <CardTitle>Source Mix</CardTitle>
          <CardDescription>Feedback contribution by connected source</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.distributions.appMix}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
              <XAxis dataKey="name" fontSize={11} stroke="#64748b" />
              <YAxis fontSize={11} stroke="#64748b" />
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #cbd5e1", fontSize: 12 }} />
              <Bar dataKey="count" radius={[8, 8, 0, 0]} fill="#2ec27e" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="kivo-card rounded-2xl border-slate-200/70 lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Top 3 Revenue Opportunities</CardTitle>
                <CardDescription>Evidence-backed locale priorities with confidence scoring</CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-lg border-slate-200 bg-white/80 text-xs font-semibold text-slate-700"
                  onClick={exportOpportunityBrief}
                  disabled={!analytics?.opportunitiesTop3?.length}
                >
                  Export brief
                </Button>
                <button
                  onClick={() => setSelectedLocale("all")}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-xs font-semibold",
                    selectedLocale === "all" ? "border-slate-800 bg-slate-800 text-white" : "border-slate-200 bg-white/80 text-slate-600"
                  )}
                >
                  All locales
                </button>
                {analytics.limits.allLocales.map((locale) => {
                  const isLocked = analytics.limits.lockedLocales.includes(locale.code);
                  const isActive = selectedLocale === locale.code;
                  return (
                    <button
                      key={locale.code}
                      onClick={() => handleLocaleClick(locale.code, isLocked)}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-xs font-semibold",
                        isActive ? "border-emerald-400 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white/80 text-slate-600"
                      )}
                    >
                      <span className="inline-flex items-center gap-1">
                        {locale.code.toUpperCase()}
                        {isLocked && user?.subscriptionTier === "FREE" && <Lock className="h-3 w-3" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {analytics.opportunitiesTop3.map((opportunity, index) => {
              const isPremiumInsight = user?.subscriptionTier === "FREE" && index > 0;
              const isSelected = selectedOpportunityId === opportunity.id;
              return (
                <button
                  key={opportunity.id}
                  onClick={() => {
                    if (isPremiumInsight) {
                      openUpgrade(
                        "Unlock full opportunity map",
                        "Free plan shows one strategic opportunity. Upgrade to unlock all prioritized market opportunities and ROI estimates."
                      );
                      return;
                    }
                    setSelectedOpportunityId(opportunity.id);
                    if (selectedLocale === "all") {
                      setSelectedLocale(opportunity.locale);
                    }
                  }}
                  className={cn(
                    "w-full rounded-xl border p-4 text-left transition-all",
                    isPremiumInsight
                      ? "border-slate-200 bg-slate-50/80 opacity-70 hover:opacity-100"
                      : isSelected
                        ? "border-emerald-300 bg-emerald-50/70 shadow-sm"
                        : "border-slate-200 bg-white/80 hover:border-slate-300"
                  )}
                >
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                    <div className="space-y-1 md:col-span-3">
                      <div className="flex items-center gap-2">
                        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", priorityBadge(opportunity.priority))}>
                          {opportunity.priority}
                        </span>
                        {isPremiumInsight && <span className="text-[10px] font-bold uppercase text-slate-500">Premium</span>}
                        <span className="rounded-full bg-slate-900/5 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                          Confidence {opportunity.confidence}%
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">{opportunity.headline}</p>
                      <p className="text-xs text-slate-500">Locale: {opportunity.locale.toUpperCase()} · Owner: {opportunity.ownerHint}</p>
                      <div className="grid grid-cols-1 gap-1 pt-1">
                        {opportunity.evidence.map((point) => (
                          <p key={point} className="text-xs text-slate-500">• {point}</p>
                        ))}
                      </div>
                    </div>
                    <div className="text-right md:col-span-1">
                      <p className="text-xs font-semibold uppercase text-slate-400">Impact</p>
                      <p className="text-lg font-bold text-blue-700">+{opportunity.impactPct}%</p>
                      <p className="mt-1 text-xs font-semibold text-emerald-600">Expected lift +{opportunity.expectedLift}%</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <Card className="kivo-card rounded-2xl border-slate-200/70">
          <CardHeader>
            <CardTitle>Kivo AI Executive Brief</CardTitle>
            <CardDescription>Actionable prioritization, localized · Powered by Lingo.dev</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {aiSummary ? (
              <>
                <p className="rounded-xl border border-slate-200 bg-white/80 p-3 text-sm leading-relaxed text-slate-700">
                  {aiSummary.summary}
                </p>
                {aiSummary.projectedImpact && (
                  <div className="rounded-xl border border-slate-200/70 bg-white/75 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Projected MRR Lift</p>
                    <p className="text-2xl font-bold text-emerald-600">+{aiSummary.projectedImpact.mrrLiftPct}%</p>
                  </div>
                )}
                <div className="space-y-2">
                  {aiSummary.actionItems.slice(0, 3).map((item) => (
                    <div key={item} className="flex items-start gap-2 text-xs text-slate-600">
                      <ChevronRight className="mt-0.5 h-3.5 w-3.5 text-emerald-600" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500">Run AI Intelligence to generate strategic recommendations.</p>
            )}
            <Button onClick={handleAiRun} className="w-full rounded-xl bg-gradient-to-r from-[#315bf0] to-[#2f6d5a] hover:brightness-105" disabled={aiLoading}>
              {aiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
              {analytics.limits.aiLimit ? `Run AI (${analytics.limits.aiUsage}/${analytics.limits.aiLimit})` : "Run AI Intelligence"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="kivo-card rounded-2xl border-slate-200/70">
        <CardHeader className="pb-2">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Recent Feedback Stream</CardTitle>
              <CardDescription>
                {visibleFeedback.length} shown of {totalFeedback} reviews
                {selectedOpportunityId && analytics.opportunitiesTop3.length
                  ? ` · Focused by ${analytics.opportunitiesTop3.find((item) => item.id === selectedOpportunityId)?.locale.toUpperCase() || "locale"} opportunity`
                  : ""}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto">
              <button
                onClick={() => setActiveAppId("all")}
                className={cn(
                  "rounded-lg border px-3 py-2 text-xs font-semibold",
                  activeAppId === "all" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white/80 text-slate-600"
                )}
              >
                All Apps
              </button>
              {user?.apps.map((app) => (
                <button
                  key={app.id}
                  onClick={() => setActiveAppId(app.id)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold",
                    activeAppId === app.id ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white/80 text-slate-600"
                  )}
                >
                  {app.sourceType === "appstore" ? <Apple className="h-3.5 w-3.5" /> : <Database className="h-3.5 w-3.5" />}
                  {app.name}
                  <span className="opacity-60">{app._count.feedback}</span>
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {visibleFeedback.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-300/70 bg-white/70 p-10 text-center">
              <p className="font-semibold text-slate-700">No feedback in this view.</p>
              <p className="mt-1 text-sm text-slate-500">Try another locale filter or connect a new source.</p>
            </div>
          ) : (
            visibleFeedback.map((item) => {
              const sentiment = sentimentClasses[item.sentiment || "neutral"] || sentimentClasses.neutral;
              const SentimentIcon = sentiment.icon;

              return (
                <div key={item.id} className="rounded-xl border border-slate-200/70 bg-white/75 p-4">
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className={cn("rounded-lg p-1.5", sentiment.bg)}>
                        <SentimentIcon className={cn("h-3.5 w-3.5", sentiment.color)} />
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {item.app?.name || item.source} · {item.sourceLocale.toUpperCase()}
                      </span>
                      {item.rating ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
                          <Star className="h-3.5 w-3.5 fill-amber-400" />
                          {item.rating}/5
                        </span>
                      ) : null}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 rounded-lg text-[11px]"
                      onClick={() => handleTranslate(item.id)}
                      disabled={translatingReview === item.id}
                    >
                      {translatingReview === item.id ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Globe className="mr-1 h-3 w-3" />}
                      {item.translatedText ? "Re-translate" : "Translate"}
                    </Button>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{item.translatedText || item.originalText}</p>
                  {item.translatedText && item.translatedText !== item.originalText ? (
                    <p className="mt-2 text-xs italic text-slate-500">Original: {item.originalText}</p>
                  ) : null}
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                    <span>{item.authorName || "Anonymous"}</span>
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })
          )}

          {hasMore ? (
            <div className="flex justify-center pt-2">
              <Button variant="outline" onClick={() => fetchDashboard(true)} className="rounded-xl bg-white/80">
                Load More Reviews
              </Button>
            </div>
          ) : null}

          {isLimited ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              Free plan shows the latest 200 reviews. Upgrade to unlock full historical insights and trend continuity.
            </div>
          ) : null}
        </CardContent>
      </Card>

      <AnimatePresence>
        {isConnectOpen ? (
          <ModalPortal>
            <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsConnectOpen(false)}
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ y: 20, opacity: 0, scale: 0.96 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 20, opacity: 0, scale: 0.96 }}
                className="relative z-10 w-full max-w-md rounded-3xl border border-slate-200/80 bg-white/95 p-7 shadow-2xl shadow-slate-900/10"
              >
                <h3 className="text-xl font-bold text-slate-900">Connect a New Source</h3>
                <p className="mt-1 text-sm text-slate-500">Add app reviews to start multilingual intelligence.</p>

                <TooltipProvider>
                  <div className="mt-5 flex rounded-2xl bg-slate-100/80 p-1">
                    <button
                      onClick={() => setSourceType("appstore")}
                      className={cn(
                        "flex-1 rounded-xl px-3 py-2 text-xs font-bold",
                        sourceType === "appstore" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                      )}
                    >
                      App Store
                    </button>
                    <UITooltip>
                      <TooltipTrigger className="flex-1 rounded-xl px-3 py-2 text-xs font-bold text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          Play Store <Lock className="h-3 w-3" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>Coming Soon</TooltipContent>
                    </UITooltip>
                  </div>
                </TooltipProvider>

                <div className="mt-4 space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">App Store ID</label>
                  <Input value={newAppId} onChange={(e) => setNewAppId(e.target.value)} placeholder="e.g. 284882215" />
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <Button variant="ghost" onClick={() => setIsConnectOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleConnect} disabled={!newAppId || syncing === "connecting"}>
                    {syncing === "connecting" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Connect"}
                  </Button>
                </div>
              </motion.div>
            </div>
          </ModalPortal>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {isUpgradeOpen ? (
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
                initial={{ y: 20, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 20, opacity: 0, scale: 0.95 }}
                className="relative z-10 max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-[2rem] border border-slate-200/80 bg-white"
              >
                <div className="bg-gradient-to-br from-[#0f1e46] via-[#1a2f6f] to-[#2f6d5a] p-8 text-white">
                  <p className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                    Premium Upgrade
                  </p>
                  <h3 className="mt-3 text-2xl font-bold">{upgradeTitle}</h3>
                  <p className="mt-2 text-sm text-blue-100">{upgradeMessage}</p>
                </div>
                <div className="p-8">
                  <div className="space-y-3 text-sm text-slate-600">
                    <p>• Unlock all locales beyond free top-5 coverage</p>
                    <p>• Unlimited AI analysis with ROI impact modeling</p>
                    <p>• Full opportunity map and historical trend access</p>
                  </div>
                  <div className="mt-6 flex flex-col gap-3">
                    <Button className="h-12 rounded-2xl bg-emerald-300 text-base font-bold text-emerald-950 hover:bg-emerald-200">
                      Upgrade to Premium — $49/mo
                    </Button>
                    <Button variant="ghost" className="h-11 rounded-2xl" onClick={() => setIsUpgradeOpen(false)}>
                      Maybe later
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </ModalPortal>
        ) : null}
      </AnimatePresence>

      <Card className="kivo-card rounded-2xl border-slate-200/70">
        <CardHeader>
          <CardTitle>Connected Apps</CardTitle>
          <CardDescription>Quick source controls</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {user?.apps.map((app) => (
            <div key={app.id} className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-white/75 p-3">
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-white p-2 shadow-sm">
                  {app.sourceType === "appstore" ? <Apple className="h-4 w-4" /> : <Database className="h-4 w-4" />}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{app.name}</p>
                  <p className="text-xs text-slate-400">
                    {app._count.feedback} synced reviews · {app.lastSyncStatus || "idle"}
                  </p>
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-lg text-red-500 hover:bg-red-50"
                onClick={() => handleDisconnect(app.id)}
                disabled={syncing === app.id}
              >
                {syncing === app.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
