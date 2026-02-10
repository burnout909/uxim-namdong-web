import Title from "@/components/Title";

export default function Mission() {
    return (
        <div className="px-4 py-12 max-w-screen-lg mx-auto text-center">
            <Title text="미션과 비전" />

            {/* 메인 미션 슬로건 */}
            <div className="mt-10">
                <h2 className="text-2xl font-bold text-blue-800 mb-4">
                    多같이 행복한 일자리, 老人이 행복한 세상!!
                </h2>
            </div>

            {/* Vision Section */}
            <div className="mt-12 text-left">
                <h3 className="text-xl font-bold text-gray-800 mb-6">
                    ✔ 비전 (Vision)
                </h3>
                <ul className="list-disc list-inside text-[15px] text-gray-700 space-y-2 leading-relaxed">
                    <li>1-3세대가 어우러져 함께하는 소통 일자리 추진</li>
                    <li>
                        어르신의 인적, 물적 자원을 나누고 공유하여 지역사회와 함께 성장하는
                        기관
                    </li>
                    <li>
                        노인의 4고(苦)를 모두 해결할 수 있는 풍요로운 일자리 활성화를
                        선도하는 시니어클럽
                    </li>
                </ul>
            </div>

            {/* 핵심가치 Section */}
            <div className="mt-30">
                <h3 className="text-xl font-bold text-gray-800 mb-8">
                    🌟 핵심가치 (Core Values)
                </h3>
                <div className="grid grid-cols-2 mt-15 md:grid-cols-4 gap-4 md:gap-6 justify-center">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-36 h-36 md:w-44 md:h-44 rounded-full bg-blue-50 border-[5px] border-blue-400 shadow-md flex flex-col items-center justify-center px-4 text-center">
                            <h4 className="text-blue-600 font-bold text-lg mb-1">소통</h4>
                            {/* 🔵 소통 아래 파란색 구분선 */}
                            <div className="w-8 h-0.5 bg-blue-600 my-2 rounded-full" />
                            <p className="text-sm text-gray-700 leading-tight">
                                지역사회와 함께
                                <br />
                                생각을 공유하고 <br />
                                이해하는 기관
                            </p>
                        </div>
                    </div>

                    {/* 도전 */}
                    <div className="flex flex-col items-center text-center">
                        <div className="w-36 h-36 md:w-44 md:h-44 rounded-full bg-green-50 border-[5px] border-green-600 shadow-md flex flex-col items-center justify-center px-4 text-center">
                            <h4 className="text-green-700 font-bold text-lg mb-1">도전</h4>
                            <div className="w-8 h-0.5 bg-green-700 my-2 rounded-full" />
                            <p className="text-sm text-gray-700 leading-tight">
                                환경에 얽매이지 않고
                                <br />
                                꿈을 향해 나아가는 삶
                            </p>
                        </div>
                    </div>

                    {/* 신뢰 */}
                    <div className="flex flex-col items-center text-center">
                        <div className="w-36 h-36 md:w-44 md:h-44 rounded-full bg-orange-50 border-[5px] border-orange-500 shadow-md flex flex-col items-center justify-center px-4 text-center">
                            <h4 className="text-orange-600 font-bold text-lg mb-1">신뢰</h4>
                            <div className="w-8 h-0.5 bg-orange-600 my-2 rounded-full" />
                            <p className="text-sm text-gray-700 leading-tight">
                                기대와 믿음에
                                <br />
                                부응하는 조직
                            </p>
                        </div>
                    </div>

                    {/* 존중 */}
                    <div className="flex flex-col items-center text-center">
                        <div className="w-36 h-36 md:w-44 md:h-44 rounded-full bg-red-50 border-[5px] border-red-600 shadow-md flex flex-col items-center justify-center px-4 text-center">
                            <h4 className="text-red-600 font-bold text-lg mb-1">존중</h4>
                            <div className="w-8 h-0.5 bg-red-600 my-2 rounded-full" />
                            <p className="text-sm text-gray-700 leading-tight">
                                다양성을 인정하고
                                <br />
                                이해하는 공동체
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
