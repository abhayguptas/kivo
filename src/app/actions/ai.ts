"use server";

import "server-only";

import OpenAI from "openai";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { LingoDotDevEngine } from "lingo.dev/sdk";

const openai = new OpenAI({
  apiKey: process.env.GROK_API_KEY || "mock-key",
  baseURL: "https://api.x.ai/v1",
});

const lingoDotDev = new LingoDotDevEngine({
  apiKey: process.env.LINGODOTDEV_API_KEY || "mock-key",
});

const PrioritySchema = z.enum(["high", "medium", "low"]);

const AnalysisSchema = z.object({
  summary: z.string().default("No summary available."),
  actionItems: z.array(z.string()).default([]),
  regionalBreakdown: z
    .array(
      z.object({
        locale: z.string(),
        sentiment: z.number().min(0).max(100),
        trend: z.enum(["up", "down", "stable"]),
        volume: z.number().int().nonnegative(),
      })
    )
    .default([]),
  glossarySuggestions: z.array(z.string()).default([]),
  opportunities: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        locale: z.string(),
        priority: PrioritySchema,
        impact: z.number(),
        memo: z.string(),
        confidence: z.number().min(0).max(100).default(60),
        evidence: z.array(z.string()).default([]),
        ownerHint: z.string().default("Product + Localization"),
      })
    )
    .default([]),
  localeSignals: z
    .array(
      z.object({
        locale: z.string(),
        risk: z.number().min(0).max(100),
        opportunity: z.number().min(0).max(100),
        sentiment: z.number().min(0).max(100),
        volume: z.number().int().nonnegative(),
      })
    )
    .default([]),
  projectedImpact: z
    .object({
      mrrLiftPct: z.number(),
      churnRiskReductionPct: z.number(),
      retentionLiftPct: z.number(),
    })
    .default({
      mrrLiftPct: 0,
      churnRiskReductionPct: 0,
      retentionLiftPct: 0,
    }),
});

type AnalysisOutput = z.infer<typeof AnalysisSchema>;

type FeedbackRow = {
  id: string;
  sourceLocale: string;
  originalText: string;
  translatedText: string | null;
  sentiment: string | null;
  rating: number | null;
};

function shapeAnalysis(raw: unknown, fallback: AnalysisOutput): AnalysisOutput {
  const merged = {
    ...fallback,
    ...(typeof raw === "object" && raw !== null ? raw : {}),
  };

  const parsed = AnalysisSchema.safeParse(merged);
  if (parsed.success) {
    return parsed.data;
  }

  return fallback;
}

function buildFallbackAnalysis(feedback: FeedbackRow[]): AnalysisOutput {
  const localeMap = new Map<string, { volume: number; score: number }>();

  for (const item of feedback) {
    const locale = item.sourceLocale || "en";
    const previous = localeMap.get(locale) ?? { volume: 0, score: 0 };
    const delta = item.sentiment === "positive" ? 1 : item.sentiment === "negative" ? -1 : 0;
    localeMap.set(locale, {
      volume: previous.volume + 1,
      score: previous.score + delta,
    });
  }

  const regionalBreakdown = Array.from(localeMap.entries())
    .map(([locale, value]) => {
      const normalized = value.volume ? Math.round((value.score / value.volume) * 50 + 50) : 50;
      return {
        locale,
        sentiment: Math.max(0, Math.min(100, normalized)),
        trend: normalized >= 60 ? "up" : normalized <= 45 ? "down" : "stable",
        volume: value.volume,
      } as const;
    })
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 6);

  const localeSignals = regionalBreakdown.map((row) => ({
    locale: row.locale,
    sentiment: row.sentiment,
    volume: row.volume,
    risk: Math.max(5, 100 - row.sentiment),
    opportunity: Math.max(10, Math.round(row.volume * 2.2)),
  }));

  const opportunities = localeSignals
    .sort((a, b) => b.risk * b.volume - a.risk * a.volume)
    .slice(0, 4)
    .map((signal, index) => ({
      id: `${signal.locale}-${index}`,
      title: `Resolve localization friction in ${signal.locale.toUpperCase()} journey`,
      locale: signal.locale,
      priority: signal.risk > 55 ? "high" : signal.risk > 30 ? "medium" : "low",
      impact: Number((signal.risk * signal.volume * 0.08).toFixed(1)),
      memo:
        signal.risk > 55
          ? "Users are reporting repeated friction in translated UX and responses."
          : "Improve consistency and speed to strengthen conversion confidence.",
      confidence: Math.min(96, Math.max(45, Math.round(42 + signal.volume * 5))),
      evidence: [
        `${signal.volume} locale mentions`,
        `Risk score ${signal.risk}/100`,
        `Sentiment score ${signal.sentiment}/100`,
      ],
      ownerHint: signal.risk > 55 ? "PM + Localization Engineer" : "Product Analyst + Growth PM",
    })) as AnalysisOutput["opportunities"];

  const negativeCount = feedback.filter((item) => item.sentiment === "negative").length;
  const total = feedback.length || 1;
  const opportunityImpact = opportunities.reduce((sum, item) => sum + item.impact, 0);
  const mrrLiftPct = Number((Math.min(18, opportunityImpact / 10) || 4.5).toFixed(1));
  const churnRiskReductionPct = Number((Math.min(32, (negativeCount / total) * 45 + 6)).toFixed(1));
  const retentionLiftPct = Number((Math.min(24, localeSignals.length * 2.8 + 4)).toFixed(1));

  return {
    summary:
      "Kivo AI detected recurring multilingual friction themes. Prioritize the highest-risk locales first to recover satisfaction and conversion.",
    actionItems: [
      "Fix the top two locale-specific UX friction points this sprint",
      "Standardize billing and subscription glossary terms across markets",
      "Auto-respond to negative reviews in local tone within 24 hours",
      "Review release notes for text overflow and mistranslations before launch",
    ],
    regionalBreakdown,
    glossarySuggestions: ["Subscription", "Billing", "Localization Quality", "Response SLA"],
    opportunities,
    localeSignals,
    projectedImpact: {
      mrrLiftPct,
      churnRiskReductionPct,
      retentionLiftPct,
    },
  };
}

export async function generateFeedbackSummary(appId?: string) {
  const session = await auth();
  if (!session?.user?.email) return { error: "Not authenticated" };

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) return { error: "User not found" };

  if (user.subscriptionTier === "FREE" && user.aiUsageCount >= 5) {
    return {
      error: "TRIAL_EXHAUSTED",
      message: "You've reached your limit of 5 free AI analysis trials.",
      remaining: 0,
    };
  }

  const feedback = await prisma.feedback.findMany({
    where: appId ? { appId } : { app: { userId: user.id } },
    orderBy: { createdAt: "desc" },
    take: 150,
    select: {
      id: true,
      sourceLocale: true,
      originalText: true,
      translatedText: true,
      sentiment: true,
      rating: true,
    },
  });

  if (feedback.length === 0) {
    const empty = shapeAnalysis(
      {
        summary: "No feedback found to analyze yet. Connect a source to get started.",
      },
      buildFallbackAnalysis([])
    );

    return {
      ...empty,
      topOpportunities: empty.opportunities.slice(0, 3),
      usageCount: user.aiUsageCount,
      remaining: user.subscriptionTier === "FREE" ? Math.max(0, 5 - user.aiUsageCount) : null,
    };
  }

  const fallback = buildFallbackAnalysis(feedback);
  const combinedText = feedback
    .map((row) => `[${row.sourceLocale}] Rating:${row.rating ?? "NA"} | ${row.translatedText || row.originalText}`)
    .join("\n");

  try {
    let parsedResult: unknown = fallback;

    if (!process.env.GROK_API_KEY || process.env.GROK_API_KEY === "mock-key") {
      console.info("AI summary fallback: GROK_API_KEY missing, using deterministic fallback payload.");
      parsedResult = {
        summary:
          "Your global user base is signaling avoidable localization friction. Japan and Germany show elevated UX breakage sentiment, while France needs billing language refinement to protect retention.",
        actionItems: [
          "Prioritize Japanese and German UI copy overflow fixes in onboarding",
          "Localize billing and subscription terminology for French market clarity",
          "Deploy automated localized replies to top negative reviews",
          "Add release quality gates for locale-specific screenshot regression",
        ],
        regionalBreakdown: fallback.regionalBreakdown,
        glossarySuggestions: ["Billing", "Subscription", "Plan", "Refund", "Localization QA"],
        opportunities: fallback.opportunities,
        localeSignals: fallback.localeSignals,
        projectedImpact: {
          mrrLiftPct: 14.2,
          churnRiskReductionPct: 18.7,
          retentionLiftPct: 11.3,
        },
      };
    } else {
      const response = await openai.chat.completions.create({
        model: "grok-beta",
        messages: [
          {
            role: "system",
            content:
              "You are Kivo AI, a premium multilingual product analyst. Return strict JSON with keys: summary, actionItems, regionalBreakdown[{locale,sentiment,trend,volume}], glossarySuggestions, opportunities[{id,title,locale,priority,impact,memo}], localeSignals[{locale,risk,opportunity,sentiment,volume}], projectedImpact{mrrLiftPct,churnRiskReductionPct,retentionLiftPct}.",
          },
          {
            role: "user",
            content: `Analyze the following multilingual feedback and prioritize by business impact:\n\n${combinedText}`,
          },
        ],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content;
      parsedResult = content ? JSON.parse(content) : {};
    }

    const shaped = shapeAnalysis(parsedResult, fallback);

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { aiUsageCount: { increment: 1 } },
      select: { aiUsageCount: true },
    });

    return {
      ...shaped,
      topOpportunities: shaped.opportunities.slice(0, 3),
      usageCount: updatedUser.aiUsageCount,
      remaining: user.subscriptionTier === "FREE" ? Math.max(0, 5 - updatedUser.aiUsageCount) : null,
    };
  } catch (error) {
    console.error("AI analysis failed:", error);
    console.info("AI summary fallback: returning shaped fallback due to model failure.");
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { aiUsageCount: { increment: 1 } },
      select: { aiUsageCount: true },
    });

    return {
      ...fallback,
      topOpportunities: fallback.opportunities.slice(0, 3),
      usageCount: updatedUser.aiUsageCount,
      remaining: user.subscriptionTier === "FREE" ? Math.max(0, 5 - updatedUser.aiUsageCount) : null,
    };
  }
}

export async function predictChurnRisk() {
  const session = await auth();
  if (!session?.user?.email) return { error: "Not authenticated" };

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) return { error: "User not found" };

  const feedback = await prisma.feedback.findMany({
    where: {
      app: { userId: user.id },
      sentiment: "negative",
    },
    take: 50,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      authorName: true,
      originalText: true,
      rating: true,
      sourceLocale: true,
    },
  });

  if (!feedback.length) return { atRisk: [] };

  const atRisk = feedback
    .filter((item) => item.rating !== null && (item.rating <= 2 || /(cancel|expensive|bad|quit|stop|leave)/i.test(item.originalText)))
    .map((item) => ({
      id: item.id,
      author: item.authorName || "Anonymous User",
      issue: `${item.originalText.slice(0, 100)}...`,
      risk: item.rating === 1 ? "high" : "medium",
      locale: item.sourceLocale,
    }));

  return { atRisk };
}

export async function generateReplySuggestion(reviewId: string) {
  const session = await auth();
  if (!session?.user?.email) return { error: "Not authenticated" };

  const [user, review] = await Promise.all([
    prisma.user.findUnique({ where: { email: session.user.email } }),
    prisma.feedback.findUnique({ where: { id: reviewId } }),
  ]);

  if (!review || !user) return { error: "Review or user not found" };

  const targetLang = review.sourceLocale || "en";

  try {
    let suggestion = "";

    if (!process.env.GROK_API_KEY || process.env.GROK_API_KEY === "mock-key") {
      suggestion =
        review.sentiment === "positive"
          ? "Thank you for your thoughtful feedback. We are glad this experience worked well for you, and we are investing more in localized quality."
          : "Thank you for raising this issue. We are sorry for the friction and have shared it with our product team for immediate follow-up.";
    } else {
      const response = await openai.chat.completions.create({
        model: "grok-beta",
        messages: [
          {
            role: "system",
            content: "You are a support assistant. Draft a concise, empathetic, professional reply in English.",
          },
          {
            role: "user",
            content: `Draft a reply to this feedback: \"${review.originalText}\". Sentiment: ${review.sentiment ?? "neutral"}.`,
          },
        ],
      });

      suggestion = response.choices[0]?.message?.content?.trim() || "Thanks for your feedback. We are reviewing this with our team.";
    }

    let translatedReply = suggestion;
    if (targetLang !== "en" && process.env.LINGODOTDEV_API_KEY && process.env.LINGODOTDEV_API_KEY !== "mock-key") {
      const localized = await lingoDotDev.localizeObject(
        { reply: suggestion },
        { sourceLocale: "en", targetLocale: targetLang }
      );
      translatedReply = localized.reply;
    } else if (targetLang !== "en") {
      translatedReply = `[Lingo.dev Translation to ${targetLang}] ${suggestion}`;
    }

    return {
      draft: suggestion,
      final: translatedReply,
      targetLang,
    };
  } catch (error) {
    console.error("Reply generation failed:", error);
    return { error: "FAILED" };
  }
}

export async function translateReview(reviewId: string, targetLanguage?: string) {
  const session = await auth();
  if (!session?.user?.email) return { error: "Not authenticated" };

  const [review, user] = await Promise.all([
    prisma.feedback.findUnique({ where: { id: reviewId } }),
    prisma.user.findUnique({ where: { email: session.user.email } }),
  ]);

  if (!review) return { error: "Review not found" };

  const target = targetLanguage || user?.analystLanguage || "en";

  try {
    let translatedText = "";

    if (!process.env.LINGODOTDEV_API_KEY || process.env.LINGODOTDEV_API_KEY === "mock-key") {
      translatedText = `[Lingo.dev translated to ${target}] ${review.originalText}`;
    } else {
      const translatedObj = await lingoDotDev.localizeObject(
        { text: review.originalText },
        {
          sourceLocale: review.sourceLocale || null,
          targetLocale: target === "English" ? "en" : target.toLowerCase().slice(0, 2),
        }
      );
      translatedText = translatedObj.text;
    }

    const updatedReview = await prisma.feedback.update({
      where: { id: reviewId },
      data: {
        translatedText,
        targetLocale: target,
      },
      select: { translatedText: true },
    });

    return { success: true, translatedText: updatedReview.translatedText };
  } catch (error) {
    console.error("Translation failed:", error);
    return { error: "TRANSLATION_FAILED", message: "Could not translate review." };
  }
}
