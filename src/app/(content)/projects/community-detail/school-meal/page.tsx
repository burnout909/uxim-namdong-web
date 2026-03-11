import school from "@/assets/images/community/schoolFood.png";
import DynamicBusinessImage from "@/components/DynamicBusinessImage";

export default function School() {
  return (
    <DynamicBusinessImage fallbackImage={school} alt="schoolmeal" />
  );
}
