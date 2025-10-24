// src/components/post/PostFileList.tsx
import DownloadIcon from "@/assets/icons/download.svg";
import DownloadButton from "@/components/DownloadButton";
import { getDisplayFileName } from "@/utils/post";

type PostFileListProps = {
  files: Array<{
    role: string;
    file: {
      file_key: string;
      size_bytes: number;
      mime_type: string;
      created_at: string;
    }[];
  }>;
};

export default function PostFileList({ files }: PostFileListProps) {
  if (!files || files.length === 0) return null;

  return (
    <div className="mt-6 space-y-2">
      {files.map((pf:any) => {
        const file = pf.file;
        const isThumbnail = pf.role === "THUMBNAIL";
        return (
          <div
            key={file.file_key}
            className="flex items-center justify-between rounded-md bg-[#EEF2F7] px-4 py-3 text-body-small"
          >
            <div className="flex items-center gap-2 text-gray-500">
              <DownloadIcon width={20} height={20} className="shrink-0" />
              <DownloadButton
                fileKey={file.file_key}
                fileName={getDisplayFileName(file.file_key)}
              />
              {isThumbnail && (
                <span className="text-xs text-blue-500 font-medium">
                  (썸네일)
                </span>
              )}
            </div>
            <span className="text-gray-500">
              {(file.size_bytes / 1024).toFixed(1)} KB
            </span>
          </div>
        );
      })}
    </div>
  );
}
