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
        <div className="flex w-full min-h-screen">
            <aside className="w-[181px] shrink-0 mr-[130px]">
                <LeftNav title="소통공간" items={aboutItems} />
            </aside>
            <section className="flex-grow mt-[40px]">
                {children}
            </section>
        </div>
    );
}
