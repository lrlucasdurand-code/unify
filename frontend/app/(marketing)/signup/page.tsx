"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Rocket, ArrowRight, Loader2, Sparkles, Building, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

function SignupContent() {
    const router = useRouter();
    const { isAuthenticated, isLoading, login } = useAuth(); // We'll manually login after register
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Form States
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [companyName, setCompanyName] = useState("");

    const searchParams = useSearchParams();
    const plan = searchParams.get("plan");

    // Redirect to dashboard if already authenticated
    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            if (plan) {
                router.replace(`/pricing?checkout_plan=${plan}`);
            } else {
                router.replace("/dashboard");
            }
        }
    }, [isAuthenticated, isLoading, router, plan]);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // 1. Register
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    password,
                    full_name: fullName,
                    company_name: companyName
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || "Registration failed");
            }

            // 2. Login (Auto-login)
            await login(email, password);
            // Redirect handled by useEffect

        } catch (err: any) {
            setError(err.message || "Registration failed");
            setLoading(false);
        } finally {
            // setLoading(false); // handled in catch or if success, we redirect
            if (!isAuthenticated) setLoading(false);
        }
    };

    // Show nothing while checking auth status
    if (isLoading || isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#030014]">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center relative p-4 bg-[#030014] overflow-hidden selection:bg-primary/30 text-white">

            {/* Background Effects */}
            <div className="fixed inset-0 z-0">
                <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[128px] animate-pulse-slow" />
                <div className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[128px] animate-pulse-slow delay-1000" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                <div className="mb-8 flex items-center justify-center gap-3">
                    <div className="p-3 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                        <Rocket size={24} className="text-primary" />
                    </div>
                    <span className="font-bold text-3xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                        Antigravity
                    </span>
                </div>

                <div className="group relative">
                    {/* Card Glow */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-purple-600 rounded-2xl opacity-20 blur transition duration-500"></div>

                    <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">

                        <div className="text-center mb-8">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-purple-200 mb-4">
                                <Sparkles size={12} className="text-purple-400" />
                                <span>Free Demo Account</span>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
                            <p className="text-muted-foreground text-sm">Join the future of ad automation.</p>
                        </div>

                        <form onSubmit={handleSignup} className="space-y-4">
                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider ml-1">Full Name</label>
                                    <div className="relative">
                                        <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-3.5 text-white placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-sm"
                                            placeholder="John Doe"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider ml-1">Company</label>
                                    <div className="relative">
                                        <Building size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                        <input
                                            type="text"
                                            value={companyName}
                                            onChange={(e) => setCompanyName(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-3.5 text-white placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-sm"
                                            placeholder="Acme Inc"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider ml-1">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all shadow-inner"
                                    placeholder="name@company.com"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider ml-1">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all shadow-inner"
                                    placeholder="Min 8 characters"
                                    required
                                    minLength={8}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 mt-4"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                    <>
                                        Create Free Account
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-white/5 text-center text-xs text-muted-foreground">
                            Already have an account? <Link href="/login" className="text-white hover:text-primary transition-colors font-medium">Sign In</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function SignupPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#030014] text-white flex items-center justify-center">Loading...</div>}>
            <SignupContent />
        </Suspense>
    );
}
