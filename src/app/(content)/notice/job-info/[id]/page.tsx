import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { FaDownload } from "react-icons/fa";

type Post = {
  id: string;
  title: string | null;
  contents: string | null;
  created_at: string;
  views: number | null;
  file_name: string | null;
  file_download_count: number | null;
  // 필요 시 작성자/부서 컬럼을 추가하세요 (e.g. author_name)
};

export const dynamic = "force-dynamic";

function formatMetaDate(iso: string) {
  // “07.04 11:16” 형태
  const d = new Date(iso);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${mm}.${dd} ${hh}:${mi}`;
}

export default async function JobInfoDetail({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // 1) 현재 글
  const { data: post, error } = await supabase
    .from("POST")
    .select("id, title, contents, created_at, views, file_name, file_download_count, type")
    .eq("type", "JOB")
    .eq("id", id)
    .single();

  if (error || !post) notFound();

  // 2) 이전/다음 글 (작성일 기준, 같은 JOB만)
  const [{ data: prev }, { data: next }] = await Promise.all([
    supabase
      .from("POST")
      .select("id, title, created_at")
      .eq("type", "JOB")
      .lt("created_at", post.created_at)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("POST")
      .select("id, title, created_at")
      .eq("type", "JOB")
      .gt("created_at", post.created_at)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      {/* 제목 */}
      <h1 className="text-3xl font-bold text-gray-900">일자리 소식</h1>

      {/* 구분선 */}
      <div className="mt-6 border-b-2 border-gray-300" />

      {/* 본문 카드 */}
      <section className="mt-6 rounded-lg border bg-white">
        {/* 타이틀 */}
        <div className="px-6 pt-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {post.title ?? "제목 없음"}
          </h2>
          {/* 부제/기관명 필요하면 여기 */}
          <p className="mt-2 text-gray-500">남동시니어클럽</p>
        </div>

        {/* 메타 + 첨부 */}
        <div className="mt-4 px-6">
          {/* 첨부 파일 (있을 때만) */}
          {post.file_name ? (
            <div className="flex items-center justify-between rounded-md border bg-gray-50 px-4 py-3 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <FaDownload className="shrink-0" />
                <span className="truncate">{post.file_name}</span>
                {/* 파일 크기 표시는 스토리지에서 가져와야 정확, 없으면 생략 */}
              </div>
              <div className="text-blue-600">
                + {post.file_download_count ?? 0}
              </div>
            </div>
          ) : null}

          {/* 개요문이 있으면 추가 라인 배치 가능 */}
        </div>

        {/* 본문 */}
        <article
          className="prose prose-slate mt-6 px-6 pb-6 text-gray-700"
          dangerouslySetInnerHTML={{ __html: post.contents ?? "" }}
        />

        {/* 하단 메타 (작성일) */}
        <div className="flex items-center justify-end gap-6 border-t px-6 py-4 text-sm text-gray-600">
          <span>작성일: {formatMetaDate(post.created_at)}</span>
        </div>
      </section>

      {/* 이전/다음/목록 */}
      <div className="mt-6 flex items-center justify-end gap-2">
        <Link
          href={prev ? `/notice/job-info/${prev.id}` : "#"}
          aria-disabled={!prev}
          className={`inline-flex items-center gap-2 rounded border px-4 py-2 text-sm ${
            prev
              ? "text-gray-700 hover:bg-gray-100"
              : "cursor-not-allowed text-gray-400"
          }`}
        >
          ◀ 이전
        </Link>
        <Link
          href={next ? `/notice/job-info/${next.id}` : "#"}
          aria-disabled={!next}
          className={`inline-flex items-center gap-2 rounded border px-4 py-2 text-sm ${
            next
              ? "text-gray-700 hover:bg-gray-100"
              : "cursor-not-allowed text-gray-400"
          }`}
        >
          다음 ▶
        </Link>
        <Link
          href="/notice/job-info"
          className="ml-2 inline-flex items-center gap-2 rounded border px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          ≡ 목록
        </Link>
      </div>
    </div>
  );
}
