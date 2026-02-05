import Link from "next/link";
import { Rocket, BarChart3, Settings2, Zap, ArrowRight } from "lucide-react";
import { MarketingHeader } from "@/components/MarketingHeader";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#030014] text-white flex flex-col overflow-hidden selection:bg-primary/30">

            {/* Background Effects - More subtle and cleaner */}
            <div className="fixed inset-0 z-0 opacity-60">
                <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] animate-pulse-slow delay-1000" />
            </div>

            {/* Header */}
            <MarketingHeader />

            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center justify-center text-center px-4 relative z-10 pt-16 pb-24">



                <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 max-w-4xl mx-auto leading-[1.2]">
                    <span className="text-white">
                        Automate Ad Spend with
                    </span>
                    <br />
                    <span className="bg-gradient-to-r from-indigo-300 via-primary to-purple-300 bg-clip-text text-transparent">
                        Artificial Intelligence.
                    </span>
                </h1>

                <p className="text-lg text-muted-foreground max-w-xl mb-10 leading-relaxed font-light">
                    Connect your sales data directly to Meta, Google, and TikTok Ads.
                    Let our AI adjust budgets in <span className="text-white font-medium">real-time</span> to maximize ROI.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-16">
                    <Link href="/pricing" className="px-8 py-3.5 rounded-full bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-all shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_50px_rgba(168,85,247,0.5)] hover:-translate-y-0.5 flex items-center gap-2">
                        <Rocket size={16} />
                        View Pricing
                    </Link>
                    <Link href="/demo" className="px-8 py-3.5 rounded-full bg-white/5 border border-white/10 text-white font-semibold text-sm hover:bg-white/10 transition-all hover:-translate-y-0.5 flex items-center gap-2">
                        <Rocket size={16} />
                        Launch Demo
                    </Link>
                </div>

                {/* Promo Video */}
                <div className="w-full max-w-4xl mx-auto mb-24 relative z-20 group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                    <div className="relative aspect-video bg-black/50 border border-white/10 rounded-xl overflow-hidden shadow-2xl flex items-center justify-center backdrop-blur-sm">

                        <video
                            className="w-full h-full object-cover"
                            controls
                            autoPlay
                            muted
                            loop
                            playsInline
                            poster="/placeholder-video-poster.jpg" // Optional: we can add this later if needed
                        >
                            <source src="/demo.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>

                    </div>
                </div>

                {/* Feature Grid - Cleaner */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full text-left px-4">
                    <FeatureCard
                        icon={<BarChart3 size={20} />}
                        title="Real-time Analytics"
                        description="Monitor performance across all channels in a single dashboard."
                        color="blue"
                    />
                    <FeatureCard
                        icon={<Zap size={20} />}
                        title="Auto-Optimization"
                        description="Automatically scale winning campaigns and cut losing ones."
                        color="purple"
                    />
                    <FeatureCard
                        icon={<Settings2 size={20} />}
                        title="Custom Rules"
                        description="Define your own logic for budget adjustments based on ROAS targets."
                        color="green"
                    />
                </div>
            </main>

            <footer className="py-8 text-center text-xs text-muted-foreground border-t border-white/5 bg-black/20 backdrop-blur-xl relative z-10">
                <p>© 2026 Unify. Built for the future of advertising.</p>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, description, color }: { icon: React.ReactNode, title: string, description: string, color: 'blue' | 'purple' | 'green' }) {
    const colorClasses = {
        blue: "text-blue-400 bg-blue-500/5 border-blue-500/10 group-hover:border-blue-500/30",
        purple: "text-purple-400 bg-purple-500/5 border-purple-500/10 group-hover:border-purple-500/30",
        green: "text-green-400 bg-green-500/5 border-green-500/10 group-hover:border-green-500/30",
    };

    return (
        <div className="group p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all duration-300 hover:bg-white/[0.07]">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 border transition-all duration-300 ${colorClasses[color]}`}>
                {icon}
            </div>

            <h3 className="text-base font-bold mb-2 text-white">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
    );
}
