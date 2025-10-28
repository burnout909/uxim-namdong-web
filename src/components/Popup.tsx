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
  link_url?: string
  image_url?: string
}

export default function Popup() {
  const [popups, setPopups] = useState<PopupData[]>([])
  const [visiblePopups, setVisiblePopups] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchPopups()
  }, [])

  const fetchPopups = async () => {
    const { data } = await supabase
      .from('POPUP')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true })
    
    if (data) {
      const popupsWithUrls = await Promise.all(
        data.map(async (popup) => ({
          ...popup,
          image_url: await generateDownloadUrl(popup.bucket, popup.file_key)
        }))
      )
      
      setPopups(popupsWithUrls)
      
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

  const handlePopupClick = (popup: PopupData) => {
    if (popup.link_url) {
      window.open(popup.link_url, '_blank', 'noopener,noreferrer')
    }
  }

  if (visiblePopups.size === 0) return null

  return (
    <>
      {popups
        .filter(p => visiblePopups.has(p.id))
        .map((popup, i) => (
          <div
            key={popup.id}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            style={{ zIndex: 1000 + i }}
          >
            <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
              {/* X 버튼 */}
              <button
                onClick={() => closePopup(popup.id)}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 z-10 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* 팝업 이미지 - 링크가 있으면 클릭 가능 */}
              <div className="relative w-full overflow-y-auto" style={{ maxHeight: 'calc(90vh - 60px)' }}>
                <div className="p-4 pb-0">
                  {popup.link_url ? (
                    <div
                      onClick={() => handlePopupClick(popup)}
                      className="cursor-pointer group"
                    >
                      <img
                        src={popup.image_url}
                        alt="popup"
                        className="w-full h-auto rounded-t-lg group-hover:opacity-95 transition-opacity"
                      />
                      {/* 링크 힌트 아이콘 */}
                      <div className="absolute top-6 left-6 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        🔗 클릭하여 이동
                      </div>
                    </div>
                  ) : (
                    <img
                      src={popup.image_url}
                      alt="popup"
                      className="w-full h-auto rounded-t-lg"
                    />
                  )}
                </div>
              </div>

              {/* 하단 버튼 영역 */}
              <div className="flex border-t border-gray-200 bg-white">
                <button
                  onClick={() => closeForToday(popup.id)}
                  className="flex-1 py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  오늘 하루 보지 않기
                </button>
                <div className="w-px bg-gray-200" />
                <button
                  onClick={() => closePopup(popup.id)}
                  className="flex-1 py-3 text-sm text-gray-900 font-medium hover:bg-gray-50 transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        ))}
    </>
  )
}