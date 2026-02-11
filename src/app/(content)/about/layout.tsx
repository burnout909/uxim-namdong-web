import LeftNav from "@/components/LeftNav";
import { ROUTE } from "@/constants/route";

const aboutItems = [
    { label: "인사말", path: ROUTE.about.greeting },
    { label: "시니어클럽소개", path: ROUTE.about.introduction },
    { label: "미션과 비전", path: ROUTE.about.mission },
    { label: "기관연혁", path: ROUTE.about.history },
    { label: "법인 소개", path: ROUTE.about.legal },
    { label: "기관 조직도", path: ROUTE.about.org },
    { label: "오시는 길", path: ROUTE.about.location },
];

export default function AboutLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className="flex flex-col md:flex-row w-full max-w-[1440px] mx-auto px-4 md:px-5">
            <aside className="w-full md:w-[200px] shrink-0 md:mr-[60px]">
                <LeftNav title="기관소개" items={aboutItems} />
            </aside>
            <section className="flex-1 min-w-0">
                {children}
            </section>
        </div>
    );
}

