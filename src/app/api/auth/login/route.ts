import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(req: Request) {
    const supabase = await createClient()
    const formData = await req.formData()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 400 })
    }

    // 로그인 성공 시 홈으로 리다이렉트
    return NextResponse.redirect(new URL('/', req.url))
}
