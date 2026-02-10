'use client';
import { usePathname } from "next/navigation";
import Link from "next/link"

export interface MenuItem {
  label: string;
  path: string;
  matchPaths?: string[];
}

interface LeftNavProps {
  title: string;
  items: MenuItem[];
}

function normalize(p: string) {
  // 끝 슬래시 제거 ("/"만 예외)
  if (!p) return "/";
  const n = p.replace(/\/+$/, "");
  return n === "" ? "/" : n;
}

function isUnder(base: string, target: string) {
  // target이 base와 동일하거나 base 하위 경로인지 체크
  const b = normalize(base);
  const t = normalize(target);
  if (b === "/") return t === "/";
  return t === b || t.startsWith(b + "/");
}

export default function LeftNav({ title, items }: LeftNavProps) {
  const pathname = usePathname();

  return (
    <>
      {/* 모바일: 가로 스크롤 탭 */}
      <div className="md:hidden w-full overflow-x-auto">
        <div className="flex gap-2 px-[20px] py-3">
          {items.map((item) => {
            const activeByMain = isUnder(item.path, pathname);
            const activeByExtra =
              item.matchPaths?.some((p) => isUnder(p, pathname)) ?? false;
            const isActive = activeByMain || activeByExtra;

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`whitespace-nowrap px-4 py-2 rounded-full border text-sm transition-colors ${
                  isActive
                    ? "bg-[#246BEB] text-white border-[#246BEB]"
                    : "bg-white text-gray-700 border-gray-300 hover:border-[#246BEB] hover:text-[#246BEB]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* 데스크톱: 기존 세로 카드 */}
      <div className="hidden md:block w-full bg-white border border-gray-200 rounded-md overflow-hidden">
        {/* Title Header */}
        <div className="py-[42px] bg-[#246BEB] text-white text-center text-heading-medium">
          {title}
        </div>

        {/* Menu Items */}
        <nav className="flex flex-col divide-y divide-gray-200">
          {items.map((item) => {
            const activeByMain = isUnder(item.path, pathname);
            const activeByExtra =
              item.matchPaths?.some((p) => isUnder(p, pathname)) ?? false;
            const isActive = activeByMain || activeByExtra;

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex text-body-large items-center px-[28px] py-[13px] text-black ${isActive ? "font-bold" : "hover:bg-gray-100"
                  }`}
              >
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
