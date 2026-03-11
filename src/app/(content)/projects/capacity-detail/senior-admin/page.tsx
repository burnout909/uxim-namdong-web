import HelperImage from "@/assets/images/capacity/helper.png";
import DynamicBusinessImage from "@/components/DynamicBusinessImage";

export default function Helper() {
  return (
    <DynamicBusinessImage fallbackImage={HelperImage} alt="행정도우미" />
  );
}
