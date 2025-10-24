"use client";

import { useState } from "react";

interface DownloadButtonProps {
    fileKey: string;
    fileName?: string;
}

export default function DownloadButton({ fileKey, fileName }: DownloadButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleDownload = async () => {
        try {
            setLoading(true);

            const bucket = process.env.NEXT_PUBLIC_S3_BUCKET_NAME;
            const query = new URLSearchParams({
                bucket: bucket ?? "",
                key: fileKey,
                filename: fileName ?? "",
            });

            const res = await fetch(`/api/s3/download?${query.toString()}`);
            if (!res.ok) throw new Error("URL 생성 실패");

            const { url } = await res.json();

            const fileRes = await fetch(url);
            const blob = await fileRes.blob();
            const downloadUrl = window.URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = downloadUrl;
            a.download = fileName ?? "download";
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(downloadUrl);
        } catch (err) {
            console.error("Download failed:", err);
            alert("파일 다운로드 중 문제가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleDownload}
            disabled={loading}
            className="hover:underline truncate text-left"
        >
            {loading ? "다운로드 중..." : fileName ?? "파일 다운로드"}
        </button>
    );
}
