// app/(content)/notice/announcement/page.tsx
import Link from 'next/link';
import { FaFileAlt } from 'react-icons/fa';
import { createClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

type Free = {
    id: string;
    title: string | null;
    contents: string | null;
    created_at: string;
    updated_at: string | null;
    views: number | null;
};

async function getFree(page = 1, limit = 10) {
    const supabase = await createClient();
    const offset = (page - 1) * limit;

    const { count, error: countError } = await supabase
        .from('POST')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'FREE');
    if (countError) throw countError;

    const { data, error } = await supabase
        .from('POST')
        .select('id, title, contents, created_at, updated_at, views')
        .eq('type', 'FREE')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
    if (error) throw error;

    const total = count ?? 0;
    const freeList = (data ?? []) as Free[];

    return {
        freeList,
        total,
        currentPage: page,
        totalPages: Math.max(1, Math.ceil(total / limit)),
    };
}

export default async function FreePage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>;
}) {
    const { page } = await searchParams;
    const currentPage = Number(page ?? '1') || 1;

    const { freeList, totalPages, total } = await getFree(currentPage);

    return (
        <div className="px-6 py-12 max-w-screen-lg mx-auto">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-gray-900">자유게시판</h1>
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        placeholder="검색"
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm">
                        검색
                    </button>
                </div>
            </div>

            {/* 목록 */}
            <div className="bg-white rounded-lg border border-gray-200">
                <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                    <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
                        <div className="col-span-1">번호</div>
                        <div className="col-span-7">제목</div>
                        <div className="col-span-2">작성일</div>
                        <div className="col-span-2">조회</div>
                    </div>
                </div>

                <div className="divide-y divide-gray-100">
                    {freeList.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">등록된 게시글이 없습니다.</div>
                    ) : (
                        freeList.map((free) => (
                            <div key={free.id} className="px-6 py-4">
                                <div className="grid grid-cols-12 gap-4 items-center text-sm">
                                    <div className="col-span-1">
                                        <FaFileAlt className="text-gray-400" />
                                    </div>
                                    <div className="col-span-7">
                                        <Link
                                            href={`/notice/free/${free.id}`}
                                            className="text-gray-900 hover:text-blue-600 hover:underline line-clamp-1"
                                        >
                                            {free.title ?? '제목 없음'}
                                        </Link>
                                    </div>
                                    <div className="col-span-2 text-gray-500">
                                        {new Date(free.created_at).toLocaleDateString('ko-KR', {
                                            year: '2-digit',
                                            month: '2-digit',
                                            day: '2-digit',
                                        })}
                                    </div>
                                    <div className="col-span-2 text-gray-500">{free.views ?? 0}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                    <nav className="flex space-x-1">
                        {currentPage > 1 && (
                            <Link
                                href={`/notice/free?page=${currentPage - 1}`}
                                className="px-3 py-2 text-gray-500 hover:text-gray-700"
                            >
                                &lt;
                            </Link>
                        )}
                        {Array.from({ length: Math.min(9, totalPages) }, (_, i) => {
                            const pageNum = i + 1;
                            const isCurrent = pageNum === currentPage;
                            return (
                                <Link
                                    key={pageNum}
                                    href={`/notice/free?page=${pageNum}`}
                                    className={`px-3 py-2 text-sm rounded ${isCurrent ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    {pageNum}
                                </Link>
                            );
                        })}
                        {currentPage < totalPages && (
                            <Link
                                href={`/notice/free?page=${currentPage + 1}`}
                                className="px-3 py-2 text-gray-500 hover:text-gray-700"
                            >
                                &gt;
                            </Link>
                        )}
                    </nav>
                </div>
            )}

            <div className="mt-8 text-center text-sm text-gray-500">
                총 {total}개의 게시글이 있습니다.
            </div>
        </div>
    );
}
