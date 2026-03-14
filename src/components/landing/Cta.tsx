"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { getAuthAwarePath } from "@/lib/auth-redirect";

export function Cta() {
  const { data: session } = useSession();
  const isAuthenticated = Boolean(session?.user);

  return (
    <section className="kivo-section-light pb-32 pt-24">
      <div className="container mx-auto px-4 md:px-6 text-center max-w-4xl relative z-10">
        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 drop-shadow-sm">
          Ready to turn global feedback into growth?
        </h2>
        <p className="text-lg md:text-xl text-slate-700/80 mb-10 max-w-2xl mx-auto">
          Launch in minutes with Lingo.dev-powered translation, then unlock premium intelligence to prioritize localization fixes by revenue impact.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
          <Button 
            size="lg" 
            className="kivo-primary-btn h-[52px] rounded-[26px] px-8 text-[15px] font-medium transition-all"
            onClick={() => {
              window.location.href = getAuthAwarePath(isAuthenticated, "/login");
            }}
          >
            Start Free Intelligence <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button 
            size="lg" 
            variant="ghost" 
            className="kivo-pill h-[52px] rounded-[26px] border border-slate-200/80 px-8 text-[15px] font-medium text-slate-900 transition-all hover:bg-white/95"
            onClick={() => {
              window.location.href = getAuthAwarePath(isAuthenticated, "/demo");
            }}
          >
            Open Guided Demo
          </Button>
        </div>
      </div>
    </section>
  );
}
