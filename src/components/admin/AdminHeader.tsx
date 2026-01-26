'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

export default function AdminHeader() {
    const { user, signOut, loading } = useAuth()

    return (
        <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
                <div className="flex items-center gap-6">
                    <Link
                        href="/admin"
                        className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
                    >
                        Admin
                    </Link>
                    <nav className="hidden md:flex items-center gap-4">
                        <Link
                            href="/admin/posts"
                            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            게시글
                        </Link>
                        <Link
                            href="/admin/banner"
                            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            배너
                        </Link>
                        <Link
                            href="/admin/popup"
                            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            팝업
                        </Link>
                        <Link
                            href="/admin/freeboard"
                            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            자유게시판
                        </Link>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    {loading ? (
                        <span className="text-sm text-gray-400">로딩 중...</span>
                    ) : user ? (
                        <>
                            <span className="text-sm text-gray-600">
                                {user.email}
                            </span>
                            <button
                                onClick={signOut}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                로그아웃
                            </button>
                        </>
                    ) : (
                        <Link
                            href="/admin/sign-in"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                        >
                            로그인
                        </Link>
                    )}
                </div>
            </div>
        </header>
    )
}
