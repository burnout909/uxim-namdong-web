import {
  FaPhoneAlt,
  FaClipboardList,
  FaProjectDiagram,
  FaUserFriends,
  FaUserCheck,
  FaArrowRight,
  FaChevronRight,
} from "react-icons/fa";
import Link from "next/link";
import { ROUTE } from "@/constants/route";
import QuickLinkCard from "@/components/home/QuickLinkCard";
import NoticeItem from "@/components/home/NoticeItem";
import { createClient } from "@/lib/supabase";
import Banner from "@/components/Banner";
import Popup from "@/components/Popup";

const QUICK_LINKS = [
  { label: "기관소개", to: ROUTE.about.greeting },
  { label: "일자리 사업소개", to: ROUTE.projects.publicService },
  { label: "나에게 맞는 일자리", to: ROUTE.projects.employment },
  { label: "생산품", to: ROUTE.notice.products },
];

const PARTICIPATION_STEPS = [
  {
    label: "전화 및 내방",
    desc: "032-267-6080",
    icon: <FaPhoneAlt className="text-[#6B917A] text-lg md:text-xl" />,
  },
  {
    label: "상담 및 등록",
    desc: "방문 상담 진행",
    icon: <FaClipboardList className="text-[#6B917A] text-lg md:text-xl" />,
  },
  {
    label: "알선",
    desc: "적합 일자리 매칭",
    icon: <FaProjectDiagram className="text-[#6B917A] text-lg md:text-xl" />,
  },
  {
    label: "채용",
    desc: "근로계약 체결",
    icon: <FaUserFriends className="text-[#6B917A] text-lg md:text-xl" />,
  },
  {
    label: "사후관리",
    desc: "근무 현장 점검",
    icon: <FaUserCheck className="text-[#6B917A] text-lg md:text-xl" />,
  },
];

async function getLatestNotices() {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from("POST")
      .select("id, title, created_at")
      .eq("type", "NOTICE")
      .order("created_at", { ascending: false })
      .limit(5);
    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

async function getLatestJobs() {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from("POST")
      .select("id, title, created_at")
      .eq("type", "JOB")
      .order("created_at", { ascending: false })
      .limit(5);
    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr)
    .toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\./g, ".")
    .replace(/\s/g, "");
}

export default async function Home() {
  const [notices, jobs] = await Promise.all([
    getLatestNotices(),
    getLatestJobs(),
  ]);

  return (
    <div className="w-full">
      <Popup />

      {/* 배너 */}
      <Banner />

      {/* 주요 바로가기 */}
      <section className="bg-white py-5 md:py-6 px-4 md:px-8 lg:px-12">
        <div className="w-full max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {QUICK_LINKS.map(({ label, to }) => (
            <QuickLinkCard key={label} label={label} to={to} />
          ))}
        </div>
      </section>

      {/* 공지사항 + 일자리 소식 - 퀵링크와 같은 넓은 폭 */}
      <section className="w-full max-w-6xl mx-auto py-14 grid md:grid-cols-2 gap-6 px-4">
        {/* 공지사항 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-5 pb-3 border-b-2 border-[#6B917A]">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-[#6B917A] rounded-sm"></span>
              공지사항
            </h2>
            <Link
              href={ROUTE.notice.announcement}
              className="text-sm text-gray-400 hover:text-[#6B917A] transition-colors flex items-center gap-1"
            >
              더보기 <FaArrowRight className="text-xs" />
            </Link>
          </div>
          <ul className="text-sm">
            {notices.length === 0
              ? Array.from({ length: 5 }).map((_, i) => (
                  <NoticeItem
                    key={i}
                    title={`2024년도 남동시니어클럽 제${i + 1}차 운영위원회...`}
                    date={"2025.XX.XX"}
                  />
                ))
              : notices.map((notice) => (
                  <Link
                    key={notice.id}
                    href={`/notice/announcement/${notice.id}`}
                    className="block"
                  >
                    <NoticeItem
                      title={notice.title}
                      date={formatDate(notice.created_at)}
                    />
                  </Link>
                ))}
          </ul>
        </div>

        {/* 일자리 소식 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-5 pb-3 border-b-2 border-[#8AAD72]">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-[#8AAD72] rounded-sm"></span>
              일자리 소식
            </h2>
            <Link
              href={ROUTE.notice.jobInfo}
              className="text-sm text-gray-400 hover:text-[#8AAD72] transition-colors flex items-center gap-1"
            >
              더보기 <FaArrowRight className="text-xs" />
            </Link>
          </div>
          <ul className="text-sm">
            {jobs.length === 0
              ? Array.from({ length: 5 }).map((_, i) => (
                  <NoticeItem
                    key={i}
                    title={`2024년도 남동시니어클럽 제${i + 1}차 운영위원회...`}
                    date={"2025.XX.XX"}
                  />
                ))
              : jobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/notice/job-info/${job.id}`}
                    className="block"
                  >
                    <NoticeItem
                      title={job.title}
                      date={formatDate(job.created_at)}
                    />
                  </Link>
                ))}
          </ul>
        </div>
      </section>

      {/* 일자리 참여방법 */}
      <section className="bg-white py-16 md:py-20 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-[#6B917A] text-sm font-semibold mb-2">HOW TO PARTICIPATE</p>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              일자리 참여방법
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-0">
            {PARTICIPATION_STEPS.map(({ label, desc, icon }, idx) => (
              <div key={label} className="flex items-center">
                <div className="flex flex-col items-center flex-1">
                  {/* 스텝 번호 */}
                  <span className="text-xs font-bold text-[#6B917A] mb-2">
                    STEP 0{idx + 1}
                  </span>
                  {/* 아이콘 박스 */}
                  <div className="w-[72px] h-[72px] md:w-[88px] md:h-[88px] bg-[#F2F5F8] border-2 border-[#D8E1EC] rounded-2xl flex items-center justify-center mb-3">
                    {icon}
                  </div>
                  {/* 라벨 */}
                  <p className="text-[15px] font-bold text-gray-900">{label}</p>
                  <p className="text-xs text-gray-400 mt-1">{desc}</p>
                </div>
                {/* 화살표 (마지막 제외, 데스크톱만) */}
                {idx < PARTICIPATION_STEPS.length - 1 && (
                  <div className="hidden md:flex items-center text-gray-300 mx-1">
                    <FaChevronRight className="text-sm" />
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
