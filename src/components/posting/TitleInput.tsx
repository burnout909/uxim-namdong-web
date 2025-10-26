'use client';
export default function TitleInput({ title, setTitle }: any) {
  return (
    <input
      type="text"
      placeholder="제목을 입력하세요"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      className="w-full border border-gray-300 p-3 rounded text-gray-900 placeholder:text-gray-400"
    />
  );
}
