'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { v4 as uuidv4 } from 'uuid';
import { generateUploadUrl, generateDownloadUrl } from '@/app/service/s3';
import ReactCrop, { type PercentCrop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

// Supabase 브라우저 클라이언트
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

// 팝업 타입 정의
interface Popup {
  id: string;
  file_key: string;
  bucket: string;
  size_bytes: number;
  mime_type: string;
  order_index: number;
  is_active: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
  image_url?: string; // 프론트엔드에서 동적 생성
}

// 팝업 권장 크기 (비율 자유지만 최대 크기 제한)
const MAX_POPUP_WIDTH = 800;
const MAX_POPUP_HEIGHT = 1000;

export default function PopupPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // 크롭은 자유 비율
  const [crop, setCrop] = useState<PercentCrop>({
    unit: '%',
    x: 10,
    y: 10,
    width: 80,
    height: 80,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);

  const [uploading, setUploading] = useState(false);
  const [popupList, setPopupList] = useState<Popup[]>([]);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 로그인된 사용자 정보
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUserId(data.user.id);
    };
    getUser();
  }, []);

  // 팝업 목록 불러오기 + Presigned URL 생성
  useEffect(() => {
    const fetchPopups = async () => {
      const { data, error } = await supabase
        .from('POPUP')
        .select('*')
        .order('order_index', { ascending: true });
      
      if (error) {
        console.error('팝업 로드 에러:', error);
        return;
      }

      if (data) {
        console.log('🪟 팝업 데이터:', data);
        
        // 각 팝업에 대해 Presigned URL 생성
        const popupsWithUrls = await Promise.all(
          data.map(async (popup) => {
            try {
              const downloadUrl = await generateDownloadUrl(popup.bucket, popup.file_key);
              return {
                ...popup,
                image_url: downloadUrl
              };
            } catch (err) {
              console.error('Presigned URL 생성 실패:', popup.file_key, err);
              return {
                ...popup,
                image_url: ''
              };
            }
          })
        );
        
        setPopupList(popupsWithUrls);
      }
    };
    
    fetchPopups();
  }, []);

  /** 이미지 선택 */
  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }
    
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setCompletedCrop(null);
  };

  /** 크롭 완료 시 캔버스에 그려두기 (원본 비율 유지, 최대 크기 제한) */
  useEffect(() => {
    if (!completedCrop || !imgRef.current || !canvasRef.current) return;

    const image = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // 원본 크롭 크기
    let outputWidth = completedCrop.width * scaleX;
    let outputHeight = completedCrop.height * scaleY;

    // 최대 크기 제한 (비율 유지하며 축소)
    if (outputWidth > MAX_POPUP_WIDTH || outputHeight > MAX_POPUP_HEIGHT) {
      const widthRatio = MAX_POPUP_WIDTH / outputWidth;
      const heightRatio = MAX_POPUP_HEIGHT / outputHeight;
      const ratio = Math.min(widthRatio, heightRatio);
      
      outputWidth = Math.floor(outputWidth * ratio);
      outputHeight = Math.floor(outputHeight * ratio);
    }

    canvas.width = outputWidth;
    canvas.height = outputHeight;

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      outputWidth,
      outputHeight
    );
  }, [completedCrop]);

  /** 캔버스 → Blob */
  const getCroppedBlob = (): Promise<Blob> =>
    new Promise((resolve, reject) => {
      if (!canvasRef.current) return reject(new Error('no canvas'));
      canvasRef.current.toBlob((b) => {
        if (!b) return reject(new Error('toBlob failed'));
        resolve(b);
      }, 'image/jpeg', 0.95);
    });

  /** 업로드 */
  const handleUpload = useCallback(async () => {
    if (!completedCrop || !userId || !selectedFile) {
      alert('이미지를 선택하고 영역을 조정해주세요.');
      return;
    }

    try {
      setUploading(true);

      const blob = await getCroppedBlob();
      const bucket = process.env.NEXT_PUBLIC_S3_BUCKET_NAME!;
      const fileExtension = selectedFile.name.split('.').pop() || 'jpg';
      const fileKey = `popups/${uuidv4()}.${fileExtension}`;
      
      console.log('📤 팝업 업로드 시작:', { bucket, fileKey });
      
      // 1. Presigned URL 생성 (업로드용)
      const uploadUrl = await generateUploadUrl(bucket, fileKey);
      console.log('🔗 업로드 URL 생성:', uploadUrl);

      // 2. S3에 업로드
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': blob.type },
        body: blob,
      });

      if (!response.ok) {
        console.error('S3 업로드 실패:', response.status, response.statusText);
        throw new Error('S3 업로드 실패');
      }

      console.log('✅ S3 업로드 완료');

      // 3. DB에 파일 메타데이터 저장
      const { data, error } = await supabase
        .from('POPUP')
        .insert([
          {
            file_key: fileKey,
            bucket: bucket,
            size_bytes: blob.size,
            mime_type: blob.type,
            order_index: popupList.length + 1,
            is_active: true,
            user_id: userId,
          },
        ])
        .select();

      if (error) {
        console.error('DB 저장 실패:', error);
        throw error;
      }

      console.log('💾 DB 저장 완료:', data);

      // 4. 새로 추가된 팝업에 Presigned URL 생성
      if (data && data.length > 0) {
        const newPopup = data[0];
        const downloadUrl = await generateDownloadUrl(bucket, fileKey);
        
        setPopupList((prev) => [...prev, {
          ...newPopup,
          image_url: downloadUrl
        }]);
      }

      alert('✅ 팝업이 성공적으로 등록되었습니다!');
      setSelectedFile(null);
      setPreviewUrl(null);
      setCompletedCrop(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error('업로드 오류:', err);
      alert('업로드 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setUploading(false);
    }
  }, [completedCrop, userId, selectedFile, popupList]);

  /** 순서 변경 */
  const handleMove = async (from: number, to: number) => {
    const updated = [...popupList];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);

    const updates = updated.map((p, idx) => ({
      id: p.id,
      order_index: idx + 1,
    }));

    try {
      await Promise.all(
        updates.map((u) =>
          supabase.from('POPUP').update({ order_index: u.order_index }).eq('id', u.id)
        )
      );
      setPopupList(updated);
    } catch (err) {
      console.error('순서 변경 오류:', err);
      alert('순서 변경 중 오류가 발생했습니다.');
    }
  };

  /** 활성화/비활성화 토글 */
  const handleToggleActive = async (popupId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('POPUP')
        .update({ is_active: !currentStatus })
        .eq('id', popupId);

      if (error) throw error;

      setPopupList((prev) =>
        prev.map((p) => (p.id === popupId ? { ...p, is_active: !currentStatus } : p))
      );
    } catch (err) {
      console.error('상태 변경 오류:', err);
      alert('상태 변경 중 오류가 발생했습니다.');
    }
  };

  /** 팝업 삭제 */
  const handleDelete = async (popupId: string) => {
    if (!confirm('이 팝업을 삭제하시겠습니까?')) return;

    try {
      const { error } = await supabase.from('POPUP').delete().eq('id', popupId);
      if (error) throw error;

      setPopupList((prev) => prev.filter((p) => p.id !== popupId));
      alert('팝업이 삭제되었습니다.');
    } catch (err) {
      console.error('삭제 오류:', err);
      alert('팝업 삭제 중 오류가 발생했습니다.');
    }
  };

  /** 이미지 선택 취소 */
  const handleCancelSelect = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setCompletedCrop(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">팝업 관리</h1>
          <p className="text-gray-600">메인 페이지에 표시될 팝업을 등록하고 관리하세요</p>
          <p className="text-sm text-purple-600 mt-1">📐 크기 자유 (최대: 800 x 1000px)</p>
        </div>

        {/* 업로드 섹션 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <span className="text-2xl">🪟</span>
            새 팝업 업로드
          </h2>

          {!previewUrl ? (
            /* 파일 선택 영역 */
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-purple-400 hover:bg-purple-50/50 transition-all cursor-pointer">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleSelect}
                className="hidden"
                id="popup-upload"
              />
              <label htmlFor="popup-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-700 mb-1">이미지를 선택해주세요</p>
                    <p className="text-sm text-gray-500">크기 자유 (최대 800x1000) | JPG, PNG 형식</p>
                  </div>
                  <span className="px-6 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors">
                    파일 선택
                  </span>
                </div>
              </label>
            </div>
          ) : (
            /* 크롭 영역 */
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-700">
                    ✂️ 원하는 영역을 자유롭게 선택하세요
                  </p>
                  <button
                    onClick={handleCancelSelect}
                    className="text-sm text-gray-600 hover:text-gray-900 underline"
                  >
                    다시 선택
                  </button>
                </div>
                <div className="flex justify-center">
                  <ReactCrop
                    crop={crop}
                    onChange={(pixelCrop: PixelCrop, percentCrop: PercentCrop) => setCrop(percentCrop)}
                    onComplete={(pixelCrop: PixelCrop) => setCompletedCrop(pixelCrop)}
                    keepSelection
                  >
                    <img
                      ref={imgRef}
                      src={previewUrl}
                      alt="preview"
                      className="max-w-full rounded-lg"
                    />
                  </ReactCrop>
                </div>
              </div>

              <canvas ref={canvasRef} className="hidden" />

              <div className="flex gap-3">
                <button
                  onClick={handleUpload}
                  disabled={uploading || !completedCrop}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md disabled:shadow-none"
                >
                  {uploading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      업로드 중...
                    </span>
                  ) : (
                    '팝업 등록하기'
                  )}
                </button>
                <button
                  onClick={handleCancelSelect}
                  disabled={uploading}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 팝업 목록 */}
        {popupList.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <span className="text-2xl">📋</span>
                등록된 팝업
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({popupList.filter(p => p.is_active).length}/{popupList.length}개 활성화)
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popupList.map((popup, i) => (
                <div
                  key={popup.id}
                  className={`group relative bg-gray-50 rounded-xl overflow-hidden border-2 transition-all ${
                    popup.is_active
                      ? 'border-green-300 hover:border-green-400 hover:shadow-lg'
                      : 'border-gray-200 opacity-60 hover:opacity-80'
                  }`}
                >
                  {/* 순서 뱃지 */}
                  <div className="absolute top-3 left-3 z-10 px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full shadow-md">
                    #{i + 1}
                  </div>

                  {/* 상태 뱃지 */}
                  <div className={`absolute top-3 right-3 z-10 px-3 py-1 text-xs font-bold rounded-full shadow-md ${
                    popup.is_active
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-400 text-white'
                  }`}>
                    {popup.is_active ? '✓ 활성' : '✕ 비활성'}
                  </div>

                  {/* 이미지 */}
                  <div className="bg-gray-200 flex items-center justify-center min-h-[200px] max-h-[400px]">
                    <img
                      src={popup.image_url || ''}
                      alt={`popup-${i}`}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        console.error('팝업 이미지 로드 실패:', popup.image_url);
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" fill="%23999"%3EError%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </div>

                  {/* 컨트롤 */}
                  <div className="p-4 bg-white space-y-3">
                    {/* 순서 변경 */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleMove(i, i - 1)}
                        disabled={i === 0}
                        className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        ← 앞으로
                      </button>
                      <button
                        onClick={() => handleMove(i, i + 1)}
                        disabled={i === popupList.length - 1}
                        className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        뒤로 →
                      </button>
                    </div>

                    {/* 활성화/삭제 */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleActive(popup.id, popup.is_active)}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          popup.is_active
                            ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                        }`}
                      >
                        {popup.is_active ? '⏸️ 비활성화' : '▶️ 활성화'}
                      </button>
                      <button
                        onClick={() => handleDelete(popup.id)}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 빈 상태 */}
        {popupList.length === 0 && !previewUrl && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">🪟</div>
            <p className="text-lg font-medium text-gray-700 mb-2">등록된 팝업이 없습니다</p>
            <p className="text-sm text-gray-500">위에서 첫 팝업을 등록해보세요!</p>
          </div>
        )}
      </div>
    </div>
  );
}