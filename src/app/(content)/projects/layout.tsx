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
    <div className="flex flex-col md:flex-row w-full max-w-[1440px] mx-auto px-4 md:px-5">
      <aside className="w-full md:w-[200px] shrink-0 md:mr-[60px]">
        <LeftNav title="사업소개" items={projectItems} />
      </aside>
      <section className="flex-1 min-w-0">
        {children}
      </section>
    </div>
  );
}


