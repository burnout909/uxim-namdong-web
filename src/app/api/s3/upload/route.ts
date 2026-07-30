import { NextResponse } from "next/server";
import { generateUploadUrl } from "@/app/service/s3";

// 업로드를 허용할 키 접두사. 여기 없는 경로로는 presign 을 내주지 않는다.
const ALLOWED_PREFIXES = [
  "uploads/",
  "editor/",
  "banners/",
  "popups/",
  "organization/",
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");

  if (!key) {
    return NextResponse.json({ error: "Missing key" }, { status: 400 });
  }
  if (key.includes("..") || key.startsWith("/")) {
    return NextResponse.json({ error: "Invalid key" }, { status: 400 });
  }
  if (!ALLOWED_PREFIXES.some((p) => key.startsWith(p))) {
    return NextResponse.json({ error: "Key not allowed" }, { status: 403 });
  }

  // 버킷은 클라이언트가 지정하지 못하게 서버 설정값만 쓴다
  const bucket = process.env.NEXT_PUBLIC_S3_BUCKET_NAME;
  if (!bucket) {
    console.error("NEXT_PUBLIC_S3_BUCKET_NAME is not set");
    return NextResponse.json({ error: "bucket not configured" }, { status: 500 });
  }

  try {
    const url = await generateUploadUrl(bucket, key);
    return NextResponse.json({ url });
  } catch (e) {
    console.error("Upload presign failed:", e);
    return NextResponse.json({ error: "presign failed" }, { status: 500 });
  }
}
