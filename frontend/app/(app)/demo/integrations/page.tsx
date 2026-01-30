"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

interface IntegrationCardProps {
    name: string;
    description: string;
    icon: React.ReactNode;
    isEnabled: boolean;
}

function DemoIntegrationCard({ name, description, icon, isEnabled }: IntegrationCardProps) {
    return (
        <div className="relative group h-full">
            {/* Glow Effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-purple-600 rounded-2xl opacity-20 group-hover:opacity-50 blur transition duration-500"></div>

            <div className="relative h-full bg-card/80 backdrop-blur-xl border border-white/10 rounded-xl p-6 flex flex-col justify-between transition-all duration-300 group-hover:-translate-y-1">

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

                <div className="w-full py-2.5 rounded-lg text-sm font-bold text-center border bg-green-500/10 text-green-400 border-green-500/20">
                    Connected (Demo)
                </div>
            </div>
        </div>
    );
}

export default function DemoIntegrationsPage() {
    return (
        <div className="p-8 md:p-12 max-w-6xl mx-auto relative">

            {/* Demo Banner Overlay */}
            <div className="mb-8 px-6 py-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 flex items-center gap-4 animate-fade-in-down">
                <div className="p-2 rounded-full bg-purple-500/20">
                    <Sparkles size={18} className="text-purple-400" />
                </div>
                <div>
                    <span className="font-bold text-base text-white">Integrations Demo</span>
                    <p className="text-xs text-purple-300/80">In this demo, all major platforms are pre-connected to show capabilities.</p>
                </div>
                <Link href="/pricing" className="ml-auto px-5 py-2 rounded-full bg-white text-purple-950 text-sm font-bold hover:bg-gray-100 transition-colors shadow-lg flex items-center gap-2">
                    Subscribe <ArrowRight size={14} />
                </Link>
            </div>

            <div className="mb-10">
                <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">Integrations</h1>
                <p className="text-lg text-muted-foreground">Connect your ad platforms to enable AI automation.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <DemoIntegrationCard
                    name="Meta Ads"
                    description="Automate Facebook & Instagram campaigns with AI optimization."
                    icon={<span className="text-blue-500">f</span>}
                    isEnabled={true}
                />

                <DemoIntegrationCard
                    name="Google Ads"
                    description="Optimize Search, Display, and Youtube performance."
                    icon={<span className="text-yellow-500">G</span>}
                    isEnabled={true}
                />

                <DemoIntegrationCard
                    name="Snap Ads"
                    description="Scale your reach on Snapchat with automated rules."
                    icon={<span className="text-yellow-300">👻</span>}
                    isEnabled={true}
                />

                <DemoIntegrationCard
                    name="TikTok Ads"
                    description="Boost viral short-form video campaigns."
                    icon={<span className="text-pink-500">♪</span>}
                    isEnabled={true}
                />
            </div>
        </div>
    );
}
