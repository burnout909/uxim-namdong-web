"use client";

import Link from "next/link";
import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import ArrowRightIcon from "@/assets/icons/arrow-right.svg";
import MenuIcon from "@/assets/icons/menu.svg";

interface PostNavigatorProps {
  prev?: { id: string } | null;
  next?: { id: string } | null;
  basePath: string; // e.g. "/notice/announcement"
}

export default function PostNavigator({ prev, next, basePath }: PostNavigatorProps) {
  return (
    <div className="mt-6 flex items-center justify-end gap-2.5">
      {/* 이전글 */}
      <Link
        href={prev ? `${basePath}/${prev.id}` : "#"}
        aria-disabled={!prev}
        className={`py-2.5 flex items-center px-2 rounded-[6px] bg-gray-100 transition-colors ${
          prev ? "text-gray-500 hover:text-gray-700 cursor-pointer" : "text-gray-300 cursor-not-allowed"
        }`}
      >
        <ArrowLeftIcon width={20} height={20} className="text-gray-500" />
        <span className="text-body-medium">이전</span>
      </Link>

      {/* 다음글 */}
      <Link
        href={next ? `${basePath}/${next.id}` : "#"}
        aria-disabled={!next}
        className={`py-2.5 flex items-center px-2 rounded-[6px] bg-gray-100 transition-colors ${
          next ? "text-gray-500 hover:text-gray-700 cursor-pointer" : "text-gray-300 cursor-not-allowed"
        }`}
      >
        <span className="text-body-medium">다음</span>
        <ArrowRightIcon width={20} height={20} className="text-gray-500" />
      </Link>

      {/* 목록 */}
      <Link
        href={basePath}
        className="py-2.5 flex items-center px-2 gap-1 rounded-[6px] bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
      >
        <MenuIcon width={20} height={20} className="text-gray-500" />
        <span className="text-body-medium">목록</span>
      </Link>
    </div>
  );
}
