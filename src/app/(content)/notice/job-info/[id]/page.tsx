import { notFound } from "next/navigation";
import { getPostDetail } from "@/services/postService";
import PostMetaInfo from "@/components/post/PostMetaInfo";
import PostFileList from "@/components/post/PostFileList";
import PostContent from "@/components/post/PostContent";
import PostNavigator from "@/components/post/PostNavigator";
import { formatMetaDate } from "@/utils/post";

export const dynamic = "force-dynamic";

export default async function JobAnnouncementDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // 🔹 공지 대신 일자리소식 타입으로 변경
  const result = await getPostDetail("JOB", id);
  if (!result) notFound();

  const { post, prev, next } = result;

  return (
    <div className="min-w-[929px] mx-auto pb-12 px-6">
      <h1 className="text-heading-large">일자리 소식</h1>

      <div className="pt-6">
        <h2 className="text-heading-medium text-gray-900">
          {post.title ?? "제목 없음"}
        </h2>
        <PostMetaInfo
          author="남동시니어클럽"
          createdAt={formatMetaDate(post.created_at)}
        />
      </div>

      <PostFileList files={post.POST_FILE ?? []} />
      <PostContent html={post.contents} />

      <PostNavigator
        prev={prev}
        next={next}
        basePath="/notice/job-info"
      />
    </div>
  );
}
