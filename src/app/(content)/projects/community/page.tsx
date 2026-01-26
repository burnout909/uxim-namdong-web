// app/(content)/projects/community/page.tsx
'use client';

import { useRouter } from "next/navigation";
import Title from "@/components/Title";
import ProjectTab from "@/components/ProjectTab";
import { ROUTE } from "@/constants/route";

const tabList = [
  {
    name: "OK! 6070 아파트택배(구월)",
    path: ROUTE.projects.communityDetail.ok6070Apartment1,
  },
  {
    name: "OK! 6070 아파트택배(논현)",
    path: ROUTE.projects.communityDetail.ok6070Apartment2,
  },
  {
    name: "청소년건강지킴이",
    path: ROUTE.projects.communityDetail.studentHealth,
  },
  { name: "OK 6070 카드형", path: ROUTE.projects.communityDetail.ok6070Card },
  {
    name: "복지카페매니저(센터)",
    path: ROUTE.projects.communityDetail.yettunCafe1,
  },
  {
    name: "복지카페매니저(소래점)",
    path: ROUTE.projects.communityDetail.yettunCafe2,
  },
  { name: "공동작업장-1", path: ROUTE.projects.communityDetail.sharingJob1 },
  { name: "공동작업장-2", path: ROUTE.projects.communityDetail.sharingJob2 },
  { name: "도시락배송지원", path: ROUTE.projects.communityDetail.jungdotab },
  { name: "학교급식지원", path: ROUTE.projects.communityDetail.schoolMeal },
  { name: "ESG환경지킴이", path: ROUTE.projects.communityDetail.ourESG },
];

export default function CommunityMain() {
  const router = useRouter();

  const handleTabClick = (tabName: string) => {
    const target = tabList.find((tab) => tab.name === tabName);
    if (target) {
      router.push(target.path);
    }
  };

  return (
    <div className="px-6 md:px-10 py-10 max-w-screen-lg mx-auto text-gray-800">
      <Title text="공동체사업단" />

      {/* 탭 버튼 */}
      <div className="mt-10">
        <ProjectTab
          tabs={tabList.map((t) => t.name)}
          activeTab={""}
          onTabClick={handleTabClick}
        />
      </div>

      {/* 사업 소개 */}
      <div className="mt-14">
        <h2 className="text-blue-700 text-xl md:text-2xl font-bold mb-4">
          시장형 사업이란?
        </h2>
        <div className="space-y-3 pl-2 text-[16px] md:text-[17px] leading-relaxed">
          <p>
            <strong className="font-semibold">사업의 정의</strong>: 노인에게
            적합한 업종 중 소규모 매장 및 전문 직종 사업단 등을 공동으로
            운영하여 일자리를 창출하는 사업. 일정기간 사업비 또는 참여자 인건비
            일부를 보충 지원하고, 추가 소득으로 연중 운영하는 노인 일자리
          </p>
          <p>
            <strong className="font-semibold">사업기간</strong>: 2025년 1월 ~
            12월 (연중)
          </p>
          <p>
            <strong className="font-semibold">사업대상</strong>: 인천시 남동구
            거주 만 60세 이상 사업특성 적합자
          </p>
          <p>
            <strong className="font-semibold">활동시간 / 활동비</strong>: 일
            2.5시간 / 시급 적용
            <br />
            <span className="text-sm text-gray-600 ml-2">
              ※ 수요처 계약에 따라 달라질 수 있음
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}