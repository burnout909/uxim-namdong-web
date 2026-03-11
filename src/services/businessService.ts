import { createClient } from '@/lib/supabase';

export type BusinessMenuItem = {
  id: string;
  category: string;
  name: string;
  slug: string;
  description: string | null;
  image_key: string | null;
  image_bucket: string | null;
  order_index: number;
  is_active: boolean;
};

/**
 * 사업 카테고리별 메뉴 항목을 DB에서 가져옵니다.
 * DB에 데이터가 없으면 빈 배열을 반환합니다.
 */
export async function getBusinessMenuItems(
  category: string
): Promise<BusinessMenuItem[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('BUSINESS_MENU')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (!error && data && data.length > 0) {
      return data as BusinessMenuItem[];
    }
  } catch {
    // 테이블이 없거나 오류 시 빈 배열 반환
  }
  return [];
}
