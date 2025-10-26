'use client';
import { generateUploadUrl } from "@/app/service/s3";
import { createBrowserClient } from "@supabase/ssr";
import { v4 as uuidv4 } from "uuid";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default function FileUploader({ userId, files, setFiles, uploading, setUploading, setFileKeyList }: any) {
  const ACCEPT = [
    'image/*', '.pdf', '.doc', '.docx', '.ppt', '.pptx',
    '.xls', '.xlsx', '.hwp', '.hwpx', '.txt', '.csv', '.mp3', '.wav'
  ].join(',');

  const handlePickFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!userId) return alert("로그인이 필요합니다.");
    const list = e.target.files;
    if (!list) return;

    const newFiles = Array.from(list);
    setFiles((prev: any) => [...prev, ...newFiles]);
    setUploading(true);

    try {
      const bucket = process.env.NEXT_PUBLIC_S3_BUCKET_NAME!;
      await Promise.all(
        newFiles.map(async (f) => {
          const ext = f.name.split('.').pop();
          const fileName = f.name.replace(/\.[^/.]+$/, "");
          const key = `uploads/${uuidv4()}-${fileName}.${ext}`;
          setFileKeyList((prev: any) => [...prev, key]);
          const uploadUrl = await generateUploadUrl(bucket, key);
          await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": f.type }, body: f });
          await supabase.from("FILE").insert([{ file_key: key, bucket, size_bytes: f.size, mime_type: f.type, user_id: userId }]);
        })
      );
    } catch (err) {
      console.error("업로드 실패:", err);
      alert("파일 업로드 중 오류가 발생했습니다.");
    } finally {
      setUploading(false);
      e.currentTarget.value = "";
    }
  };

  return (
    <section className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-sm font-semibold text-gray-900">파일 업로드</h3>
        <button className="w-5 h-5 text-xs border rounded-full text-gray-600 hover:bg-gray-100" title="영상 업로드는 불가합니다.">?</button>
      </div>
      <input
        type="file"
        multiple
        accept={ACCEPT}
        onChange={handlePickFiles}
        className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
      />
      {uploading && <p className="mt-2 text-xs text-blue-600">파일 업로드 중…</p>}
      {files.length > 0 && (
        <ul className="mt-3 space-y-2 text-sm text-gray-700">
          {files.map((f: any, i: number) => (
            <li key={i} className="border p-2 rounded">{f.name}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
