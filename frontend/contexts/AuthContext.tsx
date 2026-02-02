"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

interface User {
    email: string;
    role: "user" | "admin";
    organization: string | null;
    plan: string;
    id: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: User | null;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const fetchAppUser = async (sbUser: SupabaseUser) => {
        try {
            // In a real app, we would fetch extra profile data from our backend
            // For now, we simulate the profile structure based on Supabase data
            const token = (await supabase.auth.getSession()).data.session?.access_token;

            // Optional: Sync user to backend if needed
            // await fetch("/api/users/sync", { headers: { Authorization: `Bearer ${token}` } });

            setUser({
                id: sbUser.id,
                email: sbUser.email!,
                role: "user", // Default
                organization: sbUser.user_metadata?.company_name || "My Organization",
                plan: "free" // Default or fetched from DB
            });
        } catch (error) {
            console.error("Error fetching user profile:", error);
            setUser(null);
        }
    };

    useEffect(() => {
        // 1. Check active session
        const initSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                await fetchAppUser(session.user);
            }
            setIsLoading(false);
        };

        initSession();

        // 2. Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                await fetchAppUser(session.user);
                setIsLoading(false);
            } else {
                setUser(null);
                setIsLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const loginWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/dashboard`
            }
        });
        if (error) throw error;
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        router.push("/login");
    };

    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, user, loginWithGoogle, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
