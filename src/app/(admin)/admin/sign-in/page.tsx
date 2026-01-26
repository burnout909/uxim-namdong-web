'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'

export default function AdminSignInPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createBrowserSupabaseClient()

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                if (error.message.includes('Invalid login credentials')) {
                    setError('이메일 또는 비밀번호가 올바르지 않습니다.')
                } else {
                    setError(error.message)
                }
                return
            }

            router.push('/admin')
            router.refresh()
        } catch {
            setError('로그인 중 오류가 발생했습니다.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-[100vh] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            관리자 로그인
                        </h1>
                        <p className="text-sm text-gray-500">
                            관리자 계정으로 로그인하세요
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                이메일
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@example.com"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-400 transition-colors"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                비밀번호
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-400 transition-colors"
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                        >
                            {loading ? '로그인 중...' : '로그인'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
