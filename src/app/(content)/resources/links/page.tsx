import PostContainer from "@/components/post/PostContainer";
import Title from "@/components/Title";

const LinkDict: Record<string, string> = {
    "남동구": "https://www.namdong.go.kr/",
    "인천광역시": "https://www.incheon.go.kr/",
    "보건복지부": "https://www.mohw.go.kr/",
    "한국노인인력개발원": "https://www.kordi.or.kr/",
    "한국시니어클럽협회": "http://www.silverpower.or.kr/",
    "사회복지공동모금회": "https://www.chest.or.kr/",
    "한국사회복지협의회": "https://www.bokji.net/",
    "한국사회복지사협회": "https://www.welfare.net/",
};

export default function Link() {
    const items = Object.entries(LinkDict);

    return (
        <PostContainer>
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-heading-large text-gray-900">관련 사이트</h1>
            </div>

            {/* 버튼 그리드 */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {items.map(([label, href]) => (
                    <a
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        role="button"
                        className="group flex items-center justify-center rounded-md border border-gray-300 bg-white px-6 py-10 text-heading-medium text-gray-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                        aria-label={`${label} 새 창으로 열기`}
                    >
                        {label}
                    </a>
                ))}
            </div>
        </PostContainer>
    );
}
