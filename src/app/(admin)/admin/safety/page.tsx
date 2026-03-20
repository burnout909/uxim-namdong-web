'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase-browser';
import { v4 as uuidv4 } from 'uuid';
import { generateUploadUrl, generateDownloadUrl } from '@/app/service/s3';
import { useAuth } from '@/hooks/useAuth';
import AdminHeader from '@/components/admin/AdminHeader';

const supabase = createBrowserSupabaseClient();

export default function SafetyPolicyPage() {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 현재 등록된 이미지 불러오기
  useEffect(() => {
    async function fetchCurrent() {
      try {
        const { data } = await supabase
          .from('SITE_CONFIG')
          .select('config_value')
          .eq('config_key', 'safety_policy_image')
          .single();

        if (data?.config_value) {
          const parsed = JSON.parse(data.config_value);
          if (parsed.bucket && parsed.key) {
            const url = await generateDownloadUrl(parsed.bucket, parsed.key);
            setCurrentImageUrl(url);
          }
        }
      } catch {
        // 아직 등록된 이미지 없음
      }
      setLoading(false);
    }
    fetchCurrent();
  }, []);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = useCallback(async () => {
    if (!userId) {
      alert('로그인이 필요합니다.');
      return;
    }
    if (!selectedFile) {
      alert('이미지를 선택해주세요.');
      return;
    }

    try {
      setUploading(true);

      const bucket = process.env.NEXT_PUBLIC_S3_BUCKET_NAME!;
      const fileExtension = selectedFile.name.split('.').pop() || 'jpg';
      const fileKey = `safety-policy/${uuidv4()}.${fileExtension}`;

      // S3 업로드
      const uploadUrl = await generateUploadUrl(bucket, fileKey);
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': selectedFile.type },
        body: selectedFile,
      });

      if (!response.ok) {
        throw new Error('S3 업로드 실패');
      }

      // SITE_CONFIG에 저장 (upsert)
      const configValue = JSON.stringify({ bucket, key: fileKey });
      const { error } = await supabase
        .from('SITE_CONFIG')
        .upsert(
          { config_key: 'safety_policy_image', config_value: configValue },
          { onConflict: 'config_key' }
        );

      if (error) throw error;

      // 미리보기 갱신
      const downloadUrl = await generateDownloadUrl(bucket, fileKey);
      setCurrentImageUrl(downloadUrl);

      alert('안전보건경영방침 이미지가 등록되었습니다!');
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error('업로드 오류:', err);
      alert('업로드 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setUploading(false);
    }
  }, [selectedFile, userId]);

  const handleDelete = async () => {
    if (!confirm('안전보건경영방침 이미지를 삭제하시겠습니까?')) return;

    try {
      const { error } = await supabase
        .from('SITE_CONFIG')
        .delete()
        .eq('config_key', 'safety_policy_image');

      if (error) throw error;

      setCurrentImageUrl(null);
      alert('이미지가 삭제되었습니다.');
    } catch (err) {
      console.error('삭제 오류:', err);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleCancelSelect = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AdminHeader />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">안전보건경영방침 관리</h1>
          <p className="text-gray-600">센터소개 &gt; 안전보건경영방침 페이지에 표시될 이미지를 관리합니다</p>
        </div>

        {/* 현재 이미지 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">현재 등록된 이미지</h2>

          {loading ? (
            <div className="text-center py-12 text-gray-400">불러오는 중...</div>
          ) : currentImageUrl ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <img
                  src={currentImageUrl}
                  alt="안전보건경영방침"
                  className="max-w-full rounded-lg shadow border border-gray-200"
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                >
                  이미지 삭제
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <p>등록된 이미지가 없습니다</p>
            </div>
          )}
        </div>

        {/* 이미지 업로드 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            {currentImageUrl ? '이미지 변경' : '새 이미지 업로드'}
          </h2>

          {!previewUrl ? (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleSelect}
                className="hidden"
                id="safety-upload"
              />
              <label htmlFor="safety-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-700 mb-1">이미지를 선택해주세요</p>
                    <p className="text-sm text-gray-500">JPG, PNG 형식</p>
                  </div>
                  <span className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                    파일 선택
                  </span>
                </div>
              </label>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-700">미리보기</p>
                  <button
                    onClick={handleCancelSelect}
                    className="text-sm text-gray-600 hover:text-gray-900 underline"
                  >
                    다시 선택
                  </button>
                </div>
                <div className="flex justify-center">
                  <img
                    src={previewUrl}
                    alt="미리보기"
                    className="max-w-full rounded-lg"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleUpload}
                  disabled={uploading || !userId}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  {!userId ? '로그인 필요' : uploading ? '업로드 중...' : '이미지 등록하기'}
                </button>
                <button
                  onClick={handleCancelSelect}
                  disabled={uploading}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 disabled:opacity-50 transition-all"
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
