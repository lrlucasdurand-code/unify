"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Settings, Layers, Rocket, LogOut, Database, CreditCard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Integrations", href: "/integrations", icon: Layers },
    { name: "Sales", href: "/sales", icon: Database },
    { name: "Settings", href: "/settings", icon: Settings },
    { name: "Billing", href: "/billing", icon: CreditCard },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuth();
    const isDemo = pathname?.startsWith("/demo");
    const isFree = user?.plan === "free" && !isDemo;

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    return (
        <div className="w-64 border-r border-white/10 bg-card/50 backdrop-blur-xl h-screen fixed left-0 top-0 flex flex-col p-6 z-50">
            <div className="flex items-center gap-2 mb-10 px-2">
                <div className="p-2 bg-primary rounded-lg">
                    <Rocket size={20} className="text-white" />
                </div>
                <span className="font-bold text-xl tracking-tight">Unify</span>
            </div>

            <nav className="space-y-2">
                {navItems.map((item) => {
                    let targetHref = item.href;
                    let isActive = pathname === item.href;
                    let isDisabled = false;

                    // Demo Mode Logic
                    if (isDemo) {
                        if (item.href === "/dashboard") targetHref = "/demo";
                        else if (item.href === "/integrations") targetHref = "/demo/integrations";
                        else if (item.href === "/settings") targetHref = "/demo/settings";
                        else {
                            targetHref = "#";
                            isDisabled = true;
                        }
                        isActive = pathname === targetHref;
                    }
                    // Free Tier Logic
                    else if (isFree) {
                        if (["/sales", "/billing"].includes(item.href)) {
                            targetHref = "#";
                            isDisabled = true;
                        }
                    }

                    return (
                        <Link
                            key={item.href}
                            href={targetHref}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium",
                                isActive
                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                    : "text-muted-foreground hover:bg-white/5 hover:text-white",
                                isDisabled && "opacity-50 cursor-not-allowed pointer-events-none"
                            )}
                        >
                            <item.icon size={18} className={cn(isActive ? "text-white" : "group-hover:text-primary transition-colors")} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto">
                {isDemo ? (
                    <div className="px-4 py-4 bg-purple-500/10 rounded-xl border border-purple-500/20 mb-4 animate-pulse">
                        <p className="text-xs text-purple-300 mb-1 font-bold uppercase">Demo Mode</p>
                        <p className="text-xs text-muted-foreground">You are viewing a public simulation.</p>
                        <Link href="/login" className="block mt-3 text-center text-xs bg-white text-black font-bold py-2 rounded-lg hover:bg-gray-200">
                            Log In
                        </Link>
                    </div>
                ) : isFree ? (
                    <div className="px-4 py-4 bg-orange-500/10 rounded-xl border border-orange-500/20 mb-4">
                        <p className="text-xs text-orange-400 mb-1 font-bold uppercase">Free Plan</p>
                        <p className="text-xs text-muted-foreground">Upgrade to unlock Sales & Billing.</p>
                        <Link href="/pricing" className="block mt-3 text-center text-xs bg-primary text-white font-bold py-2 rounded-lg hover:bg-primary/90">
                            Subscribe
                        </Link>
                    </div>
                ) : (
                    <div className="px-4 py-4 bg-white/5 rounded-xl border border-white/5 mb-4">
                        <p className="text-xs text-muted-foreground mb-1">Current Plan</p>
                        <p className="font-semibold text-sm capitalize">{user?.plan || "Pro"} License</p>
                    </div>
                )}

                {!isDemo && (
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-red-400 transition-all duration-200 group text-sm font-medium w-full text-left"
                    >
                        <LogOut size={18} className="group-hover:text-red-400 transition-colors" />
                        Log Out
                    </button>
                )}
            </div>
        </div>
    );
}
