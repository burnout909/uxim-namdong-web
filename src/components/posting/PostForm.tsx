'use client';
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import TitleInput from "./TitleInput";
import Editor from "./Editor";
import PrivateOption from "./PrivateOption";
import SubmitButton from "./SubmitButton";
import bcrypt from "bcryptjs";

const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default function PostForm() {
    const [title, setTitle] = useState("");
    const [contents, setContents] = useState("");
    const [userId, setUserId] = useState<string | null>(null);
    const [isPrivate, setIsPrivate] = useState(false);
    const [password, setPassword] = useState("");
    const [uploading, setUploading] = useState(false);
    const [fileKeyList, setFileKeyList] = useState<string[]>([]);
    const router = useRouter();

    useEffect(() => {
        const getUserInfo = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setUserId(user.id);
        };
        getUserInfo();
    }, []);

    const isEmpty = useMemo(() => {
        const plain = contents.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim();
        return !title.trim() || plain.length === 0;
    }, [title, contents]);

    const handleSubmit = async () => {
        if (isEmpty) return alert("제목과 내용을 모두 입력해주세요.");
        if (isPrivate && password.trim().length < 4) return alert("비밀번호는 4자리 이상이어야 합니다.");

        const hashedPassword = isPrivate ? await bcrypt.hash(password, 10) : null;

        try {
            const { data, error } = await supabase
                .from("POST")
                .insert([
                    { title, contents, user_id: userId, type: "FREE", is_private: isPrivate, password: isPrivate ? hashedPassword : null },
                ])
                .select();

            if (error || !data?.length) throw error;
            const postId = data[0].id;

            if (fileKeyList.length) {
                await Promise.all(
                    fileKeyList.map((key) =>
                        supabase.from("POST_FILE").insert([{ post_id: postId, file_key: key, role: "ATTACHMENT" }])
                    )
                );
            }
            alert("게시글이 등록되었습니다.");
            router.push("/notice/free");
        } catch (err) {
            console.error("게시글 등록 실패:", err);
            alert("게시글 등록에 실패했습니다.");
        }
    };

    return (

        <div className="flex-col w-full flex space-y-4 justify-between my-6">
            <PrivateOption isPrivate={isPrivate} setIsPrivate={setIsPrivate} password={password} setPassword={setPassword} />
            <TitleInput title={title} setTitle={setTitle} />
            <Editor contents={contents} setContents={setContents} />
            <SubmitButton onClick={handleSubmit} disabled={isEmpty || uploading} />
        </div>
    );
}
