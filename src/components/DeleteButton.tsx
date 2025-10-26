"use client";

export default function DeleteButton({
  id,
  handleDelete,
}: {
  id: string;
  handleDelete: (formData: FormData) => void;
}) {
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!confirm("정말 이 게시글을 삭제하시겠습니까?")) {
      e.preventDefault();
    }
  };

  return (
    <form action={handleDelete} onSubmit={onSubmit}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-md"
      >
        삭제
      </button>
    </form>
  );
}
