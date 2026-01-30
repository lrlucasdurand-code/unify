"use client";

import { Bot, DollarSign, Activity, Clock, User, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function DemoSettingsPage() {
    // Static configuration for Demo
    const config = {
        bot_settings: {
            global_budget_cap: 15000,
            target_roas: 4.0,
            optimization_frequency: "hourly",
            auto_scaling_enabled: true
        }
    };

    return (
        <div className="p-8 md:p-12 max-w-5xl mx-auto">
            {/* Demo Banner Overlay */}
            <div className="mb-8 px-6 py-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 flex items-center gap-4 animate-fade-in-down">
                <div className="p-2 rounded-full bg-purple-500/20">
                    <Sparkles size={18} className="text-purple-400" />
                </div>
                <div>
                    <span className="font-bold text-base text-white">Configuration Demo</span>
                    <p className="text-xs text-purple-300/80">Settings are read-only in this demo. Subscribe to customize your AI.</p>
                </div>
                <Link href="/pricing" className="ml-auto px-5 py-2 rounded-full bg-white text-purple-950 text-sm font-bold hover:bg-gray-100 transition-colors shadow-lg flex items-center gap-2">
                    Subscribe <ArrowRight size={14} />
                </Link>
            </div>

            <div className="mb-12 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">Settings</h1>
                    <p className="text-lg text-muted-foreground">Manage your AI configuration and account profile.</p>
                </div>
            </div>

            {/* SECTION 1: BOT CONFIGURATION */}
            <section className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Bot size={18} className="text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Bot Configuration</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Settings Panel */}
                    <div className="lg:col-span-2 relative group">
                        {/* Glow Effect */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-purple-600 rounded-2xl opacity-20 group-hover:opacity-50 blur transition duration-500"></div>

                        <div className="relative bg-card/80 backdrop-blur-xl border border-white/10 rounded-xl p-8 transition-all duration-300">
                            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/10">
                                <div>
                                    <h3 className="text-lg font-bold text-white">Optimization Parameters</h3>
                                    <p className="text-sm text-muted-foreground">Core rules for budget allocation.</p>
                                </div>
                            </div>

                            <div className="space-y-8 opacity-90 pointer-events-none">
                                {/* Global Budget Cap */}
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <label className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                                            <DollarSign size={14} className="text-muted-foreground" />
                                            Max Monthly Budget Cap
                                        </label>
                                        <span className="text-primary font-mono text-sm font-bold">${config.bot_settings.global_budget_cap.toLocaleString()}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1000"
                                        max="50000"
                                        step="500"
                                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary hover:accent-primary/80"
                                        value={config.bot_settings.global_budget_cap}
                                        readOnly
                                    />
                                </div>

                                {/* Target ROAS Input */}
                                <div>
                                    <label className="text-sm font-semibold text-gray-300 flex items-center gap-2 mb-3">
                                        <Activity size={14} className="text-muted-foreground" />
                                        Target ROAS (Return on Ad Spend)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white font-mono"
                                            value={config.bot_settings.target_roas}
                                            readOnly
                                        />
                                    </div>
                                </div>

                                {/* Frequency Toggle */}
                                <div>
                                    <label className="text-sm font-semibold text-gray-300 flex items-center gap-2 mb-3">
                                        <Clock size={14} className="text-muted-foreground" />
                                        Optimization Frequency
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {["hourly", "daily", "weekly"].map((freq) => (
                                            <button
                                                key={freq}
                                                className={cn(
                                                    "py-2 px-4 rounded-lg text-sm font-medium border transition-all capitalize",
                                                    config.bot_settings.optimization_frequency === freq
                                                        ? "bg-primary/20 text-primary border-primary/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                                                        : "bg-white/5 text-muted-foreground border-white/10"
                                                )}
                                            >
                                                {freq}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Auto Scale Toggle */}
                                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                                    <div>
                                        <h4 className="text-sm font-semibold text-white">Auto-Scaling</h4>
                                        <p className="text-xs text-muted-foreground">Allow AI to increase budget up to +20% daily.</p>
                                    </div>
                                    <div className={cn(
                                        "w-12 h-6 rounded-full transition-colors relative bg-green-500"
                                    )}>
                                        <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-7" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebars (Status + Safety) */}
                    <div className="space-y-6">
                        {/* Bot Status */}
                        <div className="relative group">
                            {/* Glow Effect */}
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-purple-600 rounded-2xl opacity-20 group-hover:opacity-50 blur transition duration-500"></div>

                            <div className="relative bg-card/80 backdrop-blur-xl border border-white/10 rounded-xl p-6 transition-all duration-300">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center border border-green-500/20">
                                        <Bot size={20} className="text-green-400" />
                                    </div>
                                    <h3 className="font-bold text-white text-lg">Bot Status</h3>
                                </div>

                                <div className="flex items-center gap-2 text-green-400 bg-green-500/10 px-3 py-1.5 rounded-full w-fit text-xs font-bold mb-4 border border-green-500/20 shadow-[0_0_15px_rgba(74,222,128,0.2)]">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                    Online & Watching
                                </div>

                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    The bot is simulated to monitor ad accounts.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
