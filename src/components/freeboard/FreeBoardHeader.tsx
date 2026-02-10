"use client";

import { useRouter } from "next/navigation";

export default function FreeBoardHeader() {
    const router = useRouter();
    return (
        <div className="flex items-center justify-between mb-6">
            <h1 className="text-heading-large text-gray-900">자유게시판</h1>
            <button
                className="px-3 py-2 bg-gray-200 hover:bg-gray-100 text-body-medium"
                onClick={() => router.push('/notice/free/post')}
            >
                등록
            </button>
        </div>
    );
}
