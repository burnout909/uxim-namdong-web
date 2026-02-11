import Title from "@/components/Title";
import LocationImage from "@/assets/images/about/location.png"
import Image from "next/image"

export default function Location() {
    return (
        <div className="py-8 max-w-screen-lg mx-auto">
            <Title text="오시는 길" />

            <div className="mt-6 md:mt-8 space-y-6 md:space-y-8">
                {/* 지도 이미지 */}
                <div className="flex flex-col md:flex-row justify-center">
                    <Image
                        src={LocationImage}
                        alt="남동시니어클럽 위치지도"
                        className="w-full md:w-2/3 rounded shadow"
                    />
                </div>

                {/* 주소 및 연락처 */}
                <div className="text-gray-700 leading-relaxed text-sm md:text-[15px]">
                    <h3 className="text-lg md:text-xl text-blue-500 font-semibold mb-2">주소</h3>
                    <p className="mb-4">
                        인천광역시 남동구 남동서로62번길 13 (구월동, 남동구노인복지관)
                    </p>

                    <div className="grid grid-cols-2 gap-4 md:gap-6">
                        <div>
                            <h3 className="text-lg md:text-xl text-blue-500 font-semibold mb-2">전화</h3>
                            <p>032-267-6080</p>
                        </div>
                        <div>
                            <h3 className="text-lg md:text-xl text-blue-500 font-semibold mb-2">팩스</h3>
                            <p>032-267-6081</p>
                        </div>
                    </div>

                    {/* 교통안내 */}
                    <div className="mt-6 md:mt-8">
                        <h3 className="text-base md:text-lg font-semibold mb-2">교통안내</h3>
                        <div className="space-y-2">
                            <p><span className="font-medium">지하철:</span> 인천 1호선 예술회관역 10번 출구에서 도보 약 7분 거리</p>
                            <p><span className="font-medium">버스:</span> 구월3동 행정복지센터 또는 구월우체국 정류장 하차 후 도보 약 3분 거리</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
