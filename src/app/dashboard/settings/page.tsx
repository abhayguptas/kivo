"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, Shield, CreditCard, ChevronRight, Check, Zap, Loader2 } from "lucide-react";
import { getUserStatus } from "@/app/actions/user";
import { updateAnalystLanguage, updateSubscriptionTier } from "@/app/actions/settings";
import { cn } from "@/lib/utils";

const languages = [
  { code: "en", name: "English" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "es", name: "Spanish" },
  { code: "ja", name: "Japanese" },
  { code: "hi", name: "Hindi" },
  { code: "ko", name: "Korean" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "zh", name: "Chinese" },
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

export default function SettingsPage() {
  const [user, setUser] = useState<{
    analystLanguage: string;
    subscriptionTier: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const u = await getUserStatus();
      setUser(u);
      setLoading(false);
    }
    init();
  }, []);

  const handleLanguageChange = async (lang: string) => {
    setSaving("language");
    await updateAnalystLanguage(lang);
    const u = await getUserStatus();
    setUser(u);
    setSaving(null);
  };

  const handleUpgrade = async () => {
    setSaving("subscription");
    await updateSubscriptionTier("PREMIUM");
    const u = await getUserStatus();
    setUser(u);
    setSaving(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Account Settings</h1>
        <p className="text-sm text-slate-500">Manage your preferences and subscription</p>
      </div>

      <div className="grid gap-8">
        {/* Localization Settings */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="h-5 w-5 text-blue-600" />
            <h3 className="font-bold text-slate-900">Analyst Preferences</h3>
          </div>
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Primary Analyst Language</CardTitle>
              <CardDescription>Select the language you want to read all feedback in.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    disabled={saving === "language"}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium border transition-all",
                      user?.analystLanguage === lang.code
                        ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm"
                        : "bg-white border-slate-100 text-slate-600 hover:border-slate-200"
                    )}
                  >
                    {lang.name}
                    {user?.analystLanguage === lang.code && <Check className="h-4 w-4" />}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Subscription Gating */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="h-5 w-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900">Plan & Billing</h3>
          </div>
          <Card className="border-none shadow-sm rounded-2xl bg-gradient-to-br from-white to-slate-50/50">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                      user?.subscriptionTier === "PREMIUM" 
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" 
                        : "bg-slate-200 text-slate-600"
                    )}>
                      {user?.subscriptionTier || "FREE"} PLAN
                    </span>
                    {user?.subscriptionTier === "FREE" && (
                      <span className="text-xs text-slate-400 font-medium">1 app connection remaining</span>
                    )}
                  </div>
                  
                  {user?.subscriptionTier === "FREE" ? (
                    <div className="space-y-1">
                      <h4 className="text-xl font-bold text-slate-900 italic">Upgrade to Premium</h4>
                      <p className="text-sm text-slate-500 max-w-md italic">
                        Unlock unlimited app connections, AI sentiment summaries, and custom glossaries for your global feedback analysis.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <h4 className="text-xl font-bold text-slate-900 italic">You are on the Pro Plan</h4>
                      <p className="text-sm text-slate-500 max-w-md italic">
                        Enjoying unlimited connections and priority AI processing.
                      </p>
                    </div>
                  )}
                </div>

                {user?.subscriptionTier === "FREE" && (
                  <Button 
                    onClick={handleUpgrade}
                    disabled={saving === "subscription"}
                    className="h-14 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20 text-base font-bold transition-all hover:scale-105 active:scale-95"
                  >
                    {saving === "subscription" ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>Upgrade Now — $49/mo <ChevronRight className="ml-2 h-5 w-5" /></>
                    )}
                  </Button>
                )}
              </div>

              <div className="grid sm:grid-cols-3 gap-6 mt-12 pt-8 border-t border-slate-100">
                {[
                  { title: "Unlimited Apps", desc: "Connect as many sources as you need.", icon: Zap },
                  { title: "AI Analytics", desc: "Deep dive into sentiment trends with AI.", icon: Shield },
                  { title: "Team Invites", desc: "Collaborate with your product team.", icon: Globe },
                ].map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="p-2 w-fit rounded-lg bg-white shadow-sm border border-slate-50">
                      <item.icon className="h-4 w-4 text-blue-500" />
                    </div>
                    <p className="text-sm font-bold text-slate-800">{item.title}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Security Settings Placeholder */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900">Security</h3>
          </div>
          <Card className="border-none shadow-sm rounded-2xl opacity-50 cursor-not-allowed">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900">Two-Factor Authentication</p>
                <p className="text-xs text-slate-500">Add an extra layer of security to your account.</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 rounded-lg text-slate-400">COMING SOON</span>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
