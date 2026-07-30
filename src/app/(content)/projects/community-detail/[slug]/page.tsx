'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase-browser';
import { generateDownloadUrl } from '@/app/service/s3';

/** 한글 등 비ASCII 슬러그를 안전하게 디코딩한다 */
function decodeSlug(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export default function CommunityDetailDynamic() {
  const params = useParams();
  // useParams 는 URL 세그먼트를 인코딩된 그대로 돌려준다.
  // 한글 슬러그면 %EC%B7%A8... 형태라 그대로 조회하면 매칭되지 않는다.
  const slug = decodeSlug(params.slug as string);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchImage() {
      try {
        const supabase = createBrowserSupabaseClient();
        const { data } = await supabase
          .from('BUSINESS_MENU')
          .select('image_key, image_bucket')
          .eq('slug', slug)
          .maybeSingle();

        if (data?.image_key && data?.image_bucket) {
          const url = await generateDownloadUrl(data.image_bucket, data.image_key);
          setImageUrl(url);
        }
      } catch {
        // fallback
      }
      setLoading(false);
    }
    fetchImage();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="text-gray-400 text-sm">불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <div className="relative w-full max-w-[700px] h-auto">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={slug}
            className="rounded-lg shadow w-full h-auto"
          />
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-10 text-center text-gray-500">
            <p className="text-sm">사업 이미지가 등록되지 않았습니다.</p>
            <p className="text-xs mt-2">관리자 페이지에서 이미지를 업로드해주세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}
