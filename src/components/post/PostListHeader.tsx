// src/components/post/PostListHeader.tsx
export default function PostListHeader() {
  return (
    <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
      <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
        <div className="col-span-6 text-heading-small">제목</div>
        <div className="col-span-3 text-heading-small">작성일</div>
        <div className="col-span-3 text-center text-heading-small text-end">
          작성자
        </div>
      </div>
    </div>
  );
}
