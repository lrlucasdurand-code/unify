"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Loader2, Rocket, ArrowRight } from "lucide-react";

function SuccessContent() {
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

    useEffect(() => {
        const activateBilling = async () => {
            const plan = searchParams.get("plan") || "starter";
            const token = localStorage.getItem("antigravity_token");

            if (!token) {
                setStatus("error");
                return;
            }

            try {
                const response = await fetch("http://localhost:8000/api/billing/activate", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ plan }),
                });

                if (response.ok) {
                    setStatus("success");
                } else {
                    setStatus("error");
                }
            } catch {
                setStatus("error");
            }
        };

        activateBilling();
    }, [searchParams]);

    return (
        <div className="relative z-10 text-center max-w-md">
            {status === "loading" && (
                <>
                    <Loader2 className="animate-spin text-primary mx-auto mb-6" size={48} />
                    <h1 className="text-2xl font-bold mb-4">Activation en cours...</h1>
                    <p className="text-muted-foreground">Veuillez patienter pendant que nous activons votre abonnement.</p>
                </>
            )}

            {status === "success" && (
                <>
                    <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="text-green-400" size={40} />
                    </div>
                    <h1 className="text-3xl font-bold mb-4">Paiement réussi !</h1>
                    <p className="text-muted-foreground mb-8">
                        Votre abonnement a été activé avec succès. Vous avez maintenant accès à toutes les fonctionnalités.
                    </p>
                    <button
                        onClick={() => window.location.href = "/dashboard"}
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-lg shadow-purple-500/25"
                    >
                        <Rocket size={20} />
                        Accéder au Dashboard
                        <ArrowRight size={18} />
                    </button>
                </>
            )}

            {status === "error" && (
                <>
                    <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
                        <span className="text-red-400 text-4xl">!</span>
                    </div>
                    <h1 className="text-3xl font-bold mb-4">Une erreur est survenue</h1>
                    <p className="text-muted-foreground mb-8">
                        Nous n&apos;avons pas pu activer votre abonnement. Veuillez contacter le support.
                    </p>
                    <Link
                        href="/pricing"
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all"
                    >
                        Retour aux tarifs
                    </Link>
                </>
            )}
        </div>
    );
}

function LoadingFallback() {
    return (
        <div className="relative z-10 text-center max-w-md">
            <Loader2 className="animate-spin text-primary mx-auto mb-6" size={48} />
            <h1 className="text-2xl font-bold mb-4">Chargement...</h1>
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#030014] text-white p-4">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0">
                <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-green-500/10 rounded-full blur-[128px]" />
                <div className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[128px]" />
            </div>

            <Suspense fallback={<LoadingFallback />}>
                <SuccessContent />
            </Suspense>
        </div>
    );
}
