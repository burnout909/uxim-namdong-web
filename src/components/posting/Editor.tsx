'use client';
import dynamic from "next/dynamic";
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

export default function Editor({ contents, setContents }: any) {
  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
    ],
  };

  const formats = ['header', 'bold', 'italic', 'underline', 'list', 'link', 'image', 'video'];

  return (
    <div className="bg-white rounded border border-gray-200 min-h-[300px]">
      <ReactQuill
        theme="snow"
        value={contents}
        onChange={setContents}
        modules={modules}
        formats={formats}
        className="quill-wrapper" // 내부 에디터 영역에도 높이 적용
      />
    </div>
  );
}
