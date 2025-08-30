import Title from "@/components/Title";
import OrgImage from "@/assets/images/about/org.png"
import Image from "next/image"

export default function Org() {
    return (
        <div className="px-6 py-10">
            <Title text="기관 조직도" />

            {/* 조직도 이미지 */}
            <div className="flex flex-col md:flex-row justify-center gap-8">
                <Image
                    src={OrgImage}
                    alt="남동시니어클럽 조직도"
                    className="w-full rounded shadow"
                />
            </div>

            {/* 인원 구성도 표 */}
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
    );
}
