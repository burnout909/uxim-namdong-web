export default function ContentLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex flex-grow w-full py-4 md:py-8 overflow-x-hidden">
            <section className="flex-grow min-w-0 w-full">
                {children}
            </section>
        </div>
    );
}
