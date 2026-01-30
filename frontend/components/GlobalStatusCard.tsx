
import { Users, Calendar } from "lucide-react";

interface GlobalStatusCardProps {
    status: {
        daily: { cap: number | null; current: number; unit: string };
        weekly: { cap: number | null; current: number; unit: string };
    } | null;
}

export function GlobalStatusCard({ status }: GlobalStatusCardProps) {
    if (!status) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 animate-fade-in-down">
            {/* Daily Status */}
            <div className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-xl p-5 flex items-center justify-between shadow-lg">
                <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                        <Users size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Daily Capacity</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-white">{status.daily.current.toFixed(0)}</span>
                            {status.daily.cap && (
                                <span className="text-sm text-muted-foreground">/ {status.daily.cap} Leads</span>
                            )}
                        </div>
                    </div>
                </div>
                {status.daily.cap && (
                    <div className="text-right">
                        <div className="text-xs font-mono mb-1 text-muted-foreground">Load</div>
                        <div className={`text-lg font-bold ${status.daily.current > status.daily.cap ? "text-red-400" : "text-green-400"}`}>
                            {((status.daily.current / status.daily.cap) * 100).toFixed(0)}%
                        </div>
                    </div>
                )}
            </div>

            {/* Weekly Status */}
            <div className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-xl p-5 flex items-center justify-between shadow-lg">
                <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                        <Calendar size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Weekly Capacity</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-white">{status.weekly.current.toFixed(0)}</span>
                            {status.weekly.cap && (
                                <span className="text-sm text-muted-foreground">/ {status.weekly.cap} Leads</span>
                            )}
                        </div>
                    </div>
                </div>
                {status.weekly.cap && (
                    <div className="text-right">
                        <div className="text-xs font-mono mb-1 text-muted-foreground">Load</div>
                        <div className={`text-lg font-bold ${status.weekly.current > status.weekly.cap ? "text-red-400" : "text-green-400"}`}>
                            {((status.weekly.current / status.weekly.cap) * 100).toFixed(0)}%
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
