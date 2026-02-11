// components/Banner.tsx
'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { generateDownloadUrl } from '@/app/service/s3'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

interface BannerData {
  id: string
  file_key: string
  bucket: string
  order_index: number
  link_url?: string
  image_url?: string
}

export default function Banner() {
  const [banners, setBanners] = useState<BannerData[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    fetchBanners()
  }, [])

  useEffect(() => {
    if (banners.length <= 1) return
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [banners.length])

  const fetchBanners = async () => {
    const { data } = await supabase
      .from('BANNER')
      .select('*')
      .order('order_index', { ascending: true })
    
    if (data) {
      const bannersWithUrls = await Promise.all(
        data.map(async (banner) => ({
          ...banner,
          image_url: await generateDownloadUrl(banner.bucket, banner.file_key)
        }))
      )
      setBanners(bannersWithUrls)
    }
  }

  if (banners.length === 0) return null

  const currentBanner = banners[currentIndex]

  // 배너 이미지 컴포넌트
  const BannerImage = () => (
    <img
      src={currentBanner.image_url}
      alt="banner"
      className="w-full h-auto md:h-full md:object-cover"
    />
  )

  return (
    <section className="w-full relative bg-white">
      <div className="relative w-full h-auto md:h-[400px] overflow-hidden">
        {/* 링크가 있으면 <a> 태그로 감싸기 */}
        {currentBanner.link_url ? (
          <a 
            href={currentBanner.link_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block w-full h-full cursor-pointer"
          >
            <BannerImage />
          </a>
        ) : (
          <BannerImage />
        )}
      </div>

      {banners.length > 1 && (
        <>
          <button
            onClick={() => setCurrentIndex(prev => (prev - 1 + banners.length) % banners.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 z-10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={() => setCurrentIndex(prev => (prev + 1) % banners.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 z-10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentIndex ? 'bg-white w-8' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}