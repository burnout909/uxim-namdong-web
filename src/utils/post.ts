/**
 * 에디터 본문이 비어 있는지 판정한다.
 *
 * 태그만 걷어내고 판정하면 사진만 올린 글이 "빈 글"로 걸린다.
 * 사진자료실처럼 이미지가 본문 전부인 글이 있으므로 이미지도 내용으로 친다.
 */
export function isEditorContentEmpty(html: string): boolean {
    if (/<img\b/i.test(html)) return false;
    const plain = html
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    return plain.length === 0;
}

export function getDisplayFileName(fileKey: string) {
    const parts = fileKey.split("-");
    // UUID(5개 파트, 36자) + 나머지를 조합
    return parts.slice(5).join("-");
}

// src/utils/date.ts
export function formatMetaDate(iso: string): string {
    const d = new Date(iso);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}.${mm}.${dd}`;
}
