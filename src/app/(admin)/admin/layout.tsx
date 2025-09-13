'use client'
import { useVerifyAdmin } from "@/hooks/useVerifyAdmin"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const { loading, isAdmin, error } = useVerifyAdmin()
    const router = useRouter()

    //loading이 끝난 후 체크
    useEffect(() => {
        if (!loading && !isAdmin) {
            router.replace('/admin/sign-in')
        }
    }, [loading, isAdmin, router])
    return (
        <div>
            {children}
        </div>
    )

}