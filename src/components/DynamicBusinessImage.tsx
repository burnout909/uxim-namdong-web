'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Image, { StaticImageData } from 'next/image';
import { createBrowserSupabaseClient } from '@/lib/supabase-browser';
import { generateDownloadUrl } from '@/app/service/s3';

const supabase = createBrowserSupabaseClient();

interface DynamicBusinessImageProps {
  fallbackImage: StaticImageData;
  alt: string;
}

export default function DynamicBusinessImage({ fallbackImage, alt }: DynamicBusinessImageProps) {
  const pathname = usePathname();
  const [dynamicUrl, setDynamicUrl] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    async function fetchImage() {
      try {
        // URL에서 slug 추출: /projects/public-detail/senior-meal -> senior-meal
        const slug = pathname.split('/').pop();
        if (!slug) {
          setChecked(true);
          return;
        }

        const { data } = await supabase
          .from('BUSINESS_MENU')
          .select('image_key, image_bucket')
          .eq('slug', slug)
          .maybeSingle();

        if (data?.image_key && data?.image_bucket) {
          const url = await generateDownloadUrl(data.image_bucket, data.image_key);
          setDynamicUrl(url);
        }
      } catch {
        // DB 오류 시 폴백 이미지 사용
      }
      setChecked(true);
    }

    fetchImage();
  }, [pathname]);

  // DB 이미지가 있으면 그걸 표시
  if (dynamicUrl) {
    return (
      <div className="flex justify-center">
        <div className="relative w-full max-w-[700px] h-auto">
          <img
            src={dynamicUrl}
            alt={alt}
            className="rounded-lg shadow w-full h-auto"
          />
        </div>
      </div>
    );
  }

  // 폴백: 기존 정적 이미지
  return (
    <div className="flex justify-center">
      <div className="relative w-full max-w-[700px] h-auto">
        <Image
          src={fallbackImage}
          alt={alt}
          className="rounded-lg shadow"
          width={700}
          height={500}
        />
      </div>
    </div>
  );
}
