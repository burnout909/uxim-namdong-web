import { NextResponse } from "next/server";
import { generateUploadUrl } from "@/app/service/s3";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const bucket = searchParams.get("bucket");
  const key = searchParams.get("key");

  if (!bucket || !key) {
    return NextResponse.json({ error: "Missing bucket or key" }, { status: 400 });
  }

  try {
    const url = await generateUploadUrl(bucket, key);
    return NextResponse.json({ url });
  } catch (e) {
    console.error("Upload presign failed:", e);
    return NextResponse.json({ error: "presign failed" }, { status: 500 });
  }
}
