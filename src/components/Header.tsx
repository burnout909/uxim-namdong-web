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
      { label: "공익활동형", path: ROUTE.projects.publicService },
      { label: "사회서비스형", path: ROUTE.projects.capacity },
      { label: "시장형", path: ROUTE.projects.community },
      { label: "취업연계형", path: ROUTE.projects.employment },
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

  return (
    <header className="w-full bg-white min-w-[1440px] max-w-[1920px] mx-auto">
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
    </header>
  );
}
