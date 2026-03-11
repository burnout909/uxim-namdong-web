import Title from "@/components/Title";
import OrgImage from "@/assets/images/about/org.png";
import Image from "next/image";
import { createClient } from "@/lib/supabase";
import { generateDownloadUrl } from "@/app/service/s3";

export const dynamic = "force-dynamic";

type StaffRow = {
  id: string;
  position: string;
  count: number;
  order_index: number;
};

async function getOrgChartImage() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("SITE_CONFIG")
      .select("*")
      .eq("config_key", "org_chart_image")
      .maybeSingle();

    if (data?.file_key && data?.bucket) {
      return await generateDownloadUrl(data.bucket, data.file_key);
    }
  } catch {
    // 테이블이 없거나 오류 시 기본 이미지 사용
  }
  return null;
}

async function getStaffComposition(): Promise<StaffRow[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("STAFF_COMPOSITION")
      .select("*")
      .order("order_index", { ascending: true });

    if (!error && data && data.length > 0) {
      return data;
    }
  } catch {
    // 테이블이 없으면 기본 데이터 사용
  }
  return [];
}

// 기본 하드코딩 데이터 (DB 미연결 시 폴백)
const DEFAULT_STAFF = [
  { position: "관장", count: 1 },
  { position: "부장", count: 1 },
  { position: "과장", count: 1 },
  { position: "대리", count: 2 },
  { position: "팀장", count: 1 },
  { position: "주임", count: 1 },
  { position: "사회복지사", count: 18 },
];

export default async function Org() {
  const [orgImageUrl, staffData] = await Promise.all([
    getOrgChartImage(),
    getStaffComposition(),
  ]);

  const staff =
    staffData.length > 0
      ? staffData.map((s) => ({ position: s.position, count: s.count }))
      : DEFAULT_STAFF;

  const totalCount = staff.reduce((acc, s) => acc + s.count, 0);

  return (
    <div className="py-8 md:py-10">
      <Title text="기관 조직도" />

      {/* 조직도 이미지 */}
      <div className="mt-6 flex flex-col md:flex-row justify-center gap-8">
        {orgImageUrl ? (
          <img
            src={orgImageUrl}
            alt="남동시니어클럽 조직도"
            className="w-full rounded shadow"
          />
        ) : (
          <Image
            src={OrgImage}
            alt="남동시니어클럽 조직도"
            className="w-full rounded shadow"
          />
        )}
      </div>

      {/* 인원 구성도 - 모바일용 그리드 */}
      <div className="mt-8 block md:hidden">
        <h3 className="text-base font-bold text-gray-800 mb-4">인원 구성도</h3>
        <div className="grid grid-cols-3 gap-2">
          {staff.map((s, i) => (
            <div
              key={i}
              className={`bg-gray-100 rounded-lg p-3 text-center ${
                i === staff.length - 1 && staff.length % 3 !== 0
                  ? "col-span-2"
                  : ""
              }`}
            >
              <span className="text-xs text-gray-500 block">{s.position}</span>
              <span className="text-lg font-bold text-gray-800">{s.count}</span>
            </div>
          ))}
          <div className="bg-blue-100 rounded-lg p-3 text-center">
            <span className="text-xs text-blue-600 block">계</span>
            <span className="text-lg font-bold text-blue-700">
              {totalCount}
            </span>
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
                {staff.map((s, i) => (
                  <th key={i} className="border px-4 py-2">
                    {s.position}
                  </th>
                ))}
                <th className="border px-4 py-2">계</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border px-4 py-2 font-semibold">인원</td>
                {staff.map((s, i) => (
                  <td key={i} className="border px-4 py-2">
                    {s.count}
                  </td>
                ))}
                <td className="border px-4 py-2 font-bold">{totalCount}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
