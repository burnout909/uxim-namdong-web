// app/(content)/projects/community-detail/layout.tsx
'use client';

import { ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
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

export default function CommunityDetailLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const handleTabClick = (tabName: string) => {
    const target = tabList.find((tab) => tab.name === tabName);
    if (target) router.push(target.path);
  };

  const activeTab =
    tabList.find((tab) => tab.path === pathname)?.name || "";

  return (
    <div className="px-6 md:px-10 py-10 max-w-screen-lg mx-auto text-gray-800">
      {/* 상단 제목 */}
      <Title text="공동체사업단" />

      {/* 탭 버튼 */}
      <div className="mt-10">
        <ProjectTab
          tabs={tabList.map((t) => t.name)}
          activeTab={activeTab}
          onTabClick={handleTabClick}
        />
      </div>

      {/* 하위 컨텐츠 */}
      <div className="mt-10">{children}</div>
    </div>
  );
}