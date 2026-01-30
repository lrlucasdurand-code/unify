"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Users, Building, ShieldCheck, DollarSign, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AdminStats {
    total_organizations: number;
    active_users: number;
    mrr: number;
}

interface Organization {
    id: number;
    name: string;
    admin_email: string | null;
    user_count: number;
    plan: string;
    google_sheet_id: string | null;
    drive_folder_id: string | null;
    status: string;
}

export default function AdminPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [dataLoading, setDataLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoading && (!user || user.role !== "admin")) {
            router.push("/dashboard");
        }
    }, [user, isLoading, router]);

    const fetchData = async () => {
        setDataLoading(true);
        setError(null);

        const token = localStorage.getItem("antigravity_token");
        if (!token) return;

        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

        try {
            const [statsRes, orgsRes] = await Promise.all([
                fetch(`${API_URL}/api/admin/stats`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                fetch(`${API_URL}/api/admin/organizations`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            if (!statsRes.ok || !orgsRes.ok) {
                throw new Error("Failed to fetch admin data");
            }

            const [statsData, orgsData] = await Promise.all([
                statsRes.json(),
                orgsRes.json()
            ]);

            setStats(statsData);
            setOrganizations(orgsData);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setDataLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === "admin") {
            fetchData();
        }
    }, [user]);

    if (isLoading || !user || user.role !== "admin") {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    const getPlanBadgeColor = (plan: string) => {
        switch (plan) {
            case "super": return "bg-purple-500/10 text-purple-400";
            case "growth": return "bg-blue-500/10 text-blue-400";
            case "starter": return "bg-green-500/10 text-green-400";
            default: return "bg-gray-500/10 text-gray-400";
        }
    };

    return (
        <div className="p-8 md:p-12 max-w-7xl mx-auto">
            <div className="mb-10 flex justify-between items-start">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-3 tracking-tight flex items-center gap-3">
                        <ShieldCheck className="text-red-500" size={36} />
                        Super Admin Console
                    </h1>
                    <p className="text-lg text-muted-foreground">Manage all organizations, users, and subscriptions.</p>
                </div>
                <button
                    onClick={fetchData}
                    disabled={dataLoading}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`text-white ${dataLoading ? 'animate-spin' : ''}`} size={20} />
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <StatCard
                    label="Total Organizations"
                    value={dataLoading ? "..." : stats?.total_organizations.toString() || "0"}
                    icon={<Building size={24} />}
                    color="blue"
                />
                <StatCard
                    label="Active Users"
                    value={dataLoading ? "..." : stats?.active_users.toString() || "0"}
                    icon={<Users size={24} />}
                    color="green"
                />
                <StatCard
                    label="Total Revenue (MRR)"
                    value={dataLoading ? "..." : `$${stats?.mrr || 0}`}
                    icon={<DollarSign size={24} />}
                    color="purple"
                />
            </div>

            {/* Organizations Table */}
            <div className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-white">Organizations</h3>
                    <button className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90 transition-colors">
                        + New Tenant
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-white/5 text-xs uppercase font-medium text-white">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Admin Email</th>
                                <th className="px-6 py-4">Users</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Plan</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {dataLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center">
                                        <Loader2 className="animate-spin text-primary mx-auto" size={24} />
                                    </td>
                                </tr>
                            ) : organizations.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                                        No organizations found
                                    </td>
                                </tr>
                            ) : (
                                organizations.map((org) => (
                                    <tr key={org.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-medium text-white">{org.name}</td>
                                        <td className="px-6 py-4">{org.admin_email || "-"}</td>
                                        <td className="px-6 py-4">{org.user_count}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-400 text-xs capitalize">
                                                {org.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs capitalize ${getPlanBadgeColor(org.plan)}`}>
                                                {org.plan}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button className="text-primary hover:underline">Manage</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
    const colorClasses: Record<string, string> = {
        blue: "bg-blue-500/10 text-blue-400",
        green: "bg-green-500/10 text-green-400",
        purple: "bg-purple-500/10 text-purple-400"
    };

    return (
        <div className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-xl p-6 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${colorClasses[color] || colorClasses.blue}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
            </div>
        </div>
    );
}
