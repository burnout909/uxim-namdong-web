// src/components/post/PostListItem.tsx
import Link from "next/link";

type PostListItemProps = {
  id: string;
  title: string | null;
  created_at: string;
  author?: string;
  basePath?: string; // eg. "/notice/announcement"
};

export default function PostListItem({
  id,
  title,
  created_at,
  author = "남동시니어클럽",
  basePath = "/notice/announcement",
}: PostListItemProps) {
  return (
    <div
      className="grid grid-cols-12 items-center gap-4 px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
    >
      <div className="col-span-6">
        <Link
          href={`${basePath}/${id}`}
          className="text-gray-900 line-clamp-1 text-body-medium"
        >
          {title ?? "제목 없음"}
        </Link>
      </div>
      <div className="col-span-3 text-gray-500 text-body-medium">
        {new Date(created_at).toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </div>
      <div className="col-span-3 text-end text-center text-gray-500 text-body-medium">
        {author}
      </div>
    </div>
  );
}
