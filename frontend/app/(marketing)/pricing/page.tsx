"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Zap, Shield, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { MarketingHeader } from "@/components/MarketingHeader";

function PricingContent() {
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(false);
    const searchParams = useSearchParams();
    const autoCheckoutPlan = searchParams.get("checkout_plan");

    useEffect(() => {
        if (isAuthenticated && autoCheckoutPlan === "starter") {
            // Remove the param to prevent loop/double trigger
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);

            handleCheckout("starter");
        }
    }, [isAuthenticated, autoCheckoutPlan]);

    const handleCheckout = async (plan: "starter" | "enterprise") => {
        if (plan === "enterprise") {
            // For enterprise, just show contact info or redirect
            return;
        }

        if (!isAuthenticated) {
            router.push(`/signup?plan=${plan}`);
            return;
        }

        setLoading(true);

        try {
            // Get the Stripe price ID from environment variable
            const priceId = process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID;

            if (!priceId) {
                console.error("Stripe price ID not configured");
                setLoading(false);
                return;
            }

            const token = localStorage.getItem("antigravity_token");
            const headers: HeadersInit = {
                "Content-Type": "application/json"
            };
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            const response = await fetch("http://127.0.0.1:8000/api/checkout", {
                method: "POST",
                headers: headers,
                body: JSON.stringify({
                    price_id: priceId,
                    success_url: `${window.location.origin}/checkout/success?plan=${plan}`,
                    cancel_url: `${window.location.origin}/checkout/cancel`,
                }),
            });

            const data = await response.json();

            if (data.url) {
                // Redirect to Stripe Checkout
                window.location.href = data.url;
            } else {
                console.error("No checkout URL returned. Backend response:", data);
                alert(`Checkout failed: ${data.detail || "Unknown error"}`);
                setLoading(false);
            }
        } catch (error) {
            console.error("Checkout error:", error);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#030014] text-white flex flex-col font-sans selection:bg-primary/30">

            {/* Header */}
            <MarketingHeader />

            <main className="flex-1 p-8 md:p-12 max-w-6xl mx-auto w-full relative z-10 pt-20">

                {/* Background Effects */}
                <div className="fixed inset-0 z-0 opacity-60 pointer-events-none">
                    <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px]" />
                </div>

                <div className="mb-16 text-center max-w-2xl mx-auto relative z-10">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">Simple, Transparent Pricing</h1>
                    <p className="text-xl text-muted-foreground">Start automating your ad spend with AI today. No credit card required for demo.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto relative z-10">

                    {/* Starter Plan */}
                    <div className="relative group rounded-3xl p-8 border border-white/10 hover:border-primary/50 bg-white/5 hover:bg-white/[0.07] transition-all duration-300 flex flex-col hover:-translate-y-1">
                        <div className="mb-8">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-6">
                                <Zap size={24} className="text-purple-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Starter</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold text-white">39€</span>
                                <span className="text-muted-foreground">/month</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                                Perfect for small businesses and startups looking to automate their first campaigns.
                            </p>
                        </div>

                        <ul className="space-y-4 mb-8 flex-1">
                            <FeatureItem text="Up to $5k Monthly Ad Spend" />
                            <FeatureItem text="Meta & Google Ads Integration" />
                            <FeatureItem text="Daily Budget Optimization" />
                            <FeatureItem text="Email Support" />
                        </ul>

                        <button
                            onClick={() => handleCheckout("starter")}
                            disabled={loading}
                            className="w-full py-4 rounded-xl font-bold bg-primary text-white hover:bg-primary/90 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                "Get Started Now"
                            )}
                        </button>
                    </div>

                    {/* Enterprise Plan */}
                    <div className="relative group rounded-3xl p-8 border border-white/10 bg-gradient-to-br from-white/5 to-transparent hover:border-white/20 transition-all duration-300 flex flex-col hover:-translate-y-1">
                        <div className="mb-8">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-6">
                                <Shield size={24} className="text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Enterprise</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-white">Custom</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                                For agencies and large scale advertisers requiring advanced controls and dedicated support.
                            </p>
                        </div>

                        <ul className="space-y-4 mb-8 flex-1">
                            <FeatureItem text="Unlimited Ad Spend" />
                            <FeatureItem text="All Integrations (TikTok, Snap)" />
                            <FeatureItem text="Hourly Optimization" />
                            <FeatureItem text="Dedicated Account Manager" />
                            <FeatureItem text="Custom Logic Rules" />
                        </ul>

                        <button
                            className="w-full py-4 rounded-xl font-bold bg-white text-black hover:bg-white/90 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 shadow-lg shadow-white/10"
                        >
                            Contact Sales <ArrowRight size={18} />
                        </button>
                    </div>

                </div>

                <div className="mt-16 text-center">
                    <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                        <Shield size={14} />
                        Secure payments powered by Stripe
                    </p>
                </div>
            </main>
        </div>
    );
}

export default function PricingPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#030014] text-white flex items-center justify-center">Loading...</div>}>
            <PricingContent />
        </Suspense>
    );
}

function FeatureItem({ text }: { text: string }) {
    return (
        <li className="flex items-center gap-3 text-sm text-gray-300">
            <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 shrink-0">
                <Check size={12} strokeWidth={3} />
            </div>
            {text}
        </li>
    );
}
