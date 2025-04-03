"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { AuthResponse } from "@/types";

interface AuthContextProps {
    isAuthenticated: boolean;
    login: (
        username: string,
        password: string
    ) => Promise<AuthResponse | { status: string; message: string }>;
    logout: () => Promise<void>;
    register: (
        username: string,
        password: string
    ) => Promise<AuthResponse | { status: string; message: string }>;
    userId: string | null;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    // Check authentication status on initial load
    useEffect(() => {
        // Check if we have userId in localStorage as a basic check
        // Note: This is just for UI state, actual auth is enforced by HTTP-only cookies
        const storedUserId = localStorage.getItem("userId");
        if (storedUserId) {
            setUserId(storedUserId);
            setIsAuthenticated(true);
        }
    }, []);

    const login = async (username: string, password: string) => {
        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (data.status === "success") {
                setIsAuthenticated(true);
                setUserId(data.userId);
                // Store userId in localStorage for UI state persistence
                localStorage.setItem("userId", data.userId);
                return data;
            }

            return {
                status: "error",
                message: data.message || "Login failed",
            };
        } catch (error) {
            return {
                status: "error",
                message: "Network error occurred",
            };
        }
    };

    const logout = async () => {
        try {
            await fetch("/api/auth/logout", {
                method: "POST",
            });

            setIsAuthenticated(false);
            setUserId(null);
            localStorage.removeItem("userId");
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    const register = async (username: string, password: string) => {
        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (data.status === "success") {
                setIsAuthenticated(true);
                setUserId(data.userId);
                localStorage.setItem("userId", data.userId);
                return data;
            }

            return {
                status: "error",
                message: data.message || "Registration failed",
            };
        } catch (error) {
            return {
                status: "error",
                message: "Network error occurred",
            };
        }
    };

    return (
        <AuthContext.Provider
            value={{ isAuthenticated, login, logout, register, userId }}>
            {children}
        </AuthContext.Provider>
    );
};
