"use client";
import { useState } from "react";
import PostFileList from "../post/PostFileList";
import PostMetaInfo from "../post/PostMetaInfo";
import { formatMetaDate } from "@/utils/post";
import PostContent from "../post/PostContent";
import PostNavigator from "../post/PostNavigator";
import PostReply from "../post/PostReply";

export default function FreeBoardDetailClient({ result }: any) {
  const { post, prev, next } = result;
  const [password, setPassword] = useState("");
  const [authorized, setAuthorized] = useState(!post.is_private);
  const [error, setError] = useState("");

  const handleVerify = async () => {
    const res = await fetch("/api/post/verify-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId: post.id, inputPassword: password }),
    });
    const data = await res.json();
    if (data.success) {
      setAuthorized(true);
      setError("");
    } else {
      setError(data.message);
    }
  };

  if (post.is_private && !authorized) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h2 className="text-lg font-semibold mb-3">🔒 비공개 글입니다</h2>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호 입력"
          className="border px-3 py-2 rounded mb-2"
        />
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <button
          onClick={handleVerify}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          확인
        </button>
      </div>
    );
  }

  return (
    <div className="pb-12 px-2 md:px-6">
      <h1 className="text-heading-large">자유게시판</h1>
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
      <PostReply postId={post.id} />
      <PostNavigator prev={prev} next={next} basePath="/notice/free" />
    </div>
  );
}
