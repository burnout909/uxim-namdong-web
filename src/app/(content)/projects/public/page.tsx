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

      <div className="mt-8 md:mt-14">
        <h2 className="text-blue-700 text-lg md:text-2xl font-bold mb-3 md:mb-4">
          {c.sectionTitle}
        </h2>
        <div className="space-y-2 md:space-y-3 text-sm md:text-[17px] leading-relaxed">
          <p>
            <strong className="font-semibold">사업의 정의</strong>: {c.definition}
          </p>
          <p>
            <strong className="font-semibold">사업기간</strong>: {c.period}
          </p>
          <p>
            <strong className="font-semibold">참여대상</strong>: {c.target}
            {c.targetNote && (
              <>
                <br />
                <span className="text-xs md:text-sm text-gray-600 ml-2">
                  ※ {c.targetNote}
                </span>
              </>
            )}
          </p>
          <p>
            <strong className="font-semibold">활동횟수 / 활동비</strong>: {c.activity}
            {c.activityNote && (
              <>
                <br />
                <span className="text-xs md:text-sm text-gray-600 ml-2">
                  ※ {c.activityNote}
                </span>
              </>
            )}
          </p>
        </div>
      </div>

      {hasApplicationInfo && (
        <>
          <div className="border-t border-gray-300 my-6 md:my-10" />

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 md:p-6 shadow-sm">
            <h2 className="text-base md:text-xl font-bold text-blue-800 mb-3 md:mb-4">
              신청 안내
            </h2>
            <ul className="space-y-2 text-sm md:text-[16px] leading-relaxed">
              {c.documents && (
                <li>
                  ● <strong>구비서류</strong>: {c.documents}
                </li>
              )}
              {c.method && (
                <li>
                  ● <strong>신청방법</strong>: {c.method}
                </li>
              )}
              {c.exclusions && (
                <li>
                  ● <strong>제외대상</strong>:
                  <ul className="ml-4 list-disc list-inside mt-1">
                    {c.exclusions.split("\n").filter(Boolean).map((item: string, i: number) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </li>
              )}
            </ul>
            {c.notice && (
              <p className="text-xs md:text-[14px] mt-3 md:mt-4 text-blue-600">
                ※ {c.notice}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
