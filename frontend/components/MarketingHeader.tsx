"use client";

import Link from "next/link";
import { Rocket, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function MarketingHeader() {
    const { isAuthenticated } = useAuth();

    const ctaHref = isAuthenticated ? "/dashboard" : "/login";

    return (
        <header className="px-6 py-6 flex justify-between items-center relative z-50 max-w-7xl mx-auto w-full">
            <Link href="/" className="flex items-center gap-2">
                <Rocket size={20} className="text-white" />
                <span className="font-bold text-lg tracking-tight text-white">
                    Unify
                </span>
            </Link>
            <div className="flex gap-4">
                {!isAuthenticated && (
                    <Link href="/login" className="hidden md:flex items-center px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-white transition-colors">
                        Log In
                    </Link>
                )}
                <Link href={ctaHref === "/login" ? "/pricing" : ctaHref} className="px-5 py-2 rounded-full bg-white text-black text-xs font-bold hover:bg-gray-200 transition-all flex items-center gap-2">
                    {isAuthenticated ? "Go to Dashboard" : "Subscribe"} <ArrowRight size={14} />
                </Link>
            </div>
        </header>
    );
}
