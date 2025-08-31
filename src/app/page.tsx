// app/(content)/home/page.tsx
'use client';

import HeroImage from "@/assets/images/main2.png"
import {
  FaPhoneAlt,
  FaClipboardList,
  FaProjectDiagram,
  FaUserFriends,
  FaUserCheck,
  FaArrowRight,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import { ROUTE } from "@/constants/route";
import QuickLinkCard from "@/components/home/QuickLinkCard";
import NoticeItem from "@/components/home/NoticeItem";
import Image from "next/image"

const QUICK_LINKS = [
  { label: "기관소개", to: ROUTE.about.greeting },
  { label: "일자리 사업소개", to: ROUTE.projects.publicService },
  { label: "나에게 맞는 일자리", to: ROUTE.projects.employment },
  { label: "생산품", to: ROUTE.notice.products },
];

const PARTICIPATION_STEPS = [
  {
    label: "전화 및 내방",
    icon: <FaPhoneAlt className="text-teal-500 text-3xl" />,
  },
  {
    label: "상담 및 등록",
    icon: <FaClipboardList className="text-green-600 text-3xl" />,
  },
  {
    label: "알선",
    icon: <FaProjectDiagram className="text-blue-500 text-3xl" />,
  },
  {
    label: "채용",
    icon: <FaUserFriends className="text-indigo-500 text-3xl" />,
  },
  {
    label: "사후관리",
    icon: <FaUserCheck className="text-gray-700 text-3xl" />,
  },
];

export default function Home() {
  const router = useRouter();

  return (
    <div className="w-full">
      {/* Hero 영역 */}
      <section className="relative w-full h-[400px] bg-gray-100 flex items-center justify-center overflow-hidden">
        <Image
          src={HeroImage}
          alt="메인이미지"
          className="object-cover object-center"
          priority
          fill
        />
      </section>

      {/* 주요 바로가기 */}
      <section className="bg-blue-500 text-white py-7">
        <div className="w-full max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {QUICK_LINKS.map(({ label, to }) => (
            <QuickLinkCard key={label} label={label} to={to} />
          ))}
        </div>
      </section>

      {/* 공지사항 + 일자리 소식 */}
      <section className="w-full max-w-6xl mx-auto py-12 grid md:grid-cols-2 gap-12">
        {/* 공지사항 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold !text-gray-900">
              공지사항{" "}
              <span className="!text-gray-600 text-lg ml-2">Notice</span>
            </h2>
            <button
              onClick={() => router.push(ROUTE.notice.announcement)}
              className="!text-gray-800 text-xl hover:!text-blue-500 transition-colors"
            >
              ＋
            </button>
          </div>
          <ul className="space-y-2 text-sm !text-gray-500">
            {Array.from({ length: 5 }).map((_, i) => (
              <NoticeItem
                key={i}
                title={`2024년도 서울남동시니어클럽 제${i + 1}차 운영위원회...`}
                date={"2025.XX.XX"}
              />
            ))}
          </ul>
        </div>

        {/* 일자리 소식 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold !text-gray-900">
              일자리 소식{" "}
              <span className="!text-gray-600 text-lg ml-2">Job Info</span>
            </h2>
            <button 
              onClick={() => router.push(ROUTE.notice.jobInfo)}
              className="!text-gray-800 text-xl hover:!text-blue-500 transition-colors"
            >
              ＋
            </button>
          </div>
          <ul className="space-y-2 text-sm !text-gray-800">
            {Array.from({ length: 5 }).map((_, i) => (
              <NoticeItem
                key={i}
                title={`2024년도 서울남동시니어클럽 제${i + 1}차 운영위원회...`}
                date={"2025.XX.XX"}
              />
            ))}
          </ul>
        </div>
      </section>

      {/* 일자리 참여방법 */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-2xl font-bold mb-10 !text-gray-900">일자리참여방법</p>

          <div className="flex flex-wrap justify-center items-center mt-10 gap-10">
            {PARTICIPATION_STEPS.map(({ label, icon }, i) => (
              <div key={label} className="flex items-center gap-6">
                {/* 아이콘 카드 */}
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-md bg-white shadow-md border border-gray-200 flex items-center justify-center">
                    {icon}
                  </div>
                  <p className="text-sm !text-gray-800 mt-2 font-medium">{label}</p>
                </div>

                {/* 화살표 */}
                {i < PARTICIPATION_STEPS.length - 1 && (
                  <div className="h-20 flex items-center">
                    <FaArrowRight className="text-gray-500 text-2xl relative -top-[10px]" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}