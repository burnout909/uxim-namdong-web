'use client'
import { FooterText } from "@/assets/text/FooterText";
import LogoImage from "@/assets/images/logo.png"
import Image from "next/image"

export default function Footer() {
  return (
    <footer className="w-full bg-[#f4f4f4] border-t border-gray-200 py-8 px-20">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
        {/* 왼쪽: 로고 및 정보 */}
        <div className="flex flex-col gap-4">
          <Image src={LogoImage} width={224} height={48} alt="logo" />
          <p className="text-sm text-gray-700">{FooterText.address}</p>
          <p className="text-sm text-gray-900 font-semibold">
            {FooterText.telLabel}
          </p>
        </div>

        {/* 오른쪽: 빈 공간 or 나중에 링크 등 추가 가능 */}
        <div></div>
      </div>

      {/* Copyright 영역 */}
      <div className="mt-8 border-t border-gray-300 pt-4 text-sm text-gray-500">
        {FooterText.copyright}
      </div>
    </footer>
  );
}
