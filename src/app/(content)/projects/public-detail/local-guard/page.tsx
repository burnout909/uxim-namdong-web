import LocalGuardImage from "@/assets/images/public/localGuard.png";
import DynamicBusinessImage from "@/components/DynamicBusinessImage";

export default function LocalGuard() {
  return (
    <DynamicBusinessImage fallbackImage={LocalGuardImage} alt="LocalGuard" />
  );
}
