import Title from "@/components/Title";

const coreValues = [
    {
        title: "소통",
        lines: ["지역사회와 함께", "생각을 공유하고", "이해하는 기관"],
    },
    {
        title: "도전",
        lines: ["환경에 얽매이지 않고", "꿈을 향해 나아가는 삶"],
    },
    {
        title: "신뢰",
        lines: ["기대와 믿음에", "부응하는 조직"],
    },
    {
        title: "존중",
        lines: ["다양성을 인정하고", "이해하는 공동체"],
    },
];

export default function Mission() {
    return (
        <div className="py-8 md:py-12 max-w-screen-lg mx-auto">
            <Title text="미션과 비전" />

            {/* 메인 미션 슬로건 */}
            <div className="mt-8 md:mt-12 py-8 md:py-10 border-y border-gray-200 text-center">
                <h2 className="text-xl md:text-[28px] font-bold text-[#003675] leading-snug">
                    多같이 행복한 일자리, 老人이 행복한 세상!!
                </h2>
            </div>

            {/* Vision Section */}
            <div className="mt-12 md:mt-16">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-5">
                    비전 <span className="font-normal text-gray-500">(Vision)</span>
                </h3>
                <ul className="border-t-2 border-[#003675] text-sm md:text-[16px] text-gray-800 leading-relaxed">
                    <li className="py-4 border-b border-gray-200">1-3세대가 어우러져 함께하는 소통 일자리 추진</li>
                    <li className="py-4 border-b border-gray-200">
                        어르신의 인적, 물적 자원을 나누고 공유하여 지역사회와 함께 성장하는
                        기관
                    </li>
                    <li className="py-4 border-b border-gray-200">
                        노인의 4고(苦)를 모두 해결할 수 있는 풍요로운 일자리 활성화를
                        선도하는 시니어클럽
                    </li>
                </ul>
            </div>

            {/* 핵심가치 Section */}
            <div className="mt-12 md:mt-16">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-5">
                    핵심가치 <span className="font-normal text-gray-500">(Core Values)</span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 border-t-2 border-t-[#003675] border-b border-b-gray-200">
                    {coreValues.map((v, i) => (
                        <div
                            key={v.title}
                            className={`px-4 py-6 md:px-6 md:py-8 text-center border-gray-200 ${i % 2 === 1 ? "border-l" : ""} ${i >= 2 ? "border-t md:border-t-0" : ""} ${i === 2 ? "md:border-l" : ""}`}
                        >
                            <h4 className="text-lg md:text-2xl font-bold text-[#003675] mb-3">{v.title}</h4>
                            <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                                {v.lines.map((line, j) => (
                                    <span key={j}>
                                        {line}
                                        {j < v.lines.length - 1 && <br />}
                                    </span>
                                ))}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
