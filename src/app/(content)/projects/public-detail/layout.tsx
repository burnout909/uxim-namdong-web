// app/(content)/projects/public-detail/layout.tsx
'use client';

import { useRouter, usePathname } from "next/navigation";
import Title from "@/components/Title";
import ProjectTab from "@/components/ProjectTab";
import { ROUTE } from "@/constants/route";

const tabList = [
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
    <div className="px-6 md:px-10 py-10 max-w-screen-lg mx-auto text-gray-800">
      <Title text="노인공익활동사업" />
      <div className="mt-10">
        <ProjectTab
          tabs={tabList.map(t => t.name)}
          activeTab={activeTab}
          onTabClick={handleTabClick}
        />
      </div>
      <div className="mt-10">{children}</div>
    </div>
  );
}
