"use client";

import { useEffect, useState } from "react";
import { Campaign } from "@/types";
import { CampaignCard } from "@/components/CampaignCard";
import { RefreshCcw, Zap, Sparkles, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function DemoPage() {
    const [loading, setLoading] = useState(false);

    // RICH MOCK DATA FOR DEMO
    const demoCampaigns: Campaign[] = [
        {
            id: "demo_1",
            name: "🔥 Q1 Scale - Top Performers",
            metrics: { actual: 45000, objective: 30000 },
            budget_recommendation: { action: "INCREASE", multiplier: 1.2, reason: "ROAS is 4.5 maintained for 3 days." },
            current_budget: 1200
        },
        {
            id: "demo_2",
            name: "Retargeting - Cart Abandoners",
            metrics: { actual: 8500, objective: 10000 },
            budget_recommendation: { action: "MAINTAIN", multiplier: 1.0, reason: "Performance stable, awaiting more data." },
            current_budget: 350
        },
        {
            id: "demo_3",
            name: "Test - New Creatives (Gen Z)",
            metrics: { actual: 1200, objective: 4000 },
            budget_recommendation: { action: "DECREASE", multiplier: 0.85, reason: "CPA exceeded threshold by 20%." },
            current_budget: 150
        }
    ];

    const handleRefresh = () => {
        setLoading(true);
        setTimeout(() => setLoading(false), 800);
    };

    return (
        <main className="min-h-screen p-8 md:p-12 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2" />

            {/* Demo Banner */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 z-50" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="mb-8 px-6 py-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 flex flex-col md:flex-row items-center gap-4 animate-fade-in-down shadow-[0_0_30px_rgba(168,85,247,0.15)]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-purple-500/20">
                            <Sparkles size={18} className="text-purple-400" />
                        </div>
                        <div>
                            <span className="font-bold text-base text-white">Live Interactive Demo</span>
                            <p className="text-xs text-purple-300/80">You are viewing a simulation of high-performing campaigns.</p>
                        </div>
                    </div>
                    <Link href="/pricing" className="md:ml-auto px-5 py-2 rounded-full bg-white text-purple-950 text-sm font-bold hover:bg-gray-100 transition-colors shadow-lg flex items-center gap-2">
                        Subscribe <ArrowRight size={14} />
                    </Link>
                </div>

                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                            Antigravity
                        </h1>
                        <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                            <span className="px-2 py-0.5 rounded-md bg-white/10 text-xs font-bold text-white uppercase">Demo</span>
                            <span>Ad Investment Automation Dashboard</span>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={handleRefresh}
                            className="px-4 py-2 rounded-lg bg-secondary/50 border border-white/5 hover:bg-secondary/80 transition-colors flex items-center gap-2 text-sm font-medium"
                        >
                            <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
                            Simulate Sync
                        </button>
                        <button className="px-5 py-2 rounded-lg bg-primary hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 flex items-center gap-2 text-sm font-bold text-white cursor-help" title="Optimization logic runs automatically in production">
                            <Zap size={16} fill="currentColor" />
                            Run Optimization
                        </button>
                    </div>
                </header>

                <section>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {demoCampaigns.map((campaign) => (
                            <CampaignCard key={campaign.id} campaign={campaign} />
                        ))}
                    </div>
                </section>

                <div className="mt-12 p-8 rounded-2xl bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/20 text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <h3 className="text-2xl font-bold text-white mb-2 relative z-10">Ready to automate your real campaigns?</h3>
                    <p className="text-muted-foreground mb-6 max-w-xl mx-auto relative z-10">
                        Connect Meta, Google, and TikTok Ads in less than 2 minutes.
                    </p>
                    <Link href="/pricing" className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-white text-indigo-950 font-bold hover:scale-105 transition-transform shadow-xl relative z-10">
                        Subscribe <ArrowRight size={16} />
                    </Link>
                </div>

            </div>
        </main>
    );
}

function ArrowRight({ size = 24 }: { size?: number }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
        </svg>
    )
}
