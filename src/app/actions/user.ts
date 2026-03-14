"use server";

import "server-only";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { buildWebhookApiKey } from "@/lib/security";

type SourceType = "appstore" | "playstore";

type FeedbackSentiment = "positive" | "negative" | "mixed" | "neutral";

type LocaleMeta = {
  code: string;
  name: string;
};

const SUPPORTED_LOCALES: LocaleMeta[] = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "ja", name: "Japanese" },
  { code: "pt", name: "Portuguese" },
  { code: "hi", name: "Hindi" },
  { code: "ko", name: "Korean" },
  { code: "it", name: "Italian" },
  { code: "zh", name: "Chinese" },
  { code: "ru", name: "Russian" },
  { code: "ar", name: "Arabic" },
  { code: "tr", name: "Turkish" },
  { code: "nl", name: "Dutch" },
  { code: "pl", name: "Polish" },
  { code: "vi", name: "Vietnamese" },
  { code: "th", name: "Thai" },
  { code: "id", name: "Indonesian" },
  { code: "sv", name: "Swedish" },
  { code: "fi", name: "Finnish" },
  { code: "da", name: "Danish" },
  { code: "no", name: "Norwegian" },
  { code: "cs", name: "Czech" },
  { code: "hu", name: "Hungarian" },
];

const DEFAULT_FREE_LOCALES = ["en", "es", "fr", "de", "ja"];

function detectLocaleFromText(text: string): string {
  if (!text) return "en";

  if (/[\u3040-\u30ff\u4e00-\u9faf]/.test(text)) return "ja";
  if (/[\uac00-\ud7af]/.test(text)) return "ko";
  if (/[\u0900-\u097f]/.test(text)) return "hi";
  if (/[\u0400-\u04ff]/.test(text)) return "ru";
  if (/[\u0600-\u06ff]/.test(text)) return "ar";
  if (/[\u0e00-\u0e7f]/.test(text)) return "th";

  const lower = text.toLowerCase();
  if (/[¿¡ñ]/.test(lower) || /(\bno puedo\b|\bgracias\b|\bmuy\b|\bexcelente\b)/.test(lower)) return "es";
  if (/[àâçéèêëîïôûùüÿœ]/.test(lower) || /(\btrès\b|\bmerci\b|\bbonjour\b|\bapplication\b)/.test(lower)) return "fr";
  if (/[äöüß]/.test(lower) || /(\bdanke\b|\bnicht\b|\bsehr\b)/.test(lower)) return "de";
  if (/[ãõ]/.test(lower) || /(\bobrigado\b|\bnão\b|\bmuito\b)/.test(lower)) return "pt";
  if (/(\biyi\b|\bkötü\b|\bteşekkür\b)/.test(lower)) return "tr";

  return "en";
}

function normalizeSentiment(rating: number | null): FeedbackSentiment {
  if (!rating) return "neutral";
  if (rating >= 4) return "positive";
  if (rating <= 2) return "negative";
  return "mixed";
}

type AppStoreEntry = {
  content?: { label?: string };
  id?: { label?: string };
  author?: { name?: { label?: string } };
  ["im:rating"]?: { label?: string };
  title?: { label?: string };
};

type SyncItem = {
  source: string;
  sourceLocale: string;
  originalText: string;
  translatedText: string;
  sentiment: FeedbackSentiment;
  rating: number | null;
  authorName: string | null;
  externalId: string | null;
  appId: string;
  targetLocale: string;
};

type SyncTelemetry = {
  status: "success" | "error" | "partial";
  pages: number;
  fetched: number;
  inserted: number;
  duplicates: number;
  lastSyncedAt: string;
  message: string;
};

function parseAppStoreEntry(entry: AppStoreEntry, appId: string): SyncItem | null {
  const originalText = entry.content?.label?.trim();
  const externalId = entry.id?.label?.trim() ?? null;
  const ratingRaw = entry["im:rating"]?.label;
  const rating = ratingRaw ? parseInt(ratingRaw, 10) : null;

  if (!originalText || Number.isNaN(rating ?? 0)) {
    return null;
  }

  const locale = detectLocaleFromText(originalText);

  return {
    source: "appstore",
    sourceLocale: locale,
    originalText,
    translatedText: originalText,
    sentiment: normalizeSentiment(rating),
    rating,
    authorName: entry.author?.name?.label?.trim() ?? null,
    externalId,
    appId,
    targetLocale: "en",
  };
}

async function fetchAppStorePage(externalId: string, page: number) {
  const res = await fetch(
    `https://itunes.apple.com/rss/customerreviews/page=${page}/id=${externalId}/sortby=mostrecent/json`,
    { next: { revalidate: 0 } }
  );

  if (!res.ok) {
    return [] as AppStoreEntry[];
  }

  const json: unknown = await res.json();
  const maybeEntries =
    typeof json === "object" &&
    json !== null &&
    "feed" in json &&
    typeof (json as { feed?: unknown }).feed === "object" &&
    (json as { feed?: { entry?: unknown } }).feed?.entry
      ? (json as { feed: { entry: unknown } }).feed.entry
      : [];

  const entries = Array.isArray(maybeEntries) ? maybeEntries : [];
  return entries as AppStoreEntry[];
}

function buildLocaleAccess(args: {
  localeCounts: Record<string, number>;
  subscriptionTier: string;
  analystLanguage: string;
}) {
  const allLocaleCodes = SUPPORTED_LOCALES.map((item) => item.code);
  const ranked = Object.entries(args.localeCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([locale]) => locale);

  if (args.subscriptionTier === "PREMIUM") {
    return {
      unlockedLocales: allLocaleCodes,
      lockedLocales: [] as string[],
      topLocales: ranked.slice(0, 5),
      allLocales: SUPPORTED_LOCALES,
    };
  }

  const seed = [args.analystLanguage, ...ranked, ...DEFAULT_FREE_LOCALES];
  const unlockedLocales = Array.from(new Set(seed.filter((code) => allLocaleCodes.includes(code)))).slice(0, 5);
  const lockedLocales = allLocaleCodes.filter((code) => !unlockedLocales.includes(code));

  return {
    unlockedLocales,
    lockedLocales,
    topLocales: ranked.slice(0, 5),
    allLocales: SUPPORTED_LOCALES,
  };
}

export async function completeDemo() {
  const session = await auth();
  if (!session?.user?.email) return { error: "Not authenticated" };

  await prisma.user.update({
    where: { email: session.user.email },
    data: { hasCompletedDemo: true },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function getUserStatus() {
  const session = await auth();
  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      hasCompletedDemo: true,
      subscriptionTier: true,
      analystLanguage: true,
      aiUsageCount: true,
      webhookApiKeyPrefix: true,
      webhookApiKeyUpdatedAt: true,
      apps: {
        orderBy: { createdAt: "asc" },
        include: {
          _count: {
            select: { feedback: true },
          },
        },
      },
    },
  });

  return user;
}

export async function regenerateWebhookApiKey() {
  const session = await auth();
  if (!session?.user?.email) return { error: "Not authenticated" };

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) return { error: "User not found" };

  const apiKey = buildWebhookApiKey();
  const now = new Date();

  await prisma.user.update({
    where: { id: user.id },
    data: {
      webhookApiKeyHash: apiKey.hash,
      webhookApiKeyPrefix: apiKey.prefix,
      webhookApiKeyUpdatedAt: now,
    },
  });

  revalidatePath("/dashboard/sources");
  revalidatePath("/dashboard/settings");

  return {
    success: true,
    apiKey: apiKey.token,
    prefix: apiKey.prefix,
    updatedAt: now.toISOString(),
  };
}

export async function getFeedback(appId?: string, page = 1, limit = 20) {
  const session = await auth();
  if (!session?.user?.email) return { feedback: [], total: 0, hasMore: false, isLimited: false };

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, subscriptionTier: true },
  });

  if (!user) return { feedback: [], total: 0, hasMore: false, isLimited: false };

  const maxReviews = user.subscriptionTier === "FREE" ? 200 : Number.POSITIVE_INFINITY;
  const skip = Math.max(0, (page - 1) * limit);

  if (skip >= maxReviews) return { feedback: [], total: maxReviews, hasMore: false, isLimited: true };

  const actualLimit = Math.min(limit, maxReviews - skip);

  const [feedback, total] = await Promise.all([
    prisma.feedback.findMany({
      where: {
        app: { userId: user.id },
        ...(appId ? { appId } : {}),
      },
      include: {
        app: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: actualLimit,
    }),
    prisma.feedback.count({
      where: {
        app: { userId: user.id },
        ...(appId ? { appId } : {}),
      },
    }),
  ]);

  const effectiveTotal = Math.min(total, maxReviews);
  const hasMore = skip + actualLimit < effectiveTotal;

  return {
    feedback,
    total: effectiveTotal,
    hasMore,
    isLimited: total > maxReviews,
  };
}

export async function getDashboardAnalytics(appId?: string, range: "14d" | "30d" | "90d" = "30d") {
  const session = await auth();
  if (!session?.user?.email) return { error: "Not authenticated" };

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      subscriptionTier: true,
      aiUsageCount: true,
      analystLanguage: true,
      apps: { select: { id: true } },
    },
  });

  if (!user) return { error: "User not found" };

  const dayWindow = range === "14d" ? 14 : range === "90d" ? 90 : 30;
  const since = new Date();
  since.setDate(since.getDate() - dayWindow);

  const feedback = await prisma.feedback.findMany({
    where: {
      app: { userId: user.id },
      ...(appId ? { appId } : {}),
      createdAt: { gte: since },
    },
    include: {
      app: { select: { name: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const totalReviews = feedback.length;
  const positiveCount = feedback.filter((item) => item.sentiment === "positive").length;
  const negativeCount = feedback.filter((item) => item.sentiment === "negative").length;
  const languages = new Set(feedback.map((item) => item.sourceLocale));
  const rated = feedback.filter((item) => typeof item.rating === "number");

  const avgRating = rated.length
    ? Number((rated.reduce((sum, item) => sum + (item.rating ?? 0), 0) / rated.length).toFixed(1))
    : 0;

  const positivityScore = totalReviews ? Math.round((positiveCount / totalReviews) * 100) : 0;

  const dayLabels = Array.from({ length: dayWindow }, (_, index) => {
    const day = new Date();
    day.setDate(day.getDate() - (dayWindow - 1 - index));
    return day.toISOString().slice(0, 10);
  });

  const trendMap = new Map<string, { date: string; reviews: number; positive: number; negative: number; mixed: number; neutral: number }>();
  dayLabels.forEach((label) => {
    trendMap.set(label, { date: label, reviews: 0, positive: 0, negative: 0, mixed: 0, neutral: 0 });
  });

  const localeCounts: Record<string, number> = {};
  const localeSentimentSum: Record<string, number> = {};
  const sourceMix: Record<string, number> = {};
  const localeNegativeCounts: Record<string, number> = {};
  const localeRatingSum: Record<string, number> = {};
  const localeRatingCount: Record<string, number> = {};
  const ratingDistribution = [1, 2, 3, 4, 5].map((rating) => ({ rating: `${rating}★`, count: 0 }));

  feedback.forEach((item) => {
    const dateKey = item.createdAt.toISOString().slice(0, 10);
    const bucket = trendMap.get(dateKey);
    if (bucket) {
      bucket.reviews += 1;
      const sentiment = item.sentiment ?? "neutral";
      if (sentiment === "positive") bucket.positive += 1;
      else if (sentiment === "negative") bucket.negative += 1;
      else if (sentiment === "mixed") bucket.mixed += 1;
      else bucket.neutral += 1;
    }

    const locale = item.sourceLocale || "en";
    localeCounts[locale] = (localeCounts[locale] ?? 0) + 1;
    if (item.sentiment === "negative") {
      localeNegativeCounts[locale] = (localeNegativeCounts[locale] ?? 0) + 1;
    }
    if (typeof item.rating === "number" && item.rating > 0) {
      localeRatingSum[locale] = (localeRatingSum[locale] ?? 0) + item.rating;
      localeRatingCount[locale] = (localeRatingCount[locale] ?? 0) + 1;
    }

    const sentimentWeight = item.sentiment === "positive" ? 1 : item.sentiment === "negative" ? -1 : 0;
    localeSentimentSum[locale] = (localeSentimentSum[locale] ?? 0) + sentimentWeight;

    const sourceLabel = item.app?.name || item.source;
    sourceMix[sourceLabel] = (sourceMix[sourceLabel] ?? 0) + 1;

    if (item.rating && item.rating >= 1 && item.rating <= 5) {
      ratingDistribution[item.rating - 1].count += 1;
    }
  });

  const localeDistribution = Object.entries(localeCounts)
    .map(([locale, count]) => ({
      locale,
      count,
      sentimentScore: Math.max(0, Math.min(100, Math.round(((localeSentimentSum[locale] ?? 0) / count) * 50 + 50))),
    }))
    .sort((a, b) => b.count - a.count);

  const appMix = Object.entries(sourceMix)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const opportunities = localeDistribution
    .slice(0, 6)
    .map((locale, index) => {
      const risk = 100 - locale.sentimentScore;
      const priority = risk > 45 ? "high" : risk > 25 ? "medium" : "low";
      const impact = Number((locale.count * (risk / 100) * 0.8).toFixed(1));

      return {
        id: `${locale.locale}-${index}`,
        locale: locale.locale,
        priority,
        impact,
        headline:
          priority === "high"
            ? `Localization friction is increasing in ${locale.locale.toUpperCase()}`
            : `Quality optimization opportunity in ${locale.locale.toUpperCase()}`,
      };
    })
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 4);

  const midpoint = Math.floor(dayLabels.length / 2) || 1;
  const firstHalfSet = new Set(dayLabels.slice(0, midpoint));
  const secondHalfSet = new Set(dayLabels.slice(midpoint));

  const localeHalfVolume = new Map<string, { first: number; second: number }>();
  const localeHalfRating = new Map<string, { firstSum: number; firstCount: number; secondSum: number; secondCount: number }>();

  for (const item of feedback) {
    const locale = item.sourceLocale || "en";
    const dateKey = item.createdAt.toISOString().slice(0, 10);
    const half = localeHalfVolume.get(locale) ?? { first: 0, second: 0 };
    const ratingHalf = localeHalfRating.get(locale) ?? { firstSum: 0, firstCount: 0, secondSum: 0, secondCount: 0 };

    if (firstHalfSet.has(dateKey)) {
      half.first += 1;
      if (typeof item.rating === "number" && item.rating > 0) {
        ratingHalf.firstSum += item.rating;
        ratingHalf.firstCount += 1;
      }
    } else if (secondHalfSet.has(dateKey)) {
      half.second += 1;
      if (typeof item.rating === "number" && item.rating > 0) {
        ratingHalf.secondSum += item.rating;
        ratingHalf.secondCount += 1;
      }
    }

    localeHalfVolume.set(locale, half);
    localeHalfRating.set(locale, ratingHalf);
  }

  const opportunitiesTop3 = localeDistribution
    .map((locale, index) => {
      const localeCode = locale.locale;
      const negatives = localeNegativeCounts[localeCode] ?? 0;
      const negativeRate = locale.count ? negatives / locale.count : 0;
      const risk = Math.max(0, 100 - locale.sentimentScore);
      const impactPct = Number((Math.min(25, (risk * locale.count) / Math.max(10, totalReviews) * 2.2)).toFixed(1));
      const halfVolume = localeHalfVolume.get(localeCode) ?? { first: 0, second: 0 };
      const trendDelta = halfVolume.second - halfVolume.first;
      const trendPct = halfVolume.first > 0 ? Math.round(((halfVolume.second - halfVolume.first) / halfVolume.first) * 100) : halfVolume.second > 0 ? 100 : 0;
      const ratings = localeHalfRating.get(localeCode) ?? { firstSum: 0, firstCount: 0, secondSum: 0, secondCount: 0 };
      const firstAvg = ratings.firstCount ? ratings.firstSum / ratings.firstCount : 0;
      const secondAvg = ratings.secondCount ? ratings.secondSum / ratings.secondCount : 0;
      const ratingDrop = Number(Math.max(0, firstAvg - secondAvg).toFixed(1));
      const confidence = Math.min(96, Math.max(42, Math.round(45 + locale.count * 3 + negativeRate * 35)));
      const priority = risk > 45 ? "high" : risk > 25 ? "medium" : "low";

      return {
        id: `${localeCode}-top-${index}`,
        locale: localeCode,
        headline:
          priority === "high"
            ? `Churn risk rising in ${localeCode.toUpperCase()} due to localized friction`
            : `Growth opportunity detected in ${localeCode.toUpperCase()} locale experience`,
        impactPct,
        confidence,
        evidence: [
          `${negatives} negative reviews (${Math.round(negativeRate * 100)}%)`,
          `${trendDelta >= 0 ? "+" : ""}${trendDelta} trend delta (${trendPct >= 0 ? "+" : ""}${trendPct}%)`,
          `Rating drop: ${ratingDrop.toFixed(1)} pts`,
        ],
        ownerHint: priority === "high" ? "PM + Localization Engineer" : "Product Analyst + Growth PM",
        priority,
        expectedLift: Number((Math.max(2.5, impactPct * 0.8)).toFixed(1)),
      };
    })
    .sort((a, b) => b.impactPct - a.impactPct)
    .slice(0, 3);

  const proofMode = totalReviews >= 20 ? "live" : "simulated";
  const proofReason =
    proofMode === "live"
      ? "Based on real workspace activity in selected date range."
      : "Not enough live volume yet; showing simulation baseline until more data arrives.";
  const weightedRisk = totalReviews ? Math.round((negativeCount / totalReviews) * 100) : 48;
  const proofMetrics =
    proofMode === "live"
      ? {
          mrrLiftPct: Number((Math.min(22, 5 + weightedRisk * 0.18)).toFixed(1)),
          churnRiskPct: weightedRisk,
          retentionLiftPts: Number((Math.min(19, 4 + languages.size * 1.4)).toFixed(1)),
        }
      : {
          mrrLiftPct: 14.2,
          churnRiskPct: 31,
          retentionLiftPts: 11.8,
        };

  const localeAccess = buildLocaleAccess({
    localeCounts,
    subscriptionTier: user.subscriptionTier,
    analystLanguage: user.analystLanguage,
  });

  return {
    kpis: {
      totalReviews,
      positivityScore,
      avgRating,
      languages: languages.size,
      negativeCount,
    },
    trends: {
      reviewsByDay: Array.from(trendMap.values()),
      sentimentByDay: Array.from(trendMap.values()),
    },
    distributions: {
      ratingDistribution,
      localeDistribution,
      appMix,
    },
    opportunities,
    opportunitiesTop3,
    proof: {
      mode: proofMode,
      reason: proofReason,
      metrics: proofMetrics,
    },
    limits: {
      aiUsage: user.aiUsageCount,
      aiLimit: user.subscriptionTier === "FREE" ? 5 : null,
      appsUsed: user.apps.length,
      appLimit: user.subscriptionTier === "FREE" ? 2 : null,
      unlockedLocales: localeAccess.unlockedLocales,
      lockedLocales: localeAccess.lockedLocales,
      topLocales: localeAccess.topLocales,
      allLocales: localeAccess.allLocales,
    },
  };
}

export async function connectApp(source: SourceType, externalId: string, name?: string) {
  const session = await auth();
  if (!session?.user?.email) return { error: "Not authenticated" };

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { apps: true },
  });

  if (!user) return { error: "User not found" };

  const existingApp = user.apps.find((app) => app.externalId === externalId && app.sourceType === source);
  if (existingApp) {
    return { error: "ALREADY_CONNECTED", message: `The app \"${existingApp.name}\" is already connected to your account.` };
  }

  if (user.subscriptionTier === "FREE" && user.apps.length >= 2) {
    return { error: "LIMIT_REACHED", message: "Free plan is limited to 2 apps. Upgrade to Premium for unlimited connections." };
  }

  let finalName = name || (source === "appstore" ? "iOS Application" : "Android Application");

  if (source === "appstore") {
    try {
      const itunesRes = await fetch(`https://itunes.apple.com/lookup?id=${externalId}`);
      const itunesData: unknown = await itunesRes.json();
      if (
        typeof itunesData === "object" &&
        itunesData !== null &&
        "results" in itunesData &&
        Array.isArray((itunesData as { results?: unknown[] }).results)
      ) {
        const first = (itunesData as { results: Array<{ trackName?: string; bundleId?: string }> }).results[0];
        if (first) {
          finalName = first.trackName || first.bundleId || finalName;
        }
      }
    } catch (error) {
      console.warn("Failed to fetch App Store metadata for", externalId, error);
    }
  }

  const app = await prisma.app.create({
    data: {
      name: finalName,
      sourceType: source,
      externalId,
      userId: user.id,
    },
  });

  const syncResult = await syncAppData(app.id, { maxPages: 25, backfill: true });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/sources");
  return { success: true, app, sync: syncResult };
}

export async function disconnectApp(appId: string) {
  const session = await auth();
  if (!session?.user?.email) return { error: "Not authenticated" };

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) return { error: "User not found" };

  const app = await prisma.app.findFirst({
    where: { id: appId, userId: user.id },
  });

  if (!app) return { error: "App not found or unauthorized" };

  await prisma.app.delete({
    where: { id: appId },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/sources");
  return { success: true };
}

export async function syncConnectedApp(appId: string) {
  const session = await auth();
  if (!session?.user?.email) return { error: "Not authenticated" };

  const app = await prisma.app.findFirst({
    where: {
      id: appId,
      user: { email: session.user.email },
    },
    select: { id: true },
  });

  if (!app) return { error: "App not found or unauthorized" };
  return syncAppData(app.id, { maxPages: 25, backfill: true });
}

export async function syncAppData(appId: string, options?: { maxPages?: number; backfill?: boolean }) {
  const app = await prisma.app.findUnique({
    where: { id: appId },
  });

  if (!app) return { error: "App not found" };

  const isBackfill = Boolean(options?.backfill);
  const maxPages = Math.max(1, options?.maxPages ?? (isBackfill ? 25 : 10));
  const now = new Date();
  const syncData: SyncItem[] = [];
  let fetched = 0;
  let duplicates = 0;
  let pages = 0;
  let status: SyncTelemetry["status"] = "success";
  let message = "Sync completed.";

  try {
    if (app.sourceType === "appstore" && app.externalId) {
      const existing = await prisma.feedback.findMany({
        where: { appId: app.id, externalId: { not: null } },
        select: { externalId: true },
      });

      const existingExternalIds = new Set(
        existing.map((item) => item.externalId).filter((value): value is string => Boolean(value))
      );
      const fetchedIds = new Set<string>();

      for (let page = 1; page <= maxPages; page += 1) {
        const entries = await fetchAppStorePage(app.externalId, page);
        if (!entries.length) break;
        pages += 1;

        let insertedThisPage = 0;
        for (const entry of entries.slice(1)) {
          const normalized = parseAppStoreEntry(entry, app.id);
          if (!normalized || !normalized.externalId) continue;

          fetched += 1;
          if (existingExternalIds.has(normalized.externalId) || fetchedIds.has(normalized.externalId)) {
            duplicates += 1;
            continue;
          }

          fetchedIds.add(normalized.externalId);
          syncData.push(normalized);
          insertedThisPage += 1;
        }

        if (insertedThisPage === 0 && !isBackfill) break;
      }

      if (pages === 0) message = "No App Store pages returned.";
    } else if (app.sourceType === "playstore") {
      const sampleExternalId = `playstore-${app.id}-sample`;
      const existing = await prisma.feedback.findFirst({
        where: { appId: app.id, externalId: sampleExternalId },
        select: { id: true },
      });

      fetched = 1;
      pages = 1;
      if (existing) {
        duplicates = 1;
        message = "Play Store sample already synced.";
      } else {
        syncData.push({
          source: "playstore",
          sourceLocale: "hi",
          originalText: `यह ${app.name} बहुत अच्छा है।`,
          translatedText: `This ${app.name} is very good.`,
          sentiment: "positive",
          rating: 4,
          authorName: "Rahul V.",
          externalId: sampleExternalId,
          appId: app.id,
          targetLocale: "en",
        });
      }
    }
  } catch (error) {
    status = "error";
    message = error instanceof Error ? error.message : "Unexpected sync failure";
    console.warn("Sync failed", { appId: app.id, source: app.sourceType, error });
  }

  let inserted = 0;
  if (syncData.length) {
    const createResult = await prisma.feedback.createMany({
      data: syncData,
      skipDuplicates: true,
    });
    inserted = createResult.count;
  }

  if (status === "success" && inserted === 0 && fetched > 0) {
    status = "partial";
    message = "No new records inserted; all fetched reviews were already present.";
  }

  if (status === "success" && fetched === 0 && inserted === 0) {
    message = "No new reviews found for this source.";
  }

  const telemetry: SyncTelemetry = {
    status,
    pages,
    fetched,
    inserted,
    duplicates,
    lastSyncedAt: now.toISOString(),
    message,
  };

  await prisma.app.update({
    where: { id: app.id },
    data: {
      lastSyncedAt: now,
      lastSyncStatus: telemetry.status,
      lastSyncPages: telemetry.pages,
      lastSyncFetched: telemetry.fetched,
      lastSyncInserted: telemetry.inserted,
      lastSyncMessage: telemetry.message,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/sources");
  revalidatePath("/dashboard/inbox");

  return {
    success: telemetry.status !== "error",
    synced: inserted,
    telemetry,
  };
}

export async function simulateSync(source: SourceType, externalId: string) {
  return connectApp(source, externalId, source === "appstore" ? "New iOS App" : "New Android App");
}
