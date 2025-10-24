// src/components/post/PostContainer.tsx
export default function PostContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="px-6 pb-12">{children}</div>;
}
