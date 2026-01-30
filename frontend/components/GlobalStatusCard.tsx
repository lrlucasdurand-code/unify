
import { Target, Calendar, Clock } from "lucide-react";

interface GlobalStatusCardProps {
    status: {
        daily_target: number;
        weekly_target: number;
    } | null;
}

export function GlobalStatusCard({ status }: GlobalStatusCardProps) {
    if (!status) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 animate-fade-in-down">
            {/* Daily Target */}
            <div className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-xl p-5 flex items-center justify-between shadow-lg group hover:border-blue-500/30 transition-all">
                <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                        <Clock size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Volume Target Daily</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-white">{status.daily_target.toLocaleString()}</span>
                            <span className="text-sm text-muted-foreground">Leads</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Weekly Target */}
            <div className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-xl p-5 flex items-center justify-between shadow-lg group hover:border-purple-500/30 transition-all">
                <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                        <Calendar size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Volume Target Weekly</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-white">{status.weekly_target.toLocaleString()}</span>
                            <span className="text-sm text-muted-foreground">Leads</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
