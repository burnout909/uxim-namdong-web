'use client'
import { FooterText } from "@/assets/text/FooterText";
import LogoImage from "@/assets/images/logo.png"
import NamdongLogo from "@/assets/images/partners/namdong.png"
import InnojungLogo from "@/assets/images/partners/innojung.png"
import KordiLogo from "@/assets/images/partners/kordi.png"
import IaswLogo from "@/assets/images/partners/iasw.png"
import Image, { StaticImageData } from "next/image"
import Link from "next/link"

// 파트너 기관 정보
const PARTNER_ORGANIZATIONS: {
  name: string;
  url: string;
  logo: StaticImageData;
}[] = [
  {
    name: "남동구청",
    url: "https://www.namdong.go.kr/",
    logo: NamdongLogo,
  },
  {
    name: "인천광역시노인인력개발센터",
    url: "http://www.innojung.go.kr/",
    logo: InnojungLogo,
  },
  {
    name: "한국노인인력개발원",
    url: "https://www.kordi.or.kr/",
    logo: KordiLogo,
  },
  {
    name: "인천사회복지사협회",
    url: "https://www.iasw.or.kr/",
    logo: IaswLogo,
  },
];

export default function Footer() {
  return (
    <footer className="w-full bg-[#f4f4f4] border-t border-gray-200 min-w-[1440px] max-w-[1920px] mx-auto">
      {/* 기존 Footer 콘텐츠 */}
      <div className="py-8 px-20">
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
        <div className="mt-8 border-t border-gray-300 pt-4 flex items-center justify-between">
          <span className="text-sm text-gray-500">{FooterText.copyright}</span>
          <div className="flex items-center gap-4">
            {PARTNER_ORGANIZATIONS.map((partner) => (
              <Link
                key={partner.name}
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-70 transition-opacity"
              >
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  height={24}
                  className="h-6 w-auto object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100"
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
