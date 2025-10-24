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
