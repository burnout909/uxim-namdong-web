import Footer from "@/components/Footer";
import Header from "@/components/Header";


export default function ContentLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex flex-grow w-full px-20 py-8">
            <section className="flex-grow">
                {children}
            </section>
        </div>
    );
}
