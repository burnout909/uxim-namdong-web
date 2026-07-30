'use client';
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => <div className="p-4 text-sm text-gray-500">에디터 로딩 중…</div>,
});

const EditorPlaceholder = () => (
  <div className="p-4 text-sm text-gray-500">에디터 로딩 중…</div>
);

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

type EditorProps = {
  contents: string;
  setContents: (value: string) => void;
  /** 이미지 업로드가 진행 중인 동안 저장 버튼을 막고 싶을 때 사용 */
  onUploadingChange?: (uploading: boolean) => void;
};

/**
 * 이미지를 S3 에 올리고 본문에 넣을 경로를 돌려준다.
 *
 * 예전에는 Quill 기본 동작대로 붙여넣은 이미지가 base64 로 본문에 통째로 박혔다.
 * 글 하나가 1~3MB 가 되면서 DB 와 게시판 목록이 같이 무거워졌기 때문에
 * 이제는 어떤 경로로 들어온 이미지든 전부 S3 로 보낸다.
 */
async function uploadImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("이미지 파일만 넣을 수 있습니다.");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error(
      `이미지 용량이 너무 큽니다. (${(file.size / 1024 / 1024).toFixed(1)}MB / 최대 ${MAX_IMAGE_BYTES / 1024 / 1024}MB)`
    );
  }

  const ext =
    (file.name.split(".").pop() || file.type.split("/")[1] || "png")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "") || "png";
  const key = `editor/${uuidv4()}.${ext}`;

  const presignRes = await fetch(`/api/s3/upload?key=${encodeURIComponent(key)}`);
  if (!presignRes.ok) throw new Error("업로드 주소를 받지 못했습니다.");
  const { url } = await presignRes.json();

  const put = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!put.ok) throw new Error(`이미지 업로드에 실패했습니다. (S3 ${put.status})`);

  return `/api/s3/image?key=${encodeURIComponent(key)}`;
}

async function dataUriToFile(dataUri: string): Promise<File> {
  const blob = await (await fetch(dataUri)).blob();
  const ext = blob.type.split("/")[1] || "png";
  return new File([blob], `pasted.${ext}`, { type: blob.type });
}

export default function Editor({ contents, setContents, onUploadingChange }: EditorProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const savedRange = useRef<Range | null>(null);
  const [pending, setPending] = useState(0);

  /**
   * 마운트 이후에만 에디터를 그린다.
   *
   * dynamic(ssr:false) 를 서버에서 그대로 만나면 해당 세그먼트가
   * "클라이언트 렌더링으로 폴백"(BAILOUT_TO_CLIENT_SIDE_RENDERING) 상태가 되는데,
   * 이때 페이지 본문이 hydration 되지 않고 "에디터 로딩 중…"에서 멈추는 일이 있었다.
   * 서버/클라이언트 첫 렌더를 같은 placeholder 로 맞춰서 폴백 자체를 피한다.
   */
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    onUploadingChange?.(pending > 0);
  }, [pending, onUploadingChange]);

  /**
   * Quill 인스턴스에 ref 로 접근하는 대신 DOM(.ql-editor)을 직접 다룬다.
   * next/dynamic 으로 감싼 컴포넌트라 ref 전달이 보장되지 않기 때문이다.
   * Quill 2 는 MutationObserver 로 DOM 변경을 스스로 반영하므로 이걸로 충분하다.
   */
  const getRoot = useCallback(
    () => wrapperRef.current?.querySelector<HTMLElement>(".ql-editor") ?? null,
    []
  );

  const syncContents = useCallback(() => {
    const root = getRoot();
    if (root) setContents(root.innerHTML);
  }, [getRoot, setContents]);

  /** 파일 대화상자를 열면 선택 영역이 날아가므로 미리 저장해둔다 */
  const rememberSelection = useCallback(() => {
    const root = getRoot();
    const sel = window.getSelection();
    if (!root || !sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (root.contains(range.commonAncestorContainer)) {
      savedRange.current = range.cloneRange();
    }
  }, [getRoot]);

  const insertImage = useCallback(
    (url: string) => {
      const root = getRoot();
      if (!root) return;

      const img = document.createElement("img");
      img.setAttribute("src", url);

      const range = savedRange.current;
      if (range && root.contains(range.commonAncestorContainer)) {
        range.deleteContents();
        range.insertNode(img);
        range.setStartAfter(img);
        range.collapse(true);
        savedRange.current = range.cloneRange();
      } else {
        root.appendChild(img);
      }
      syncContents();
    },
    [getRoot, syncContents]
  );

  /** 파일 여러 개를 순서대로 올려서 커서 위치에 넣는다 */
  const uploadAndInsert = useCallback(
    async (files: File[]) => {
      const images = files.filter((f) => f.type.startsWith("image/"));
      if (images.length === 0) return;

      setPending((n) => n + images.length);
      for (const file of images) {
        try {
          const url = await uploadImage(file);
          insertImage(url);
        } catch (err) {
          console.error("에디터 이미지 업로드 실패:", err);
          alert(err instanceof Error ? err.message : "이미지 업로드에 실패했습니다.");
        } finally {
          setPending((n) => n - 1);
        }
      }
    },
    [insertImage]
  );

  /** 툴바 이미지 버튼 */
  const handleToolbarImage = useCallback(() => {
    rememberSelection();
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.onchange = () => {
      const files = Array.from(input.files ?? []);
      if (files.length) uploadAndInsert(files);
    };
    input.click();
  }, [rememberSelection, uploadAndInsert]);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, false] }],
          ['bold', 'italic', 'underline'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link', 'image'],
        ],
        handlers: { image: handleToolbarImage },
      },
    }),
    [handleToolbarImage]
  );

  const formats = useMemo(
    () => ['header', 'bold', 'italic', 'underline', 'list', 'link', 'image'],
    []
  );

  /** 붙여넣기 / 드래그앤드롭으로 들어온 이미지 파일을 가로챈다 */
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const onPaste = (e: ClipboardEvent) => {
      const files = Array.from(e.clipboardData?.files ?? []).filter((f) =>
        f.type.startsWith("image/")
      );
      if (files.length === 0) return;
      e.preventDefault();
      e.stopPropagation();
      rememberSelection();
      uploadAndInsert(files);
    };

    const onDrop = (e: DragEvent) => {
      const files = Array.from(e.dataTransfer?.files ?? []).filter((f) =>
        f.type.startsWith("image/")
      );
      if (files.length === 0) return;
      e.preventDefault();
      e.stopPropagation();
      rememberSelection();
      uploadAndInsert(files);
    };

    const onSelectionChange = () => rememberSelection();

    // Quill 기본 핸들러보다 먼저 잡아야 base64 변환을 막을 수 있다
    wrapper.addEventListener("paste", onPaste, true);
    wrapper.addEventListener("drop", onDrop, true);
    wrapper.addEventListener("keyup", onSelectionChange);
    wrapper.addEventListener("mouseup", onSelectionChange);
    return () => {
      wrapper.removeEventListener("paste", onPaste, true);
      wrapper.removeEventListener("drop", onDrop, true);
      wrapper.removeEventListener("keyup", onSelectionChange);
      wrapper.removeEventListener("mouseup", onSelectionChange);
    };
  }, [rememberSelection, uploadAndInsert]);

  /**
   * 마지막 안전망.
   * 한글/워드 문서를 통째로 붙여넣는 경우처럼 위 두 경로를 빠져나가
   * 본문에 base64 <img> 가 들어오면, 뒤늦게라도 S3 로 올리고 src 를 갈아끼운다.
   */
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const seen = new WeakSet<HTMLImageElement>();

    const sweep = () => {
      const root = getRoot();
      if (!root) return;
      root.querySelectorAll<HTMLImageElement>('img[src^="data:"]').forEach((img) => {
        if (seen.has(img)) return;
        seen.add(img);
        const src = img.getAttribute("src");
        if (!src) return;

        setPending((n) => n + 1);
        dataUriToFile(src)
          .then(uploadImage)
          .then((url) => {
            img.setAttribute("src", url);
            syncContents();
          })
          .catch((err) => {
            console.error("붙여넣은 이미지 업로드 실패:", err);
            img.remove();
            alert(
              "붙여넣은 이미지를 업로드하지 못해 본문에서 제거했습니다. 이미지 버튼으로 다시 넣어주세요."
            );
            syncContents();
          })
          .finally(() => setPending((n) => n - 1));
      });
    };

    const observer = new MutationObserver(sweep);
    observer.observe(wrapper, { childList: true, subtree: true, attributes: true, attributeFilter: ["src"] });
    sweep();
    return () => observer.disconnect();
  }, [getRoot, syncContents]);

  return (
    <div ref={wrapperRef} className="bg-white rounded border border-gray-200 min-h-[300px]">
      {mounted ? (
        <ReactQuill
          theme="snow"
          value={contents}
          onChange={setContents}
          modules={modules}
          formats={formats}
          className="quill-wrapper"
        />
      ) : (
        <EditorPlaceholder />
      )}
      {pending > 0 && (
        <p className="px-4 py-2 text-xs text-blue-600 border-t border-gray-100">
          이미지 업로드 중… ({pending}장)
        </p>
      )}
    </div>
  );
}
