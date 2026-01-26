import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // getUser()를 호출하면 세션을 검증하고 필요시 토큰을 갱신함
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const pathname = request.nextUrl.pathname

    // /admin 경로 보호 (sign-in 제외)
    if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/sign-in')) {
        if (!user) {
            const url = request.nextUrl.clone()
            url.pathname = '/admin/sign-in'
            return NextResponse.redirect(url)
        }
    }

    // 이미 로그인된 상태에서 sign-in 페이지 접근 시 /admin으로 리다이렉트
    if (pathname === '/admin/sign-in' && user) {
        const url = request.nextUrl.clone()
        url.pathname = '/admin'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        '/admin/:path*',
    ],
}
