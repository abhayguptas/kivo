import { createHash, randomBytes } from "crypto";

export function hashWebhookApiKey(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export function buildWebhookApiKey(): { token: string; hash: string; prefix: string } {
  const token = `kivo_${randomBytes(24).toString("hex")}`;
  return {
    token,
    hash: hashWebhookApiKey(token),
    prefix: token.slice(0, 12),
  };
}

export function verifyWebhookApiKey(rawToken: string, storedHash: string | null | undefined): boolean {
  if (!rawToken || !storedHash) return false;
  return hashWebhookApiKey(rawToken) === storedHash;
}
