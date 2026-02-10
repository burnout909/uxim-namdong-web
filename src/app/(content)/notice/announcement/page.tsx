// app/(content)/notice/announcement/page.tsx
import PostContainer from "@/components/post/PostContainer";
import PostList from "@/components/post/PostList";
import Pagination from "@/components/Pagination";
import { getPosts, PostType } from "@/services/postService";

export const dynamic = "force-dynamic";

export default async function AnnouncementPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Number(page ?? "1") || 1;

  const { posts, totalPages } = await getPosts(PostType.NOTICE, currentPage);

  return (
    <PostContainer>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-heading-large text-gray-900">공지사항</h1>
      </div>

      <PostList posts={posts} basePath="/notice/announcement" />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/notice/announcement"
      />
    </PostContainer>
  );
}
