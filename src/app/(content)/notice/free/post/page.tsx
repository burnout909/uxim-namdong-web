'use client'
import { useRouter } from "next/navigation";
import { useMemo, useState, useEffect, useCallback } from "react";
import 'react-quill-new/dist/quill.snow.css';
import dynamic from "next/dynamic";
import { createBrowserClient } from '@supabase/ssr';
import { generateUploadUrl } from "@/app/service/s3";
import { v4 as uuidv4 } from "uuid";
import PostForm from "@/components/posting/PostForm";

// ✅ 브라우저용 Supabase 클라이언트
const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

// ✅ SSR 비활성화하여 클라이언트에서만 로드
const ReactQuill = dynamic(() => import('react-quill-new'), {
    ssr: false,
    loading: () => <div className="text-sm text-gray-500">에디터 로딩 중…</div>,
});

type LocalFile = {
    file: File;
    previewUrl?: string;
};

export default function PostPage() {
    const [title, setTitle] = useState("");
    const [contents, setContents] = useState("");
    const [userId, setUserId] = useState<string | null>(null);
    const [type, setType] = useState('NOTICE');

    // ✅ 나만보기 & 비밀번호 상태
    const [isPrivate, setIsPrivate] = useState(false);
    const [password, setPassword] = useState("");

    // ✅ 업로드 상태
    const [files, setFiles] = useState<LocalFile[]>([]);
    const [uploading, setUploading] = useState(false);
    const [fileKeyList, setFileKeyList] = useState<string[]>();

    const router = useRouter();

    // ✅ 사용자 정보 가져오기
    useEffect(() => {
        const getUserInfo = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setUserId(user.id);
        };
        getUserInfo();
    }, []);

    // ✅ 제목/내용 비어 있는지 판정
    const isEmpty = useMemo(() => {
        const plain = contents
            .replace(/<[^>]+>/g, "")
            .replace(/&nbsp;/g, " ")
            .replace(/\s+/g, " ")
            .trim();
        return !title.trim() || plain.length === 0;
    }, [title, contents]);

    // ✅ Quill toolbar 구성
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

    const formats = useMemo(
        () => ['header', 'bold', 'italic', 'underline', 'list', 'link', 'image', 'video'],
        []
    );

    // ✅ 파일 업로드 핸들러
    const handlePickFiles = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!userId) {
            alert("파일 업로드를 위해 로그인이 필요합니다");
            return;
        }
        const list = e.target.files;
        if (!list) return;

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
            await Promise.all(
                Array.from(list)
                    .filter(f => !f.type.startsWith("video/"))
                    .map(async (f) => {
                        const ext = f.name.split('.').pop();
                        const fileName = f.name.replace(/\.[^/.]+$/, "");
                        const key = `uploads/${uuidv4()}-${fileName}.${ext}`;
                        setFileKeyList((prev) => [...prev || [], key]);
                        const uploadUrl = await generateUploadUrl(bucket, key);
                        const res = await fetch(uploadUrl, {
                            method: "PUT",
                            headers: { "Content-Type": f.type || "application/octet-stream" },
                            body: f,
                        });
                        await supabase.from('FILE').insert([
                            { file_key: key, bucket, size_bytes: f.size, mime_type: f.type, user_id: userId },
                        ]);
                        if (!res.ok) throw new Error(`❌ 업로드 실패: ${f.name}`);
                    })
            );
        } catch (err) {
            console.error("업로드 중 오류:", err);
            alert("파일 업로드 중 오류가 발생했습니다.");
            setFiles(prev => prev.filter(f => !next.includes(f)));
        } finally {
            setUploading(false);
            e.currentTarget.value = "";
        }
    }, [setFiles, setUploading, setFileKeyList, userId]);

    // ✅ 파일 제거
    const removeFile = useCallback((idx: number) => {
        setFiles(prev => {
            const target = prev[idx];
            if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
            return prev.filter((_, i) => i !== idx);
        });
    }, []);

    // ✅ 게시글 제출
    const handleSubmit = async () => {
        if (isEmpty) {
            alert("제목과 내용을 모두 입력해주세요.");
            return;
        }
        if (!userId) {
            alert("로그인이 필요합니다.");
            return;
        }
        if (isPrivate && password.trim().length < 4) {
            alert("비밀번호는 4자리 이상이어야 합니다.");
            return;
        }

        try {
            const { data: postData, error: postError } = await supabase
                .from("POST")
                .insert([
                    {
                        title,
                        contents,
                        user_id: userId,
                        type: "FREE",
                        is_private: isPrivate,
                        password: isPrivate ? password : null,
                    },
                ])
                .select();

            if (postError || !postData?.length) {
                console.error("게시글 등록 실패:", postError);
                alert("게시글 등록에 실패했습니다.");
                return;
            }

            const newPostId = postData[0].id;

            if (fileKeyList?.length) {
                const linkPromises = fileKeyList.map(async (key) => {
                    await supabase.from("POST_FILE").insert([
                        { post_id: newPostId, file_key: key, role: "ATTACHMENT" },
                    ]);
                });
                await Promise.all(linkPromises);
            }

            alert("게시글이 등록되었습니다.");
            window.location.reload();
        } catch (err) {
            console.error("공지사항 등록 실패:", err);
            alert("공지사항 등록에 실패했습니다.");
        }
    };

    const ACCEPT = [
        'image/*',
        '.pdf', '.doc', '.docx', '.ppt', '.pptx',
        '.xls', '.xlsx', '.hwp', '.hwpx',
        '.txt', '.csv', '.mp3', '.wav'
    ].join(',');

    return (
        <div className="min-w-[929px]">
            <h1 className="text-heading-large text-gray-900">자유게시판</h1>
            <PostForm/>
        </div>
    );
}
