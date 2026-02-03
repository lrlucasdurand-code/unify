"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Activity } from "lucide-react";

interface PlatformConfig {
    enabled: boolean;
    // add other potential fields here if needed
}

interface IntegrationCardProps {
    name: string;
    description: string;
    icon: React.ReactNode;
    platformKey: string;
    isEnabled: boolean;
    onToggle: (key: string) => void;
    isLocked?: boolean;
}

function IntegrationCard({ name, description, icon, platformKey, isEnabled, onToggle, isLocked }: IntegrationCardProps) {
    // If locked, override interactions

    return (
        <div className="relative group h-full">
            {/* Glow Effect (Disabled if locked) */}
            {!isLocked && (
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-purple-600 rounded-2xl opacity-20 group-hover:opacity-50 blur transition duration-500"></div>
            )}

            <div className={cn(
                "relative h-full bg-card/80 backdrop-blur-xl border border-white/10 rounded-xl p-6 flex flex-col justify-between transition-all duration-300 overflow-hidden",
                !isLocked && "group-hover:-translate-y-1"
            )}>
                {isLocked && (
                    <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-center p-6">
                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-3">
                            <span className="text-2xl">🔒</span>
                        </div>
                        <h4 className="text-white font-bold mb-1">Upgrade to Connect</h4>
                        <p className="text-xs text-muted-foreground mb-4">Subscribe to the Starter Plan to unlock this integration.</p>
                        <a href="/billing" className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors">
                            View Plans
                        </a>
                    </div>
                )}

                <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-2xl bg-white/5 border border-white/10">
                        {icon}
                    </div>
                    <div className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 transition-all duration-300",
                        isEnabled
                            ? "bg-green-400/10 text-green-400 border-green-400/20 shadow-[0_0_15px_rgba(74,222,128,0.2)]"
                            : "bg-white/5 text-muted-foreground border-white/10"
                    )}>
                        <div className={cn("w-1.5 h-1.5 rounded-full", isEnabled ? "bg-green-400 animate-pulse" : "bg-gray-500")} />
                        {isEnabled ? "Active" : "Disabled"}
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="font-bold text-lg text-white tracking-wide mb-1">{name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                </div>

                <button
                    onClick={() => !isLocked && onToggle(platformKey)}
                    disabled={isLocked}
                    className={cn(
                        "w-full py-2.5 rounded-lg text-sm font-bold transition-all duration-300 border",
                        isEnabled
                            ? "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 hover:shadow-[0_0_15px_rgba(248,113,113,0.2)]"
                            : "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 hover:border-primary/40 hover:shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                    )}
                >
                    {isEnabled ? "Disconnect Platform" : "Connect Platform"}
                </button>
            </div>
        </div>
    );
}

export default function IntegrationsPage() {
    const [loading, setLoading] = useState(true);
    const [config, setConfig] = useState<any>(null);
    const [showCustomModal, setShowCustomModal] = useState(false);
    const [customName, setCustomName] = useState("");
    const [customDesc, setCustomDesc] = useState("");

    const addCustomIntegration = async () => {
        if (!config || !customName) return;

        const newEntry = { name: customName, description: customDesc, enabled: true };
        const newCustomList = [...(config.custom_integrations || []), newEntry];

        const newConfig = { ...config, custom_integrations: newCustomList };
        setConfig(newConfig); // Optimistic
        setShowCustomModal(false);
        setCustomName("");
        setCustomDesc("");

        try {
            await fetch("/api/config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newConfig),
            });
        } catch (e) {
            console.error("Error saving custom integration", e);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("antigravity_token");
        const headers = { Authorization: `Bearer ${token}` };

        fetch("/api/config", { headers })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to load config");
                return res.json();
            })
            .then((data) => {
                // Ensure ad_platforms structure exists
                if (!data.ad_platforms) {
                    data.ad_platforms = {
                        meta: { enabled: false },
                        google: { enabled: false },
                        snap: { enabled: false }
                    };
                }
                setConfig(data);
                setLoading(false);
            })
            .catch(e => {
                console.error("Config fetch error", e);
                // Fallback config to prevent crash
                setConfig({
                    ad_platforms: {
                        meta: { enabled: false },
                        google: { enabled: false },
                        snap: { enabled: false }
                    }
                });
                setLoading(false);
            });
    }, []);

    const togglePlatform = async (platform: string) => {
        if (!config) return;

        const newConfig = { ...config };
        // Handle optional tiktok field if not present in initial config
        if (!newConfig.ad_platforms[platform]) {
            newConfig.ad_platforms[platform] = { enabled: false };
        }

        newConfig.ad_platforms[platform].enabled = !newConfig.ad_platforms[platform].enabled;
        setConfig(newConfig); // Optimistic update

        const token = localStorage.getItem("antigravity_token");
        try {
            await fetch("/api/config", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(newConfig),
            });
        } catch (e) {
            console.error("Error saving toggle", e);
        }
    };

    // Defensive check: if loading is false but config is still null (should be handled by catch, but just in case)
    if (!config && !loading) return (
        <div className="flex h-[80vh] items-center justify-center flex-col">
            <div className="text-red-400 font-medium mb-2">Failed to load configuration.</div>
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-white/10 rounded-lg text-sm">Retry</button>
        </div>
    );

    if (loading) return (
        <div className="flex h-[80vh] items-center justify-center">
            <div className="animate-pulse text-primary font-medium">Loading integrations...</div>
        </div>
    );

    return (
        <div className="p-8 md:p-12 max-w-6xl mx-auto">
            <div className="mb-10">
                <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">Integrations</h1>
                <p className="text-lg text-muted-foreground">Connect your ad platforms to enable AI automation.</p>
            </div>

            {/* TOP SECTION: INTEGRATION GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                <IntegrationCard
                    name="Meta Ads"
                    description="FB & Insta."
                    icon={<span className="text-blue-500">f</span>}
                    platformKey="meta"
                    isEnabled={config?.ad_platforms?.meta?.enabled || false}
                    onToggle={togglePlatform}
                />

                <IntegrationCard
                    name="Google Ads"
                    description="Search & YT."
                    icon={<span className="text-yellow-500">G</span>}
                    platformKey="google"
                    isEnabled={config?.ad_platforms?.google?.enabled || false}
                    onToggle={togglePlatform}
                />

                <IntegrationCard
                    name="Snap Ads"
                    description="Snapchat."
                    icon={<span className="text-yellow-300">👻</span>}
                    platformKey="snap"
                    isEnabled={config?.ad_platforms?.snap?.enabled || false}
                    onToggle={togglePlatform}
                />

                <IntegrationCard
                    name="TikTok Ads"
                    description="TikTok."
                    icon={<span className="text-pink-500">♪</span>}
                    platformKey="tiktok"
                    isEnabled={config?.ad_platforms?.tiktok?.enabled || false}
                    onToggle={togglePlatform}
                />
            </div>

            {/* BOTTOM SECTION: DETAILED CONFIGURATION */}
            <div className="space-y-12">
                <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-4">Configuration</h2>

                {/* META ADS CONFIG */}
                {config.ad_platforms.meta.enabled && (
                    <div className="bg-card/80 backdrop-blur-xl border border-white/10 rounded-xl p-8 animate-fade-in-down">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-500 font-bold text-xl">f</div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Meta Ads Configuration</h3>
                                <p className="text-sm text-muted-foreground">Facebook & Instagram connection settings.</p>
                            </div>
                        </div>

                        {/* Dry Run Toggle */}
                        <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg flex items-start gap-3 mb-6">
                            <Activity size={16} className="text-orange-400 mt-0.5" />
                            <div className="flex-1 flex justify-between">
                                <div>
                                    <h4 className="font-bold text-orange-400 text-sm mb-1">Dry Run Mode</h4>
                                    <p className="text-xs text-muted-foreground">Simulate actions without spending real budget.</p>
                                </div>
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 accent-orange-500 cursor-pointer"
                                    checked={config.ad_platforms.meta.dry_run ?? true}
                                    onChange={(e) => {
                                        const newConfig = { ...config };
                                        newConfig.ad_platforms.meta.dry_run = e.target.checked;
                                        setConfig(newConfig);
                                        // Save logic would go here
                                    }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase">Ad Account ID</label>
                                <input
                                    type="text"
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm focus:border-blue-500/50 outline-none"
                                    value={config.ad_platforms.meta.ad_account_id || ""}
                                    onChange={(e) => {
                                        const newConfig = { ...config };
                                        newConfig.ad_platforms.meta.ad_account_id = e.target.value;
                                        setConfig(newConfig);
                                    }}
                                    placeholder="act_123456789"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase">Access Token</label>
                                <input
                                    type="password"
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm focus:border-blue-500/50 outline-none"
                                    value={config.ad_platforms.meta.access_token || ""}
                                    onChange={(e) => {
                                        const newConfig = { ...config };
                                        newConfig.ad_platforms.meta.access_token = e.target.value;
                                        setConfig(newConfig);
                                    }}
                                    placeholder="EAA..."
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* GOOGLE ADS CONFIG */}
                {config.ad_platforms.google.enabled && (
                    <div className="bg-card/80 backdrop-blur-xl border border-white/10 rounded-xl p-8 animate-fade-in-down">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20 text-yellow-500 font-bold text-xl">G</div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Google Ads Configuration</h3>
                                <p className="text-sm text-muted-foreground">Search, Youtube & Display settings.</p>
                            </div>
                        </div>

                        {/* Dry Run Toggle */}
                        <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg flex items-start gap-3 mb-6">
                            <Activity size={16} className="text-orange-400 mt-0.5" />
                            <div className="flex-1 flex justify-between">
                                <div>
                                    <h4 className="font-bold text-orange-400 text-sm mb-1">Dry Run Mode</h4>
                                    <p className="text-xs text-muted-foreground">Simulate actions without spending real budget.</p>
                                </div>
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 accent-orange-500 cursor-pointer"
                                    checked={config.ad_platforms.google.dry_run ?? true}
                                    onChange={(e) => {
                                        const newConfig = { ...config };
                                        if (!newConfig.ad_platforms.google.dry_run) newConfig.ad_platforms.google.dry_run = true;
                                        newConfig.ad_platforms.google.dry_run = e.target.checked;
                                        setConfig(newConfig);
                                    }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase">Customer ID</label>
                                <input
                                    type="text"
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm focus:border-yellow-500/50 outline-none"
                                    value={config.ad_platforms.google.customer_id || ""}
                                    onChange={(e) => {
                                        const newConfig = { ...config };
                                        newConfig.ad_platforms.google.customer_id = e.target.value;
                                        setConfig(newConfig);
                                    }}
                                    placeholder="123-456-7890"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase">Developer Token</label>
                                <input
                                    type="password"
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm focus:border-yellow-500/50 outline-none"
                                    value={config.ad_platforms.google.developer_token || ""}
                                    onChange={(e) => {
                                        const newConfig = { ...config };
                                        newConfig.ad_platforms.google.developer_token = e.target.value;
                                        setConfig(newConfig);
                                    }}
                                    placeholder="AbC..."
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase">Refresh Token</label>
                                <input
                                    type="password"
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm focus:border-yellow-500/50 outline-none"
                                    value={config.ad_platforms.google.refresh_token || ""}
                                    onChange={(e) => {
                                        const newConfig = { ...config };
                                        newConfig.ad_platforms.google.refresh_token = e.target.value;
                                        setConfig(newConfig);
                                    }}
                                    placeholder="1//0g..."
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* SNAP ADS CONFIG */}
                {config.ad_platforms.snap.enabled && (
                    <div className="bg-card/80 backdrop-blur-xl border border-white/10 rounded-xl p-8 animate-fade-in-down">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-10 h-10 rounded-lg bg-yellow-300/10 flex items-center justify-center border border-yellow-300/20 text-yellow-300 font-bold text-xl">👻</div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Snap Ads Configuration</h3>
                                <p className="text-sm text-muted-foreground">Snapchat Ads Manager settings.</p>
                            </div>
                        </div>

                        {/* Dry Run Toggle */}
                        <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg flex items-start gap-3 mb-6">
                            <Activity size={16} className="text-orange-400 mt-0.5" />
                            <div className="flex-1 flex justify-between">
                                <div>
                                    <h4 className="font-bold text-orange-400 text-sm mb-1">Dry Run Mode</h4>
                                    <p className="text-xs text-muted-foreground">Simulate actions without spending real budget.</p>
                                </div>
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 accent-orange-500 cursor-pointer"
                                    checked={config.ad_platforms.snap.dry_run ?? true}
                                    onChange={(e) => {
                                        const newConfig = { ...config };
                                        if (!newConfig.ad_platforms.snap.dry_run) newConfig.ad_platforms.snap.dry_run = true;
                                        newConfig.ad_platforms.snap.dry_run = e.target.checked;
                                        setConfig(newConfig);
                                    }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase">Organization ID</label>
                                <input
                                    type="text"
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm focus:border-yellow-300/50 outline-none"
                                    value={config.ad_platforms.snap.organization_id || ""}
                                    onChange={(e) => {
                                        const newConfig = { ...config };
                                        newConfig.ad_platforms.snap.organization_id = e.target.value;
                                        setConfig(newConfig);
                                    }}
                                    placeholder="org_..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase">Ad Account ID</label>
                                <input
                                    type="text"
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm focus:border-yellow-300/50 outline-none"
                                    value={config.ad_platforms.snap.ad_account_id || ""}
                                    onChange={(e) => {
                                        const newConfig = { ...config };
                                        newConfig.ad_platforms.snap.ad_account_id = e.target.value;
                                        setConfig(newConfig);
                                    }}
                                    placeholder="act_..."
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase">Access Token</label>
                                <input
                                    type="password"
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm focus:border-yellow-300/50 outline-none"
                                    value={config.ad_platforms.snap.access_token || ""}
                                    onChange={(e) => {
                                        const newConfig = { ...config };
                                        newConfig.ad_platforms.snap.access_token = e.target.value;
                                        setConfig(newConfig);
                                    }}
                                    placeholder="..."
                                />
                            </div>
                        </div>
                    </div>
                )}


                {/* SAVE BUTTON */}
                <div className="flex justify-end pt-8">
                    <button
                        onClick={async () => {
                            try {
                                await fetch("/api/config", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify(config),
                                });
                                // handle success (e.g. toast)
                            } catch (e) {
                                console.error("Error saving config", e);
                            }
                        }}
                        className="px-8 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                    >
                        Save Configuration
                    </button>
                </div>

            </div>
        </div>
    );
}
