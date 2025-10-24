type PostContentProps = { html: string | null };

export default function PostContent({ html }: PostContentProps) {
  return (
    <article
      className="prose prose-slate mt-8 pb-6 text-gray-900 text-body-medium"
      dangerouslySetInnerHTML={{ __html: html ?? "" }}
    />
  );
}
