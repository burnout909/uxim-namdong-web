import { notFound } from "next/navigation";
import { getPostDetail } from "@/services/postService";
import FreeBoardDetailClient from "../../../../../components/freeboard/FreeBoardDetailClient";

export const dynamic = "force-dynamic";

export default async function FreeBoardDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getPostDetail("FREE", id);
  if (!result) notFound();

  return <FreeBoardDetailClient result={result} />;
}
