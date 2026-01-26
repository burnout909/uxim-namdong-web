// app/projects/public-service/page.tsx
'use client';

import { useRouter } from "next/navigation";
import Title from "@/components/Title";
import ProjectTab from "@/components/ProjectTab";
import { ROUTE } from "@/constants/route";

const tabList = [
  { name: "경로당급식지원", path: ROUTE.projects.publicDetail.seniorMeal },
  {
    name: "경로당시설안전관리요원",
    path: ROUTE.projects.publicDetail.facilitySafety,
  },
  { name: "노인시설지킴이", path: ROUTE.projects.publicDetail.elderGuard },
  { name: "동네쉼터관리사", path: ROUTE.projects.publicDetail.shelterManager },
  { name: "스쿨존안전지킴이", path: ROUTE.projects.publicDetail.schoolZone },
  {
    name: "시니어폐의약품수거",
    path: ROUTE.projects.publicDetail.drugCollector,
  },
  { name: "우리동네안전지킴이", path: ROUTE.projects.publicDetail.localGuard },
  { name: "은빛정원선생님", path: ROUTE.projects.publicDetail.gardenTeacher },
];

export default function PublicService() {
  const router = useRouter();

  const handleTabClick = (tabName: string) => {
    const target = tabList.find((tab) => tab.name === tabName);
    if (target) {
      router.push(target.path);
    }
  };

  return (
    <div className="px-6 md:px-10 py-10 max-w-screen-lg mx-auto text-gray-800">
      <Title text="노인공익활동사업" />

      {/* 탭 버튼 */}
      <div className="mt-10">
        <ProjectTab
          tabs={tabList.map((t) => t.name)}
          activeTab={""} // activeTab은 더 이상 필요 X
          onTabClick={handleTabClick}
        />
      </div>

      {/* 공익활동 소개 */}
      <div className="mt-14">
        <h2 className="text-blue-700 text-xl md:text-2xl font-bold mb-4">
          공익활동사업이란?
        </h2>
        <div className="space-y-3 pl-2 text-[16px] md:text-[17px] leading-relaxed">
          <p>
            <strong className="font-semibold">사업의 정의</strong>: 노인이
            자기만족과 성취감 향상 및 지역사회 공익 증진을 위해 참여하는
            봉사활동입니다.
          </p>
          <p>
            <strong className="font-semibold">사업기간</strong>: 2025년 1월 ~
            11월 (총 11개월)
          </p>
          <p>
            <strong className="font-semibold">참여대상</strong>: 인천시 남동구
            거주 만 65세 이상의 기초연금 수급자
          </p>
          <p>
            <strong className="font-semibold">활동횟수 / 활동비</strong>: 월
            최대 10회 (1회 3시간) / 최대 월 29만 원
          </p>
        </div>
      </div>

      {/* 구분선 */}
      <div className="border-t border-gray-300 my-10" />

      {/* 신청 안내 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg md:text-xl font-bold text-blue-800 mb-4">
          신청 안내
        </h2>
        <ul className="space-y-2 text-[15px] md:text-[16px] leading-relaxed">
          <li>
            ● <strong>구비서류</strong>: 주민등록등본 1통, 사진 2매, 신청서 1부,
            개인정보동의서
          </li>
          <li>
            ● <strong>신청방법</strong>: 방문 접수 (개별 면담 진행)
          </li>
          <li>
            ● <strong>제외대상</strong>:
            <ul className="ml-4 list-disc list-inside">
              <li>국민기초생활보장법에 의한 생계급여 수급권자</li>
              <li>타 정부부처 일자리 사업 참여자</li>
              <li>건강보험 직장가입자</li>
              <li>장기요양등급 판정자</li>
            </ul>
          </li>
        </ul>
        <p className="text-[14px] mt-4 text-blue-600">
          ※ 진행되는 사업은{" "}
          <strong className="text-red-500">2024년 확정 내시</strong>에 따라
          달라질 수 있습니다.
        </p>
      </div>
    </div>
  );
}