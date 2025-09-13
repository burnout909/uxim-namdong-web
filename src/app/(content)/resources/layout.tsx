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
        <div className="flex w-full min-h-screen bg-white">
            <aside className="w-[181px] shrink-0 mr-[130px]">
                <LeftNav title="자료실" items={resourceItems} />
            </aside>
            <section className="flex-grow mt-[40px]">
                {children}
            </section>
        </div>
    );
}