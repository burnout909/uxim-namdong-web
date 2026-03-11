import OfficeImage from "@/assets/images/capacity/office.png";
import DynamicBusinessImage from "@/components/DynamicBusinessImage";

export default function Moblile() {
  return (
    <DynamicBusinessImage fallbackImage={OfficeImage} alt="모바일도우미" />
  );
}
