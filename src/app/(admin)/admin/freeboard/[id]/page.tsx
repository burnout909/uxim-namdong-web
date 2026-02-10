import { notFound, redirect } from "next/navigation";
import { getPostDetail, deletePost } from "@/services/postService";
import PostMetaInfo from "@/components/post/PostMetaInfo";
import PostFileList from "@/components/post/PostFileList";
import PostContent from "@/components/post/PostContent";
import PostNavigator from "@/components/post/PostNavigator";
import { formatMetaDate } from "@/utils/post";
import DeleteButton from "@/components/DeleteButton";
import PostReply from "@/components/post/PostReply";

export const dynamic = "force-dynamic";

// Server Action
async function handleDelete(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const ok = await deletePost(id);
  if (ok) {
    redirect("/admin/freeboard");
  }
}

export default async function AdminFreeBoardDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getPostDetail("FREE", id);
  if (!result) notFound();

  const { post, prev, next } = result;

  return (
    <div className="mx-auto pb-12 px-2 md:px-6 max-w-[1440px] mt-10 mb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-heading-large">자유게시판</h1>
        {/* 삭제 버튼 */}
        <DeleteButton id={post.id} handleDelete={handleDelete} />
      </div>

      <div className="pt-6">
        <h2 className="text-heading-medium text-gray-900">
          {post.is_private ? "🔒 " : "🌐 "}
          {post.title ?? "제목 없음"}
        </h2>
        <PostMetaInfo
          author="남동시니어클럽"
          createdAt={formatMetaDate(post.created_at)}
        />
      </div>

      <PostFileList files={post.POST_FILE ?? []} />
      <PostContent html={post.contents} />
      <PostReply postId={post.id} isAdmin={true} />
      <PostNavigator prev={prev} next={next} basePath="/admin/freeboard/" />
    </div>
  );
}
