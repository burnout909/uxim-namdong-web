'use client';
export default function SubmitButton({ onClick, disabled }: any) {
  return (
    <div className="relative z-10 mt-4 flex gap-2">
      <button
        onClick={onClick}
        disabled={disabled}
        className="cursor-pointer px-6 py-2 text-white bg-blue-500 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded font-semibold shadow"
      >
        게시하기
      </button>
    </div>
  );
}
