"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
    email: string;
    role: "user" | "admin";
    organization: string | null;
    plan: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_TOKEN_KEY = "antigravity_token";

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUser = async (token: string) => {
        try {
            const res = await fetch("http://127.0.0.1:8000/api/me", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const userData = await res.json();
                setUser(userData);
                setIsAuthenticated(true);
            } else {
                logout();
            }
        } catch (e) {
            logout();
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        if (token) {
            fetchUser(token);
        } else {
            setIsLoading(false);
        }
    }, []);

    const login = async (username: string, password: string) => {
        const formData = new FormData();
        formData.append("username", username);
        formData.append("password", password);

        const res = await fetch("http://127.0.0.1:8000/token", {
            method: "POST",
            body: formData,
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || "Login failed");
        }

        const data = await res.json();
        localStorage.setItem(AUTH_TOKEN_KEY, data.access_token);
        await fetchUser(data.access_token);
    };

    const logout = () => {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        setIsAuthenticated(false);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout }}>
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
