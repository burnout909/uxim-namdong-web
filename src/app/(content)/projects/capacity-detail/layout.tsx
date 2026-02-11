// app/(content)/projects/capacity-detail/layout.tsx
'use client';

import { useRouter, usePathname } from "next/navigation";
import Title from "@/components/Title";
import ProjectTab from "@/components/ProjectTab";
import { ROUTE } from "@/constants/route";

const tabList = [
  { name: "시니어행정도우미", path: ROUTE.projects.capacityDetail.seniorAdmin },
  { name: "소비자감시단", path: ROUTE.projects.capacityDetail.consumerMonitor },
  { name: "북딜리버리", path: ROUTE.projects.capacityDetail.bookDelivery },
  { name: "모바일행정도우미", path: ROUTE.projects.capacityDetail.mobileAdmin },
  { name: "금융생활지원단", path: ROUTE.projects.capacityDetail.financeSupport },
  { name: "푸드뱅크관리사", path: ROUTE.projects.capacityDetail.foodbankManager },
  { name: "교통안전조사원", path: ROUTE.projects.capacityDetail.trafficSurveyor },
];

export default function CapacityDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const handleTabClick = (tabName: string) => {
    const target = tabList.find((tab) => tab.name === tabName);
    if (target) router.push(target.path);
  };

  const activeTab = tabList.find((tab) => tab.path === pathname)?.name || "";

  return (
    <div className="py-8 md:py-10 max-w-screen-lg mx-auto text-gray-800">
      <Title text="노인역량활용사업" />
      <div className="mt-6 md:mt-10">
        <ProjectTab
          tabs={tabList.map((t) => t.name)}
          activeTab={activeTab}
          onTabClick={handleTabClick}
        />
      </div>
      <div className="mt-6 md:mt-10">{children}</div>
    </div>
  );
}