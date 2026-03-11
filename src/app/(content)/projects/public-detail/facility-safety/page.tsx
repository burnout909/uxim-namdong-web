import FacilityImage from "@/assets/images/public/safe.png";
import DynamicBusinessImage from "@/components/DynamicBusinessImage";

export default function Facility() {
  return (
    <DynamicBusinessImage fallbackImage={FacilityImage} alt="시설" />
  );
}
