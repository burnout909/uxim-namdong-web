import { NextResponse } from "next/server";
import { generateDownloadUrl } from "@/app/service/s3";

/**
 * 본문에 삽입된 이미지를 내려주는 라우트.
 *
 * 버킷이 비공개라 S3 주소를 본문에 그대로 박을 수 없고,
 * presigned URL 은 1시간 뒤 만료돼서 저장된 글에 넣으면 곧 깨진다.
 * 그래서 본문에는 이 경로만 남기고, 요청이 올 때마다 presign 해서 리다이렉트한다.
 */

// 에디터가 올리는 이미지 전용. 다른 경로의 객체는 이 라우트로 못 꺼낸다.
const ALLOWED_PREFIXES = ["editor/"];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");

  if (!key || key.includes("..")) {
    return new NextResponse(null, { status: 400 });
  }
  if (!ALLOWED_PREFIXES.some((p) => key.startsWith(p))) {
    return new NextResponse(null, { status: 403 });
  }

  const bucket = process.env.NEXT_PUBLIC_S3_BUCKET_NAME;
  if (!bucket) {
    console.error("NEXT_PUBLIC_S3_BUCKET_NAME is not set");
    return new NextResponse(null, { status: 500 });
  }

  try {
    const url = await generateDownloadUrl(bucket, key);
    return NextResponse.redirect(url, {
      status: 307,
      headers: {
        // presign 만료(1시간)보다 짧게 잡아야 캐시된 리다이렉트가 죽지 않는다
        "Cache-Control": "public, max-age=1800, s-maxage=1800",
      },
    });
  } catch (e) {
    console.error("image presign failed:", e);
    return new NextResponse(null, { status: 500 });
  }
}
