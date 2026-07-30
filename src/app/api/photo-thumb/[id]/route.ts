import { NextResponse } from "next/server";
import sharp from "sharp";
import { createClient } from "@/lib/supabase";
import { generateDownloadUrl } from "@/app/service/s3";

/**
 * 사진자료실 글의 대표 이미지를 내려주는 라우트.
 *
 * 사진 글 본문에는 base64 data URI 이미지가 통째로 들어있는 경우가 많아
 * (한 글에 1~3MB) 메인 페이지에서 본문을 직접 읽으면 HTML이 수 MB가 된다.
 * 그래서 대표 이미지만 이 라우트로 분리해서 브라우저/CDN 캐시에 태운다.
 *
 * 우선순위
 *   1) POST_FILE 에 붙은 이미지 첨부 (S3 presigned URL 로 리다이렉트)
 *   2) 본문 첫 번째 <img> 의 http(s) URL (리다이렉트)
 *   3) 본문 첫 번째 <img> 의 data URI (디코딩해서 바이트로 응답)
 */

const CACHE_HEADER =
  "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800";

/** 갤러리 카드는 데스크톱에서 최대 ~380px. 2x 디스플레이 감안해서 800px. */
const THUMB_WIDTH = 800;

type FileRow = { file_key: string; mime_type: string | null };
type PostFileRow = {
  role: string | null;
  // 스키마 캐시 상태에 따라 객체로도, 배열로도 내려온다
  file: FileRow | FileRow[] | null;
};

function toFile(pf: PostFileRow): FileRow | null {
  if (!pf.file) return null;
  return Array.isArray(pf.file) ? pf.file[0] ?? null : pf.file;
}

function firstImageSrc(html: string): string | null {
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : null;
}

function decodeDataUri(src: string): { body: Buffer; contentType: string } | null {
  const match = src.match(/^data:([^;,]+);base64,([\s\S]*)$/);
  if (!match) return null;
  const [, contentType, base64] = match;
  if (!contentType.startsWith("image/")) return null;
  try {
    return { body: Buffer.from(base64, "base64"), contentType };
  } catch {
    return null;
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const supabase = await createClient();
    const { data: post, error } = await supabase
      .from("POST")
      .select(
        `
        id,
        is_private,
        contents,
        POST_FILE (
          role,
          file:FILE!inner(file_key, mime_type)
        )
      `
      )
      .eq("type", "PHOTO")
      .eq("id", id)
      .maybeSingle();

    if (error || !post || post.is_private) {
      return new NextResponse(null, { status: 404 });
    }

    // 1) 첨부 이미지가 있으면 S3 를 그대로 쓴다 (본문 파싱보다 언제나 빠르다)
    const files = (post.POST_FILE ?? []) as unknown as PostFileRow[];
    const imageFiles = files
      .map((pf) => ({ role: pf.role, file: toFile(pf) }))
      .filter((pf) => pf.file?.mime_type?.startsWith("image/"));
    const picked =
      imageFiles.find((pf) => pf.role === "THUMBNAIL") ?? imageFiles[0];

    if (picked?.file) {
      const bucket = process.env.NEXT_PUBLIC_S3_BUCKET_NAME;
      if (bucket) {
        const url = await generateDownloadUrl(bucket, picked.file.file_key);
        return NextResponse.redirect(url, {
          status: 307,
          headers: { "Cache-Control": CACHE_HEADER },
        });
      }
    }

    // 2) / 3) 본문에 인라인된 이미지
    const src = firstImageSrc(post.contents ?? "");
    if (!src) return new NextResponse(null, { status: 404 });

    if (/^https?:\/\//i.test(src)) {
      return NextResponse.redirect(src, {
        status: 307,
        headers: { "Cache-Control": CACHE_HEADER },
      });
    }

    const decoded = decodeDataUri(src);
    if (!decoded) return new NextResponse(null, { status: 404 });

    // 원본은 장당 1MB 안팎이라 카드 크기에 맞춰 줄여서 내보낸다.
    // 실패하면 원본 그대로 (갤러리가 아예 안 뜨는 것보단 낫다)
    let body = decoded.body;
    let contentType = decoded.contentType;
    try {
      body = await sharp(decoded.body)
        .rotate()
        .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
        .webp({ quality: 76 })
        .toBuffer();
      contentType = "image/webp";
    } catch (e) {
      console.error("photo-thumb resize failed, serving original:", e);
    }

    return new NextResponse(new Uint8Array(body), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(body.byteLength),
        "Cache-Control": CACHE_HEADER,
      },
    });
  } catch (e) {
    console.error("photo-thumb failed:", e);
    return new NextResponse(null, { status: 500 });
  }
}
