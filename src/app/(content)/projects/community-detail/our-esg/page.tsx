import ESG from "@/assets/images/community/resourceUsage.png";
import DynamicBusinessImage from "@/components/DynamicBusinessImage";

export default function Esg() {
  return (
    <DynamicBusinessImage fallbackImage={ESG} alt="esg" />
  );
}
