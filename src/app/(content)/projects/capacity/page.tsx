import Title from "@/components/Title";
import { ROUTE } from "@/constants/route";
import { getBusinessMenuItems } from "@/services/businessService";
import DynamicProjectTab from "@/components/DynamicProjectTab";

export const dynamic = "force-dynamic";

const FALLBACK_TABS = [
  { name: "시니어행정도우미", path: ROUTE.projects.capacityDetail.seniorAdmin },
  { name: "소비자감시단", path: ROUTE.projects.capacityDetail.consumerMonitor },
  { name: "북딜리버리", path: ROUTE.projects.capacityDetail.bookDelivery },
  { name: "모바일행정도우미", path: ROUTE.projects.capacityDetail.mobileAdmin },
  { name: "금융생활지원단", path: ROUTE.projects.capacityDetail.financeSupport },
  { name: "푸드뱅크관리사", path: ROUTE.projects.capacityDetail.foodbankManager },
  { name: "교통안전조사원", path: ROUTE.projects.capacityDetail.trafficSurveyor },
];

export default async function CapacityMain() {
  const dbItems = await getBusinessMenuItems("capacity");

  const tabList =
    dbItems.length > 0
      ? dbItems.map((item) => ({
          name: item.name,
          path: `/projects/capacity-detail/${item.slug}`,
        }))
      : FALLBACK_TABS;

  return (
    <div className="py-8 md:py-10 max-w-screen-lg mx-auto text-gray-800">
      <Title text="노인역량활용사업" />

      <div className="mt-6 md:mt-10">
        <DynamicProjectTab tabs={tabList} />
      </div>

      <div className="mt-8 md:mt-14">
        <h2 className="text-blue-700 text-lg md:text-2xl font-bold mb-3 md:mb-4">
          사회서비스형 사업이란?
        </h2>
        <div className="space-y-2 md:space-y-3 text-sm md:text-[17px] leading-relaxed">
          <p>
            <strong className="font-semibold">사업의 정의</strong>: 노인의
            경력과 활동역량을 활용하여 사회적 도움이 필요한 영역(지역사회 돌봄,
            안전 등)에 서비스를 제공하는 일자리
          </p>
          <p>
            <strong className="font-semibold">사업기간</strong>: 2025년 1월 ~
            10월 (10개월)
          </p>
          <p>
            <strong className="font-semibold">사업대상</strong>: 인천시 남동구
            거주 만 65세 이상 사업특성 적합자
            <br />
            <span className="text-xs md:text-sm text-gray-600 ml-2">
              ※ 일부 유형 만 60세 이상 참여 가능
            </span>
          </p>
          <p>
            <strong className="font-semibold">활동시간 / 활동비</strong>: 주
            소정근로시간 15시간 (월 60시간, 4주)
            <br />/ 만근 시 761,040원
          </p>
        </div>
      </div>
    </div>
  );
}
