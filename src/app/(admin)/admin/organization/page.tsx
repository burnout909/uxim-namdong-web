'use client'

import { useState, useEffect, useCallback } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'
import { generateUploadUrl, generateDownloadUrl } from '@/app/service/s3'
import { v4 as uuidv4 } from 'uuid'
import { useAuth } from '@/hooks/useAuth'

const supabase = createBrowserSupabaseClient()

type StaffRow = {
  id: string
  position: string
  count: number
  order_index: number
}

export default function AdminOrganizationPage() {
  const { user } = useAuth()
  const [orgImageUrl, setOrgImageUrl] = useState<string | null>(null)
  const [orgImageKey, setOrgImageKey] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [staffList, setStaffList] = useState<StaffRow[]>([])
  const [staffLoading, setStaffLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newPosition, setNewPosition] = useState('')
  const [newCount, setNewCount] = useState(0)

  // 조직도 이미지 로드
  const fetchOrgImage = useCallback(async () => {
    const { data } = await supabase
      .from('SITE_CONFIG')
      .select('*')
      .eq('config_key', 'org_chart_image')
      .maybeSingle()

    if (data?.file_key && data?.bucket) {
      setOrgImageKey(data.file_key)
      const url = await generateDownloadUrl(data.bucket, data.file_key)
      setOrgImageUrl(url)
    }
  }, [])

  // 직원 구성 로드
  const fetchStaff = useCallback(async () => {
    setStaffLoading(true)
    const { data, error } = await supabase
      .from('STAFF_COMPOSITION')
      .select('*')
      .order('order_index', { ascending: true })

    if (!error && data) {
      setStaffList(data)
    }
    setStaffLoading(false)
  }, [])

  useEffect(() => {
    fetchOrgImage()
    fetchStaff()
  }, [fetchOrgImage, fetchStaff])

  // 조직도 이미지 업로드
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setUploading(true)
    try {
      const bucket = process.env.NEXT_PUBLIC_S3_BUCKET_NAME!
      const ext = file.name.split('.').pop()
      const key = `organization/org-chart-${uuidv4()}.${ext}`

      const uploadUrl = await generateUploadUrl(bucket, key)
      const res = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        body: file,
      })

      if (!res.ok) throw new Error('이미지 업로드 실패')

      // SITE_CONFIG upsert
      const { error } = await supabase
        .from('SITE_CONFIG')
        .upsert({
          config_key: 'org_chart_image',
          file_key: key,
          bucket: bucket,
          updated_at: new Date().toISOString(),
          updated_by: user.id,
        }, { onConflict: 'config_key' })

      if (error) throw error

      const url = await generateDownloadUrl(bucket, key)
      setOrgImageUrl(url)
      setOrgImageKey(key)
      alert('조직도 이미지가 업데이트되었습니다.')
    } catch (err) {
      console.error(err)
      alert('이미지 업로드 중 오류가 발생했습니다.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  // 직원 인원 수정
  const updateStaffCount = (id: string, count: number) => {
    setStaffList(prev =>
      prev.map(s => s.id === id ? { ...s, count: Math.max(0, count) } : s)
    )
  }

  // 직원 직급명 수정
  const updateStaffPosition = (id: string, position: string) => {
    setStaffList(prev =>
      prev.map(s => s.id === id ? { ...s, position } : s)
    )
  }

  // 직원 행 삭제
  const removeStaff = (id: string) => {
    if (!confirm('해당 직급을 삭제하시겠습니까?')) return
    setStaffList(prev => prev.filter(s => s.id !== id))
  }

  // 새 직급 추가
  const addStaff = () => {
    if (!newPosition.trim()) return
    setStaffList(prev => [
      ...prev,
      {
        id: `new-${uuidv4()}`,
        position: newPosition.trim(),
        count: newCount,
        order_index: prev.length + 1,
      }
    ])
    setNewPosition('')
    setNewCount(0)
  }

  // 순서 이동
  const moveStaff = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1
    if (target < 0 || target >= staffList.length) return
    const next = [...staffList]
    ;[next[index], next[target]] = [next[target], next[index]]
    next.forEach((s, i) => s.order_index = i + 1)
    setStaffList(next)
  }

  // 전체 저장
  const handleSaveStaff = async () => {
    if (!user) return
    setSaving(true)

    try {
      // 기존 데이터 전체 삭제 후 재삽입
      await supabase.from('STAFF_COMPOSITION').delete().neq('id', '00000000-0000-0000-0000-000000000000')

      const insertData = staffList.map((s, i) => ({
        position: s.position,
        count: s.count,
        order_index: i + 1,
        updated_at: new Date().toISOString(),
      }))

      const { error } = await supabase.from('STAFF_COMPOSITION').insert(insertData)
      if (error) throw error

      alert('인원 구성도가 저장되었습니다.')
      fetchStaff()
    } catch (err) {
      console.error(err)
      alert('저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const totalCount = staffList.reduce((acc, s) => acc + s.count, 0)

  return (
    <div className="px-6 lg:px-16 py-12 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">조직도 관리</h1>
        <p className="text-sm text-gray-500 mb-8">조직도 이미지와 인원 구성표를 관리합니다.</p>

        {/* 조직도 이미지 관리 */}
        <section className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">조직도 이미지</h2>

          {orgImageUrl && (
            <div className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
              <img src={orgImageUrl} alt="현재 조직도" className="w-full h-auto" />
            </div>
          )}

          {!orgImageUrl && (
            <div className="mb-4 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center text-gray-400">
              현재 등록된 조직도 이미지가 없습니다.
              <br />
              <span className="text-sm">아래에서 이미지를 업로드해주세요.</span>
            </div>
          )}

          <div className="flex items-center gap-4">
            <label className="cursor-pointer px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium transition-colors">
              {uploading ? '업로드 중...' : '이미지 교체'}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
            <span className="text-xs text-gray-400">PNG, JPG 권장</span>
          </div>
        </section>

        {/* 인원 구성도 관리 */}
        <section className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">인원 구성도</h2>
            <span className="text-sm text-gray-500">총 인원: <strong className="text-blue-600">{totalCount}명</strong></span>
          </div>

          {staffLoading ? (
            <p className="text-sm text-gray-500 py-4">로딩 중...</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-gray-600 font-medium w-12">순서</th>
                      <th className="px-4 py-3 text-left text-gray-600 font-medium">직급</th>
                      <th className="px-4 py-3 text-center text-gray-600 font-medium w-24">인원</th>
                      <th className="px-4 py-3 text-center text-gray-600 font-medium w-32">관리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {staffList.map((staff, index) => (
                      <tr key={staff.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button
                              onClick={() => moveStaff(index, 'up')}
                              disabled={index === 0}
                              className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs"
                            >
                              ▲
                            </button>
                            <button
                              onClick={() => moveStaff(index, 'down')}
                              disabled={index === staffList.length - 1}
                              className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs"
                            >
                              ▼
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={staff.position}
                            onChange={e => updateStaffPosition(staff.id, e.target.value)}
                            className="border border-gray-200 rounded px-2 py-1 text-gray-900 w-full"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="number"
                            min={0}
                            value={staff.count}
                            onChange={e => updateStaffCount(staff.id, parseInt(e.target.value) || 0)}
                            className="border border-gray-200 rounded px-2 py-1 text-center text-gray-900 w-20 mx-auto"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => removeStaff(staff.id)}
                            className="text-xs px-3 py-1 text-red-600 hover:bg-red-50 border border-red-100 rounded"
                          >
                            삭제
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 새 직급 추가 */}
              <div className="mt-4 flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="text"
                  placeholder="직급명"
                  value={newPosition}
                  onChange={e => setNewPosition(e.target.value)}
                  className="border border-gray-200 rounded px-3 py-2 text-sm text-gray-900 flex-1"
                />
                <input
                  type="number"
                  min={0}
                  placeholder="인원"
                  value={newCount || ''}
                  onChange={e => setNewCount(parseInt(e.target.value) || 0)}
                  className="border border-gray-200 rounded px-3 py-2 text-sm text-gray-900 w-20 text-center"
                />
                <button
                  onClick={addStaff}
                  disabled={!newPosition.trim()}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded text-sm font-medium"
                >
                  추가
                </button>
              </div>

              {/* 저장 버튼 */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSaveStaff}
                  disabled={saving}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded font-semibold shadow text-sm"
                >
                  {saving ? '저장 중...' : '인원 구성도 저장'}
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
