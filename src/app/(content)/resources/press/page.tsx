import PostContainer from "@/components/post/PostContainer";
import PostList from "@/components/post/PostList";
import Pagination from "@/components/Pagination";
import { getPosts, PostType, Post } from "@/services/postService";

export const dynamic = "force-dynamic";

export default async function PressBoardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Number(page ?? "1") || 1;

  let posts: Post[] = [];
  let totalPages = 1;

  try {
    const result = await getPosts(PostType.PRESS, currentPage);
    posts = result.posts;
    totalPages = result.totalPages;
  } catch {
    // PRESS 타입 게시글이 없거나 DB 오류 시 빈 목록
  }

  return (
    <PostContainer>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-heading-large text-gray-900">보도자료</h1>
      </div>

      <PostList posts={posts} basePath="/resources/press" />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/resources/press"
      />
    </PostContainer>
  );
}
