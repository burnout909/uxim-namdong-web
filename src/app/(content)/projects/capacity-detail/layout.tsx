'use client';

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Title from "@/components/Title";
import ProjectTab from "@/components/ProjectTab";
import { ROUTE } from "@/constants/route";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

const FALLBACK_TABS = [
  { name: "시니어행정도우미", path: ROUTE.projects.capacityDetail.seniorAdmin },
  { name: "소비자감시단", path: ROUTE.projects.capacityDetail.consumerMonitor },
  { name: "북딜리버리", path: ROUTE.projects.capacityDetail.bookDelivery },
  { name: "모바일행정도우미", path: ROUTE.projects.capacityDetail.mobileAdmin },
  { name: "금융생활지원단", path: ROUTE.projects.capacityDetail.financeSupport },
  { name: "푸드뱅크관리사", path: ROUTE.projects.capacityDetail.foodbankManager },
  { name: "교통안전조사원", path: ROUTE.projects.capacityDetail.trafficSurveyor },
];

export default function CapacityDetailLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [tabList, setTabList] = useState(FALLBACK_TABS);

  useEffect(() => {
    async function fetchTabs() {
      try {
        const supabase = createBrowserSupabaseClient();
        const { data } = await supabase
          .from("BUSINESS_MENU")
          .select("name, slug")
          .eq("category", "capacity")
          .eq("is_active", true)
          .order("order_index", { ascending: true });

        if (data && data.length > 0) {
          setTabList(data.map((item: { name: string; slug: string }) => ({
            name: item.name,
            path: `/projects/capacity-detail/${item.slug}`,
          })));
        }
      } catch { /* 폴백 유지 */ }
    }
    fetchTabs();
  }, []);

  const activeTab = tabList.find((tab) => tab.path === pathname)?.name || "";

  const handleTabClick = (tabName: string) => {
    const target = tabList.find((tab) => tab.name === tabName);
    if (target) router.push(target.path);
  };

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
