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
  { value: 'employment', label: '취업지원사업' },
] as const

type Category = typeof CATEGORIES[number]['value']

type BusinessMenuItem = {
  id: string
  category: Category
  name: string
  slug: string
  image_key: string | null
  image_bucket: string | null
  image_url?: string
  order_index: number
  is_active: boolean
}

// 공통 페이지 필드 (public, capacity, community)
type CommonPageFields = {
  sectionTitle: string
  definition: string
  period: string
  target: string
  targetNote: string
  activity: string
  activityNote: string
  documents: string
  method: string
  exclusions: string
  notice: string
}

// 취업지원 전용 필드
type EmploymentPageFields = {
  sectionTitle: string
  definition: string
  targetEmployer: string
  targetJobseeker: string
  activityTime: string
  activityArea: string
  activityContent: string
  activityCount: string
  activityPay: string
}

const EMPTY_COMMON: CommonPageFields = {
  sectionTitle: '', definition: '', period: '', target: '', targetNote: '',
  activity: '', activityNote: '', documents: '', method: '', exclusions: '', notice: '',
}

const EMPTY_EMPLOYMENT: EmploymentPageFields = {
  sectionTitle: '', definition: '', targetEmployer: '', targetJobseeker: '',
  activityTime: '', activityArea: '', activityContent: '', activityCount: '', activityPay: '',
}

export default function AdminBusinessPage() {
  const { user } = useAuth()
  const [activeCategory, setActiveCategory] = useState<Category>('public')
  const [menuItems, setMenuItems] = useState<BusinessMenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [editingItem, setEditingItem] = useState<BusinessMenuItem | null>(null)
  const [formName, setFormName] = useState('')
  const [formSlug, setFormSlug] = useState('')
  const [formImageFile, setFormImageFile] = useState<File | null>(null)
  const [formImagePreview, setFormImagePreview] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const [commonContent, setCommonContent] = useState<CommonPageFields>(EMPTY_COMMON)
  const [employmentContent, setEmploymentContent] = useState<EmploymentPageFields>(EMPTY_EMPLOYMENT)
  const [contentSaving, setContentSaving] = useState(false)

  // 취업지원 이미지
  const [empImageFile, setEmpImageFile] = useState<File | null>(null)
  const [empImagePreview, setEmpImagePreview] = useState<string | null>(null)
  const [empImageKey, setEmpImageKey] = useState<string | null>(null)
  const [empImageBucket, setEmpImageBucket] = useState<string | null>(null)

  const isEmployment = activeCategory === 'employment'

  const fetchMenuItems = useCallback(async () => {
    if (isEmployment) { setLoading(false); return }
    setLoading(true)
    const { data, error } = await supabase
      .from('BUSINESS_MENU')
      .select('*')
      .eq('category', activeCategory)
      .order('order_index', { ascending: true })

    if (!error && data) {
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
  }, [activeCategory, isEmployment])

  const fetchPageContent = useCallback(async () => {
    const { data } = await supabase
      .from('SITE_CONFIG')
      .select('config_value')
      .eq('config_key', `business_page_${activeCategory}`)
      .single()

    if (data?.config_value) {
      try {
        const parsed = JSON.parse(data.config_value)
        if (isEmployment) {
          setEmploymentContent({ ...EMPTY_EMPLOYMENT, ...parsed })
          // 이미지 로드
          if (parsed._imageKey && parsed._imageBucket) {
            setEmpImageKey(parsed._imageKey)
            setEmpImageBucket(parsed._imageBucket)
            const url = await generateDownloadUrl(parsed._imageBucket, parsed._imageKey)
            setEmpImagePreview(url)
          } else {
            setEmpImageKey(null)
            setEmpImageBucket(null)
            setEmpImagePreview(null)
          }
        } else {
          setCommonContent({ ...EMPTY_COMMON, ...parsed })
        }
      } catch {
        if (isEmployment) setEmploymentContent(EMPTY_EMPLOYMENT)
        else setCommonContent(EMPTY_COMMON)
      }
    } else {
      if (isEmployment) {
        setEmploymentContent(EMPTY_EMPLOYMENT)
        setEmpImageKey(null)
        setEmpImageBucket(null)
        setEmpImagePreview(null)
      }
      else setCommonContent(EMPTY_COMMON)
    }
  }, [activeCategory, isEmployment])

  useEffect(() => {
    fetchMenuItems()
    fetchPageContent()
  }, [fetchMenuItems, fetchPageContent])

  const resetForm = () => {
    setEditingItem(null)
    setFormName('')
    setFormSlug('')
    setFormImageFile(null)
    setFormImagePreview(null)
    setShowForm(false)
  }

  const handleEdit = (item: BusinessMenuItem) => {
    setEditingItem(item)
    setFormName(item.name)
    setFormSlug(item.slug)
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

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9가-힣\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()
  }

  const handleSubmit = async () => {
    if (!formName.trim() || !user) return
    setSaving(true)
    try {
      const bucket = process.env.NEXT_PUBLIC_S3_BUCKET_NAME!
      let imageKey = editingItem?.image_key || null
      let imageBucket = editingItem?.image_bucket || null

      if (formImageFile) {
        const ext = formImageFile.name.split('.').pop()
        imageKey = `business/${activeCategory}/${uuidv4()}.${ext}`
        imageBucket = bucket
        const uploadUrl = await generateUploadUrl(bucket, imageKey)
        const res = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': formImageFile.type }, body: formImageFile })
        if (!res.ok) throw new Error('이미지 업로드 실패')
      }

      const slug = formSlug.trim() || generateSlug(formName)

      if (editingItem) {
        const { error } = await supabase.from('BUSINESS_MENU').update({
          name: formName.trim(), slug, image_key: imageKey, image_bucket: imageBucket, updated_at: new Date().toISOString(),
        }).eq('id', editingItem.id)
        if (error) throw error
        alert('사업 항목이 수정되었습니다.')
      } else {
        const maxOrder = menuItems.length > 0 ? Math.max(...menuItems.map(m => m.order_index)) : 0
        const { error } = await supabase.from('BUSINESS_MENU').insert({
          category: activeCategory, name: formName.trim(), slug, image_key: imageKey,
          image_bucket: imageBucket, order_index: maxOrder + 1, is_active: true,
        })
        if (error) throw error
        alert('사업 항목이 추가되었습니다.')
      }
      resetForm()
      fetchMenuItems()
    } catch (err) {
      console.error(err)
      alert('저장 중 오류가 발생했습니다.')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('해당 사업 항목을 삭제하시겠습니까?')) return
    const { error } = await supabase.from('BUSINESS_MENU').delete().eq('id', id)
    if (error) { alert('삭제 중 오류가 발생했습니다.'); return }
    fetchMenuItems()
  }

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    const { error } = await supabase.from('BUSINESS_MENU').update({ is_active: !currentActive }).eq('id', id)
    if (!error) fetchMenuItems()
  }

  const moveItem = async (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1
    if (target < 0 || target >= menuItems.length) return
    const next = [...menuItems]
    ;[next[index], next[target]] = [next[target], next[index]]
    await Promise.all(next.map((item, i) => supabase.from('BUSINESS_MENU').update({ order_index: i + 1 }).eq('id', item.id)))
    fetchMenuItems()
  }

  const handleEmpImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setEmpImageFile(file)
    setEmpImagePreview(URL.createObjectURL(file))
  }

  const handleSaveContent = async () => {
    if (!user) return
    setContentSaving(true)
    try {
      let contentToSave: Record<string, string | null>

      if (isEmployment) {
        let imageKey = empImageKey
        let imageBucket = empImageBucket

        // 새 이미지 업로드
        if (empImageFile) {
          const bucket = process.env.NEXT_PUBLIC_S3_BUCKET_NAME!
          const ext = empImageFile.name.split('.').pop()
          imageKey = `business/employment/${uuidv4()}.${ext}`
          imageBucket = bucket
          const uploadUrl = await generateUploadUrl(bucket, imageKey)
          const res = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': empImageFile.type }, body: empImageFile })
          if (!res.ok) throw new Error('이미지 업로드 실패')
          setEmpImageKey(imageKey)
          setEmpImageBucket(imageBucket)
          setEmpImageFile(null)
        }

        contentToSave = { ...employmentContent, _imageKey: imageKey, _imageBucket: imageBucket }
      } else {
        contentToSave = { ...commonContent }
      }

      const { error } = await supabase.from('SITE_CONFIG').upsert({
        config_key: `business_page_${activeCategory}`,
        config_value: JSON.stringify(contentToSave),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'config_key' })
      if (error) throw error
      alert('페이지 내용이 저장되었습니다.')
    } catch (err) {
      console.error(err)
      alert('저장 중 오류가 발생했습니다.')
    } finally { setContentSaving(false) }
  }

  const inputCls = "w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-900"
  const labelCls = "block text-xs font-medium text-gray-600 mb-1"

  return (
    <div className="px-6 lg:px-16 py-12 min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">사업 관리</h1>
        <p className="text-sm text-gray-500 mb-8">
          사업 카테고리별 메뉴 항목과 페이지 내용을 관리할 수 있습니다.
        </p>

        {/* 카테고리 탭 */}
        <div className="flex flex-wrap gap-2 mb-6">
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

        {/* 항목 목록 (취업지원 제외) */}
        {!isEmployment && (
          <>
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
                <div className="p-12 text-center text-gray-400 text-sm">등록된 사업 항목이 없습니다.</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {menuItems.map((item, index) => (
                    <div key={item.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50">
                      <div className="flex flex-col gap-0.5">
                        <button onClick={() => moveItem(index, 'up')} disabled={index === 0} className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs">▲</button>
                        <button onClick={() => moveItem(index, 'down')} disabled={index === menuItems.length - 1} className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs">▼</button>
                      </div>
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-14 h-14 object-cover rounded border border-gray-200" />
                      ) : (
                        <div className="w-14 h-14 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-xs text-gray-400">없음</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{item.name}</span>
                          {!item.is_active && <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded">비활성</span>}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">/{item.slug}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleToggleActive(item.id, item.is_active)} className={`text-xs px-3 py-1 rounded border ${item.is_active ? 'text-yellow-600 border-yellow-200 hover:bg-yellow-50' : 'text-green-600 border-green-200 hover:bg-green-50'}`}>
                          {item.is_active ? '비활성화' : '활성화'}
                        </button>
                        <button onClick={() => handleEdit(item)} className="text-xs px-3 py-1 text-blue-600 hover:bg-blue-50 border border-blue-100 rounded">수정</button>
                        <button onClick={() => handleDelete(item.id)} className="text-xs px-3 py-1 text-red-600 hover:bg-red-50 border border-red-100 rounded">삭제</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {showForm && (
              <section id="business-form" className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {editingItem ? '사업 항목 수정' : '새 사업 항목 추가'}
                </h3>
                <div className="grid gap-4">
                  <div>
                    <label className={labelCls}>사업명 *</label>
                    <input type="text" value={formName} onChange={(e) => { setFormName(e.target.value); if (!editingItem) setFormSlug(generateSlug(e.target.value)) }} placeholder="예: 경로당급식지원" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>URL 슬러그</label>
                    <input type="text" value={formSlug} onChange={(e) => setFormSlug(e.target.value)} placeholder="자동 생성됨" className={inputCls} />
                    <p className="text-xs text-gray-400 mt-1">URL에 사용될 이름입니다. 비워두면 자동 생성됩니다.</p>
                  </div>
                  <div>
                    <label className={labelCls}>대표 이미지</label>
                    {formImagePreview && <div className="mb-2"><img src={formImagePreview} alt="미리보기" className="w-32 h-32 object-cover rounded border" /></div>}
                    <input type="file" accept="image/*" onChange={handleImageSelect} className="text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
                  </div>
                </div>
                <div className="mt-6 flex gap-2">
                  <button onClick={handleSubmit} disabled={!formName.trim() || saving} className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded font-semibold text-sm">
                    {saving ? '저장 중...' : editingItem ? '수정하기' : '추가하기'}
                  </button>
                  <button onClick={resetForm} className="px-6 py-2 border border-gray-200 rounded hover:bg-gray-50 text-sm text-gray-600">취소</button>
                </div>
              </section>
            )}
          </>
        )}

        {/* 페이지 내용 편집 */}
        <section className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">페이지 내용 편집</h3>
          <p className="text-sm text-gray-500 mb-6">
            {CATEGORIES.find(c => c.value === activeCategory)?.label} 페이지에 표시되는 텍스트를 수정합니다.
          </p>

          {isEmployment ? (
            /* 취업지원 전용 폼 */
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h4 className="text-sm font-bold text-blue-800 mb-3">취업알선형 소개</h4>
                <div className="space-y-3">
                  <div>
                    <label className={labelCls}>섹션 제목</label>
                    <input type="text" value={employmentContent.sectionTitle} onChange={(e) => setEmploymentContent(p => ({ ...p, sectionTitle: e.target.value }))} placeholder="취업알선형이란?" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>사업의 정의</label>
                    <textarea value={employmentContent.definition} onChange={(e) => setEmploymentContent(p => ({ ...p, definition: e.target.value }))} placeholder="수요처의 요구에 의해서..." rows={3} className={inputCls + ' resize-none'} />
                  </div>
                  <div>
                    <label className={labelCls}>구인처 대상</label>
                    <input type="text" value={employmentContent.targetEmployer} onChange={(e) => setEmploymentContent(p => ({ ...p, targetEmployer: e.target.value }))} placeholder="어르신 인력이 필요한 개인, 단체, 사업체" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>구직자 대상</label>
                    <input type="text" value={employmentContent.targetJobseeker} onChange={(e) => setEmploymentContent(p => ({ ...p, targetJobseeker: e.target.value }))} placeholder="인천시 만 60세 이상 건강한 어르신" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>활동시간 / 활동일</label>
                    <input type="text" value={employmentContent.activityTime} onChange={(e) => setEmploymentContent(p => ({ ...p, activityTime: e.target.value }))} placeholder="구인업체 현황에 따라 상이함" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>활동지역</label>
                    <input type="text" value={employmentContent.activityArea} onChange={(e) => setEmploymentContent(p => ({ ...p, activityArea: e.target.value }))} placeholder="인천시 내" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>활동내용</label>
                    <input type="text" value={employmentContent.activityContent} onChange={(e) => setEmploymentContent(p => ({ ...p, activityContent: e.target.value }))} placeholder="아파트, 상가, 대학교, 공원, 시설관리 등..." className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>활동인원</label>
                    <input type="text" value={employmentContent.activityCount} onChange={(e) => setEmploymentContent(p => ({ ...p, activityCount: e.target.value }))} placeholder="배정인원 238명" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>활동비</label>
                    <input type="text" value={employmentContent.activityPay} onChange={(e) => setEmploymentContent(p => ({ ...p, activityPay: e.target.value }))} placeholder="수요처 약정 급여" className={inputCls} />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                <h4 className="text-sm font-bold text-green-800 mb-3">페이지 이미지</h4>
                {empImagePreview && (
                  <div className="mb-3">
                    <img src={empImagePreview} alt="미리보기" className="max-w-[400px] w-full h-auto rounded border border-gray-200" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEmpImageSelect}
                  className="text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
                <p className="text-xs text-gray-400 mt-1">비워두면 기본 이미지가 표시됩니다.</p>
              </div>
            </div>
          ) : (
            /* 공통 폼 (public, capacity, community) */
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h4 className="text-sm font-bold text-blue-800 mb-3">사업 소개 영역</h4>
                <div className="space-y-3">
                  <div>
                    <label className={labelCls}>섹션 제목 (예: 공익활동사업이란?)</label>
                    <input type="text" value={commonContent.sectionTitle} onChange={(e) => setCommonContent(p => ({ ...p, sectionTitle: e.target.value }))} placeholder="공익활동사업이란?" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>사업의 정의</label>
                    <textarea value={commonContent.definition} onChange={(e) => setCommonContent(p => ({ ...p, definition: e.target.value }))} placeholder="노인이 자기만족과 성취감 향상 및..." rows={2} className={inputCls + ' resize-none'} />
                  </div>
                  <div>
                    <label className={labelCls}>사업기간</label>
                    <input type="text" value={commonContent.period} onChange={(e) => setCommonContent(p => ({ ...p, period: e.target.value }))} placeholder="2025년 1월 ~ 11월 (총 11개월)" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>참여대상</label>
                    <input type="text" value={commonContent.target} onChange={(e) => setCommonContent(p => ({ ...p, target: e.target.value }))} placeholder="인천시 남동구 거주 만 65세 이상의 기초연금 수급자" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>참여대상 비고 (선택)</label>
                    <input type="text" value={commonContent.targetNote} onChange={(e) => setCommonContent(p => ({ ...p, targetNote: e.target.value }))} placeholder="※ 일부 유형 만 60세 이상 참여 가능" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>활동횟수 / 활동비</label>
                    <input type="text" value={commonContent.activity} onChange={(e) => setCommonContent(p => ({ ...p, activity: e.target.value }))} placeholder="월 최대 10회 (1회 3시간) / 최대 월 29만 원" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>활동비 비고 (선택)</label>
                    <input type="text" value={commonContent.activityNote} onChange={(e) => setCommonContent(p => ({ ...p, activityNote: e.target.value }))} placeholder="※ 수요처 계약에 따라 달라질 수 있음" className={inputCls} />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                <h4 className="text-sm font-bold text-green-800 mb-1">신청 안내 영역 (선택)</h4>
                <p className="text-xs text-gray-500 mb-3">비워두면 신청 안내 박스가 표시되지 않습니다.</p>
                <div className="space-y-3">
                  <div>
                    <label className={labelCls}>구비서류</label>
                    <input type="text" value={commonContent.documents} onChange={(e) => setCommonContent(p => ({ ...p, documents: e.target.value }))} placeholder="주민등록등본 1통, 사진 2매, 신청서 1부, 개인정보동의서" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>신청방법</label>
                    <input type="text" value={commonContent.method} onChange={(e) => setCommonContent(p => ({ ...p, method: e.target.value }))} placeholder="방문 접수 (개별 면담 진행)" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>제외대상 (한 줄에 하나씩)</label>
                    <textarea value={commonContent.exclusions} onChange={(e) => setCommonContent(p => ({ ...p, exclusions: e.target.value }))} placeholder={"국민기초생활보장법에 의한 생계급여 수급권자\n타 정부부처 일자리 사업 참여자"} rows={4} className={inputCls + ' resize-none'} />
                  </div>
                  <div>
                    <label className={labelCls}>하단 안내문구</label>
                    <input type="text" value={commonContent.notice} onChange={(e) => setCommonContent(p => ({ ...p, notice: e.target.value }))} placeholder="진행되는 사업은 2024년 확정 내시에 따라 달라질 수 있습니다." className={inputCls} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6">
            <button onClick={handleSaveContent} disabled={contentSaving} className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded font-semibold text-sm">
              {contentSaving ? '저장 중...' : '페이지 내용 저장'}
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
