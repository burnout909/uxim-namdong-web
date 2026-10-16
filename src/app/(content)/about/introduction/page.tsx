// app/(content)/about/introduction/page.tsx
import Title from "@/components/Title";
import FamilyImage from "@/assets/images/about/family.png"
import Image from "next/image"

export default function Introduction() {
  const jobTypes = [
    {
      title: "공익활동사업",
      description: "자기만족과 성취감을 높이며, 지역사회에 기여하는 봉사활동",
    },
    {
      title: "사회서비스형",
      description: "지역 돌봄, 안전 등 사회적 도움이 필요한 분야에 서비스 제공",
    },
    {
      title: "시장형사업",
      description: "소규모 매장, 전문업종 등을 공동 운영하여 일자리 창출",
    },
    {
      title: "취업형사업",
      description: "일정 교육 수료자를 민간 수요처에 연계하는 맞춤형 취업지원",
    },
  ];

  return (
    <div className="py-8 md:py-12 max-w-screen-lg mx-auto">
      <Title text="시니어클럽 소개" />

      {/* 메인 소개 섹션 */}
      <div className="mt-8 md:mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-start">
          {/* 텍스트 영역 */}
          <div className="text-gray-800 leading-relaxed text-[16px] space-y-6">
            <p>
              <strong className="font-semibold text-gray-900">시니어클럽</strong>은
              「노인복지법」 제23조의2에 따라 설치 및 운영되는
              <strong className="font-semibold text-gray-900">
                {" "}
                노인일자리 전담기관
              </strong>
              으로서, 만 60세 이상 노인에게 적합한 일자리를 발굴 및 제공하여
              <strong className="font-semibold text-gray-900"> 소득창출과 사회참여</strong>를
              지원하고, 노인의 삶의 질 향상과 지역사회 공익증진을 목표로 하고
              있습니다.
            </p>
            <p>
              국가 및 지방자치단체는 노인의 능력과 적성에 맞는 다양한 일자리를
              제공하기 위해 시니어클럽을 통해 전담적으로 사업을 추진하며, 운영에
              필요한 사항은
              <strong className="font-semibold text-gray-900"> 보건복지부장관의 고시</strong>로
              정해집니다.
            </p>
          </div>

          {/* 이미지 영역 */}
          <div className="w-full">
            <div className="relative w-full h-[300px] rounded-md overflow-hidden border border-gray-200">
              <Image
                src={FamilyImage}
                alt="가족 배너 이미지"
                fill
                priority
                className="object-cover object-center"
              />

            </div>
            <p className="mt-4 pl-4 border-l-2 border-[#003675] text-[#003675] text-base md:text-lg font-semibold">
              "활기찬 제2의 인생을 선물합니다!"
            </p>
          </div>
        </div>
      </div>

      {/* 일자리 유형 섹션 */}
      <div className="mt-12 md:mt-20">
        <h3 className="text-lg md:text-xl font-bold mb-4 md:mb-5 text-gray-900">
          노인일자리 사업 유형
        </h3>

        <div className="grid grid-cols-2 lg:grid-cols-4 border-t-2 border-t-[#003675] border-b border-b-gray-200">
          {jobTypes.map((job, i) => (
            <div
              key={job.title}
              className={`p-4 md:p-6 border-gray-200 ${i % 2 === 1 ? "border-l" : ""} ${i >= 2 ? "border-t lg:border-t-0" : ""} ${i === 2 ? "lg:border-l" : ""}`}
            >
              <h4 className="text-sm md:text-lg font-bold mb-2 md:mb-3 text-[#003675]">{job.title}</h4>
              <p className="text-xs md:text-sm leading-relaxed text-gray-700">{job.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}