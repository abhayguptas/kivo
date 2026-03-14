import Google from "next-auth/providers/google"
import type { NextAuthConfig } from "next-auth"

export default {
  providers: [
    Google
  ],
  secret: process.env.AUTH_SECRET,
  trustHost: true,
} satisfies NextAuthConfig
