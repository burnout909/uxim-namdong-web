'use client'
import { useRouter } from "next/navigation";
import { useMemo, useState, useEffect, useCallback } from "react";
import 'react-quill-new/dist/quill.snow.css';
import dynamic from "next/dynamic";
import { createBrowserClient } from '@supabase/ssr';
import { generateUploadUrl } from "@/app/service/s3";
import { v4 as uuidv4 } from "uuid";


// 브라우저용 Supabase 클라이언트
const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

// 카테고리 타입 매핑
const CategoryTypeEnumMap = {
    'NOTICE': '공지사항',
    'JOB': '일자리',
    'PRODUCT': '생산품',
    'FREE': '자유게시판',
    'PHOTO': '사진게시판',
    'VIDEO': '동영상게시판'
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

export default function EditorPage() {
    const [title, setTitle] = useState("");
    const [contents, setContents] = useState("");
    const [userId, setUserId] = useState<string | null>(null);
    const [type, setType] = useState('NOTICE');

    // 업로드 상태
    const [files, setFiles] = useState<LocalFile[]>([]);
    const [uploading, setUploading] = useState(false);
    const [fileKeyList, setFileKeyList] = useState<string[]>()

    const router = useRouter();

    // 사용자 정보 가져오기
    useEffect(() => {
        const getUserInfo = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            console.log(user)
            if (user) setUserId(user.id);
        };
        getUserInfo();
    }, [setUserId]);

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
                // ['link', 'image', 'video'], // 에디터의 비디오 embed는 유지 (파일 업로드와는 별개) 일단은 이미지 업로드 비오픈
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
    const handlePickFiles = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log(userId)
        if (!userId) {
            alert("파일 업로드를 위해 로그인이 필요합니다")
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
            // 🔹 Promise.all로 병렬 업로드
            await Promise.all(
                Array.from(list)
                    .filter(f => !f.type.startsWith("video/")) // 영상 제외
                    .map(async (f) => {
                        const ext = f.name.split('.').pop();
                        const fileName = f.name.replace(/\.[^/.]+$/, "");
                        const key = `uploads/${uuidv4()}-${fileName}.${ext}`;
                        setFileKeyList((prev) => [...prev || [], key])
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
                        const { data, error } = await supabase
                            .from('FILE')
                            .insert([
                                { file_key: key, bucket: bucket, size_bytes: f.size, mime_type: f.type, user_id: userId }
                            ])
                            .select()

                        if (!res.ok) throw new Error(`❌ 업로드 실패: ${f.name}`);

                        // 업로드 성공 시 접근 URL 반환
                        return `https://${bucket}.s3.amazonaws.com/${key}`;
                    })
            );
        } catch (err) {
            console.error("업로드 중 오류:", err);
            alert("파일 업로드 중 오류가 발생했습니다.");

            // 롤백: 새로 추가된 파일 제거
            setFiles(prev => prev.filter(f => !next.includes(f)));
        } finally {
            setUploading(false);
            e.currentTarget.value = "";
        }
    }, [setFiles, setUploading, setFileKeyList, userId]);


    // 파일 제거
    const removeFile = useCallback((idx: number) => {
        setFiles(prev => {
            // 미리보기 URL revoke
            const target = prev[idx];
            if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
            return prev.filter((_, i) => i !== idx);
        });
    }, []);

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
            // 1. 게시글 저장
            const { data: postData, error: postError } = await supabase
                .from("POST")
                .insert([
                    {
                        title,
                        contents,
                        user_id: userId,
                        type,
                    },
                ])
                .select(); // Postgres는 insert 후 select() 시 새 행 반환

            if (postError || !postData?.length) {
                console.error("게시글 등록 실패:", postError);
                alert("게시글 등록에 실패했습니다.");
                return;
            }

            const newPostId = postData[0].id;

            // 2. 파일 테이블 업데이트 (비동기 병렬 처리)
            if (fileKeyList?.length) {
                const updatePromises = fileKeyList.map(async (key) => {
                    const { error: fileError } = await supabase
                        .from("FILE")
                        .update({ post_id: newPostId })
                        .eq("file_key", key); // 🔹 file 테이블에 s3_key(또는 file_key) 컬럼 기준

                    if (fileError) throw fileError;
                });

                await Promise.all(updatePromises); // 모든 파일 업데이트 완료 대기
            }

            alert("게시글이 등록되었습니다.");
            router.push("/");
        } catch (err) {
            console.error("공지사항 등록 실패:", err);
            alert("공지사항 등록에 실패했습니다.");
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
        <div className="px-24 py-12 min-h-screen">
            <p className="text-2xl font-bold mb-6">게시글 작성</p>

            {/* ====== 상단 메타 영역: 카테고리 설정 & 파일 업로드로 분리 ====== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* 카테고리 설정 */}
                <section className="bg-white">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">카테고리 설정</h3>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full border border-gray-300 p-2 rounded"
                    >
                        {Object.entries(CategoryTypeEnumMap).map(([key, value]) => (
                            <option key={key} value={key}>
                                {value}
                            </option>
                        ))}
                    </select>
                </section>

                {/* 파일 업로드 */}
                <section className="bg-white">
                    <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-sm font-semibold text-gray-700">파일 업로드</h3>

                        {/* 툴팁 아이콘 */}
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

                            {/* 툴팁 박스 */}
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
                            className="text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                        />
                    </label>

                    {/* 선택된 파일 미리보기/목록 */}
                    {files.length > 0 && (
                        <div className="mt-3 space-y-2 max-h-[100px] overflow-auto pr-1">
                            {files.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between border border-gray-100 rounded p-2"
                                >
                                    <div className="flex items-center gap-3">
                                        {/* 이미지 미리보기 */}
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
                                            <p className="font-medium">{item.file.name}</p>
                                            <p className="text-gray-500">{(item.file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => removeFile(idx)}
                                        className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-100"
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
                </section>
            </div>

            {/* 제목 */}
            <input
                type="text"
                placeholder="제목을 입력하세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-300 p-3 mb-4 rounded"
            />

            {/* 에디터 */}
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

            {/* 버튼 */}
            <div className="relative z-10 mt-4 flex gap-2">
                <button
                    onClick={handleSubmit}
                    disabled={isEmpty || uploading}
                    className="cursor-pointer px-6 py-2 text-white bg-blue-500 hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed rounded font-semibold shadow"
                >
                    게시하기
                </button>
            </div>
        </div>
    );
}
