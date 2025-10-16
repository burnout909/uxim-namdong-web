// components/Popup.tsx
'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { generateDownloadUrl } from '@/app/service/s3'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

interface PopupData {
  id: string
  file_key: string
  bucket: string
  is_active: boolean
  image_url?: string
}

export default function Popup() {
  const [popups, setPopups] = useState<PopupData[]>([])
  const [visiblePopups, setVisiblePopups] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchPopups()
  }, [])

  const fetchPopups = async () => {
    // DB에서 활성화된 팝업만 가져오기
    const { data } = await supabase
      .from('POPUP')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true })
    
    if (data) {
      // Presigned URL 생성
      const popupsWithUrls = await Promise.all(
        data.map(async (popup) => ({
          ...popup,
          image_url: await generateDownloadUrl(popup.bucket, popup.file_key)
        }))
      )
      
      setPopups(popupsWithUrls)
      
      // 오늘 하루 보지 않기 체크
      const hiddenIds = getHiddenPopups()
      const visible = new Set<string>(
        popupsWithUrls
          .filter(p => !hiddenIds.includes(p.id))
          .map(p => p.id)
      )
      setVisiblePopups(visible)
    }
  }

  const getHiddenPopups = (): string[] => {
    if (typeof window === 'undefined') return []
    const hidden = localStorage.getItem('hiddenPopups')
    if (!hidden) return []
    
    try {
      const data = JSON.parse(hidden)
      const now = Date.now()
      
      // 만료 안된 것만 필터링
      const valid = Object.entries(data)
        .filter(([_, expiry]) => (expiry as number) > now)
        .map(([id]) => id)
      
      return valid
    } catch {
      return []
    }
  }

  const closePopup = (id: string) => {
    setVisiblePopups(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  const closeForToday = (id: string) => {
    if (typeof window === 'undefined') return
    
    const hidden = JSON.parse(localStorage.getItem('hiddenPopups') || '{}')
    const tomorrow = new Date()
    tomorrow.setHours(24, 0, 0, 0)
    hidden[id] = tomorrow.getTime()
    localStorage.setItem('hiddenPopups', JSON.stringify(hidden))
    closePopup(id)
  }

  if (visiblePopups.size === 0) return null

  return (
    <>
      {popups
        .filter(p => visiblePopups.has(p.id))
        .map((popup, i) => (
          <div
            key={popup.id}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            style={{ zIndex: 1000 + i }}
          >
            <div className="relative bg-white rounded-lg shadow-2xl max-w-lg w-full mx-4">
              <div className="relative w-full" style={{ maxHeight: '80vh' }}>
                <img
                  src={popup.image_url}
                  alt="popup"
                  className="w-full h-auto rounded-t-lg"
                  style={{ maxHeight: '80vh', objectFit: 'contain' }}
                />
              </div>

              <div className="flex border-t border-gray-200">
                <button
                  onClick={() => closeForToday(popup.id)}
                  className="flex-1 py-3 text-sm text-gray-600 hover:bg-gray-50"
                >
                  오늘 하루 보지 않기
                </button>
                <div className="w-px bg-gray-200" />
                <button
                  onClick={() => closePopup(popup.id)}
                  className="flex-1 py-3 text-sm text-gray-900 font-medium hover:bg-gray-50"
                >
                  닫기
                </button>
              </div>

              <button
                onClick={() => closePopup(popup.id)}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))}
    </>
  )
}