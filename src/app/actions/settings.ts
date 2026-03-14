"use server";

import "server-only";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function updateAnalystLanguage(language: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  await prisma.user.update({
    where: { id: session.user.id },
    data: { analystLanguage: language },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateSubscriptionTier(tier: "FREE" | "PREMIUM") {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  await prisma.user.update({
    where: { id: session.user.id },
    data: { subscriptionTier: tier },
  });

  revalidatePath("/dashboard");
  return { success: true };
}
