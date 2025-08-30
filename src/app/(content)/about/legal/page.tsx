import Title from "@/components/Title";

export default function Legal() {
    return (
        <div className="px-6 py-10">
            <Title text="법인 소개" />

            {/* 운영법인 정보 */}
            <div className="mt-6">
                <p className="text-lg font-bold text-gray-800">
                    운영법인 : <span className="text-blue-900">사단법인 대한노인회인천남동구지회</span>
                </p>
            </div>

            {/* 법인 상세 정보 표 */}
            <div className="mt-6 overflow-x-auto">
                <table className="w-full border border-gray-300 text-sm text-gray-800">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border px-4 py-2">기관명</th>
                            <th className="border px-4 py-2">위치</th>
                            <th className="border px-4 py-2">설립일</th>
                            <th className="border px-4 py-2">상급기관</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="border px-4 py-2">(사)대한노인회 인천남동구지회</td>
                            <td className="border px-4 py-2">인천광역시 남동구 소래로 610</td>
                            <td className="border px-4 py-2">1988. 01. 01</td>
                            <td className="border px-4 py-2">(사)대한노인회</td>
                        </tr>
                    </tbody>
                </table>
                <p className="text-xs text-right mt-1">(단위: ㎡)</p>
            </div>

            {/* 설립 목적 */}
            <div className="mt-8">
                <h3 className="text-lg font-bold text-gray-800 mb-2">설립 목적</h3>
                <ul className="list-disc list-inside space-y-2 text-[15px] text-gray-700 leading-relaxed">
                    <li>
                        노인권익신장, 복지증진, 사회봉사 활동 등을 통한 사회를 책임지고 선도하는 노인상 구현
                    </li>
                    <li>
                        부양받는 노인에서 스스로 존경받고 아름다운 노인으로 활기차고
                        식명나게 생활하는 노인상 정립
                    </li>
                </ul>
            </div>
        </div>
    );
}
