'use client'

import { useEffect, useState, useCallback } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'
import type { User, AuthChangeEvent, Session } from '@supabase/supabase-js'

export function useAuth() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createBrowserSupabaseClient()

    useEffect(() => {
        // 초기 사용자 정보 가져오기
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
            setLoading(false)
        }
        getUser()

        // 인증 상태 변경 리스너
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event: AuthChangeEvent, session: Session | null) => {
                setUser(session?.user ?? null)
                setLoading(false)
            }
        )

        return () => {
            subscription.unsubscribe()
        }
    }, [supabase])

    const signOut = useCallback(async () => {
        await supabase.auth.signOut()
        window.location.href = '/admin/sign-in'
    }, [supabase])

    return {
        user,
        loading,
        signOut,
        isAuthenticated: !!user,
    }
}
