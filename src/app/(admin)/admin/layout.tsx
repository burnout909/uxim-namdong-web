export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className="bg-gray-50">
            {children}
        </div>
    )
}
