"use client";

function hasSessionTokenCookie() {
  if (typeof document === "undefined") return false;
  const tokenPattern =
    /(?:^|;\s)(?:__Secure-authjs\.session-token|authjs\.session-token|__Secure-next-auth\.session-token|next-auth\.session-token)=/;
  return tokenPattern.test(document.cookie);
}

export function getAuthAwarePath(isAuthenticated: boolean, fallbackPath: string) {
  if (isAuthenticated || hasSessionTokenCookie()) return "/dashboard";
  return fallbackPath;
}

