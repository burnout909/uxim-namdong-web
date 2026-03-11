import Title from "@/components/Title";
import { ROUTE } from "@/constants/route";
import { getBusinessMenuItems } from "@/services/businessService";
import DynamicProjectTab from "@/components/DynamicProjectTab";
import { createClient } from "@/lib/supabase";

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

const DEFAULTS = {
  sectionTitle: "사회서비스형 사업이란?",
  definition: "노인의 경력과 활동역량을 활용하여 사회적 도움이 필요한 영역(지역사회 돌봄, 안전 등)에 서비스를 제공하는 일자리",
  period: "2025년 1월 ~ 10월 (10개월)",
  target: "인천시 남동구 거주 만 65세 이상 사업특성 적합자",
  targetNote: "일부 유형 만 60세 이상 참여 가능",
  activity: "주 소정근로시간 15시간 (월 60시간, 4주) / 만근 시 761,040원",
  activityNote: "",
  documents: "",
  method: "",
  exclusions: "",
  notice: "",
};

async function getPageContent() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("SITE_CONFIG")
      .select("config_value")
      .eq("config_key", "business_page_capacity")
      .single();
    if (data?.config_value) {
      return { ...DEFAULTS, ...JSON.parse(data.config_value) };
    }
  } catch { /* fallback */ }
  return DEFAULTS;
}

function InfoField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-50 rounded-lg px-4 py-3 md:px-5 md:py-4">
      <p className="text-xs md:text-sm font-semibold text-gray-500 mb-1">{label}</p>
      <div className="text-sm md:text-[16px] text-gray-900 leading-relaxed">{children}</div>
    </div>
  );
}

export default async function CapacityMain() {
  const dbItems = await getBusinessMenuItems("capacity");
  const c = await getPageContent();

  const tabList =
    dbItems.length > 0
      ? dbItems.map((item) => ({
          name: item.name,
          path: `/projects/capacity-detail/${item.slug}`,
        }))
      : FALLBACK_TABS;

  const hasApplicationInfo = c.documents || c.method || c.exclusions;

  return (
    <div className="py-8 md:py-10 max-w-screen-lg mx-auto text-gray-800">
      <Title text="노인역량활용사업" />

      <div className="mt-6 md:mt-10">
        <DynamicProjectTab tabs={tabList} />
      </div>

      <div className="mt-8 md:mt-14 bg-white border border-gray-200 rounded-xl p-5 md:p-8">
        <h2 className="text-blue-700 text-lg md:text-2xl font-bold mb-5 md:mb-6">
          {c.sectionTitle}
        </h2>
        <div className="space-y-3 md:space-y-4">
          <InfoField label="사업의 정의">{c.definition}</InfoField>
          <InfoField label="사업기간">{c.period}</InfoField>
          <InfoField label="사업대상">
            {c.target}
            {c.targetNote && (
              <span className="block text-xs md:text-sm text-gray-500 mt-1">※ {c.targetNote}</span>
            )}
          </InfoField>
          <InfoField label="활동시간 / 활동비">
            {c.activity}
            {c.activityNote && (
              <span className="block text-xs md:text-sm text-gray-500 mt-1">※ {c.activityNote}</span>
            )}
          </InfoField>
        </div>
      </div>

      {hasApplicationInfo && (
        <div className="mt-4 md:mt-6 bg-blue-50 border border-blue-200 rounded-xl p-5 md:p-8">
          <h2 className="text-base md:text-xl font-bold text-blue-800 mb-5 md:mb-6">
            신청 안내
          </h2>
          <div className="space-y-3 md:space-y-4">
            {c.documents && <InfoField label="구비서류">{c.documents}</InfoField>}
            {c.method && <InfoField label="신청방법">{c.method}</InfoField>}
            {c.exclusions && (
              <InfoField label="제외대상">
                <ul className="list-disc list-inside space-y-0.5">
                  {c.exclusions.split("\n").filter(Boolean).map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </InfoField>
            )}
          </div>
          {c.notice && (
            <p className="text-xs md:text-sm mt-4 md:mt-5 text-blue-600">※ {c.notice}</p>
          )}
        </div>
      )}
    </div>
  );
}
