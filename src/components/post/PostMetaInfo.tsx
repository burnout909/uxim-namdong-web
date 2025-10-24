type PostMetaInfoProps = {
  author?: string;
  createdAt: string;
};

export default function PostMetaInfo({
  author = "남동시니어클럽",
  createdAt,
}: PostMetaInfoProps) {
  return (
    <div className="flex gap-4 items-end mt-3">
      <p className="text-gray-500 text-body-medium">{author}</p>
      <p className="text-body-medium text-gray-500">{createdAt}</p>
    </div>
  );
}
