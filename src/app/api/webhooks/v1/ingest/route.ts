import { NextResponse } from "next/server";
import { LingoDotDevEngine } from "lingo.dev/sdk";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hashWebhookApiKey } from "@/lib/security";

type IngestPayloadItem = {
  id?: string;
  externalId?: string;
  source?: string;
  sourceLocale?: string;
  locale?: string;
  lang?: string;
  text?: string;
  body?: string;
  content?: string;
  rating?: string | number;
  author?: string;
  authorName?: string;
  appId?: string;
  metadata?: unknown;
};

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

async function getWorkspaceUserFromAuth(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

  const rawToken = authHeader.replace("Bearer ", "").trim();
  if (!rawToken) return null;

  const hash = hashWebhookApiKey(rawToken);
  return prisma.user.findFirst({
    where: { webhookApiKeyHash: hash },
    select: { id: true, email: true, webhookApiKeyPrefix: true },
  });
}

export async function POST(request: Request) {
  try {
    const workspaceUser = await getWorkspaceUserFromAuth(request);
    if (!workspaceUser) return unauthorized();

    const payload = (await request.json()) as { data?: IngestPayloadItem[] };
    if (!payload.data || !Array.isArray(payload.data)) {
      return NextResponse.json({ error: "Invalid payload format. Expected { data: [] }" }, { status: 400 });
    }

    const appIds = Array.from(
      new Set(payload.data.map((item) => item.appId).filter((value): value is string => Boolean(value)))
    );

    const ownedApps = appIds.length
      ? await prisma.app.findMany({
          where: {
            id: { in: appIds },
            userId: workspaceUser.id,
          },
          select: { id: true },
        })
      : [];

    const ownedAppIds = new Set(ownedApps.map((app) => app.id));

    const apiKey = process.env.LINGODOTDEV_API_KEY;
    const lingoDotDev = apiKey ? new LingoDotDevEngine({ apiKey }) : null;

    let processed = 0;
    let inserted = 0;
    let duplicates = 0;
    let failed = 0;
    const errors: Array<{ index: number; reason: string }> = [];

    for (let index = 0; index < payload.data.length; index += 1) {
      processed += 1;
      const item = payload.data[index];

      if (!item.appId || !ownedAppIds.has(item.appId)) {
        failed += 1;
        errors.push({ index, reason: "Invalid or unauthorized appId" });
        continue;
      }

      const originalText = item.text || item.body || item.content || "";
      if (!originalText.trim()) {
        failed += 1;
        errors.push({ index, reason: "Missing feedback text" });
        continue;
      }

      const sourceLocale = item.sourceLocale || item.locale || item.lang || "auto";
      const externalId = (item.id || item.externalId || "").trim() || null;

      if (externalId) {
        const existing = await prisma.feedback.findFirst({
          where: {
            appId: item.appId,
            externalId,
          },
          select: { id: true },
        });

        if (existing) {
          duplicates += 1;
          continue;
        }
      }

      let translatedText = originalText;

      if (lingoDotDev) {
        try {
          const translated = await lingoDotDev.localizeObject(
            { text: originalText },
            { sourceLocale: sourceLocale === "auto" ? null : sourceLocale, targetLocale: "en" }
          );
          translatedText = translated.text;
        } catch (error) {
          console.error("Translation failed for webhook item", error);
        }
      }

      let sentiment = "neutral";
      const lower = translatedText.toLowerCase();
      if (/love|great|amazing|excellent|perfect|awesome|fantastic|best|good|happy/.test(lower)) {
        sentiment = "positive";
      } else if (/hate|terrible|awful|worst|bad|horrible|broken|crash|bug|slow|poor/.test(lower)) {
        sentiment = "negative";
      }

      const parsedRating = item.rating !== undefined && item.rating !== null ? parseInt(String(item.rating), 10) : null;

      await prisma.feedback.create({
        data: {
          source: item.source || "webhook",
          sourceLocale,
          originalText,
          translatedText,
          targetLocale: "en",
          sentiment,
          rating: parsedRating !== null && Number.isNaN(parsedRating) ? null : parsedRating,
          authorName: item.author || item.authorName || null,
          appId: item.appId,
          externalId,
          metadata: item.metadata ? (item.metadata as Prisma.InputJsonValue) : undefined,
        },
      });

      inserted += 1;
    }

    return NextResponse.json({
      success: true,
      summary: { processed, inserted, duplicates, failed },
      errors,
    });
  } catch (error) {
    console.error("Webhook processing failed:", error);
    return NextResponse.json({ error: "Internal server error processing webhook" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const workspaceUser = await getWorkspaceUserFromAuth(request);
    if (!workspaceUser) return unauthorized();

    const feedback = await prisma.feedback.findMany({
      where: {
        app: { userId: workspaceUser.id },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ data: feedback });
  } catch (error) {
    console.error("Failed to fetch feedback:", error);
    return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 });
  }
}
