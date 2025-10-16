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

// 배너 타입 정의
interface Banner {
  id: string;
  file_key: string;
  bucket: string;
  size_bytes: number;
  mime_type: string;
  order_index: number;
  user_id: string;
  created_at: string;
  updated_at: string;
  image_url?: string; // 프론트엔드에서 동적 생성
}

// 배너 권장 크기
const BANNER_WIDTH = 1024;
const BANNER_HEIGHT = 320;
const BANNER_RATIO = BANNER_WIDTH / BANNER_HEIGHT; // 3.2:1

export default function BannerPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [crop, setCrop] = useState<PercentCrop>({
    unit: '%',
    x: 10,
    y: 10,
    width: 80,
    height: 25,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);

  const [uploading, setUploading] = useState(false);
  const [bannerList, setBannerList] = useState<Banner[]>([]);

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

  // 배너 목록 불러오기 + Presigned URL 생성
  useEffect(() => {
    const fetchBanners = async () => {
      const { data, error } = await supabase
        .from('BANNER')
        .select('*')
        .order('order_index', { ascending: true });
      
      if (error) {
        console.error('배너 로드 에러:', error);
        return;
      }

      if (data) {
        console.log('🎨 배너 데이터:', data);
        
        // 각 배너에 대해 Presigned URL 생성
        const bannersWithUrls = await Promise.all(
          data.map(async (banner) => {
            try {
              const downloadUrl = await generateDownloadUrl(banner.bucket, banner.file_key);
              return {
                ...banner,
                image_url: downloadUrl
              };
            } catch (err) {
              console.error('Presigned URL 생성 실패:', banner.file_key, err);
              return {
                ...banner,
                image_url: ''
              };
            }
          })
        );
        
        setBannerList(bannersWithUrls);
      }
    };
    
    fetchBanners();
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

  /** 크롭 완료 시 캔버스에 그려두기 (1024x320 고정) */
  useEffect(() => {
    if (!completedCrop || !imgRef.current || !canvasRef.current) return;

    const image = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // 고정 크기로 캔버스 설정
    canvas.width = BANNER_WIDTH;
    canvas.height = BANNER_HEIGHT;

    // 고해상도로 리사이징
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      BANNER_WIDTH,
      BANNER_HEIGHT
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
      const fileKey = `banners/${uuidv4()}.${fileExtension}`;
      
      console.log('📤 업로드 시작:', { bucket, fileKey });
      
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
        .from('BANNER')
        .insert([
          {
            file_key: fileKey,
            bucket: bucket,
            size_bytes: blob.size,
            mime_type: blob.type,
            order_index: bannerList.length + 1,
            user_id: userId,
          },
        ])
        .select();

      if (error) {
        console.error('DB 저장 실패:', error);
        throw error;
      }

      console.log('💾 DB 저장 완료:', data);

      // 4. 새로 추가된 배너에 Presigned URL 생성
      if (data && data.length > 0) {
        const newBanner = data[0];
        const downloadUrl = await generateDownloadUrl(bucket, fileKey);
        
        setBannerList((prev) => [...prev, {
          ...newBanner,
          image_url: downloadUrl
        }]);
      }

      alert('✅ 배너가 성공적으로 등록되었습니다!');
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
  }, [completedCrop, userId, selectedFile, bannerList]);

  /** 순서 변경 */
  const handleMove = async (from: number, to: number) => {
    const updated = [...bannerList];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);

    const updates = updated.map((b, idx) => ({
      id: b.id,
      order_index: idx + 1,
    }));

    try {
      await Promise.all(
        updates.map((u) =>
          supabase.from('BANNER').update({ order_index: u.order_index }).eq('id', u.id)
        )
      );
      setBannerList(updated);
    } catch (err) {
      console.error('순서 변경 오류:', err);
      alert('순서 변경 중 오류가 발생했습니다.');
    }
  };

  /** 배너 삭제 */
  const handleDelete = async (bannerId: string) => {
    if (!confirm('이 배너를 삭제하시겠습니까?')) return;

    try {
      const { error } = await supabase.from('BANNER').delete().eq('id', bannerId);
      if (error) throw error;

      setBannerList((prev) => prev.filter((b) => b.id !== bannerId));
      alert('배너가 삭제되었습니다.');
    } catch (err) {
      console.error('삭제 오류:', err);
      alert('배너 삭제 중 오류가 발생했습니다.');
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">배너 관리</h1>
          <p className="text-gray-600">메인 페이지에 표시될 배너를 등록하고 관리하세요</p>
          <p className="text-sm text-blue-600 mt-1">최종 크기: 3.2:1 비율</p>
        </div>

        {/* 업로드 섹션 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <span className="text-2xl">📤</span>
            새 배너 업로드
          </h2>

          {!previewUrl ? (
            /* 파일 선택 영역 */
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleSelect}
                className="hidden"
                id="banner-upload"
              />
              <label htmlFor="banner-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-700 mb-1">이미지를 선택해주세요</p>
                    <p className="text-sm text-gray-500">최종 크기: 3.2:1 비율 | JPG, PNG 형식</p>
                  </div>
                  <span className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
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
                    🎯 배너 영역을 조정하세요
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
                    aspect={BANNER_RATIO}
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
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md disabled:shadow-none"
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
                    '배너 등록하기'
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

        {/* 배너 목록 */}
        {bannerList.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <span className="text-2xl">🖼️</span>
                등록된 배너
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({bannerList.length}개)
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bannerList.map((banner, i) => (
                <div
                  key={banner.id}
                  className="group relative bg-gray-50 rounded-xl overflow-hidden border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all"
                >
                  {/* 순서 뱃지 */}
                  <div className="absolute top-3 left-3 z-10 px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full shadow-md">
                    #{i + 1}
                  </div>

                  {/* 이미지 (1024x320 비율) */}
                  <div className="aspect-[3.2/1] bg-gray-200">
                    <img
                      src={banner.image_url || ''}
                      alt={`banner-${i}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('이미지 로드 실패:', banner.image_url);
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" fill="%23999"%3EError%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </div>

                  {/* 컨트롤 */}
                  <div className="p-4 flex items-center justify-between gap-2 bg-white">
                    {/* 순서 변경 */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleMove(i, i - 1)}
                        disabled={i === 0}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="왼쪽으로 이동"
                      >
                        ←
                      </button>
                      <button
                        onClick={() => handleMove(i, i + 1)}
                        disabled={i === bannerList.length - 1}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="오른쪽으로 이동"
                      >
                        →
                      </button>
                    </div>

                    {/* 삭제 버튼 */}
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                    >
                      🗑️ 삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 빈 상태 */}
        {bannerList.length === 0 && !previewUrl && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">🎨</div>
            <p className="text-lg font-medium text-gray-700 mb-2">등록된 배너가 없습니다</p>
            <p className="text-sm text-gray-500">위에서 첫 배너를 등록해보세요!</p>
          </div>
        )}
      </div>
    </div>
  );
}