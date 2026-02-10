// app/(content)/projects/layout.tsx
import LeftNav from "@/components/LeftNav";
import { ROUTE } from "@/constants/route";

const resourceItems = [
    {
        label: "사진자료실",
        path: ROUTE.resources.photos,
    },
    {
        label: "영상자료실",
        path: ROUTE.resources.videos,
    },
    {
        label: "관련사이트",
        path: ROUTE.resources.links
    }
];

export default function ResourcesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col md:flex-row w-full min-h-screen max-w-[1440px] mx-auto mt-5">
            <aside className="w-full md:w-[200px] shrink-0 md:mr-[100px]">
                <LeftNav title="자료실" items={resourceItems} />
            </aside>
            <section className="flex-grow">
                {children}
            </section>
        </div>
    );
}