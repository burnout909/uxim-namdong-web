// app/page.tsx
import {
  FaPhoneAlt,
  FaClipboardList,
  FaProjectDiagram,
  FaUserFriends,
  FaUserCheck,
  FaArrowRight,
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

// Supabase에서 최신 공지사항 조회
async function getLatestNotices() {
  const supabase = await createClient();
  
  try {
    const { data: notices, error } = await supabase
      .from('POST')
      .select('id, title, created_at')
      .eq('type', 'NOTICE')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching notices:', error);
      return [];
    }

    return notices || [];
  } catch (error) {
    console.error('Error fetching notices:', error);
    return [];
  }
}

// 일자리 소식 조회
async function getLatestJobs() {
  const supabase = await createClient();
  
  try {
    const { data: jobs, error } = await supabase
      .from('POST')
      .select('id, title, created_at')
      .eq('type', 'JOB')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching jobs:', error);
      return [];
    }

    return jobs || [];
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }
}

export default async function Home() {
  const [notices, jobs] = await Promise.all([
    getLatestNotices(),
    getLatestJobs()
  ]);

  return (
    <div className="w-full">
      {/* 팝업 */}
      <Popup />

      {/* Hero 영역 - 배너 슬라이더 */}
      <Banner />

      {/* 주요 바로가기 */}
      <section className="bg-blue-500 text-white py-7">
        <div className="w-full max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center px-4">
          {QUICK_LINKS.map(({ label, to }) => (
            <QuickLinkCard key={label} label={label} to={to} />
          ))}
        </div>
      </section>

      {/* 공지사항 + 일자리 소식 */}
      <section className="w-full max-w-6xl mx-auto py-16 grid md:grid-cols-2 gap-8 px-4">
        {/* 공지사항 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-5 pb-4 border-b-2 border-blue-500">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
              공지사항
              <span className="text-gray-400 text-sm font-normal ml-1">Notice</span>
            </h2>
            <Link
              href={ROUTE.notice.announcement}
              className="text-sm text-gray-500 hover:text-blue-500 transition-colors flex items-center gap-1"
            >
              더보기 <FaArrowRight className="text-xs" />
            </Link>
          </div>
          <ul className="text-sm">
            {notices.length === 0 ? (
              Array.from({ length: 5 }).map((_, i) => (
                <NoticeItem
                  key={i}
                  title={`2024년도 서울남동시니어클럽 제${i + 1}차 운영위원회...`}
                  date={"2025.XX.XX"}
                />
              ))
            ) : (
              notices.map((notice) => (
                <Link
                  key={notice.id}
                  href={`/notice/announcement/${notice.id}`}
                  className="block"
                >
                  <NoticeItem
                    title={notice.title}
                    date={new Date(notice.created_at).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                    }).replace(/\./g, '.').replace(/\s/g, '')}
                  />
                </Link>
              ))
            )}
          </ul>
        </div>

        {/* 일자리 소식 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-5 pb-4 border-b-2 border-green-500">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="w-1 h-6 bg-green-500 rounded-full"></span>
              일자리 소식
              <span className="text-gray-400 text-sm font-normal ml-1">Job Info</span>
            </h2>
            <Link
              href={ROUTE.notice.jobInfo}
              className="text-sm text-gray-500 hover:text-green-500 transition-colors flex items-center gap-1"
            >
              더보기 <FaArrowRight className="text-xs" />
            </Link>
          </div>
          <ul className="text-sm">
            {jobs.length === 0 ? (
              Array.from({ length: 5 }).map((_, i) => (
                <NoticeItem
                  key={i}
                  title={`2024년도 서울남동시니어클럽 제${i + 1}차 운영위원회...`}
                  date={"2025.XX.XX"}
                />
              ))
            ) : (
              jobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/notice/job-info/${job.id}`}
                  className="block"
                >
                  <NoticeItem
                    title={job.title}
                    date={new Date(job.created_at).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                    }).replace(/\./g, '.').replace(/\s/g, '')}
                  />
                </Link>
              ))
            )}
          </ul>
        </div>
      </section>

      {/* 일자리 참여방법 */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto text-center px-4">
          <h2 className="text-2xl font-bold mb-10 text-gray-900">일자리참여방법</h2>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-10 mt-10">
            {PARTICIPATION_STEPS.map(({ label, icon }) => (
              <div key={label} className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-md bg-white shadow-md border border-gray-200 flex items-center justify-center transition-transform hover:scale-110">
                  {icon}
                </div>
                <p className="text-sm text-gray-800 mt-2 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}