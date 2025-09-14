'use client'
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import 'react-quill-new/dist/quill.snow.css';
import dynamic from "next/dynamic";


// SSR 비활성화해서 클라이언트에서만 로드
const ReactQuill = dynamic(() => import('react-quill-new'), {
    ssr: false,
    loading: () => <div className="text-sm text-gray-500">에디터 로딩 중…</div>,
});

export default function EditorPage() {
    const [title, setTitle] = useState("");
    const [contents, setContents] = useState("");
    const router = useRouter();

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
                ['link', 'image', 'video'],
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

    const handleSubmit = async () => {
        if (isEmpty) {
            alert("제목과 내용을 모두 입력해주세요.");
            return;
        }

        try {
            alert("공지사항이 등록되었습니다.");
            //supabase api 추가 필요
            //route handler 추가해서 실시
        } catch (err) {
            console.error("공지사항 등록 실패:", err);
            alert("공지사항 등록에 실패했습니다.");
        }
    };

    return (
        <div className="px-24 py-12 min-h-screen">
            <p className="text-2xl font-bold mb-4">공지사항 작성</p>

            <input
                type="text"
                placeholder="제목을 입력하세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-300 p-2 mb-4"
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
            {/* 버튼을 완전히 분리된 div에 위치 */}
            <div className="relative z-10 mt-[15px] flex">
                <button
                    onClick={handleSubmit}
                    disabled={isEmpty}
                    className="cursor-pointer px-6 py-2 text-white bg-blue-500 hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed rounded font-semibold shadow"
                >
                    submit
                </button>
            </div>
        </div>
    );
}