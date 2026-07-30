"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FaChevronLeft, FaChevronRight, FaPlus } from "react-icons/fa";
import { ROUTE } from "@/constants/route";
import type { PhotoGalleryItem } from "@/services/postService";

type PhotoGalleryProps = {
  items: PhotoGalleryItem[];
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default function PhotoGallery({ items }: PhotoGalleryProps) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [failed, setFailed] = useState<Record<string, boolean>>({});

  const syncArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    // 소수점 오차로 화살표가 계속 켜져 있는 걸 막기 위한 여유값
    const slack = 4;
    setCanScrollLeft(el.scrollLeft > slack);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - slack);
  }, []);

  useEffect(() => {
    syncArrows();
    window.addEventListener("resize", syncArrows);
    return () => window.removeEventListener("resize", syncArrows);
  }, [syncArrows, items.length]);

  const scrollByPage = (direction: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    // 카드 한 장 + gap 만큼 이동
    const card = el.querySelector("li");
    const step = card ? card.clientWidth + 16 : el.clientWidth;
    el.scrollBy({ left: step * direction, behavior: "smooth" });
  };

  if (items.length === 0) return null;

  return (
    <section className="bg-white py-10 md:py-16 border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-4">
        {/* 섹션 헤더 */}
        <div className="flex items-end justify-between gap-4 mb-5 md:mb-7 pb-3 border-b-2 border-[#6B917A]">
          <h2 className="text-base md:text-lg font-bold text-gray-900 flex items-center gap-2 shrink-0">
            <span className="w-1.5 h-4 md:h-5 bg-[#6B917A] rounded-sm" />
            포토갤러리
          </h2>

          <div className="flex items-center gap-2 shrink-0">
            {/* 한 화면에 다 들어오면 화살표는 숨긴다 (계속 비활성으로 떠 있으면 고장난 것처럼 보임) */}
            {(canScrollLeft || canScrollRight) && (
              <>
                <button
                  type="button"
                  onClick={() => scrollByPage(-1)}
                  disabled={!canScrollLeft}
                  aria-label="이전 사진 보기"
                  className="w-8 h-8 rounded-full border border-gray-200 text-gray-500 flex items-center justify-center hover:bg-gray-50 hover:text-[#6B917A] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                >
                  <FaChevronLeft className="text-xs" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollByPage(1)}
                  disabled={!canScrollRight}
                  aria-label="다음 사진 보기"
                  className="w-8 h-8 rounded-full border border-gray-200 text-gray-500 flex items-center justify-center hover:bg-gray-50 hover:text-[#6B917A] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                >
                  <FaChevronRight className="text-xs" />
                </button>
              </>
            )}
            <Link
              href={ROUTE.resources.photos}
              aria-label="사진자료실 전체 보기"
              className="w-8 h-8 rounded-full border border-gray-200 text-gray-500 flex items-center justify-center hover:bg-gray-50 hover:text-[#6B917A] transition-colors"
            >
              <FaPlus className="text-[10px]" />
            </Link>
          </div>
        </div>

        {/* 카드 목록 */}
        <ul
          ref={trackRef}
          onScroll={syncArrows}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item) => (
            <li
              key={item.id}
              className="snap-start shrink-0 w-[calc(100%-1rem)] sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.667rem)]"
            >
              <Link
                href={`${ROUTE.resources.photos}/${item.id}`}
                className="group block h-full bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-[#6B917A] hover:shadow-md transition-all"
              >
                <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                  {failed[item.id] ? (
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">
                      이미지 준비 중
                    </div>
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={`/api/photo-thumb/${item.id}`}
                      alt={item.title ?? "사진자료실 이미지"}
                      loading="lazy"
                      decoding="async"
                      onError={() =>
                        setFailed((prev) => ({ ...prev, [item.id]: true }))
                      }
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                </div>
                <div className="p-4">
                  <p className="text-sm md:text-[15px] font-semibold text-gray-900 line-clamp-2 min-h-[2.75rem] group-hover:text-[#6B917A] transition-colors">
                    {item.title ?? "제목 없음"}
                  </p>
                  <p className="mt-2 text-xs text-gray-400">
                    {formatDate(item.created_at)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
