// app/(content)/notice/free/page.tsx
import PostContainer from "@/components/post/PostContainer";
import PostList from "@/components/post/PostList";
import Pagination from "@/components/Pagination";
import { getPosts, PostType } from "@/services/postService";

export const dynamic = "force-dynamic";

export default async function FreeBoardPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>;
}) {
    const { page } = await searchParams;
    const currentPage = Number(page ?? "1") || 1;

    const { posts, totalPages } = await getPosts(PostType.FREE, currentPage);

    return (
        <PostContainer>
            {/* 헤더 */}
            <div className="min-w-[929px] flex items-center justify-between mb-6">
                <h1 className="text-heading-large text-gray-900">자유게시판</h1>
            </div>

            {/* 게시글 목록 */}
            <PostList posts={posts} basePath="/notice/free" />

            {/* 페이지네이션 */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                basePath="/notice/free"
            />
        </PostContainer>
    );
}
