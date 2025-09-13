"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

type VerifyAdminState = {
    loading: boolean;
    isAdmin: boolean;
    error: string | null;
};

export function useVerifyAdmin(): VerifyAdminState {
    const [state, setState] = useState<VerifyAdminState>({
        loading: true,
        isAdmin: true,
        error: null,
    });

    useEffect(() => {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
        );

        async function checkAdmin() {
            try {
                const {
                    data: { user },
                    error,
                } = await supabase.auth.getUser();

                if (error) throw error;
                if (!user) {
                    setState({ loading: false, isAdmin: false, error: null });
                    return;
                }
            } catch (err: any) {
                setState({
                    loading: false,
                    isAdmin: false,
                    error: err.message ?? "Unknown error",
                });
            }
        }

        checkAdmin();
    }, []);

    return state;
}
