"use client";

import Link from "next/link";
import { XCircle, ArrowLeft } from "lucide-react";

export default function CheckoutCancelPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#030014] text-white p-4">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0">
                <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[128px]" />
                <div className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[128px]" />
            </div>

            <div className="relative z-10 text-center max-w-md">
                <div className="w-20 h-20 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-6">
                    <XCircle className="text-orange-400" size={40} />
                </div>
                <h1 className="text-3xl font-bold mb-4">Paiement annulé</h1>
                <p className="text-muted-foreground mb-8">
                    Votre paiement a été annulé. Vous pouvez réessayer à tout moment.
                </p>
                <Link
                    href="/pricing"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all"
                >
                    <ArrowLeft size={18} />
                    Retour aux tarifs
                </Link>
            </div>
        </div>
    );
}
