import Link from "next/link";
import FigmaLibraryIcon from "@/assets/icons/figma_library.svg";
import LocationIcon from "@/assets/icons/location_away.svg";
import IdentityIcon from "@/assets/icons/identity.svg";
import MapIcon from "@/assets/icons/map.svg";

interface QuickLinkCardProps {
  label: string;
  to: string;
}

export default function QuickLinkCard({ label, to }: QuickLinkCardProps) {
  let IconComponent;

  switch (label) {
    case "기관소개":
      IconComponent = <FigmaLibraryIcon width={40} height={40} className="text-white" />;
      break;
    case "일자리 사업소개":
      IconComponent = <LocationIcon width={40} height={40} className="text-white" />;
      break;
    case "나에게 맞는 일자리":
      IconComponent = <IdentityIcon width={40} height={40} className="text-white" />;
      break;
    case "생산품":
      IconComponent = <MapIcon width={40} height={40} className="text-white" />;
      break;
    default:
      IconComponent = null;
  }

  return (
    <Link
      href={to}
      className="flex flex-col items-center hover:opacity-80"
    >
      {IconComponent ? (
        IconComponent
      ) : (
        <div className="text-4xl">★</div>
      )}
      <div className="mt-2 text-lg">{label}</div>
    </Link>
  );
}
