import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import videoPlaceholder from '@/assets/images/resources/videoPlaceholder.png'

export const dynamic = 'force-dynamic';

type Video = {
    id: string;
    title: string | null;
    contents: string | null;
    created_at: string;
    updated_at: string | null;
    views: number | null;
    thumbnail_key: string | null;
};

async function getVideo(page = 1, limit = 10) {
    const supabase = await createClient();
    const offset = (page - 1) * limit;

    const { count, error: countError } = await supabase
        .from('POST')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'VIDEO');
    if (countError) throw countError;

    const { data, error } = await supabase
        .from('POST')
        .select('id, title, contents, created_at, updated_at, views, thumbnail_key')
        .eq('type', 'VIDEO')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
    if (error) throw error;

    const total = count ?? 0;
    const videoList = (data ?? []) as Video[];

    return {
        videoList,
        total,
        currentPage: page,
        totalPages: Math.max(1, Math.ceil(total / limit)),
    };
}

export default async function VideoPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>;
}) {
    const { page } = await searchParams;
    const currentPage = Number(page ?? '1') || 1;

    const { videoList, totalPages, total } = await getVideo(currentPage);

    return (
        <div className="px-6 py-12 max-w-screen-lg mx-auto">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-gray-900">영상게시판</h1>
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

            {/* 목록 (카드 그리드) */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                {videoList.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">등록된 게시글이 없습니다.</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {videoList.map((video) => {
                            const imgSrc =
                                // 추후 storage link에 맞춰서 불러오는 key 작성 필요
                                (video.thumbnail_key as unknown as string) || (videoPlaceholder as unknown as { src: string }).src;
                            return (
                                <Link
                                    key={video.id}
                                    href={`/resources/video/${video.id}`}
                                    className="group block rounded-lg overflow-hidden border border-gray-100 hover:shadow-md transition-shadow bg-white"
                                >
                                    {/* 썸네일 */}
                                    <div className="w-full aspect-[4/3] bg-gray-100 overflow-hidden">
                                        {/* next/image 제약 없이 동작하도록 img 태그 사용 */}
                                        <img
                                            src={imgSrc}
                                            alt={video.title ?? '사진'}
                                            className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
                                            loading="lazy"
                                        />
                                    </div>

                                    {/* 메타 영역 */}
                                    <div className="p-3">
                                        <h3 className="text-sm font-medium text-gray-900 line-clamp-1 group-hover:text-blue-600">
                                            {video.title ?? '제목 없음'}
                                        </h3>
                                        <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                                            <span>
                                                {new Date(video.created_at).toLocaleDateString('ko-KR', {
                                                    year: '2-digit',
                                                    month: '2-digit',
                                                    day: '2-digit',
                                                })}
                                            </span>
                                            <span>조회 {video.views ?? 0}</span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>


            {/* 페이지네이션 */}
            {
                totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                        <nav className="flex space-x-1">
                            {currentPage > 1 && (
                                <Link
                                    href={`/resources/photos?page=${currentPage - 1}`}
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
                                        href={`/resources/photos?page=${pageNum}`}
                                        className={`px-3 py-2 text-sm rounded ${isCurrent ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        {pageNum}
                                    </Link>
                                );
                            })}
                            {currentPage < totalPages && (
                                <Link
                                    href={`/resources/photos?page=${currentPage + 1}`}
                                    className="px-3 py-2 text-gray-500 hover:text-gray-700"
                                >
                                    &gt;
                                </Link>
                            )}
                        </nav>
                    </div>
                )
            }

            <div className="mt-8 text-center text-sm text-gray-500">
                총 {total}개의 게시글이 있습니다.
            </div>
        </div >
    );
}
