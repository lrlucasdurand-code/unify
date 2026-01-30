import { Campaign } from "@/types";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface CampaignCardProps {
    campaign: Campaign;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
    const { name, metrics, budget_recommendation, current_budget } = campaign;
    const percentage = Math.min(100, (metrics.actual / metrics.objective) * 100);

    const actionColor =
        budget_recommendation.action === "INCREASE" ? "text-green-400 bg-green-400/10 border-green-400/20 shadow-[0_0_15px_rgba(74,222,128,0.2)]" :
            budget_recommendation.action === "DECREASE" ? "text-red-400 bg-red-400/10 border-red-400/20" :
                "text-gray-400 bg-gray-400/10 border-gray-400/20";

    const Icon =
        budget_recommendation.action === "INCREASE" ? ArrowUpRight :
            budget_recommendation.action === "DECREASE" ? ArrowDownRight :
                Minus;

    return (
        <div className="relative group">
            {/* Glow Effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-purple-600 rounded-2xl opacity-20 group-hover:opacity-50 blur transition duration-500"></div>

            <div className="relative h-full bg-card/80 backdrop-blur-xl border border-white/10 rounded-xl p-6 overflow-hidden transition-all duration-300 group-hover:-translate-y-1">

                <div className="flex justify-between items-start mb-6 relative z-10">
                    <div>
                        <h3 className="font-bold text-lg text-white tracking-wide">{name}</h3>
                        <p className="text-xs text-primary/80 font-mono mt-1">ID: {campaign.id}</p>
                    </div>
                    <div className={cn("px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 transition-all duration-300", actionColor)}>
                        <Icon size={14} strokeWidth={2.5} />
                        {budget_recommendation.action}
                    </div>
                </div>

                <div className="space-y-5 relative z-10">
                    <div>
                        <div className="flex justify-between text-sm mb-2 font-medium">
                            <span className="text-muted-foreground">Performance</span>
                            <span className="text-white font-mono">{percentage.toFixed(1)}%</span>
                        </div>

                        {/* Progress Bar Container */}
                        <div className="h-2.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 relative">
                            {/* Shimmer Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent w-1/2 translate-x-[-150%] animate-[shimmer_2s_infinite]"></div>

                            {/* Fill */}
                            <div
                                className="h-full bg-gradient-to-r from-indigo-500 via-primary to-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                                style={{ width: `${percentage}%`, transition: "width 1.5s cubic-bezier(0.4, 0, 0.2, 1)" }}
                            />
                        </div>

                        <div className="flex justify-between text-[11px] mt-2 text-muted-foreground font-mono">
                            <span>
                                {metrics.name === "CVR"
                                    ? `${(metrics.actual * 100).toFixed(2)}%`
                                    : `$${metrics.actual.toLocaleString()}`}
                            </span>
                            <span>
                                TARGET: {metrics.name === "CVR"
                                    ? `${(metrics.objective * 100).toFixed(2)}%`
                                    : `$${metrics.objective.toLocaleString()}`}
                            </span>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex justify-between items-center bg-white/5 -mx-6 -mb-6 px-6 py-4 mt-2">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Current Budget</p>
                            <p className="font-bold text-lg text-white">${current_budget.toFixed(2)}</p>
                        </div>

                        {budget_recommendation.multiplier !== 1 && (
                            <div className="text-right">
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">AI Recommendation</p>
                                <div className="flex items-center gap-1 justify-end">
                                    <p className={cn("font-bold text-lg", budget_recommendation.action === "INCREASE" ? "text-green-400" : "text-red-400")}>
                                        {budget_recommendation.action === "INCREASE" ? "+" : "-"}
                                        {Math.abs((budget_recommendation.multiplier - 1) * 100).toFixed(0)}%
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
