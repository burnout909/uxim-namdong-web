'use client'

import { useState, useEffect, useCallback } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'
import { generateUploadUrl, generateDownloadUrl } from '@/app/service/s3'
import { v4 as uuidv4 } from 'uuid'
import { useAuth } from '@/hooks/useAuth'

const supabase = createBrowserSupabaseClient()

const CATEGORIES = [
  { value: 'public', label: '노인공익활동사업' },
  { value: 'capacity', label: '노인역량활용사업' },
  { value: 'community', label: '공동체사업단' },
] as const

type Category = typeof CATEGORIES[number]['value']

type BusinessMenuItem = {
  id: string
  category: Category
  name: string
  slug: string
  description: string | null
  image_key: string | null
  image_bucket: string | null
  image_url?: string
  order_index: number
  is_active: boolean
}

export default function AdminBusinessPage() {
  const { user } = useAuth()
  const [activeCategory, setActiveCategory] = useState<Category>('public')
  const [menuItems, setMenuItems] = useState<BusinessMenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // 폼 상태
  const [editingItem, setEditingItem] = useState<BusinessMenuItem | null>(null)
  const [formName, setFormName] = useState('')
  const [formSlug, setFormSlug] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formImageFile, setFormImageFile] = useState<File | null>(null)
  const [formImagePreview, setFormImagePreview] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const fetchMenuItems = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('BUSINESS_MENU')
      .select('*')
      .eq('category', activeCategory)
      .order('order_index', { ascending: true })

    if (!error && data) {
      // 이미지 URL 생성
      const withUrls = await Promise.all(
        data.map(async (item: Record<string, string | null>) => {
          let image_url: string | undefined
          if (item.image_key && item.image_bucket) {
            image_url = await generateDownloadUrl(item.image_bucket, item.image_key)
          }
          return { ...item, image_url } as BusinessMenuItem
        })
      )
      setMenuItems(withUrls)
    }
    setLoading(false)
  }, [activeCategory])

  useEffect(() => {
    fetchMenuItems()
  }, [fetchMenuItems])

  const resetForm = () => {
    setEditingItem(null)
    setFormName('')
    setFormSlug('')
    setFormDescription('')
    setFormImageFile(null)
    setFormImagePreview(null)
    setShowForm(false)
  }

  const handleEdit = (item: BusinessMenuItem) => {
    setEditingItem(item)
    setFormName(item.name)
    setFormSlug(item.slug)
    setFormDescription(item.description || '')
    setFormImagePreview(item.image_url || null)
    setFormImageFile(null)
    setShowForm(true)
    setTimeout(() => {
      document.getElementById('business-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFormImageFile(file)
    setFormImagePreview(URL.createObjectURL(file))
  }

  // 슬러그 자동 생성
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleSubmit = async () => {
    if (!formName.trim() || !user) return
    setSaving(true)

    try {
      const bucket = process.env.NEXT_PUBLIC_S3_BUCKET_NAME!
      let imageKey = editingItem?.image_key || null
      let imageBucket = editingItem?.image_bucket || null

      // 이미지 업로드
      if (formImageFile) {
        const ext = formImageFile.name.split('.').pop()
        imageKey = `business/${activeCategory}/${uuidv4()}.${ext}`
        imageBucket = bucket

        const uploadUrl = await generateUploadUrl(bucket, imageKey)
        const res = await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': formImageFile.type },
          body: formImageFile,
        })
        if (!res.ok) throw new Error('이미지 업로드 실패')
      }

      const slug = formSlug.trim() || generateSlug(formName)

      if (editingItem) {
        // 수정
        const { error } = await supabase
          .from('BUSINESS_MENU')
          .update({
            name: formName.trim(),
            slug,
            description: formDescription.trim() || null,
            image_key: imageKey,
            image_bucket: imageBucket,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingItem.id)

        if (error) throw error
        alert('사업 항목이 수정되었습니다.')
      } else {
        // 새로 추가
        const maxOrder = menuItems.length > 0
          ? Math.max(...menuItems.map(m => m.order_index))
          : 0

        const { error } = await supabase
          .from('BUSINESS_MENU')
          .insert({
            category: activeCategory,
            name: formName.trim(),
            slug,
            description: formDescription.trim() || null,
            image_key: imageKey,
            image_bucket: imageBucket,
            order_index: maxOrder + 1,
            is_active: true,
          })

        if (error) throw error
        alert('사업 항목이 추가되었습니다.')
      }

      resetForm()
      fetchMenuItems()
    } catch (err) {
      console.error(err)
      alert('저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('해당 사업 항목을 삭제하시겠습니까?')) return

    const { error } = await supabase
      .from('BUSINESS_MENU')
      .delete()
      .eq('id', id)

    if (error) {
      alert('삭제 중 오류가 발생했습니다.')
      return
    }

    fetchMenuItems()
  }

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    const { error } = await supabase
      .from('BUSINESS_MENU')
      .update({ is_active: !currentActive })
      .eq('id', id)

    if (!error) fetchMenuItems()
  }

  const moveItem = async (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1
    if (target < 0 || target >= menuItems.length) return

    const next = [...menuItems]
    ;[next[index], next[target]] = [next[target], next[index]]

    // DB 순서 업데이트
    await Promise.all(
      next.map((item, i) =>
        supabase
          .from('BUSINESS_MENU')
          .update({ order_index: i + 1 })
          .eq('id', item.id)
      )
    )

    fetchMenuItems()
  }

  return (
    <div className="px-6 lg:px-16 py-12 min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">사업 관리</h1>
        <p className="text-sm text-gray-500 mb-8">
          사업 카테고리별 메뉴 항목을 추가/수정/삭제하고 순서를 변경할 수 있습니다.
        </p>

        {/* 카테고리 탭 */}
        <div className="flex gap-2 mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => { setActiveCategory(cat.value); resetForm(); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeCategory === cat.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 목록 */}
        <section className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              {CATEGORIES.find(c => c.value === activeCategory)?.label} 항목
              <span className="ml-2 text-sm text-gray-400 font-normal">{menuItems.length}개</span>
            </h2>
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium"
            >
              새 항목 추가
            </button>
          </div>

          {loading ? (
            <div className="p-6 text-center text-gray-500 text-sm">로딩 중...</div>
          ) : menuItems.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-sm">
              등록된 사업 항목이 없습니다.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {menuItems.map((item, index) => (
                <div key={item.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50">
                  {/* 순서 */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => moveItem(index, 'up')}
                      disabled={index === 0}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => moveItem(index, 'down')}
                      disabled={index === menuItems.length - 1}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs"
                    >
                      ▼
                    </button>
                  </div>

                  {/* 이미지 */}
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-14 h-14 object-cover rounded border border-gray-200" />
                  ) : (
                    <div className="w-14 h-14 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-xs text-gray-400">
                      없음
                    </div>
                  )}

                  {/* 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{item.name}</span>
                      {!item.is_active && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded">비활성</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">/{item.slug}</p>
                    {item.description && (
                      <p className="text-xs text-gray-500 mt-1 truncate">{item.description}</p>
                    )}
                  </div>

                  {/* 액션 */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(item.id, item.is_active)}
                      className={`text-xs px-3 py-1 rounded border ${
                        item.is_active
                          ? 'text-yellow-600 border-yellow-200 hover:bg-yellow-50'
                          : 'text-green-600 border-green-200 hover:bg-green-50'
                      }`}
                    >
                      {item.is_active ? '비활성화' : '활성화'}
                    </button>
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-xs px-3 py-1 text-blue-600 hover:bg-blue-50 border border-blue-100 rounded"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-xs px-3 py-1 text-red-600 hover:bg-red-50 border border-red-100 rounded"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 추가/수정 폼 */}
        {showForm && (
          <section id="business-form" className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingItem ? '사업 항목 수정' : '새 사업 항목 추가'}
            </h3>

            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">사업명 *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value)
                    if (!editingItem) setFormSlug(generateSlug(e.target.value))
                  }}
                  placeholder="예: 경로당급식지원"
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL 슬러그</label>
                <input
                  type="text"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  placeholder="자동 생성됨"
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-900"
                />
                <p className="text-xs text-gray-400 mt-1">
                  URL에 사용될 이름입니다. 비워두면 자동 생성됩니다.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="사업에 대한 간단한 설명"
                  rows={3}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-900 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">대표 이미지</label>
                {formImagePreview && (
                  <div className="mb-2">
                    <img src={formImagePreview} alt="미리보기" className="w-32 h-32 object-cover rounded border" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={handleSubmit}
                disabled={!formName.trim() || saving}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded font-semibold text-sm"
              >
                {saving ? '저장 중...' : editingItem ? '수정하기' : '추가하기'}
              </button>
              <button
                onClick={resetForm}
                className="px-6 py-2 border border-gray-200 rounded hover:bg-gray-50 text-sm text-gray-600"
              >
                취소
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
