'use client';

import Link from "next/link";
import ArrowLeftIcon from "@/assets/icons/arrow-left.svg";
import ArrowRightIcon from "@/assets/icons/arrow-right.svg";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    basePath: string; // ex) "/notice/announcement"
}

export default function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
    if (totalPages <= 1) return null;

    return (
        <div className="mt-8 flex justify-center">
            <nav className="flex space-x-1 items-center">
                {/* 이전 페이지 */}
                {currentPage > 1 && (
                    <Link
                        href={`${basePath}?page=${currentPage - 1}`}
                        className="py-2.5 text-gray-500 hover:text-gray-700 flex pl-2 pr-1 items-center"
                    >
                        <ArrowLeftIcon width={20} height={20} className="text-gray-500" />
                        <span className="text-body-medium">이전</span>
                    </Link>
                )}

                {/* 페이지 번호 */}
                {Array.from({ length: Math.min(9, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    const isCurrent = pageNum === currentPage;
                    return (
                        <Link
                            key={pageNum}
                            href={`${basePath}?page=${pageNum}`}
                            className={`w-[40px] h-[40px] text-body-medium flex items-center justify-center rounded ${isCurrent
                                ? "bg-blue-500 text-white"
                                : "text-gray-700 hover:bg-gray-100"
                                }`}
                        >
                            {pageNum}
                        </Link>
                    );
                })}

                {/* 다음 페이지 */}
                {currentPage < totalPages && (
                    <Link
                        href={`${basePath}?page=${currentPage + 1}`}
                        className="py-2.5 text-gray-500 hover:text-gray-700 flex pl-2 pr-1 items-center"
                    >
                        <span className="text-body-medium">다음</span>
                        <ArrowRightIcon width={20} height={20} className="text-gray-500" />
                    </Link>
                )}
            </nav>
        </div>
    );
}
