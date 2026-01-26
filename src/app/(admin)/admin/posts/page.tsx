'use client'
import { useMemo, useState, useEffect, useCallback, type ChangeEvent } from "react";
import 'react-quill-new/dist/quill.snow.css';
import dynamic from "next/dynamic";
import { createBrowserSupabaseClient } from '@/lib/supabase-browser';
import { generateUploadUrl } from "@/app/service/s3";
import { v4 as uuidv4 } from "uuid";
import { formatMetaDate } from "@/utils/post";
import { useAuth } from "@/hooks/useAuth";

// 브라우저용 Supabase 클라이언트
const supabase = createBrowserSupabaseClient();

// 카테고리 타입 매핑 (자유게시판 제외)
const CategoryTypeEnumMap = {
    'NOTICE': '공지사항',
    'JOB': '일자리 소식',
    'PRODUCT': '생산품',
    'PHOTO': '사진자료실',
    'VIDEO': '동영상자료실'
} as const;

type PostSummary = {
    id: string;
    title: string | null;
    contents?: string | null;
    created_at: string;
    type: keyof typeof CategoryTypeEnumMap;
};

// SSR 비활성화해서 클라이언트에서만 로드
const ReactQuill = dynamic(() => import('react-quill-new'), {
    ssr: false,
    loading: () => <div className="text-sm text-gray-500">에디터 로딩 중…</div>,
});

type LocalFile = {
    file: File;
    previewUrl?: string;   // 이미지 미리보기용 (이미지일 때만)
};

export default function AdminPostPage() {
    const { user } = useAuth();
    const userId = user?.id ?? null;

    const [title, setTitle] = useState("");
    const [contents, setContents] = useState("");
    const [type, setType] = useState<keyof typeof CategoryTypeEnumMap>('NOTICE');
    const [postList, setPostList] = useState<PostSummary[]>([]);
    const [listLoading, setListLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'edit'>('list');
    const [editingPostId, setEditingPostId] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const pageSize = 10;

    // 업로드 상태
    const [files, setFiles] = useState<LocalFile[]>([]);
    const [uploading, setUploading] = useState(false);
    const [fileKeyList, setFileKeyList] = useState<string[]>([]);

    // 카테고리별 관리자 게시글 목록 로드
    const fetchPostList = useCallback(async (targetPage: number) => {
        setListLoading(true);
        const from = (targetPage - 1) * pageSize;
        const to = from + pageSize - 1;
        const { data, error, count } = await supabase
            .from("POST")
            .select("id, title, contents, created_at, type", { count: "exact" })
            .eq("type", type)
            .eq("is_admin", true)
            .order("created_at", { ascending: false })
            .range(from, to);

        if (error) {
            console.error("게시글 목록을 불러오지 못했습니다.", error);
            alert("게시글 목록을 불러오지 못했습니다.");
            setListLoading(false);
            return;
        }

        setPostList((data ?? []) as PostSummary[]);
        setTotal(count ?? 0);
        setListLoading(false);
    }, [pageSize, type]);

    useEffect(() => {
        fetchPostList(page);
    }, [fetchPostList, page]);

    // 빈 에디터 판정(태그/엔티티 제거)
    const isEmpty = useMemo(() => {
        const plain = contents
            .replace(/<[^>]+>/g, "")      // 태그 제거
            .replace(/&nbsp;/g, " ")      // nbsp 제거
            .replace(/\s+/g, " ")         // 공백 정리
            .trim();
        return !title.trim() || plain.length === 0;
    }, [title, contents]);

    /**toolbar 구성 */
    const modules = useMemo(
        () => ({
            toolbar: [
                [{ header: [1, 2, false] }],
                ['bold', 'italic', 'underline'],
                [{ list: 'ordered' }, { list: 'bullet' }],
            ],
        }),
        []
    );

    /**실제 quil format */
    const formats = useMemo(
        () => [
            'header',
            'bold',
            'italic',
            'underline',
            'list',
            'link',
            'image',
            'video'
        ],
        []
    );

    // 파일 업로드 핸들러 (영상 제외)
    const handlePickFiles = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
        if (!userId) {
            alert("파일 업로드를 위해 로그인이 필요합니다");
            return;
        }
        const list = e.target.files;
        if (!list) return;

        // UI 미리 추가
        const next: LocalFile[] = [];
        for (const f of Array.from(list)) {
            if (f.type.startsWith("video/")) continue;
            const isImage = f.type.startsWith("image/");
            next.push({
                file: f,
                previewUrl: isImage ? URL.createObjectURL(f) : undefined,
            });
        }

        setFiles(prev => [...prev, ...next]);
        setUploading(true);

        try {
            const bucket = process.env.NEXT_PUBLIC_S3_BUCKET_NAME!;
            const uploadedKeys: string[] = [];
            await Promise.all(
                Array.from(list)
                    .filter(f => !f.type.startsWith("video/")) // 영상 제외
                    .map(async (f) => {
                        const ext = f.name.split('.').pop();
                        const fileName = f.name.replace(/\.[^/.]+$/, "");
                        const key = `uploads/${uuidv4()}-${fileName}.${ext}`;
                        // presigned URL 생성
                        const uploadUrl = await generateUploadUrl(bucket, key);

                        // 실제 업로드
                        const res = await fetch(uploadUrl, {
                            method: "PUT",
                            headers: {
                                "Content-Type": f.type || "application/octet-stream",
                            },
                            body: f,
                        });

                        //db에도 파일 관련 정보 저장
                        const { error } = await supabase
                            .from('FILE')
                            .insert([
                                { file_key: key, bucket: bucket, size_bytes: f.size, mime_type: f.type, user_id: userId }
                            ]);

                        if (!res.ok) throw new Error(`❌ 업로드 실패: ${f.name}`);
                        if (error) throw error;

                        uploadedKeys.push(key);
                        return `https://${bucket}.s3.amazonaws.com/${key}`;
                    })
            );

            if (uploadedKeys.length) {
                setFileKeyList((prev) => [...prev, ...uploadedKeys]);
            }
        } catch (err) {
            console.error("업로드 중 오류:", err);
            alert("파일 업로드 중 오류가 발생했습니다.");

            // 롤백: 새로 추가된 파일 제거
            setFiles(prev => prev.filter(f => !next.includes(f)));
        } finally {
            setUploading(false);
            e.currentTarget.value = "";
        }
    }, [userId]);

    // 파일 제거
    const removeFile = useCallback((idx: number) => {
        setFiles(prev => {
            const target = prev[idx];
            if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
            return prev.filter((_, i) => i !== idx);
        });
    }, []);

    const resetForm = () => {
        setTitle("");
        setContents("");
        setFiles([]);
        setFileKeyList([]);
        setEditingPostId(null);
    };

    const handleSelectPost = async (postId: string) => {
        setListLoading(true);
        const { data, error } = await supabase
            .from("POST")
            .select("id, title, contents, type")
            .eq("id", postId)
            .eq("is_admin", true)
            .maybeSingle();

        setListLoading(false);

        if (error || !data) {
            alert("게시글을 불러오지 못했습니다.");
            return;
        }

        setEditingPostId(data.id);
        setTitle(data.title ?? "");
        setContents(data.contents ?? "");
        setType((data.type ?? "NOTICE") as keyof typeof CategoryTypeEnumMap);
        setViewMode('edit');
    };

    const handleSubmit = async () => {
        if (isEmpty) {
            alert("제목과 내용을 모두 입력해주세요.");
            return;
        }
        if (!userId) {
            alert("로그인이 필요합니다.");
            return;
        }

        try {
            let postData;
            let postError;

            if (editingPostId) {
                const updateResult = await supabase
                    .from("POST")
                    .update({
                        title,
                        contents,
                        type,
                    })
                    .eq("id", editingPostId)
                    .eq("is_admin", true)
                    .select();
                postData = updateResult.data;
                postError = updateResult.error;
            } else {
                const insertResult = await supabase
                    .from("POST")
                    .insert([
                        {
                            title,
                            contents,
                            user_id: userId,
                            type,
                            is_admin: true
                        },
                    ])
                    .select();
                postData = insertResult.data;
                postError = insertResult.error;
            }

            if (postError || !postData?.length) {
                console.error("게시글 등록 실패:", postError);
                if (postError) {
                    alert(postError.message || "게시글 등록에 실패했습니다.");
                    return;
                }
                alert("게시글 등록에 실패했습니다.");
                return;
            }

            const targetPostId = postData[0].id;

            if (fileKeyList.length) {
                const linkPromises = fileKeyList.map(async (key) => {
                    const { error: linkError } = await supabase
                        .from("POST_FILE")
                        .insert([
                            {
                                post_id: targetPostId,
                                file_key: key,
                                role: "ATTACHMENT",
                            },
                        ]);

                    if (linkError) throw linkError;
                });

                await Promise.all(linkPromises);
            }

            alert(editingPostId ? "게시글이 수정되었습니다." : "게시글이 등록되었습니다.");
            resetForm();
            setViewMode('list');
            setPage(1);
            fetchPostList(1);
        } catch (err) {
            console.error("공지사항 등록 실패:", err);
            alert("게시글 등록/수정에 실패했습니다.");
        }
    };

    const handleDeletePost = async (id: string) => {
        if (!confirm("해당 게시글을 삭제하시겠습니까?")) return;

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

        setPostList((prev) => prev.filter((post) => post.id !== id));
        setTotal((prev) => Math.max(0, prev - 1));
        if (editingPostId === id) {
            resetForm();
            setViewMode('list');
            fetchPostList(1);
        }
    };

    // 허용 확장자(영상 제외)
    const ACCEPT = [
        'image/*',
        '.pdf', '.doc', '.docx', '.ppt', '.pptx',
        '.xls', '.xlsx', '.hwp', '.hwpx',
        '.txt', '.csv',
        '.mp3', '.wav'
    ].join(',');

    return (
        <div className="px-12 lg:px-16 py-12 min-h-screen bg-gray-50">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                    <p className="text-2xl font-bold text-gray-900">게시글 관리</p>
                    <p className="text-sm text-gray-500">
                        카테고리별 관리자 게시글을 리스트로 보고, 작성/수정/삭제할 수 있습니다.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <label className="text-sm text-gray-700 font-semibold">카테고리</label>
                    <select
                        value={type}
                        onChange={(e) => { setType(e.target.value as keyof typeof CategoryTypeEnumMap); setPage(1); }}
                        className="border border-gray-300 p-2 rounded text-gray-900"
                    >
                        {Object.entries(CategoryTypeEnumMap).map(([key, value]) => (
                            <option key={key} value={key}>
                                {value}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={() => { resetForm(); setViewMode('edit'); }}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
                    >
                        새 게시글 작성
                    </button>
                </div>
            </div>

            {viewMode === 'list' && (
                <section className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between px-6 py-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {CategoryTypeEnumMap[type]} 목록 (관리자)
                        </h3>
                        <button
                            onClick={() => fetchPostList(page)}
                            className="text-xs px-3 py-1 border border-gray-200 rounded hover:bg-gray-50"
                        >
                            새로고침
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600 border-b">
                                <tr>
                                    <th className="px-6 py-3 w-1/2">제목</th>
                                    <th className="px-6 py-3 w-1/4">작성일</th>
                                    <th className="px-6 py-3 w-1/6">작성자</th>
                                    <th className="px-6 py-3 w-24 text-center">관리</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {listLoading ? (
                                    <tr>
                                        <td colSpan={4} className="text-center py-6 text-gray-500">목록을 불러오는 중입니다…</td>
                                    </tr>
                                ) : postList.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-center py-6 text-gray-500">등록된 게시글이 없습니다.</td>
                                    </tr>
                                ) : (
                                    postList.map((post) => (
                                        <tr
                                            key={post.id}
                                            className="hover:bg-gray-50 cursor-pointer"
                                            onClick={() => handleSelectPost(post.id)}
                                        >
                                            <td className="px-6 py-4 text-gray-900 line-clamp-1">{post.title ?? "제목 없음"}</td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {formatMetaDate(post.created_at)}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">남동시니어클럽</td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    className="text-xs px-3 py-1 text-red-600 hover:bg-red-50 border border-red-100 rounded"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeletePost(post.id);
                                                    }}
                                                >
                                                    삭제
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {total > pageSize && (
                        <div className="flex items-center justify-center gap-3 py-4">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-1 border rounded disabled:text-gray-300 disabled:border-gray-200"
                            >
                                이전
                            </button>
                            <span className="text-sm text-gray-700">
                                {page} / {Math.max(1, Math.ceil(total / pageSize))}
                            </span>
                            <button
                                onClick={() => setPage((p) => p + 1)}
                                disabled={page >= Math.ceil(total / pageSize)}
                                className="px-3 py-1 border rounded disabled:text-gray-300 disabled:border-gray-200"
                            >
                                다음
                            </button>
                        </div>
                    )}
                </section>
            )}

            {viewMode === 'edit' && (
                <section className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                {editingPostId ? "게시글 수정" : "새 게시글 작성"}
                            </h3>
                            <p className="text-xs text-gray-500">
                                관리자 전용 게시글로 저장됩니다.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => { resetForm(); setViewMode('list'); }}
                                className="px-4 py-2 border border-gray-200 rounded hover:bg-gray-50 text-sm"
                            >
                                목록으로
                            </button>
                        </div>
                    </div>

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

                    {/* 파일 업로드 */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-sm font-semibold text-gray-900">파일 업로드</h3>
                            <div className="relative group inline-block">
                                <button
                                    type="button"
                                    aria-label="업로드 안내"
                                    className="w-5 h-5 rounded-full border border-gray-300 text-gray-600 flex items-center justify-center text-[11px] leading-none
                   hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                    aria-describedby="upload-tooltip"
                                    title="직접 영상 업로드는 불가합니다."
                                >
                                    ?
                                </button>
                                <div
                                    id="upload-tooltip"
                                    role="tooltip"
                                    className="absolute left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block group-focus-within:block
                   whitespace-nowrap rounded-md bg-gray-800 px-3 py-1.5 text-xs text-white shadow-lg z-20"
                                >
                                    직접 영상을 업로드하는 건 불가능합니다. 유튜브에 업로드 후 링크를 추가하여주세요.
                                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-gray-800" />
                                </div>
                            </div>
                        </div>
                        <label className="block">
                            <input
                                type="file"
                                multiple
                                accept={ACCEPT}
                                onChange={handlePickFiles}
                                className="text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                            />
                        </label>

                        {files.length > 0 && (
                            <div className="mt-3 space-y-2 max-h-[100px] overflow-auto pr-1">
                                {files.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between border border-gray-100 rounded p-2"
                                    >
                                        <div className="flex items-center gap-3">
                                            {item.previewUrl ? (
                                                <img
                                                    src={item.previewUrl}
                                                    alt={item.file.name}
                                                    className="w-12 h-12 object-cover rounded"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                                                    FILE
                                                </div>
                                            )}
                                            <div className="text-sm">
                                                <p className="font-medium text-gray-900">{item.file.name}</p>
                                                <p className="text-gray-500">{(item.file.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => removeFile(idx)}
                                            className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 text-gray-900"
                                        >
                                            삭제
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {uploading && (
                            <p className="mt-2 text-xs text-blue-600">파일 업로드 중…</p>
                        )}
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

                    <div className="relative z-10 mt-4 flex gap-2">
                        <button
                            onClick={handleSubmit}
                            disabled={isEmpty || uploading}
                            className="cursor-pointer px-6 py-2 text-white bg-blue-500 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded font-semibold shadow"
                        >
                            {editingPostId ? "수정하기" : "게시하기"}
                        </button>
                        {editingPostId && (
                            <button
                                onClick={() => handleDeletePost(editingPostId)}
                                className="px-6 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded text-sm"
                            >
                                삭제
                            </button>
                        )}
                    </div>
                </section>
            )}
        </div>
    );
}
