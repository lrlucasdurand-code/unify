"use client";

import { useEffect, useState } from "react";
import { Save, Loader2, Bot, Sliders, DollarSign, Activity, Clock, User, Building, Mail, Lock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [config, setConfig] = useState<any>(null);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("antigravity_token");
        const headers = { Authorization: `Bearer ${token}` };

        fetch("http://localhost:8000/api/config", { headers })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to load config");
                return res.json();
            })
            .then((data) => {
                // Ensure bot_settings exists with defaults
                if (!data.bot_settings) {
                    data.bot_settings = {
                        global_budget_cap: 5000,
                        target_roas: 2.5,
                        optimization_frequency: "daily",
                        auto_scaling_enabled: true
                    };
                }
                setConfig(data);
                setLoading(false);
            })
            .catch(e => {
                console.error("Config fetch error", e);
                setLoading(false);
            });
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setMessage("");
        const token = localStorage.getItem("antigravity_token");

        try {
            const res = await fetch("http://localhost:8000/api/config", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(config),
            });
            if (res.ok) {
                setMessage("Settings saved successfully!");
                setTimeout(() => setMessage(""), 3000);
            } else {
                setMessage("Failed to save.");
            }
        } catch (e) {
            setMessage("Error saving settings.");
        } finally {
            setSaving(false);
        }
    };

    const updateBotSettings = (field: string, value: any) => {
        setConfig({
            ...config,
            bot_settings: {
                ...config.bot_settings,
                [field]: value
            }
        });
    };

    if (loading) return (
        <div className="flex h-[80vh] items-center justify-center">
            <div className="animate-pulse text-primary font-medium">Loading settings...</div>
        </div>
    );

    return (
        <div className="p-8 md:p-12 max-w-5xl mx-auto">
            <div className="mb-12 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">Settings</h1>
                    <p className="text-lg text-muted-foreground">Manage your AI configuration and account profile.</p>
                </div>
                {message && (
                    <div className={cn("px-4 py-2 rounded-lg text-sm font-medium border animate-fade-in",
                        message.includes("success") ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
                    )}>
                        {message}
                    </div>
                )}
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

                            <div className="space-y-8">
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
                                        onChange={(e) => updateBotSettings("global_budget_cap", parseInt(e.target.value))}
                                    />
                                    <div className="flex justify-between text-xs text-muted-foreground mt-2 font-mono">
                                        <span>$1,000</span>
                                        <span>$50,000</span>
                                    </div>
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
                                            step="0.1"
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white font-mono focus:border-primary/50 focus:bg-white/5 transition-all outline-none"
                                            value={config.bot_settings.target_roas}
                                            onChange={(e) => updateBotSettings("target_roas", parseFloat(e.target.value))}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2 pl-1">
                                        The Ai will throttle spend on campaigns below this threshold.
                                    </p>
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
                                                onClick={() => updateBotSettings("optimization_frequency", freq)}
                                                className={cn(
                                                    "py-2 px-4 rounded-lg text-sm font-medium border transition-all capitalize",
                                                    config.bot_settings.optimization_frequency === freq
                                                        ? "bg-primary/20 text-primary border-primary/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                                                        : "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10 hover:text-white"
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
                                    <button
                                        onClick={() => updateBotSettings("auto_scaling_enabled", !config.bot_settings.auto_scaling_enabled)}
                                        className={cn(
                                            "w-12 h-6 rounded-full transition-colors relative",
                                            config.bot_settings.auto_scaling_enabled ? "bg-green-500" : "bg-gray-600"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-4 h-4 bg-white rounded-full absolute top-1 transition-all",
                                            config.bot_settings.auto_scaling_enabled ? "left-7" : "left-1"
                                        )} />
                                    </button>
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
                                    The bot is actively monitoring your connected ad accounts. Adjustments will run automatically according to the schedule.
                                </p>
                            </div>
                        </div>

                        {/* Safety Limits */}
                        <div className="relative group">
                            {/* Glow Effect */}
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl opacity-20 group-hover:opacity-50 blur transition duration-500"></div>

                            <div className="relative bg-card/80 backdrop-blur-xl border border-white/10 rounded-xl p-6 transition-all duration-300">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                        <Bot size={20} className="text-blue-400" />
                                    </div>
                                    <h3 className="font-bold text-white text-lg">Safety Limits</h3>
                                </div>

                                <ul className="space-y-3 text-sm text-muted-foreground">
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                                        Max Daily Increase: <span className="text-white font-mono">+20%</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                                        Max Daily Decrease: <span className="text-white font-mono">-15%</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                                        Min Daily Spend: <span className="text-white font-mono">$10.00</span>
                                    </li>
                                </ul>

                                <div className="mt-4 pt-4 border-t border-white/5">
                                    <p className="text-xs text-blue-300/80 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 bg-blue-400 animate-pulse rounded-full" />
                                        Protection Active
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>



            {/* SECTION 2: ACCOUNT SETTINGS */}
            <section className="mb-20">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                        <User size={18} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Account Settings</h2>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    <div className="glass-card p-8 rounded-xl border border-white/10 bg-black/20">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                            {/* Profile Info */}
                            <div className="space-y-6">
                                <h3 className="font-bold text-white flex items-center gap-2">
                                    <User size={16} className="text-muted-foreground" />
                                    Personal Information
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase">Full Name</label>
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                                                JD
                                            </div>
                                            <input
                                                type="text"
                                                defaultValue="John Doe"
                                                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase">Email Address</label>
                                        <div className="relative">
                                            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                            <input
                                                type="email"
                                                defaultValue="demo@antigravity.io"
                                                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Organization & Security */}
                            <div className="space-y-6">
                                <h3 className="font-bold text-white flex items-center gap-2">
                                    <Building size={16} className="text-muted-foreground" />
                                    Organization & Security
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase">Company Name</label>
                                        <input
                                            type="text"
                                            defaultValue="Antigravity Inc."
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase">Password</label>
                                        <div className="relative">
                                            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                            <input
                                                type="password"
                                                defaultValue="password123"
                                                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/5 flex justify-end">
                            <button className="px-6 py-2 rounded-lg bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10 hover:text-white transition-colors text-sm font-semibold">
                                Update Profile
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer Actions (Sticky bottom or just nice button) */}
            <div className="fixed bottom-0 left-0 w-full p-4 bg-black/80 backdrop-blur-xl border-t border-white/10 z-40 flex justify-end md:static md:bg-transparent md:border-none md:p-0 md:z-auto">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className={cn(
                        "px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2",
                        "bg-primary text-white shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                    )}
                >
                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    Save All Changes
                </button>
            </div>
        </div>
    );
}
