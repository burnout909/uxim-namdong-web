import Title from "@/components/Title";
import LocationImage from "@/assets/images/about/location.png"
import Image from "next/image"

export default function Location() {
    return (
        <div className="px-4 py-8 max-w-screen-lg mx-auto">
            <Title text="오시는 길" />

            <div className="mt-8 space-y-8">
                {/* 지도 이미지들 */}
                <div className="flex flex-col md:flex-row justify-center gap-8">
                    <Image
                        src={LocationImage}
                        alt="남동시니어클럽 위치지도1"
                        className="w-full md:w-1/2 rounded shadow"
                    />
                </div>

                {/* 주소 및 연락처 */}
                <div className="text-gray-700 leading-relaxed text-[15px] mt-10">
                    <h3 className="text-xl text-blue-500 font-semibold mb-2">주소</h3>
                    <p className="mb-4">
                        인천광역시 남동구 남동서로62번길 13 (구월동, 남동구노인복지관)
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-100">
                        <div>
                            <h3 className="text-xl text-blue-500 font-semibold mb-2">전화</h3>
                            <p>032-267-6080</p>
                        </div>
                        <div>
                            <h3 className="text-xl text-blue-500 font-semibold mb-2">팩스</h3>
                            <p>032-267-6081</p>
                        </div>
                    </div>

                    {/* 교통안내 */}
                    <div className="mt-8">
                        <h3 className="text-lg font-semibold mb-2">교통안내</h3>
                        <p>지하철: 인천 1호선 예술회관역 10번 출구에서 도보 약 7분 거리</p>
                        <p>
                            버스: 구월3동 행정복지센터 또는 구월우체국 정류장 하차 후 도보 약
                            3분 거리
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
