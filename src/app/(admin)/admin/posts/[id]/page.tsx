'use client'
import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import "react-quill-new/dist/quill.snow.css";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

const CategoryTypeEnumMap = {
  NOTICE: "공지사항",
  JOB: "일자리 소식",
  PRODUCT: "생산품",
  FREE: "자유게시판",
  PHOTO: "사진자료실",
  VIDEO: "동영상자료실",
};

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => <div className="text-sm text-gray-500">에디터 로딩 중…</div>,
});

export default function AdminPostEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [contents, setContents] = useState("");
  const [type, setType] = useState<keyof typeof CategoryTypeEnumMap>("NOTICE");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPost = useCallback(async () => {
    if (!id) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("POST")
      .select("id, title, contents, type")
      .eq("id", id)
      .eq("is_admin", true)
      .maybeSingle();

    if (error || !data) {
      alert("게시글을 찾을 수 없거나 관리자 글이 아닙니다.");
      setLoading(false);
      router.replace("/admin/posts");
      return;
    }

    setTitle(data.title ?? "");
    setContents(data.contents ?? "");
    const detectedType = (data.type && data.type in CategoryTypeEnumMap
      ? data.type
      : "NOTICE") as keyof typeof CategoryTypeEnumMap;
    setType(detectedType);
    setLoading(false);
  }, [id, router]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const isEmpty = useMemo(() => {
    const plain = contents
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return !title.trim() || plain.length === 0;
  }, [title, contents]);

  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, false] }],
        ["bold", "italic", "underline"],
        [{ list: "ordered" }, { list: "bullet" }],
      ],
    }),
    []
  );

  const formats = useMemo(
    () => ["header", "bold", "italic", "underline", "list", "link", "image", "video"],
    []
  );

  const handleUpdate = async () => {
    if (!id) return;
    if (isEmpty) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("POST")
      .update({
        title,
        contents,
        type,
      })
      .eq("id", id)
      .eq("is_admin", true);
    setSaving(false);

    if (error) {
      console.error("게시글 수정 실패:", error);
      alert("게시글 수정에 실패했습니다.");
      return;
    }

    alert("게시글이 저장되었습니다.");
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm("정말 이 게시글을 삭제하시겠습니까?")) return;

    const { error } = await supabase
      .from("POST")
      .delete()
      .eq("id", id)
      .eq("is_admin", true);

    if (error) {
      console.error("게시글 삭제 실패:", error);
      alert("게시글 삭제에 실패했습니다.");
      return;
    }

    alert("게시글이 삭제되었습니다.");
    router.push("/admin/posts");
  };

  if (loading) {
    return (
      <div className="px-24 py-12 min-h-screen bg-gray-50">
        <p className="text-sm text-gray-600">게시글을 불러오는 중입니다…</p>
      </div>
    );
  }

  return (
    <div className="px-24 py-12 min-h-screen bg-gray-50">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <p className="text-2xl font-bold text-gray-900">게시글 수정</p>
          <p className="text-sm text-gray-500">
            관리자 작성 게시글만 수정/삭제할 수 있습니다.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push("/admin/posts")}
            className="px-4 py-2 border border-gray-200 rounded hover:bg-gray-50 text-sm"
          >
            목록으로
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
          >
            삭제
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <label className="text-sm font-semibold text-gray-700">카테고리</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as keyof typeof CategoryTypeEnumMap)}
            className="border border-gray-300 p-2 rounded text-gray-900 w-full sm:w-60"
          >
            {Object.entries(CategoryTypeEnumMap).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>
        </div>

        <input
          type="text"
          placeholder="제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-gray-300 p-3 mb-4 rounded text-gray-900 placeholder:text-gray-400"
        />

        <div className="bg-white rounded border border-gray-200">
          <ReactQuill
            theme="snow"
            value={contents}
            onChange={setContents}
            modules={modules}
            formats={formats}
            className="quill-wrapper"
          />
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={handleUpdate}
            disabled={isEmpty || saving}
            className="cursor-pointer px-6 py-2 text-white bg-blue-500 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded font-semibold shadow"
          >
            저장
          </button>
          <button
            onClick={() => router.push("/admin/posts")}
            className="px-6 py-2 border border-gray-200 rounded hover:bg-gray-50 text-sm"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
