import TrafficImage from "@/assets/images/capacity/traffic.png";
import DynamicBusinessImage from "@/components/DynamicBusinessImage";

export default function Traffic() {
  return (
    <DynamicBusinessImage fallbackImage={TrafficImage} alt="교통관리사" />
  );
}
