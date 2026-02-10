// app/(content)/resources/videos/page.tsx
import PostContainer from "@/components/post/PostContainer";
import PostList from "@/components/post/PostList";
import Pagination from "@/components/Pagination";
import { getPosts, PostType } from "@/services/postService";

export const dynamic = "force-dynamic";

export default async function VideoBoardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Number(page ?? "1") || 1;

  const { posts, totalPages } = await getPosts(PostType.VIDEO, currentPage);

  return (
    <PostContainer>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-heading-large text-gray-900">영상자료실</h1>
      </div>

      {/* 게시글 목록 */}
      <PostList posts={posts} basePath="/resources/videos" />

      {/* 페이지네이션 */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/resources/videos"
      />
    </PostContainer>
  );
}
