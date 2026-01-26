"use client";

import { useEffect, useState } from "react";
type VerifyAdminState = {
    loading: boolean;
    isAdmin: boolean;
    error: string | null;
};

export function useVerifyAdmin(): VerifyAdminState {
    const [state, setState] = useState<VerifyAdminState>({
        loading: true,
        isAdmin: false,
        error: null,
    });

    useEffect(() => {
        let active = true;
        async function checkAdmin() {
            try {
                const res = await fetch("/api/auth/me", { cache: "no-store" });
                if (!res.ok) throw new Error("Failed to verify admin");
                const data = await res.json();
                if (!active) return;
                setState({ loading: false, isAdmin: !!data?.isAdmin, error: null });
            } catch (err: any) {
                if (!active) return;
                setState({
                    loading: false,
                    isAdmin: false,
                    error: err.message ?? "Unknown error",
                });
            }
        }

        checkAdmin();
        return () => {
            active = false;
        };
    }, []);

    return state;
}
