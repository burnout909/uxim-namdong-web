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
    <div className="w-full bg-white border border-gray-200 rounded-md overflow-hidden">
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
  );
}
