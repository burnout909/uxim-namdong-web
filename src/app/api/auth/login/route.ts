import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function POST(req: Request) {
    const form = await req.formData();
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");

    //next app router의 cookie header
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    //현재 요청의 모든 쿠키 반환
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    )
                }
            },
        }
    );

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        const url = new URL("/admin/sign-in", req.url);
        url.searchParams.set("error", error.message);
        //POST→GET 전환을 위해 303 권장
        return NextResponse.redirect(url, { status: 303 });
    }
    return NextResponse.redirect(new URL("/admin", req.url));
}
