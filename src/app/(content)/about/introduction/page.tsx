import Title from "@/components/Title";
import FamilyImage from "@/assets/images/about/family.png"
import Image from "next/image"

export default function Introduction() {
  const jobTypes = [
    {
      title: "공익활동사업",
      description: "자기만족과 성취감을 높이며, 지역사회에 기여하는 봉사활동",
      bgColor: "bg-[#fceee9]", // 크림 오렌지
    },
    {
      title: "사회서비스형",
      description: "지역 돌봄, 안전 등 사회적 도움이 필요한 분야에 서비스 제공",
      bgColor: "bg-[#e7f0fa]", // 소프트 블루
    },
    {
      title: "시장형사업",
      description: "소규모 매장, 전문업종 등을 공동 운영하여 일자리 창출",
      bgColor: "bg-[#e6f5ee]", // 세이지 그린
    },
    {
      title: "취업형사업",
      description: "일정 교육 수료자를 민간 수요처에 연계하는 맞춤형 취업지원",
      bgColor: "bg-[#fbeaec]", // 연한 핑크 + 코럴 느낌
    },
  ];

  return (
    <div className="px-4 py-12 max-w-screen-xl mx-auto">
      <Title text="시니어클럽 소개" />

      {/* 소개 영역 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mt-12">
        {/* 텍스트 소개 */}
        <div className="text-gray-800 leading-relaxed text-[16px] space-y-6">
          <p>
            <strong className="font-semibold">시니어클럽</strong>은
            「노인복지법」 제23조의2에 따라 설치·운영되는
            <span className="text-blue-600 font-medium">
              {" "}
              노인일자리 전담기관
            </span>
            으로서, 만 60세 이상 노인에게 적합한 일자리를 발굴·제공하여
            <strong className="font-semibold"> 소득창출과 사회참여</strong>를
            지원하고, 노인의 삶의 질 향상과 지역사회 공익증진을 목표로 하고
            있습니다.
          </p>
          <p>
            국가 및 지방자치단체는 노인의 능력과 적성에 맞는 다양한 일자리를
            제공하기 위해 시니어클럽을 통해 전담적으로 사업을 추진하며, 운영에
            필요한 사항은
            <strong className="font-semibold"> 보건복지부장관의 고시</strong>로
            정해집니다.
          </p>
        </div>

        {/* 시각적 배너 */}
        <div className="w-full h-[300px] rounded-xl relative overflow-hidden shadow">
          <Image
            src={FamilyImage}
            alt="가족 배너 이미지"
            fill
            priority
            className="object-cover object-center"
          />

          {/* 파란 반투명 배경 텍스트 박스 */}
          <div className="absolute top-4 left-1/5 transform -translate-x-1/2 bg-green-500/40 text-white px-4 py-2 rounded-md text-sm md:text-lg font-semibold shadow">
            “활기찬 제2의 인생을 선물합니다!”
          </div>
        </div>

        {/* 일자리 유형 */}
        <div className="mt-20">
          <h3 className="text-xl font-bold !mb-10 text-center text-gray-800">
            노인일자리 사업 유형
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {jobTypes.map((job) => (
              <div
                key={job.title}
                className={`${job.bgColor} text-gray-800 p-6 rounded-xl shadow hover:scale-105 transition`}
              >
                <h4 className="text-lg font-bold mb-2">{job.title}</h4>
                <p className="text-sm leading-relaxed">{job.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
