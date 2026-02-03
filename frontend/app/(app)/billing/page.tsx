"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, CreditCard, Zap, Shield, FileText, Calendar, Download } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BillingPage() {
    const [loading, setLoading] = useState(true);
    const [config, setConfig] = useState<any>(null);

    const [invoices, setInvoices] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem("antigravity_token");
            const headers: HeadersInit = {};
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            try {
                const [configRes, invoicesRes] = await Promise.all([
                    fetch("/api/config", { headers }),
                    fetch("/api/billing/invoices", { headers })
                ]);

                if (configRes.ok) {
                    setConfig(await configRes.json());
                }

                if (invoicesRes.ok) {
                    setInvoices(await invoicesRes.json());
                }
            } catch (error) {
                console.error("Failed to fetch billing data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const currentPlan = config?.billing?.current_plan || "free";

    if (loading) return (
        <div className="flex h-[80vh] items-center justify-center">
            <div className="animate-pulse text-primary font-medium">Loading billing info...</div>
        </div>
    );

    return (
        <div className="p-8 md:p-12 max-w-6xl mx-auto">
            <div className="mb-10">
                <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">Billing & Plans</h1>
                <p className="text-lg text-muted-foreground">Manage your subscription and payment methods.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Current Plan & Details */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Current Plan Card */}
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-purple-600 rounded-2xl opacity-20 group-hover:opacity-50 blur transition duration-500"></div>
                        <div className="relative bg-card/80 backdrop-blur-xl border border-white/10 rounded-xl p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                        {currentPlan === "starter" ? <Zap className="text-primary" /> : <Shield className="text-blue-400" />}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white capitalize">{currentPlan} Plan</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                            <span className="text-xs font-bold text-green-400 uppercase tracking-widest">Active</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-white">{currentPlan === "starter" ? "39€" : "Custom"}</p>
                                    <p className="text-xs text-muted-foreground">/ month</p>
                                </div>
                            </div>

                            <div className="w-full bg-white/5 rounded-full h-2 mb-2">
                                <div className="bg-primary h-2 rounded-full w-[65%]" />
                            </div>
                            <p className="text-xs text-muted-foreground mb-6">Renews automatically on Feb 22, 2026</p>

                            <div className="flex gap-4">
                                <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm font-semibold hover:bg-white/10 transition-colors">
                                    Change Plan
                                </button>
                                <button className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold hover:bg-red-500/20 transition-colors">
                                    Cancel Subscription
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Billing Details */}
                    <div className="glass-card p-8 rounded-xl border border-white/10 bg-black/20">
                        <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                            <CreditCard size={18} className="text-muted-foreground" />
                            Billing Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">Billing Address</label>
                                <p className="text-sm text-gray-300">
                                    Antigravity Inc.<br />
                                    123 Space Station Way<br />
                                    Paris, 75001<br />
                                    France
                                </p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">Payment Method</label>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                                    <div className="w-10 h-6 bg-white rounded flex items-center justify-center">
                                        <span className="text-black text-[10px] font-bold">VISA</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-mono text-white">•••• 4242</p>
                                        <p className="text-[10px] text-muted-foreground">Expires 12/28</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-white/5 flex justify-end">
                            <button className="text-sm text-primary hover:text-primary/80 transition-filter font-medium">
                                Update Information
                            </button>
                        </div>
                    </div>

                </div>

                {/* Right Column: Invoice History */}
                <div className="glass-card p-6 rounded-xl border border-white/10 bg-black/20 h-fit">
                    <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                        <FileText size={18} className="text-muted-foreground" />
                        Invoice History
                    </h3>
                    <div className="space-y-1">
                        {invoices.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                No invoices available.
                            </div>
                        ) : (
                            invoices.map((invoice, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group cursor-default">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-muted-foreground">
                                            <FileText size={14} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">{invoice.date}</p>
                                            <p className="text-xs text-green-400">{invoice.status}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-mono text-gray-300">{invoice.amount}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
