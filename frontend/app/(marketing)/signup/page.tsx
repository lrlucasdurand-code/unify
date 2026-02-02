"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Rocket, ArrowRight, Loader2, Sparkles, Building, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

function SignupContent() {
    const router = useRouter();
    const { isAuthenticated, isLoading, loginWithGoogle } = useAuth();
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
            // Register with Supabase
            const { error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        company_name: companyName,
                    }
                }
            });

            if (signUpError) throw signUpError;

            // Auto-login (if email confirmation is disabled in Supabase, this works immediately)
            // If email confirmation is ON, we should tell the user to check their email.
            // For now, assuming disabled or immediate processing:
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) {
                // If sign in fails (e.g. email not confirmed), just show message
                alert("Account created! Please check your email to confirm.");
            } else {
                router.push("/dashboard");
            }

        } catch (err: any) {
            setError(err.message || "Registration failed");
            setLoading(false);
        } finally {
            if (!isAuthenticated) setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle();
        } catch (err: any) {
            setError(err.message || "Google login failed");
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

                        {/* Google Login Button */}
                        <button
                            onClick={handleGoogleLogin}
                            type="button"
                            className="w-full bg-white text-black hover:bg-gray-100 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-3 mb-6"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            Sign up with Google
                        </button>

                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-[#030014] px-2 text-muted-foreground">Or with email</span>
                            </div>
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
