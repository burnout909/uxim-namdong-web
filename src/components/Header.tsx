'use client';
import { useRouter } from "next/navigation";
import { ROUTE } from "@/constants/route";
import LogoImage from "@/assets/images/logo.png"
import Image from "next/image"
import ArrowDownIcon from "@/assets/icons/arrow-down.svg";

const HEADER_URLS = {
  기관소개: ROUTE.about.greeting,
  사업소개: ROUTE.projects.publicService,
  소통공간: ROUTE.notice.announcement,
  자료실: ROUTE.resources.photos,
};

type HeaderLabel = "기관소개" | "사업소개" | "소통공간" | "자료실";

const HEADERCOMPONENT: HeaderLabel[] = [
  "기관소개",
  "사업소개",
  "소통공간",
  "자료실",
];

export default function Header() {
  const router = useRouter();
  return (
    <header className="w-full bg-white min-w-[1440px] max-w-[1920px] mx-auto">
      <button className="ml-20 cursor-pointer py-5" onClick={() => router.push(ROUTE.home)}>
        <Image src={LogoImage} width={224} height={48} alt="logo" />
      </button>
      <nav className="ml-5 h-[64px] border-t border-b border-[#D8D8D8] flex px-[50px]">
        {HEADERCOMPONENT.map((label) => (
          <button
            key={label}
            className="flex gap-2 items-center cursor-pointer py-6 px-4 text-center text-lg text-slate-600 hover:bg-slate-100 active:bg-slate-100 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none" onClick={() => router.push(HEADER_URLS[label])}>
            {label}
            <ArrowDownIcon width={20} height={20} className="inline-block ml-1 text-gray-500" />
          </button>
        ))}
      </nav>
    </header >
  );
}
