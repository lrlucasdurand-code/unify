"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Rocket, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading, login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Redirect to dashboard if already authenticated
    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.replace("/dashboard");
        }
    }, [isAuthenticated, isLoading, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await login(email, password);
            // Redirect handled by useEffect or manually here
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "Login failed");
        } finally {
            setLoading(false);
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
                                <span>Alpha Access</span>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
                            <p className="text-muted-foreground text-sm">Enter your credentials to access the AI control center.</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-5">
                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
                                    {error}
                                </div>
                            )}
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
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            <div className="flex items-center justify-between text-xs font-medium">
                                <label className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-white transition-colors">
                                    <input type="checkbox" className="rounded-sm border-white/20 bg-white/5 text-primary focus:ring-offset-0 focus:ring-primary/50" />
                                    Remember me
                                </label>
                                <Link href="#" className="text-primary hover:text-primary/80 transition-colors hover:underline">Forgot password?</Link>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 mt-2"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                    <>
                                        Sign In
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-white/5 text-center text-xs text-muted-foreground">
                            Don't have an account? <Link href="/signup" className="text-white hover:text-primary transition-colors font-medium">Create Free Account</Link>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-xs text-muted-foreground opacity-50">Secure AI-Powered Environment</p>
                </div>
            </div>
        </div>
    );
}
