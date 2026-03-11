import Title from "@/components/Title";
import { ROUTE } from "@/constants/route";
import { getBusinessMenuItems } from "@/services/businessService";
import DynamicProjectTab from "@/components/DynamicProjectTab";
import { createClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const FALLBACK_TABS = [
  { name: "경로당급식지원", path: ROUTE.projects.publicDetail.seniorMeal },
  { name: "경로당시설안전관리요원", path: ROUTE.projects.publicDetail.facilitySafety },
  { name: "노인시설지킴이", path: ROUTE.projects.publicDetail.elderGuard },
  { name: "동네쉼터관리사", path: ROUTE.projects.publicDetail.shelterManager },
  { name: "스쿨존안전지킴이", path: ROUTE.projects.publicDetail.schoolZone },
  { name: "시니어폐의약품수거", path: ROUTE.projects.publicDetail.drugCollector },
  { name: "우리동네안전지킴이", path: ROUTE.projects.publicDetail.localGuard },
  { name: "은빛정원선생님", path: ROUTE.projects.publicDetail.gardenTeacher },
];

const DEFAULTS = {
  sectionTitle: "공익활동사업이란?",
  definition: "노인이 자기만족과 성취감 향상 및 지역사회 공익 증진을 위해 참여하는 봉사활동입니다.",
  period: "2025년 1월 ~ 11월 (총 11개월)",
  target: "인천시 남동구 거주 만 65세 이상의 기초연금 수급자",
  targetNote: "",
  activity: "월 최대 10회 (1회 3시간) / 최대 월 29만 원",
  activityNote: "",
  documents: "주민등록등본 1통, 사진 2매, 신청서 1부, 개인정보동의서",
  method: "방문 접수 (개별 면담 진행)",
  exclusions: "국민기초생활보장법에 의한 생계급여 수급권자\n타 정부부처 일자리 사업 참여자\n건강보험 직장가입자\n장기요양등급 판정자",
  notice: "진행되는 사업은 2024년 확정 내시에 따라 달라질 수 있습니다.",
};

async function getPageContent() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("SITE_CONFIG")
      .select("config_value")
      .eq("config_key", "business_page_public")
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

export default async function PublicService() {
  const dbItems = await getBusinessMenuItems("public");
  const c = await getPageContent();

  const tabList =
    dbItems.length > 0
      ? dbItems.map((item) => ({
          name: item.name,
          path: `/projects/public-detail/${item.slug}`,
        }))
      : FALLBACK_TABS;

  const hasApplicationInfo = c.documents || c.method || c.exclusions;

  return (
    <div className="py-8 md:py-10 max-w-screen-lg mx-auto text-gray-800">
      <Title text="노인공익활동사업" />

      <div className="mt-6 md:mt-10">
        <DynamicProjectTab tabs={tabList} />
      </div>

      {/* 사업 소개 */}
      <div className="mt-8 md:mt-14 bg-white border border-gray-200 rounded-xl p-5 md:p-8">
        <h2 className="text-blue-700 text-lg md:text-2xl font-bold mb-5 md:mb-6">
          {c.sectionTitle}
        </h2>
        <div className="space-y-3 md:space-y-4">
          <InfoField label="사업의 정의">{c.definition}</InfoField>
          <InfoField label="사업기간">{c.period}</InfoField>
          <InfoField label="참여대상">
            {c.target}
            {c.targetNote && (
              <span className="block text-xs md:text-sm text-gray-500 mt-1">※ {c.targetNote}</span>
            )}
          </InfoField>
          <InfoField label="활동횟수 / 활동비">
            {c.activity}
            {c.activityNote && (
              <span className="block text-xs md:text-sm text-gray-500 mt-1">※ {c.activityNote}</span>
            )}
          </InfoField>
        </div>
      </div>

      {/* 신청 안내 */}
      {hasApplicationInfo && (
        <div className="mt-4 md:mt-6 bg-blue-50 border border-blue-200 rounded-xl p-5 md:p-8">
          <h2 className="text-base md:text-xl font-bold text-blue-800 mb-5 md:mb-6">
            신청 안내
          </h2>
          <div className="space-y-3 md:space-y-4">
            {c.documents && (
              <InfoField label="구비서류">{c.documents}</InfoField>
            )}
            {c.method && (
              <InfoField label="신청방법">{c.method}</InfoField>
            )}
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
            <p className="text-xs md:text-sm mt-4 md:mt-5 text-blue-600">
              ※ {c.notice}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
