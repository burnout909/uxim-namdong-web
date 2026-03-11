import Image from "next/image";
import Title from "@/components/Title";
import { createClient } from "@/lib/supabase";
import { generateDownloadUrl } from "@/app/service/s3";
import ConnectJobImage from "@/assets/images/employment/connectJob.png";

export const dynamic = "force-dynamic";

const DEFAULTS = {
  sectionTitle: "취업알선형이란?",
  definition: "수요처의 요구에 의해서 일정 교육을 수료하거나 관련된 업무능력이 있는 자를 해당 수요처로 연계하여 근무기간에 대한 일정 임금을 지급받을 수 있는 일자리",
  targetEmployer: "어르신 인력이 필요한 개인, 단체, 사업체",
  targetJobseeker: "인천시 만 60세 이상 건강한 어르신",
  activityTime: "구인업체 현황에 따라 상이함",
  activityArea: "인천시 내",
  activityContent: "아파트, 상가, 대학교, 공원, 시설관리 등 경비, 미화직 등",
  activityCount: "배정인원 238명",
  activityPay: "수요처 약정 급여",
};

async function getPageContent() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("SITE_CONFIG")
      .select("config_value")
      .eq("config_key", "business_page_employment")
      .single();
    if (data?.config_value) {
      const parsed = JSON.parse(data.config_value);
      let imageUrl: string | null = null;
      if (parsed._imageKey && parsed._imageBucket) {
        imageUrl = await generateDownloadUrl(parsed._imageBucket, parsed._imageKey);
      }
      return { ...DEFAULTS, ...parsed, _dynamicImageUrl: imageUrl };
    }
  } catch { /* fallback */ }
  return { ...DEFAULTS, _dynamicImageUrl: null };
}

function InfoField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-50 rounded-lg px-4 py-3 md:px-5 md:py-4">
      <p className="text-xs md:text-sm font-semibold text-gray-500 mb-1">{label}</p>
      <div className="text-sm md:text-[16px] text-gray-900 leading-relaxed">{children}</div>
    </div>
  );
}

export default async function Employment() {
  const c = await getPageContent();

  return (
    <div className="py-8 md:py-10 max-w-screen-lg mx-auto text-gray-800">
      <Title text="취업지원사업" />

      <div className="mt-8 md:mt-14 bg-white border border-gray-200 rounded-xl p-5 md:p-8">
        <h2 className="text-blue-700 text-lg md:text-2xl font-bold mb-5 md:mb-6">
          {c.sectionTitle}
        </h2>
        <div className="space-y-3 md:space-y-4">
          <InfoField label="사업의 정의">{c.definition}</InfoField>
          <InfoField label="사업대상">
            <p>· <strong>구인처</strong>: {c.targetEmployer}</p>
            <p>· <strong>구직자</strong>: {c.targetJobseeker}</p>
          </InfoField>
          <InfoField label="활동시간 / 활동일">{c.activityTime}</InfoField>
          <InfoField label="활동지역">{c.activityArea}</InfoField>
          <InfoField label="활동내용">{c.activityContent}</InfoField>
          <InfoField label="활동인원">{c.activityCount}</InfoField>
          <InfoField label="활동비">{c.activityPay}</InfoField>
        </div>
      </div>

      <div className="max-w-screen-md mx-auto">
        <div className="mt-6 md:mt-8 flex justify-center">
          <div className="relative w-full max-w-[700px] h-auto">
            {c._dynamicImageUrl ? (
              <img
                src={c._dynamicImageUrl}
                alt="취업알선형"
                className="rounded-lg shadow w-full h-auto"
              />
            ) : (
              <Image
                src={ConnectJobImage}
                alt="취업알선형"
                className="rounded-lg shadow"
                width={700}
                height={500}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
