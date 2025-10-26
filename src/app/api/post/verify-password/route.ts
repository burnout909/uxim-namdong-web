import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createClient } from "@/lib/supabase";

export async function POST(req: Request) {
  const { postId, inputPassword } = await req.json();
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("POST")
    .select("password, is_private")
    .eq("id", postId)
    .maybeSingle();

  if (!post || !post.is_private || !post.password) {
    return NextResponse.json({ success: false, message: "비공개 글이 아니거나 존재하지 않습니다." });
  }

  const match = await bcrypt.compare(inputPassword, post.password);
  if (!match) {
    return NextResponse.json({ success: false, message: "비밀번호가 일치하지 않습니다." });
  }

  return NextResponse.json({ success: true });
}
