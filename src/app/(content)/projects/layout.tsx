// app/(content)/projects/layout.tsx
import LeftNav from "@/components/LeftNav";
import { ROUTE } from "@/constants/route";

const projectItems = [
  {
    label: "노인공익활동사업",
    path: ROUTE.projects.publicService,
  },
  {
    label: "노인역량활용사업",
    path: ROUTE.projects.capacity,
  },
  { 
    label: "공동체사업단", 
    path: ROUTE.projects.community,
  },
  { label: "취업지원", path: ROUTE.projects.employment },
];

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full min-h-screen bg-white">
      <aside className="w-[181px] shrink-0 mr-[130px]">
        <LeftNav title="사업소개" items={projectItems} />
      </aside>
      <section className="flex-grow mt-[40px]">
        {children}
      </section>
    </div>
  );
}