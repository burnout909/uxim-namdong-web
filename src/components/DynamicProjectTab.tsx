'use client';

import { useRouter } from "next/navigation";
import ProjectTab from "@/components/ProjectTab";

interface TabItem {
  name: string;
  path: string;
}

interface DynamicProjectTabProps {
  tabs: TabItem[];
  activeTab?: string;
}

export default function DynamicProjectTab({ tabs, activeTab = "" }: DynamicProjectTabProps) {
  const router = useRouter();

  const handleTabClick = (tabName: string) => {
    const target = tabs.find((tab) => tab.name === tabName);
    if (target) {
      router.push(target.path);
    }
  };

  return (
    <ProjectTab
      tabs={tabs.map((t) => t.name)}
      activeTab={activeTab}
      onTabClick={handleTabClick}
    />
  );
}
