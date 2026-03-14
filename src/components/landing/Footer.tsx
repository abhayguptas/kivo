"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { getAuthAwarePath } from "@/lib/auth-redirect";

export function Footer() {
  const { data: session } = useSession();
  const authPath = getAuthAwarePath(Boolean(session?.user), "/login");

  return (
    <footer className="kivo-section-dark relative flex min-h-[500px] flex-col justify-end overflow-hidden pb-8 pt-20">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[1200px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-[150px]" />
      <div className="pointer-events-none absolute right-[-8%] top-[20%] h-[320px] w-[320px] rounded-full bg-emerald-400/15 blur-[120px]" />
      
      <div className="container mx-auto px-6 relative z-10 h-full flex flex-col justify-between">
        
        {/* Top links area */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-auto text-white/80 pb-20 mt-10">
          <ul className="space-y-4 text-sm font-medium">
            <li><Link href="#how-it-works" className="hover:text-white transition-colors flex items-center gap-2">How It Works</Link></li>
            <li><Link href="#features" className="hover:text-white transition-colors flex items-center gap-2">Features</Link></li>
            <li><Link href="#faq" className="hover:text-white transition-colors flex items-center gap-2">FAQ</Link></li>
          </ul>
          <ul className="space-y-4 text-sm font-medium">
            <li><Link href={authPath} className="hover:text-white transition-colors flex items-center gap-2">Log In</Link></li>
            <li><Link href={authPath} className="hover:text-white transition-colors flex items-center gap-2">Sign Up</Link></li>
            <li><Link href="#pricing" className="hover:text-white transition-colors flex items-center gap-2">Pricing</Link></li>
          </ul>
          <ul className="space-y-4 text-sm font-medium">
            <li><Link href="/privacy" className="hover:text-white transition-colors flex items-center gap-2">Privacy Policy</Link></li>
            <li><Link href="/cookies" className="hover:text-white transition-colors flex items-center gap-2">Cookie Policy</Link></li>
          </ul>
          <ul className="space-y-4 text-sm font-medium md:col-start-4">
            <li><a href="https://x.com/Kivo_ai" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-2 border border-white/20 rounded-full px-4 py-2 bg-white/8 w-fit">Follow on X ↗</a></li>
            <li><a href="https://github.com/abhayguptas/kivo" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-2 border border-white/20 rounded-full px-4 py-2 bg-white/8 w-fit">View on GitHub ↗</a></li>
            <li><a href="https://lingo.dev" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-2 border border-white/20 rounded-full px-4 py-2 bg-white/8 w-fit">Powered by Lingo.dev ↗</a></li>
          </ul>
        </div>

        {/* Massive Text Logo */}
        <div className="w-full text-center mt-auto pb-4">
          <h1 className="text-[22vw] leading-[0.8] tracking-tighter font-extrabold text-white text-center drop-shadow-sm select-none">
            Kivo
          </h1>
        </div>
      </div>
    </footer>
  );
}
