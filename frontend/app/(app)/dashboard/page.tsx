"use client";

import { useEffect, useState } from "react";
import { Campaign } from "@/types";
import { CampaignCard } from "@/components/CampaignCard";
import { RefreshCcw, Zap } from "lucide-react";

import { GlobalStatusCard } from "@/components/GlobalStatusCard";

export default function Home() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [globalStatus, setGlobalStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Use mock data initially if API fails (for demo purposes)
  const mockCampaigns: Campaign[] = [
    {
      id: "mock_1",
      name: "Q1 Growth",
      metrics: { actual: 12500, objective: 10000, name: "Currency" },
      budget_recommendation: { action: "INCREASE", multiplier: 1.1, reason: "Good Job" },
      current_budget: 150
    },
    {
      id: "mock_2",
      name: "Retargeting",
      metrics: { actual: 4000, objective: 8000, name: "Currency" },
      budget_recommendation: { action: "DECREASE", multiplier: 0.9, reason: "Bad Job" },
      current_budget: 200
    }
  ];

  const fetchCampaigns = async () => {
    setLoading(true);
    const token = localStorage.getItem("antigravity_token");
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const res = await fetch("/api/campaigns", { headers });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setCampaigns(data);

      // Fetch Global Status
      const resStatus = await fetch("/api/global-status", { headers });
      if (resStatus.ok) {
        setGlobalStatus(await resStatus.json());
      }
    } catch (e) {
      console.error("API error, using mock", e);
      setCampaigns(mockCampaigns);
    } finally {
      setLoading(false);
    }
  };

  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("antigravity_token");
    const headers = { Authorization: `Bearer ${token}` };

    fetchCampaigns();
    fetch("/api/config", { headers })
      .then(res => {
        if (!res.ok) return {};
        return res.json();
      })
      .then(setConfig)
      .catch(() => setConfig({}));
  }, []);

  const isDemoMode = config?.billing?.status !== "active";

  return (
    <main className="min-h-screen p-8 md:p-12 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2" />

      {isDemoMode && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-500 z-50" />
      )}

      <div className="max-w-7xl mx-auto relative z-10">
        {/* ... Demo Banner ... */}
        {isDemoMode && (
          <div className="mb-8 px-6 py-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center gap-3 animate-fade-in-down">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="font-bold text-sm">Demo Mode Active</span>
            <span className="text-sm opacity-80 border-l border-orange-500/30 pl-3 ml-auto md:ml-0 flex items-center gap-2">
              Subscribe to connect real ad accounts and unlock automation.
              <a href="/pricing?checkout_plan=starter" className="underline font-bold hover:text-orange-300">Subscribe Now</a>
            </span>
          </div>
        )}

        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              Antigravity
            </h1>
            <p className="text-muted-foreground mt-2">Ad Investment Automation Dashboard</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={fetchCampaigns}
              className="px-4 py-2 rounded-lg bg-secondary/50 border border-white/5 hover:bg-secondary/80 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
              Sync Data
            </button>
            <button className="px-5 py-2 rounded-lg bg-primary hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 flex items-center gap-2 text-sm font-bold text-white">
              <Zap size={16} fill="currentColor" />
              Run Optimization
            </button>
          </div>
        </header>

        {/* Global Status Cards */}
        <GlobalStatusCard status={globalStatus} />

        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>

          {campaigns.length === 0 && !loading && (
            <div className="text-center py-20 text-muted-foreground">
              No active campaigns found. Check your configuration.
            </div>
          )}
        </section>
      </div >
    </main >
  );
}
