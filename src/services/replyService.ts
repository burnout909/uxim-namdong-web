import { createClient } from "@/lib/supabase";

/**
 * 특정 게시글의 모든 답글 가져오기
 */
export async function getReplies(postId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("REPLY")
    .select(`
      id,
      contents,
      created_at,
      user_id,
      auth.users(email)
    `)
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * 답글 작성
 */
export async function createReply(postId: string, userId: string | null, contents: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("REPLY").insert({
    post_id: postId,
    user_id: userId, // nullable 허용됨
    contents,
  });

  if (error) {
    console.error("❌ 답글 작성 실패:", error);
    throw error;
  }

  return true;
}

/**
 * 답글 수정
 */
export async function updateReply(id: string, contents: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("REPLY")
    .update({ contents, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("❌ 답글 수정 실패:", error);
    throw error;
  }

  return true;
}

/**
 * 답글 삭제
 */
export async function deleteReply(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("REPLY").delete().eq("id", id);

  if (error) {
    console.error("❌ 답글 삭제 실패:", error);
    throw error;
  }

  return true;
}
