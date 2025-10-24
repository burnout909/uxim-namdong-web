// src/lib/supabase/queries/post.ts
import { createClient } from '@/lib/supabase';

export enum PostType {
    NOTICE = 'NOTICE',
    JOB = 'JOB',
    PRODUCT = 'PRODUCT',
    FREE = 'FREE',
    PHOTO = 'PHOTO',
    VIDEO = 'VIDEO',
}

export type Post = {
    id: string;
    title: string | null;
    contents: string | null;
    created_at: string;
    updated_at: string | null;
    views?: number | null;
};

export interface PaginatedPosts {
    posts: Post[];
    total: number;
    currentPage: number;
    totalPages: number;
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

    // 전체 개수 카운트
    const { count, error: countError } = await supabase
        .from('POST')
        .select('*', { count: 'exact', head: true })
        .eq('type', type);
    if (countError) throw countError;

    // 페이지 데이터 조회
    const { data, error } = await supabase
        .from('POST')
        .select('id, title, contents, created_at, updated_at')
        .eq('type', type)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
    if (error) throw error;

    const total = count ?? 0;
    const posts = (data ?? []) as Post[];

    return {
        posts,
        total,
        currentPage: page,
        totalPages: Math.max(1, Math.ceil(total / limit)),
    };
}

export async function getPostDetail(type: string, id: string) {
    const supabase = await createClient();

    // 1) 현재 글
    const { data: post, error } = await supabase
        .from("POST")
        .select(`
      id,
      title,
      contents,
      created_at,
      type,
      POST_FILE (
        role,
        file:FILE!inner(file_key, mime_type, size_bytes, created_at)
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
