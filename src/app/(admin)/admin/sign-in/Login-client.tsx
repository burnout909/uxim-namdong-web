"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useVerifyAdmin } from "@/hooks/useVerifyAdmin";

export function LoginClient() {
    const [showPw, setShowPw] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const sp = useSearchParams();
    const error = sp.get("error");

    const router = useRouter();
    const { loading, isAdmin, error: isError } = useVerifyAdmin();

    useEffect(() => {
        if (!loading && isAdmin) {
            router.replace("/admin/editor");
        }
    }, [loading, isAdmin, isError, router]);

    return (
        <main className="min-h-[600px] grid place-items-center bg-white from-slate-50 to-slate-100 p-4">
            <section className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-5 shadow-lg">
                <header className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white grid place-items-center font-bold">A</div>
                    <div>
                        <h1 className="text-lg font-semibold m-0">관리자 콘솔</h1>
                        <p className="text-xs text-slate-500 mt-0.5">업무용 이메일과 비밀번호로 로그인하세요</p>
                    </div>
                </header>

                {error && (
                    <div className="my-2 mb-1 p-2.5 border border-amber-500 bg-amber-50 text-amber-800 rounded-md text-sm" role="alert">
                        {error}
                    </div>
                )}

                <form
                    method="POST"
                    action="/api/auth/login"
                    onSubmit={() => setSubmitting(true)}
                    className="flex flex-col gap-2 mt-2"
                >
                    <label htmlFor="email" className="text-sm text-gray-900">이메일</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        placeholder="admin@company.com"
                        className="h-10 border border-slate-300 rounded-lg px-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-300"
                    />

                    <div className="flex items-center justify-between">
                        <label htmlFor="password" className="text-sm text-gray-900">비밀번호</label>
                        <button
                            type="button"
                            className="text-xs text-blue-600 hover:underline"
                            onClick={() => setShowPw((s) => !s)}
                            aria-label={showPw ? "비밀번호 숨기기" : "비밀번호 표시"}
                        >
                            {showPw ? "숨기기" : "표시"}
                        </button>
                    </div>

                    <input
                        id="password"
                        name="password"
                        type={showPw ? "text" : "password"}
                        autoComplete="current-password"
                        required
                        placeholder="비밀번호를 입력하세요"
                        className="h-10 border border-slate-300 rounded-lg px-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-300"
                    />

                    <button
                        className="h-10 mt-1 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
                        type="submit"
                        disabled={submitting}
                    >
                        {submitting ? "로그인 중…" : "로그인"}
                    </button>
                </form>

                <p className="mt-3 text-center text-xs text-slate-500">
                    문제가 있나요? <a href="/support" className="text-blue-600 hover:underline">지원팀에 문의</a>
                </p>
            </section>
        </main>
    );
}
