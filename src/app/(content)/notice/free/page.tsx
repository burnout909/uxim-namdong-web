import PostContainer from "@/components/post/PostContainer";
import PostList from "@/components/post/PostList";
import Pagination from "@/components/Pagination";
import { getPosts, PostType } from "@/services/postService";
import FreeBoardHeader from "@/components/freeboard/FreeBoardHeader";

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
            <FreeBoardHeader/>

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
