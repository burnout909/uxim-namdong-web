import OK2Image from "@/assets/images/community/nonhyunapartment.png";
import DynamicBusinessImage from "@/components/DynamicBusinessImage";

export default function OK2() {
  return (
    <DynamicBusinessImage fallbackImage={OK2Image} alt="OK2" />
  );
}
