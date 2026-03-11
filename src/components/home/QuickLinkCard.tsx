import Link from "next/link";
import FigmaLibraryIcon from "@/assets/icons/figma_library.svg";
import LocationIcon from "@/assets/icons/location_away.svg";
import IdentityIcon from "@/assets/icons/identity.svg";
import MapIcon from "@/assets/icons/map.svg";
import { FaArrowRight } from "react-icons/fa";

interface QuickLinkCardProps {
  label: string;
  to: string;
}

const CARD_STYLES: Record<string, { bg: string; sub: string }> = {
  "기관소개":        { bg: "bg-[#6B917A]", sub: "About Us" },
  "일자리 사업소개":  { bg: "bg-[#8AAD72]", sub: "Job Programs" },
  "나에게 맞는 일자리": { bg: "bg-[#6B917A]", sub: "Find Jobs" },
  "생산품":          { bg: "bg-[#8AAD72]", sub: "Products" },
};

export default function QuickLinkCard({ label, to }: QuickLinkCardProps) {
  const style = CARD_STYLES[label] || { bg: "bg-[#246BEB]", sub: "" };

  let IconComponent;
  switch (label) {
    case "기관소개":
      IconComponent = <FigmaLibraryIcon width={24} height={24} className="text-white" />;
      break;
    case "일자리 사업소개":
      IconComponent = <LocationIcon width={24} height={24} className="text-white" />;
      break;
    case "나에게 맞는 일자리":
      IconComponent = <IdentityIcon width={24} height={24} className="text-white" />;
      break;
    case "생산품":
      IconComponent = <MapIcon width={24} height={24} className="text-white" />;
      break;
    default:
      IconComponent = null;
  }

  return (
    <Link
      href={to}
      className={`group ${style.bg} rounded-xl p-4 md:p-5 flex flex-col justify-between min-h-[110px] md:min-h-[130px] hover:brightness-110 transition-all duration-200 shadow-lg`}
    >
      {/* 상단: 아이콘 + 화살표 */}
      <div className="flex items-start justify-between">
        <div className="w-[40px] h-[40px] md:w-[44px] md:h-[44px] rounded-lg bg-white/20 flex items-center justify-center">
          {IconComponent}
        </div>
        <div className="w-[32px] h-[32px] rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
          <FaArrowRight className="text-white text-xs" />
        </div>
      </div>

      {/* 하단: 텍스트 */}
      <div className="mt-3">
        <p className="text-[14px] md:text-[16px] font-bold text-white leading-tight">{label}</p>
        <p className="text-[11px] md:text-[12px] text-white/60 mt-0.5">{style.sub}</p>
      </div>
    </Link>
  );
}
