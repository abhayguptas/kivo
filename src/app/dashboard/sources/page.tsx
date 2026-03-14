"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Apple,
  Check,
  Copy,
  Database,
  ExternalLink,
  Globe,
  Key,
  Loader2,
  Lock,
  Plus,
  RefreshCw,
  Terminal,
  Trash2,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ModalPortal } from "@/components/ui/modal-portal";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { connectApp, disconnectApp, getUserStatus, regenerateWebhookApiKey, syncConnectedApp } from "@/app/actions/user";

type AppRecord = {
  id: string;
  name: string;
  sourceType: string;
  externalId: string | null;
  lastSyncedAt: string | null;
  lastSyncStatus: string;
  lastSyncPages: number;
  lastSyncFetched: number;
  lastSyncInserted: number;
  lastSyncMessage: string | null;
  _count: {
    feedback: number;
  };
};

type UserRecord = {
  subscriptionTier: string;
  webhookApiKeyPrefix: string | null;
  webhookApiKeyUpdatedAt: string | null;
  apps: AppRecord[];
};

export default function SourcesPage() {
  const [user, setUser] = useState<UserRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [upgradeTitle, setUpgradeTitle] = useState("Upgrade to Premium");
  const [upgradeMessage, setUpgradeMessage] = useState(
    "Unlock unlimited app sources, full historical sync, and premium AI monitoring."
  );
  const [newAppId, setNewAppId] = useState("");
  const [sourceType, setSourceType] = useState<"appstore" | "playstore">("appstore");
  const [syncing, setSyncing] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [tokenCopied, setTokenCopied] = useState(false);
  const [creatingKey, setCreatingKey] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);

  const webhookUrl = "https://kivo.dev/api/webhooks/v1/ingest";

  const openUpgrade = (title: string, message: string) => {
    setUpgradeTitle(title);
    setUpgradeMessage(message);
    setIsUpgradeOpen(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleCopyToken = () => {
    if (!newApiKey) return;
    navigator.clipboard.writeText(newApiKey);
    setTokenCopied(true);
    setTimeout(() => setTokenCopied(false), 1500);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const u = (await getUserStatus()) as UserRecord | null;
      setUser(u);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleConnect = async () => {
    if (!newAppId) return;
    setSyncing("connecting");
    try {
      const res = await connectApp(sourceType, newAppId);
      if (res.error === "LIMIT_REACHED") {
        setIsConnectOpen(false);
        openUpgrade(
          "Source cap reached",
          "Free plan allows 2 connected apps. Upgrade to sync unlimited products and gain full market coverage."
        );
        return;
      }
      if (res.error === "ALREADY_CONNECTED") {
        setIsConnectOpen(false);
        openUpgrade(
          "Source already connected",
          "This app is already tracked. Upgrade to unlock premium anomaly alerts and advanced ingestion controls."
        );
        return;
      }

      setIsConnectOpen(false);
      setNewAppId("");
      await fetchData();
    } catch (error) {
      console.error(error);
    } finally {
      setSyncing(null);
    }
  };

  const handleDisconnect = async (appId: string) => {
    setSyncing(appId);
    try {
      await disconnectApp(appId);
      await fetchData();
    } catch (error) {
      console.error(error);
    } finally {
      setSyncing(null);
    }
  };

  const handleSync = async (appId: string) => {
    setSyncing(`sync-${appId}`);
    try {
      await syncConnectedApp(appId);
      await fetchData();
    } catch (error) {
      console.error(error);
    } finally {
      setSyncing(null);
    }
  };

  const handleRegenerateKey = async () => {
    setCreatingKey(true);
    try {
      const res = await regenerateWebhookApiKey();
      if ("apiKey" in res && res.apiKey) {
        setNewApiKey(res.apiKey);
      }
      await fetchData();
    } catch (error) {
      console.error(error);
    } finally {
      setCreatingKey(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Data Sources</h1>
          <p className="text-sm text-slate-500">Connect and sync global feedback pipelines.</p>
        </div>
        <div className="flex items-center gap-3">
          {user?.subscriptionTier === "FREE" ? (
            <div className="hidden md:block text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Free plan</p>
              <p className="text-sm font-bold text-blue-600">{user.apps.length} of 2 apps used</p>
            </div>
          ) : null}
          <Button onClick={() => setIsConnectOpen(true)} className="rounded-xl bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" /> Connect New Source
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-[45vh] flex-col items-center justify-center">
          <Loader2 className="mb-2 h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-slate-500">Loading source pipelines...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-7 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <h3 className="text-base font-bold text-slate-900">Connected Applications ({user?.apps.length || 0})</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {user?.apps.map((app) => (
                <Card key={app.id} className="rounded-2xl border-slate-200 bg-white">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-2">
                          <span className="rounded-lg bg-slate-100 p-2">
                            {app.sourceType === "appstore" ? (
                              <Apple className="h-4 w-4 text-slate-900" />
                            ) : (
                              <Database className="h-4 w-4 text-blue-700" />
                            )}
                          </span>
                          <CardTitle className="text-base">{app.name}</CardTitle>
                        </div>
                        <CardDescription className="inline-flex items-center gap-1">
                          {app.externalId} <ExternalLink className="h-3 w-3" />
                        </CardDescription>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase text-emerald-700">
                        Active
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Reviews synced</p>
                      <p className="text-xl font-bold text-slate-900">{app._count.feedback}</p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        Last sync: {app.lastSyncedAt ? new Date(app.lastSyncedAt).toLocaleString() : "Not synced yet"}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-white p-3 text-[11px] text-slate-600">
                      <p className="font-semibold text-slate-700">Sync status: {app.lastSyncStatus}</p>
                      <p>
                        Pages: {app.lastSyncPages} · Fetched: {app.lastSyncFetched} · Inserted: {app.lastSyncInserted}
                      </p>
                      {app.lastSyncMessage ? <p className="mt-1 text-slate-500">{app.lastSyncMessage}</p> : null}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        className="rounded-lg"
                        onClick={() => handleSync(app.id)}
                        disabled={syncing === `sync-${app.id}`}
                      >
                        {syncing === `sync-${app.id}` ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="mr-1 h-3.5 w-3.5" />}
                        Sync
                      </Button>
                      <Button
                        variant="outline"
                        className="rounded-lg border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => handleDisconnect(app.id)}
                        disabled={syncing === app.id}
                      >
                        {syncing === app.id ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Trash2 className="mr-1 h-3.5 w-3.5" />}
                        Disconnect
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {user?.subscriptionTier === "PREMIUM" || (user?.subscriptionTier === "FREE" && user.apps.length < 2) ? (
                <button
                  onClick={() => setIsConnectOpen(true)}
                  className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 text-slate-500 transition-all hover:border-blue-300 hover:bg-blue-50"
                >
                  <Plus className="h-6 w-6" />
                  <p className="text-sm font-bold">Add Another App</p>
                </button>
              ) : (
                <button
                  onClick={() =>
                    openUpgrade(
                      "Add unlimited sources",
                      "Upgrade to premium to connect every app and ingest all review channels without limits."
                    )
                  }
                  className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50 text-blue-700"
                >
                  <Zap className="h-6 w-6" />
                  <p className="text-sm font-bold">Limit Reached</p>
                </button>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <Card className="rounded-2xl border-slate-200 bg-white">
              <CardHeader className="border-b border-slate-100 bg-slate-50/60">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Terminal className="h-4 w-4 text-blue-600" /> Webhook Ingestion
                </CardTitle>
                <CardDescription>Direct API ingest for custom feedback streams.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-5">
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Ingestion URL</p>
                  <div className="flex gap-2">
                    <div className="flex-1 truncate rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-600">
                      {webhookUrl}
                    </div>
                    <Button variant="outline" size="icon" className="rounded-xl" onClick={handleCopy}>
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Workspace API Key</p>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                    {user?.webhookApiKeyPrefix
                      ? `Active key prefix: ${user.webhookApiKeyPrefix}...`
                      : "No key generated yet. Create one to secure ingestion."}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Button variant="outline" className="h-8 rounded-lg text-xs" onClick={handleRegenerateKey} disabled={creatingKey}>
                      {creatingKey ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Key className="mr-1 h-3.5 w-3.5" />}
                      {user?.webhookApiKeyPrefix ? "Regenerate key" : "Generate key"}
                    </Button>
                    {user?.webhookApiKeyUpdatedAt ? (
                      <span className="text-[11px] text-slate-500">Updated: {new Date(user.webhookApiKeyUpdatedAt).toLocaleString()}</span>
                    ) : null}
                  </div>
                </div>
                {newApiKey ? (
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                    <p className="text-[11px] font-semibold text-emerald-800">New API key (copy now, shown once)</p>
                    <div className="mt-2 flex gap-2">
                      <div className="flex-1 truncate rounded-lg border border-emerald-200 bg-white px-2.5 py-2 text-[11px] font-mono text-emerald-900">
                        {newApiKey}
                      </div>
                      <Button variant="outline" size="icon" className="rounded-lg border-emerald-200 bg-white" onClick={handleCopyToken}>
                        {tokenCopied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-emerald-700" />}
                      </Button>
                    </div>
                  </div>
                ) : null}
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-xs text-blue-800">
                  <p className="mb-2 inline-flex items-center gap-1 font-bold">
                    <Key className="h-3 w-3" /> Authorization
                  </p>
                  <p>Use `Authorization: Bearer &lt;YOUR_WORKSPACE_KEY&gt;` and include owned `appId` in every data item.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Globe className="h-4 w-4 text-purple-600" /> Global Coverage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Supported Locales</span>
                  <span className="font-bold text-slate-900">140+</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Realtime Sync</span>
                  <span className="font-bold text-emerald-600">Enabled</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <AnimatePresence>
        {isConnectOpen ? (
          <ModalPortal>
            <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsConnectOpen(false)}
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className="relative z-10 w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7"
              >
              <h3 className="text-xl font-bold text-slate-900">Connect Source</h3>
              <p className="mt-1 text-sm text-slate-500">Import customer feedback from app ecosystems.</p>

              <TooltipProvider>
                <div className="mt-5 flex gap-2 rounded-2xl bg-slate-100 p-1">
                  <button
                    onClick={() => setSourceType("appstore")}
                    className={cn(
                      "flex-1 rounded-xl py-2 text-xs font-bold",
                      sourceType === "appstore" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                    )}
                  >
                    <span className="inline-flex items-center gap-1">
                      <Apple className="h-3.5 w-3.5" /> App Store
                    </span>
                  </button>
                  <Tooltip>
                    <TooltipTrigger className="flex-1 rounded-xl py-2 text-xs font-bold text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <Database className="h-3.5 w-3.5" /> Play Store <Lock className="h-3 w-3" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>Coming Soon</TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>

              <div className="mt-4 space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Application ID</label>
                <Input value={newAppId} onChange={(event) => setNewAppId(event.target.value)} placeholder="e.g. 284882215" />
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button variant="ghost" onClick={() => setIsConnectOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleConnect} disabled={!newAppId || syncing === "connecting"}>
                  {syncing === "connecting" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Connect"}
                </Button>
              </div>
              </motion.div>
            </div>
          </ModalPortal>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {isUpgradeOpen ? (
          <ModalPortal>
            <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsUpgradeOpen(false)}
                className="absolute inset-0 bg-slate-950/65 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className="relative z-10 max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-[2rem] border border-slate-700 bg-white"
              >
              <div className="bg-gradient-to-br from-slate-900 via-[#0b1a3b] to-[#184ec9] p-8 text-white">
                <p className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                  Premium Upgrade
                </p>
                <h3 className="mt-3 text-2xl font-bold">{upgradeTitle}</h3>
                <p className="mt-2 text-sm text-blue-100">{upgradeMessage}</p>
              </div>
              <div className="p-8">
                <div className="space-y-3 text-sm text-slate-600">
                  <p>• Unlimited application integrations</p>
                  <p>• Full history sync beyond starter limits</p>
                  <p>• Premium anomaly and trend monitoring</p>
                </div>
                <div className="mt-6 flex flex-col gap-3">
                  <Button className="h-12 rounded-2xl bg-blue-600 text-base font-bold hover:bg-blue-700">
                    Upgrade to Premium — $49/mo
                  </Button>
                  <Button variant="ghost" className="h-11 rounded-2xl" onClick={() => setIsUpgradeOpen(false)}>
                    Maybe later
                  </Button>
                </div>
              </div>
              </motion.div>
            </div>
          </ModalPortal>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
