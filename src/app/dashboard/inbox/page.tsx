"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Inbox, 
  Search, 
  Loader2, 
  Globe, 
  Star, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  AlertCircle,
  Sparkles,
  MessageSquare,
  Send
} from "lucide-react";
import { getFeedback } from "@/app/actions/user";
import { translateReview, generateReplySuggestion } from "@/app/actions/ai";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import type { LucideIcon } from "lucide-react";

type FeedbackItem = {
  id: string;
  source: string;
  sourceLocale: string;
  originalText: string;
  translatedText: string | null;
  sentiment: string | null;
  rating: number | null;
  authorName: string | null;
  createdAt: string | Date;
  app?: { name: string } | null;
};

type ReplySuggestion = {
  draft: string;
  final: string;
  targetLang: string;
};

const sentimentConfig: Record<string, { icon: LucideIcon; color: string; bg: string; lab: string }> = {
  positive: { icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50", lab: "Positive" },
  negative: { icon: TrendingDown, color: "text-red-600", bg: "bg-red-50", lab: "Negative" },
  neutral: { icon: Minus, color: "text-slate-500", bg: "bg-slate-50", lab: "Neutral" },
  mixed: { icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-50", lab: "Mixed" },
};

export default function InboxPage() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedLocale, setSelectedLocale] = useState("all");
  const [translatingReview, setTranslatingReview] = useState<string | null>(null);
  const [generatingReply, setGeneratingReply] = useState<string | null>(null);
  const [expandedReply, setExpandedReply] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Record<string, ReplySuggestion>>({});

  const fetchFeedback = useCallback(async () => {
    setLoading(true);
    try {
      const pageSize = 100;
      let page = 1;
      let hasMore = true;
      const all: FeedbackItem[] = [];

      while (hasMore) {
        const data = await getFeedback(undefined, page, pageSize);
        all.push(...(data.feedback as FeedbackItem[]));
        hasMore = data.hasMore;
        page += 1;
      }

      setFeedback(all);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleTranslate = async (reviewId: string) => {
    setTranslatingReview(reviewId);
    try {
      const res = await translateReview(reviewId);
      if ("success" in res && res.success) {
        setFeedback((prev) => prev.map((f) => (f.id === reviewId ? { ...f, translatedText: res.translatedText ?? f.translatedText } : f)));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTranslatingReview(null);
    }
  };

  const handleGenerateReply = async (reviewId: string) => {
    setGeneratingReply(reviewId);
    setExpandedReply(reviewId);
    try {
      const res = await generateReplySuggestion(reviewId);
      if ("draft" in res && res.draft) {
        setSuggestions((prev) => ({ ...prev, [reviewId]: res as ReplySuggestion }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingReply(null);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const localeCounts = feedback.reduce<Record<string, number>>((acc, item) => {
    const key = item.sourceLocale || "unknown";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const localeOptions = Object.entries(localeCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([locale, count]) => ({ locale, count }));

  const filtered = feedback.filter((f) => {
    const textMatch = (f.originalText + (f.translatedText || "") + (f.authorName || ""))
      .toLowerCase()
      .includes(search.toLowerCase());
    const localeKey = f.sourceLocale || "unknown";
    const localeMatch = selectedLocale === "all" || localeKey === selectedLocale;
    return textMatch && localeMatch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Feedback Inbox</h1>
          <p className="text-sm text-slate-500">Manage all user reviews from connected platforms</p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={selectedLocale}
            onValueChange={(value) => {
              setSelectedLocale(value ?? "all");
            }}
          >
            <SelectTrigger className="h-10 w-[180px] rounded-xl border border-slate-200 bg-white text-sm text-slate-600">
              <SelectValue placeholder="All languages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All languages</SelectItem>
              {localeOptions.map((item) => (
                <SelectItem key={item.locale} value={item.locale}>
                  {item.locale.toUpperCase()} · {item.count}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search feedback..." 
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
          <p className="text-sm text-slate-500">Loading your inbox...</p>
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-2xl h-[400px] flex flex-col items-center justify-center text-center p-8">
          <Inbox className="h-10 w-10 text-slate-300 mb-4" />
          <h3 className="font-bold text-slate-900">No results found</h3>
          <p className="text-sm text-slate-500 mt-2 max-w-[240px]">Try adjusting your search or connect more sources.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((item) => {
              const sc = sentimentConfig[item.sentiment || "neutral"] || sentimentConfig.neutral;
              const SentimentIcon = sc.icon;
              const suggestion = suggestions[item.id];
              const isExpanded = expandedReply === item.id;
              
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-xl hover:shadow-slate-200/40 hover:border-blue-100 transition-all relative"
                  key={item.id}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-3 w-full">
                        <div className="flex items-center gap-3">
                          <div className={cn("p-1.5 rounded-lg", sc.bg)}>
                            <SentimentIcon className={cn("h-4 w-4", sc.color)} />
                          </div>
                          <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg">
                            {item.app?.name || (item.source === "appstore" ? "iOS" : "Android")}
                          </span>
                          <div className="flex items-center gap-1 text-amber-500">
                             <Star className="h-3 w-3 fill-amber-400" />
                             <span className="text-xs font-bold">{item.rating}/5</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleGenerateReply(item.id)}
                            disabled={generatingReply === item.id}
                            className="h-7 px-2 text-[10px] font-bold text-blue-600 border-blue-100 hover:bg-blue-50 rounded-lg whitespace-nowrap"
                          >
                            {generatingReply === item.id ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
                            Smart Reply
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleTranslate(item.id)}
                            disabled={translatingReview === item.id}
                            className="h-7 px-2 text-[10px] font-bold text-slate-500 border-slate-100 hover:bg-slate-50 rounded-lg whitespace-nowrap"
                          >
                            {translatingReview === item.id ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Globe className="h-3 w-3 mr-1" />}
                            Translate
                          </Button>
                        </div>
                      </div>
                      
                      <h4 className="text-[15px] font-semibold text-slate-900 leading-snug">
                        {item.translatedText || item.originalText}
                      </h4>
                      
                      {item.translatedText && item.translatedText !== item.originalText && (
                        <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 mt-3">
                          <Globe className="h-3.5 w-3.5 text-slate-400 mt-0.5" />
                          <p className="text-xs text-slate-500 italic leading-relaxed">
                            Original ({item.sourceLocale.toUpperCase()}): {item.originalText}
                          </p>
                        </div>
                      )}

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
                              <div className="flex items-center justify-between">
                                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                  <MessageSquare className="h-3 w-3" /> AI Suggested Reply
                                </h5>
                                <span className="text-[10px] font-bold text-indigo-600 uppercase">Powered by Lingo.dev</span>
                              </div>
                              {suggestion && (
                                <p className="text-[10px] font-bold text-blue-600 uppercase">Drafted in English & {suggestion.targetLang}</p>
                              )}

                              {!suggestion && generatingReply === item.id ? (
                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 animate-pulse flex items-center justify-center py-8">
                                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                                </div>
                              ) : suggestion ? (
                                <div className="space-y-3">
                                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 space-y-3">
                                     <div className="space-y-1">
                                       <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">Final localized reply</p>
                                       <p className="text-sm font-medium text-blue-900 leading-relaxed italic">{suggestion.final}</p>
                                     </div>
                                     <div className="pt-2 border-t border-blue-100">
                                       <p className="text-[9px] font-bold text-blue-300 uppercase tracking-widest">Internal review (English)</p>
                                       <p className="text-[11px] text-blue-700 leading-relaxed font-medium">{suggestion.draft}</p>
                                     </div>
                                     <Button className="w-full h-10 rounded-xl bg-blue-600 text-white font-bold text-xs mt-2 shadow-lg shadow-blue-500/20 group">
                                       Send Localized Reply <Send className="h-3 w-3 ml-2 group-hover:translate-x-1 transition-transform" />
                                     </Button>
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-700">
                            {item.authorName?.[0] || "U"}
                          </div>
                          <span className="text-xs font-medium text-slate-600">{item.authorName || "Anonymous"}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] font-medium text-slate-400 italic">
                            via {item.source === "appstore" ? "App Store" : "Play Store"}
                          </span>
                          <span className="text-[10px] font-medium text-slate-400">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
