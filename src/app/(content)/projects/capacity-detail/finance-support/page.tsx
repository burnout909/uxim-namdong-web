import FinaceImage from "@/assets/images/capacity/coin.png";
import DynamicBusinessImage from "@/components/DynamicBusinessImage";

export default function FianeSupportor() {
  return (
    <DynamicBusinessImage fallbackImage={FinaceImage} alt="시니어금융업무지원사업" />
  );
}
