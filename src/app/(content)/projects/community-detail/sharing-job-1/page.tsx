import common from "@/assets/images/community/sarang.png";
import DynamicBusinessImage from "@/components/DynamicBusinessImage";

export default function Common() {
  return (
    <DynamicBusinessImage fallbackImage={common} alt="공동작업장" />
  );
}
