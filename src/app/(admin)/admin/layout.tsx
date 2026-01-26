'use client'
import { useVerifyAdmin } from "@/hooks/useVerifyAdmin"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const { loading, isAdmin } = useVerifyAdmin()
    const router = useRouter()
    const pathname = usePathname()

    //loading이 끝난 후 체크
    useEffect(() => {
        if (pathname === '/admin/sign-in') return
        if (!loading && !isAdmin) {
            router.replace('/admin/sign-in')
        }
    }, [loading, isAdmin, router, pathname])
    return (
        <div>
            {pathname === '/admin/sign-in' ? children : (!loading && isAdmin ? children : null)}
        </div>
    )

}
