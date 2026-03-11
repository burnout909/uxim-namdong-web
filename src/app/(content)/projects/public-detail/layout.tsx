'use client';

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Title from "@/components/Title";
import ProjectTab from "@/components/ProjectTab";
import { ROUTE } from "@/constants/route";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

const FALLBACK_TABS = [
  { name: "경로당급식지원",         path: ROUTE.projects.publicDetail.seniorMeal },
  { name: "경로당시설안전관리요원", path: ROUTE.projects.publicDetail.facilitySafety },
  { name: "노인시설지킴이",         path: ROUTE.projects.publicDetail.elderGuard },
  { name: "동네쉼터관리사",         path: ROUTE.projects.publicDetail.shelterManager },
  { name: "스쿨존안전지킴이",       path: ROUTE.projects.publicDetail.schoolZone },
  { name: "시니어폐의약품수거",     path: ROUTE.projects.publicDetail.drugCollector },
  { name: "우리동네안전지킴이",     path: ROUTE.projects.publicDetail.localGuard },
  { name: "은빛정원선생님",         path: ROUTE.projects.publicDetail.gardenTeacher },
];

const normalize = (p?: string) =>
  p ? (p.length > 1 ? p.replace(/\/+$/, "") : p) : "";

export default function PublicDetailLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const current = normalize(pathname);
  const [tabList, setTabList] = useState(FALLBACK_TABS);

  useEffect(() => {
    async function fetchTabs() {
      try {
        const supabase = createBrowserSupabaseClient();
        const { data } = await supabase
          .from("BUSINESS_MENU")
          .select("name, slug")
          .eq("category", "public")
          .eq("is_active", true)
          .order("order_index", { ascending: true });

        if (data && data.length > 0) {
          setTabList(data.map((item: { name: string; slug: string }) => ({
            name: item.name,
            path: `/projects/public-detail/${item.slug}`,
          })));
        }
      } catch { /* 폴백 유지 */ }
    }
    fetchTabs();
  }, []);

  const activeTab =
    tabList.find(t => {
      const base = normalize(t.path);
      return base === current || (current && current.startsWith(base + "/"));
    })?.name ?? "";

  const handleTabClick = (tabName: string) => {
    const target = tabList.find(t => t.name === tabName);
    if (target) router.push(target.path);
  };

  return (
    <div className="py-8 md:py-10 max-w-screen-lg mx-auto text-gray-800">
      <Title text="노인공익활동사업" />
      <div className="mt-6 md:mt-10">
        <ProjectTab
          tabs={tabList.map(t => t.name)}
          activeTab={activeTab}
          onTabClick={handleTabClick}
        />
      </div>
      <div className="mt-6 md:mt-10">{children}</div>
    </div>
  );
}
