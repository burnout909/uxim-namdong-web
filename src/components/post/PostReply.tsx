"use client";

import { useState, useEffect } from "react";

interface PostReplyProps {
  postId: string;
  isAdmin?: boolean; // ✅ 관리자 여부
}

export default function PostReply({ postId, isAdmin = false }: PostReplyProps) {
  const [replies, setReplies] = useState<any[]>([]);
  const [newReply, setNewReply] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  // ✅ 댓글 불러오기
  useEffect(() => {
    const fetchReplies = async () => {
      const res = await fetch(`/api/reply?postId=${postId}`);
      const json = await res.json();
      setReplies(json.data || []);
    };
    fetchReplies();
  }, [postId]);

  // ✅ 댓글 등록 (관리자 전용)
  const handleCreate = async () => {
    if (!newReply.trim()) return;
    await fetch("/api/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, contents: newReply }),
    });
    setNewReply("");
    const res = await fetch(`/api/reply?postId=${postId}`);
    setReplies((await res.json()).data || []);
  };

  // ✅ 댓글 삭제 (관리자 전용)
  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    await fetch("/api/reply", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setReplies(replies.filter((r) => r.id !== id));
  };

  // ✅ 댓글 수정 (관리자 전용)
  const handleUpdate = async (id: string) => {
    if (!editContent.trim()) return;
    await fetch("/api/reply", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, contents: editContent }),
    });
    setEditingId(null);
    const res = await fetch(`/api/reply?postId=${postId}`);
    setReplies((await res.json()).data || []);
  };

  return (
    <section className="mt-10 border-t pt-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-900">답글</h3>

      {/* ✅ 댓글 목록 */}
      <div className="space-y-4">
        {replies.length === 0 && (
          <p className="text-gray-500 text-sm">아직 답글이 없습니다.</p>
        )}
        {replies.map((reply) => (
          <div
            key={reply.id}
            className="bg-gray-50 border rounded-lg p-4 flex flex-col gap-2"
          >
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {"남동시니어클럽"} ·{" "}
                {new Date(reply.created_at).toLocaleString("ko-KR")}
              </span>

              {/* ✅ 관리자만 수정/삭제 버튼 노출 */}
              {isAdmin && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingId(reply.id);
                      setEditContent(reply.contents);
                    }}
                    className="text-blue-500 text-sm hover:underline"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(reply.id)}
                    className="text-red-500 text-sm hover:underline"
                  >
                    삭제
                  </button>
                </div>
              )}
            </div>

            {editingId === reply.id ? (
              isAdmin ? (
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="flex-1 border rounded px-2 py-1 text-sm"
                  />
                  <button
                    onClick={() => handleUpdate(reply.id)}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                  >
                    저장
                  </button>
                </div>
              ) : (
                <p className="text-gray-800 text-sm">{reply.contents}</p>
              )
            ) : (
              <p className="text-gray-800 text-sm">{reply.contents}</p>
            )}
          </div>
        ))}
      </div>

      {/* ✅ 관리자만 답글 입력창 표시 */}
      {isAdmin && (
        <div className="flex mt-6 gap-2">
          <input
            type="text"
            value={newReply}
            onChange={(e) => setNewReply(e.target.value)}
            placeholder="답글을 입력하세요"
            className="flex-1 border rounded px-3 py-2 text-sm"
          />
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md"
          >
            등록
          </button>
        </div>
      )}
    </section>
  );
}
