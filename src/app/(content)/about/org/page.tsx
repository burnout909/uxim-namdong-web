import Title from "@/components/Title";
import OrgImage from "@/assets/images/about/org.png"
import Image from "next/image"

export default function Org() {
    return (
        <div className="py-8 md:py-10">
            <Title text="기관 조직도" />

            {/* 조직도 이미지 */}
            <div className="mt-6 flex flex-col md:flex-row justify-center gap-8">
                <Image
                    src={OrgImage}
                    alt="남동시니어클럽 조직도"
                    className="w-full rounded shadow"
                />
            </div>

            {/* 인원 구성도 - 모바일용 그리드 */}
            <div className="mt-8 block md:hidden">
                <h3 className="text-base font-bold text-gray-800 mb-4">인원 구성도</h3>
                <div className="grid grid-cols-3 gap-2">
                    <div className="bg-gray-100 rounded-lg p-3 text-center">
                        <span className="text-xs text-gray-500 block">관장</span>
                        <span className="text-lg font-bold text-gray-800">1</span>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-3 text-center">
                        <span className="text-xs text-gray-500 block">부장</span>
                        <span className="text-lg font-bold text-gray-800">1</span>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-3 text-center">
                        <span className="text-xs text-gray-500 block">과장</span>
                        <span className="text-lg font-bold text-gray-800">1</span>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-3 text-center">
                        <span className="text-xs text-gray-500 block">대리</span>
                        <span className="text-lg font-bold text-gray-800">2</span>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-3 text-center">
                        <span className="text-xs text-gray-500 block">팀장</span>
                        <span className="text-lg font-bold text-gray-800">1</span>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-3 text-center">
                        <span className="text-xs text-gray-500 block">주임</span>
                        <span className="text-lg font-bold text-gray-800">1</span>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-3 text-center col-span-2">
                        <span className="text-xs text-gray-500 block">사회복지사</span>
                        <span className="text-lg font-bold text-gray-800">18</span>
                    </div>
                    <div className="bg-blue-100 rounded-lg p-3 text-center">
                        <span className="text-xs text-blue-600 block">계</span>
                        <span className="text-lg font-bold text-blue-700">25</span>
                    </div>
                </div>
            </div>

            {/* 인원 구성도 표 - 데스크톱용 */}
            <div className="mt-8 hidden md:block">
                <h3 className="text-lg font-bold text-gray-800 mb-4">인원 구성도</h3>
                <div className="overflow-x-auto">
                    <table className="w-full border border-gray-300 text-sm text-center text-gray-800">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border px-4 py-2">구분</th>
                                <th className="border px-4 py-2">관장</th>
                                <th className="border px-4 py-2">부장</th>
                                <th className="border px-4 py-2">과장</th>
                                <th className="border px-4 py-2">대리</th>
                                <th className="border px-4 py-2">팀장</th>
                                <th className="border px-4 py-2">주임</th>
                                <th className="border px-4 py-2">사회복지사</th>
                                <th className="border px-4 py-2">계</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border px-4 py-2 font-semibold">인원</td>
                                <td className="border px-4 py-2">1</td>
                                <td className="border px-4 py-2">1</td>
                                <td className="border px-4 py-2">1</td>
                                <td className="border px-4 py-2">2</td>
                                <td className="border px-4 py-2">1</td>
                                <td className="border px-4 py-2">1</td>
                                <td className="border px-4 py-2">18</td>
                                <td className="border px-4 py-2 font-bold">25</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
