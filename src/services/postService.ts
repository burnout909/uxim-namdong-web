// src/lib/supabase/queries/post.ts
import { createClient } from '@/lib/supabase';
import bcrypt from "bcryptjs";


export enum PostType {
    NOTICE = 'NOTICE',
    JOB = 'JOB',
    PRODUCT = 'PRODUCT',
    FREE = 'FREE',
    PHOTO = 'PHOTO',
    VIDEO = 'VIDEO',
    PRESS = 'PRESS',
    STAFF = 'STAFF',
}

export type Post = {
    id: string;
    title: string | null;
    /** 목록 조회에서는 내려오지 않는다. 상세 조회에서만 채워진다. */
    contents?: string | null;
    created_at: string;
    updated_at: string | null;
    is_private?: boolean;
    password?: string | null
};

export interface PaginatedPosts {
    posts: Post[];
    total: number;
    currentPage: number;
    totalPages: number;
    is_private?: boolean;
}

/**
 * Supabase에서 게시글 목록을 페이징 형태로 가져오는 함수
 */
export async function getPosts(
    type: PostType,
    page = 1,
    limit = 10
): Promise<PaginatedPosts> {
    const supabase = await createClient();
    const offset = (page - 1) * limit;

    // 목록에는 본문(contents)이 필요 없다.
    // 본문에 base64 이미지가 통째로 들어있는 글이 있어서 select에 포함하면
    // 목록 한 페이지가 수 MB~십수 MB가 되고 그대로 게시판 진입 지연으로 이어진다.
    // 카운트와 페이지 데이터는 서로 의존하지 않으므로 병렬로 조회한다.
    const [
        { count, error: countError },
        { data, error },
    ] = await Promise.all([
        supabase
            .from('POST')
            .select('id', { count: 'exact', head: true })
            .eq('type', type),
        supabase
            .from('POST')
            .select('id, title, created_at, updated_at, is_private')
            .eq('type', type)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1),
    ]);
    if (countError) throw countError;
    if (error) throw error;

    const total = count ?? 0;
    const posts = (data ?? []).map((post) => ({
        ...post,
        title: post.is_private ? '🔒 비공개 글입니다' : post.title,
    })) as Post[];

    return {
        posts,
        total,
        currentPage: page,
        totalPages: Math.max(1, Math.ceil(total / limit)),
    };
}

export async function getPostDetail(type: string, id: string) {
  const supabase = await createClient();

  // 1) 현재 글 + 파일 + 댓글(join)
  const { data: post, error } = await supabase
    .from("POST")
    .select(`
      id,
      title,
      contents,
      created_at,
      type,
      is_private,
      password,
      POST_FILE (
        role,
        file:FILE!inner(file_key, mime_type, size_bytes, created_at)
      ),
      REPLY (
        id,
        contents,
        created_at,
        updated_at
      )
    `)
    .eq("type", type)
    .eq("id", id)
    .maybeSingle();

  if (error || !post) return null;

  // 2) 이전/다음 글
  const [{ data: prev }, { data: next }] = await Promise.all([
    supabase
      .from("POST")
      .select("id, title, created_at")
      .eq("type", type)
      .lt("created_at", post.created_at)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("POST")
      .select("id, title, created_at")
      .eq("type", type)
      .gt("created_at", post.created_at)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  return { post, prev, next };
}

/**
 * 비공개 게시글 비밀번호 검증 함수
 * @param postId - 게시글 ID
 * @param inputPassword - 사용자가 입력한 평문 비밀번호
 * @returns boolean | null (true: 일치, false: 불일치, null: 게시글 없음 또는 비공개 아님)
 */
export async function verifyPostPassword(postId: string, inputPassword: string): Promise<boolean | null> {
    const supabase = await createClient();

    // 게시글 조회 (비공개 글만)
    const { data: post, error } = await supabase
        .from("POST")
        .select("id, password, is_private")
        .eq("id", postId)
        .maybeSingle();

    if (error || !post) {
        console.error("게시글 조회 실패:", error);
        return null;
    }

    // 비공개 글이 아니면 검증 불필요
    if (!post.is_private || !post.password) {
        return null;
    }

    // bcrypt 비교
    try {
        const isMatch = await bcrypt.compare(inputPassword, post.password);
        return isMatch;
    } catch (err) {
        console.error("비밀번호 검증 중 오류:", err);
        return false;
    }
}

export type PhotoGalleryItem = {
    id: string;
    title: string | null;
    created_at: string;
};

/**
 * 메인 포토갤러리용 최신 사진자료실 글 목록.
 * 썸네일 이미지는 /api/photo-thumb/[id] 가 따로 내려주므로
 * 여기서는 본문을 절대 조회하지 않는다.
 */
export async function getLatestPhotoPosts(limit = 8): Promise<PhotoGalleryItem[]> {
    const supabase = await createClient();
    try {
        const { data, error } = await supabase
            .from('POST')
            .select('id, title, created_at')
            .eq('type', 'PHOTO')
            .order('created_at', { ascending: false })
            .limit(limit);
        if (error) return [];
        return (data ?? []) as PhotoGalleryItem[];
    } catch {
        return [];
    }
}

/**
 * 자유게시판 전체 게시글 조회 (관리자/사용자 분리)
 */
export async function getAllFreePosts() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("POST")
    .select("id, title, created_at, is_private, is_admin")
    .eq("type", "FREE")
    .order("created_at", { ascending: false });

  if (error) throw error;

  const adminPosts = data?.filter((p) => p.is_admin) ?? [];
  const userPosts = data?.filter((p) => !p.is_admin) ?? [];

  return { adminPosts, userPosts };
}


export async function deletePost(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    console.error("삭제 권한이 없습니다.");
    return false;
  }
  const { error } = await supabase.from("POST").delete().eq("id", id);

  if (error) {
    console.error("게시글 삭제에 실패했습니다.", error);
    return false;
  }

  return true;
}
