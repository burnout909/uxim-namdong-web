export default function ContentLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex flex-grow w-full px-[20px] py-[20px] md:px-20 md:py-8">
            <section className="flex-grow">
                {children}
            </section>
        </div>
    );
}
