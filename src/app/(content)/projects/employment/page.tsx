// app/(content)/projects/employment/page.tsx
import Image from "next/image";
import Title from "@/components/Title";

import ConnectJobImage from "@/assets/images/employment/connectJob.png";

export default function Employment() {
  return (
    <div className="px-6 md:px-10 py-10 max-w-screen-lg mx-auto text-gray-800">
      <Title text="취업지원사업" />

      {/* 사업 소개 */}
      <div className="mt-8">
        <h2 className="text-blue-700 text-xl md:text-2xl font-bold mb-4">
          취업알선형이란?
        </h2>
        <div className="space-y-3 pl-2 text-[16px] md:text-[17px] leading-relaxed">
          <p>
            <strong className="font-semibold">사업의 정의</strong>: 수요처의
            요구에 의해서 일정 교육을 수료하거나 관련된 업무능력이 있는 자를
            해당 수요처로 연계하여 근무기간에 대한 일정 임금을 지급받을 수 있는
            일자리
          </p>
          <p>
            <strong className="font-semibold">사업대상</strong>: <br />·{" "}
            <strong>구인처</strong>: 어르신 인력이 필요한 개인, 단체, 사업체
            <br />· <strong>구직자</strong>: 인천시 만 60세 이상 건강한 어르신
          </p>
          <p>
            <strong className="font-semibold">활동시간 / 활동일</strong>:
            구인업체 현황에 따라 상이함
          </p>
          <p>
            <strong className="font-semibold">활동지역</strong>: 인천시 내
          </p>
          <p>
            <strong className="font-semibold">활동내용</strong>: 아파트, 상가,
            대학교, 공원, 시설관리 등 경비, 미화직 등
          </p>
          <p>
            <strong className="font-semibold">활동인원</strong>: 배정인원 238명
          </p>
          <p>
            <strong className="font-semibold">활동비</strong>: 수요처 약정 급여
          </p>
        </div>
      </div>
      
      <div className="max-w-screen-md mx-auto px-4">
        <div className="!mt-10 flex justify-center">
          <div className="relative w-full max-w-[700px] h-auto">
            <Image
              src={ConnectJobImage}
              alt="취업알선형"
              className="rounded-lg shadow"
              width={700}
              height={500}
            />
          </div>
        </div>
      </div>
    </div>
  );
}