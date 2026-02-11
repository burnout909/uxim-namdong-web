'use client';
import { useRouter } from "next/navigation";
import { ROUTE } from "@/constants/route";
import LogoImage from "@/assets/images/logo.png"
import Image from "next/image"
import { useState } from "react";

type HeaderLabel = "기관소개" | "사업소개" | "소통공간" | "자료실";

interface SubMenuItem {
  label: string;
  path: string;
}

const HEADER_MENUS: Record<HeaderLabel, { defaultPath: string; subMenus: SubMenuItem[] }> = {
  기관소개: {
    defaultPath: ROUTE.about.greeting,
    subMenus: [
      { label: "인사말", path: ROUTE.about.greeting },
      { label: "센터소개", path: ROUTE.about.introduction },
      { label: "미션", path: ROUTE.about.mission },
      { label: "연혁", path: ROUTE.about.history },
      { label: "법인소개", path: ROUTE.about.legal },
      { label: "조직도", path: ROUTE.about.org },
      { label: "오시는 길", path: ROUTE.about.location },
    ],
  },
  사업소개: {
    defaultPath: ROUTE.projects.publicService,
    subMenus: [
      { label: "노인공익활동사업", path: ROUTE.projects.publicService },
      { label: "노인역량활동사업", path: ROUTE.projects.capacity },
      { label: "공동체사업단", path: ROUTE.projects.community },
      { label: "취업지원", path: ROUTE.projects.employment },
    ],
  },
  소통공간: {
    defaultPath: ROUTE.notice.announcement,
    subMenus: [
      { label: "공지사항", path: ROUTE.notice.announcement },
      { label: "채용정보", path: ROUTE.notice.jobInfo },
      { label: "생산품 소개", path: ROUTE.notice.products },
      { label: "자유게시판", path: ROUTE.notice.free },
      { label: "직원공간", path: ROUTE.notice.staff },
    ],
  },
  자료실: {
    defaultPath: ROUTE.resources.photos,
    subMenus: [
      { label: "사진자료", path: ROUTE.resources.photos },
      { label: "영상자료", path: ROUTE.resources.videos },
      { label: "관련 사이트", path: ROUTE.resources.links },
    ],
  },
};

const HEADER_LABELS: HeaderLabel[] = ["기관소개", "사업소개", "소통공간", "자료실"];

export default function Header() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState<HeaderLabel | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileAccordion, setMobileAccordion] = useState<HeaderLabel | null>(null);

  return (
    <header className="w-full bg-white">
      {/* 모바일 헤더 (md 미만) */}
      <div className="flex items-center justify-between px-[20px] py-4 md:hidden">
        <button className="cursor-pointer" onClick={() => router.push(ROUTE.home)}>
          <Image src={LogoImage} width={180} height={38} alt="logo" />
        </button>
        <button
          className="cursor-pointer p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="메뉴 열기/닫기"
        >
          {mobileOpen ? (
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {/* 모바일 메뉴 (슬라이드 다운) */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-gray-200 bg-white">
          {HEADER_LABELS.map((label) => (
            <div key={label} className="border-b border-gray-100">
              <button
                className="w-full flex items-center justify-between px-[20px] py-4 text-base text-slate-700 font-medium cursor-pointer"
                onClick={() =>
                  setMobileAccordion(mobileAccordion === label ? null : label)
                }
              >
                {label}
                <svg
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`transition-transform duration-200 ${mobileAccordion === label ? 'rotate-180' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {mobileAccordion === label && (
                <div className="bg-gray-50">
                  {HEADER_MENUS[label].subMenus.map((subItem) => (
                    <button
                      key={subItem.path}
                      className="w-full text-left px-[36px] py-3 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                      onClick={() => {
                        router.push(subItem.path);
                        setMobileOpen(false);
                        setMobileAccordion(null);
                      }}
                    >
                      {subItem.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      )}

      {/* 데스크톱 헤더 (md 이상) */}
      <div className="hidden md:block">
        <button className="ml-20 cursor-pointer py-5" onClick={() => router.push(ROUTE.home)}>
          <Image src={LogoImage} width={224} height={48} alt="logo" />
        </button>
        <nav className="ml-5 h-[64px] border-t border-b border-[#D8D8D8] flex flex-row items-center px-[50px]">
          {HEADER_LABELS.map((label) => (
            <div
              key={label}
              className="relative h-full flex items-center"
              onMouseEnter={() => setActiveMenu(label)}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <button
                className="h-full flex gap-2 items-center cursor-pointer px-4 text-center text-lg text-slate-600 hover:bg-slate-100 active:bg-slate-100 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                onClick={() => router.push(HEADER_MENUS[label].defaultPath)}
              >
                {label}
                <svg
                  width={20}
                  height={20}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`inline-block ml-1 text-gray-500 transition-transform duration-200 ${activeMenu === label ? 'rotate-180' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* 드롭다운 메뉴 */}
              {activeMenu === label && (
                <div className="absolute top-full left-0 bg-white border border-gray-200 shadow-lg rounded-b-lg min-w-[160px] z-50">
                  {HEADER_MENUS[label].subMenus.map((subItem) => (
                    <button
                      key={subItem.path}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors first:rounded-t-lg last:rounded-b-lg"
                      onClick={() => {
                        router.push(subItem.path);
                        setActiveMenu(null);
                      }}
                    >
                      {subItem.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </header>
  );
}
