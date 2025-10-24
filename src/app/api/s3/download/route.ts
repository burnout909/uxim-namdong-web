import { NextResponse } from "next/server";
import { generateDownloadUrl } from "@/app/service/s3";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const bucket = searchParams.get("bucket");
  const key = searchParams.get("key");
  const filename = searchParams.get("filename") ?? undefined;

  if (!bucket || !key) {
    return NextResponse.json({ error: "Missing bucket or key" }, { status: 400 });
  }

  try {
    // 🔽 다운로드용 Content-Disposition을 적용하려면 아래 옵션 추가 가능
    const url = await generateDownloadUrl(bucket, key /* , {
      contentDisposition: `attachment; filename="${filename}"`,
    }*/);

    return NextResponse.json({ url });
  } catch (e) {
    console.error("Download presign failed:", e);
    return NextResponse.json({ error: "presign failed" }, { status: 500 });
  }
}
