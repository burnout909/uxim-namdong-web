import Title from "@/components/Title";
import { ROUTE } from "@/constants/route";
import { getBusinessMenuItems } from "@/services/businessService";
import DynamicProjectTab from "@/components/DynamicProjectTab";
import { createClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const FALLBACK_TABS = [
  { name: "OK! 6070 아파트택배(구월)", path: ROUTE.projects.communityDetail.ok6070Apartment1 },
  { name: "OK! 6070 아파트택배(논현)", path: ROUTE.projects.communityDetail.ok6070Apartment2 },
  { name: "청소년건강지킴이", path: ROUTE.projects.communityDetail.studentHealth },
  { name: "OK 6070 카드형", path: ROUTE.projects.communityDetail.ok6070Card },
  { name: "복지카페매니저(센터)", path: ROUTE.projects.communityDetail.yettunCafe1 },
  { name: "복지카페매니저(소래점)", path: ROUTE.projects.communityDetail.yettunCafe2 },
  { name: "공동작업장-1", path: ROUTE.projects.communityDetail.sharingJob1 },
  { name: "공동작업장-2", path: ROUTE.projects.communityDetail.sharingJob2 },
  { name: "도시락배송지원", path: ROUTE.projects.communityDetail.jungdotab },
  { name: "학교급식지원", path: ROUTE.projects.communityDetail.schoolMeal },
  { name: "ESG환경지킴이", path: ROUTE.projects.communityDetail.ourESG },
];

const DEFAULTS = {
  sectionTitle: "시장형 사업이란?",
  definition: "노인에게 적합한 업종 중 소규모 매장 및 전문 직종 사업단 등을 공동으로 운영하여 일자리를 창출하는 사업. 일정기간 사업비 또는 참여자 인건비 일부를 보충 지원하고, 추가 소득으로 연중 운영하는 노인 일자리",
  period: "2025년 1월 ~ 12월 (연중)",
  target: "인천시 남동구 거주 만 60세 이상 사업특성 적합자",
  targetNote: "",
  activity: "일 2.5시간 / 시급 적용",
  activityNote: "수요처 계약에 따라 달라질 수 있음",
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
      .eq("config_key", "business_page_community")
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

export default async function CommunityMain() {
  const dbItems = await getBusinessMenuItems("community");
  const c = await getPageContent();

  const tabList =
    dbItems.length > 0
      ? dbItems.map((item) => ({
          name: item.name,
          path: `/projects/community-detail/${item.slug}`,
        }))
      : FALLBACK_TABS;

  const hasApplicationInfo = c.documents || c.method || c.exclusions;

  return (
    <div className="py-8 md:py-10 max-w-screen-lg mx-auto text-gray-800">
      <Title text="공동체사업단" />

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
