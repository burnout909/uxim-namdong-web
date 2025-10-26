"use client";
import { formatMetaDate } from "@/utils/post";
import { useRouter } from "next/navigation";

export default function PostRow({ post, author }: any) {
    const router = useRouter();

    const handleClick = () => {
        router.push(`/admin/freeboard/${post.id}`);
    };

    return (
        <tr
            onClick={handleClick}
            className="border-t hover:bg-gray-50 cursor-pointer transition-colors"
        >
            <td className="px-6 py-4 font-medium text-gray-800">
                {post.title ?? "제목 없음"}
            </td>
            <td className="px-6 py-4 text-gray-700">{author}</td>
            <td className="px-6 py-4 text-gray-600">
                {formatMetaDate(post.created_at)}
            </td>
            <td className="px-6 py-4 text-center">
                {post.is_private ? "🔒 비공개" : "🌐 공개"}
            </td>
        </tr>
    );
}
