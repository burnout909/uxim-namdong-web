import PostContainer from "@/components/post/PostContainer";
import PostList from "@/components/post/PostList";
import Pagination from "@/components/Pagination";
import { getPosts, PostType } from "@/services/postService";

export const dynamic = "force-dynamic";

export default async function StaffPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Number(page ?? "1") || 1;

  let posts: Awaited<ReturnType<typeof getPosts>>["posts"] = [];
  let totalPages = 1;

  try {
    const result = await getPosts(PostType.STAFF, currentPage);
    posts = result.posts;
    totalPages = result.totalPages;
  } catch {
    // STAFF 타입이 DB에 아직 없을 수 있음
  }

  return (
    <PostContainer>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-heading-large text-gray-900">직원공간</h1>
      </div>

      <PostList posts={posts} basePath="/notice/staff" />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/notice/staff"
      />
    </PostContainer>
  );
}
