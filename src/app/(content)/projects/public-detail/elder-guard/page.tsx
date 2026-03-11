import GuardImage from "@/assets/images/public/guard.png";
import DynamicBusinessImage from "@/components/DynamicBusinessImage";

export default function Guard() {
  return (
    <DynamicBusinessImage fallbackImage={GuardImage} alt="guard" />
  );
}
