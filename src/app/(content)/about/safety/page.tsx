'use client';

import { useEffect, useState } from 'react';
import Title from "@/components/Title";
import { createBrowserSupabaseClient } from '@/lib/supabase-browser';
import { generateDownloadUrl } from '@/app/service/s3';

export default function Safety() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchImage() {
      try {
        const supabase = createBrowserSupabaseClient();
        const { data } = await supabase
          .from('SITE_CONFIG')
          .select('config_value')
          .eq('config_key', 'safety_policy_image')
          .single();

        if (data?.config_value) {
          const parsed = JSON.parse(data.config_value);
          if (parsed.bucket && parsed.key) {
            const url = await generateDownloadUrl(parsed.bucket, parsed.key);
            setImageUrl(url);
          }
        }
      } catch {
        // 이미지 없으면 안내 메시지 표시
      }
    }
    fetchImage();
  }, []);

  return (
    <div className="py-8 md:py-10">
      <Title text="안전보건경영방침" />

      <div className="mt-6 flex justify-center">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="안전보건경영방침"
            className="rounded-lg shadow w-full max-w-[700px] h-auto"
          />
        ) : (
          <div className="w-full max-w-[700px] bg-gray-50 border border-gray-200 rounded-lg p-10 text-center text-gray-500">
            <p className="text-sm">안전보건경영방침 이미지가 등록되지 않았습니다.</p>
            <p className="text-xs mt-2">관리자 페이지에서 이미지를 업로드해주세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}
