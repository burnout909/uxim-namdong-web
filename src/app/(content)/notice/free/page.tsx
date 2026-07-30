import { Suspense } from "react";
import PostContainer from "@/components/post/PostContainer";
import PostList from "@/components/post/PostList";
import PostListSkeleton from "@/components/post/PostListSkeleton";
import Pagination from "@/components/Pagination";
import { getPosts, PostType } from "@/services/postService";
import FreeBoardHeader from "@/components/freeboard/FreeBoardHeader";

export const dynamic = "force-dynamic";

/**
 * 자유게시판만 loading.tsx 대신 페이지 안에서 Suspense 를 쓴다.
 *
 * loading.tsx 는 하위 경로(/notice/free/post)까지 Suspense 로 감싸는데,
 * 글쓰기 페이지에는 dynamic(ssr:false) 에디터가 있어서 그 조합이면
 * 해당 세그먼트가 hydration 되지 않고 "에디터 로딩 중…"에서 멈춘다.
 */
async function FreeBoardList({ currentPage }: { currentPage: number }) {
    const { posts, totalPages } = await getPosts(PostType.FREE, currentPage);

    return (
        <>
            <PostList posts={posts} basePath="/notice/free" />
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                basePath="/notice/free"
            />
        </>
    );
}

export default async function FreeBoardPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>;
}) {
    const { page } = await searchParams;
    const currentPage = Number(page ?? "1") || 1;

    return (
        <PostContainer>
            {/* 헤더 */}
            <FreeBoardHeader />

            {/* 게시글 목록 */}
            <Suspense key={currentPage} fallback={<PostListSkeleton withHeader={false} />}>
                <FreeBoardList currentPage={currentPage} />
            </Suspense>
        </PostContainer>
    );
}
