import LeftNav from "@/components/LeftNav";
import { ROUTE } from "@/constants/route";

const aboutItems = [
    { label: "공지사항", path: ROUTE.notice.announcement },
    { label: "일자리소식", path: ROUTE.notice.jobInfo },
    { label: "생산품", path: ROUTE.notice.products },
    { label: "자유게시판", path: ROUTE.notice.free },
];

export default function AboutLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className="flex flex-col md:flex-row w-full min-h-screen max-w-[1440px] mx-auto mt-5">
            <aside className="w-full md:w-[200px] shrink-0 md:mr-[100px]">
                <LeftNav title="소통공간" items={aboutItems} />
            </aside>
            <section className="flex-grow">
                {children}
            </section>
        </div>
    );
}
