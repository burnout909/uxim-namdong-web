import yettunImage from "@/assets/images/community/yettunCafeNamdong.png";
import DynamicBusinessImage from "@/components/DynamicBusinessImage";

export default function yettun() {
  return (
    <DynamicBusinessImage fallbackImage={yettunImage} alt="예뜰" />
  );
}
