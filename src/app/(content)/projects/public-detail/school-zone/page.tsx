import schoolGuard from "@/assets/images/public/schoolGuard.png";
import DynamicBusinessImage from "@/components/DynamicBusinessImage";

export default function SchoolGuard() {
  return (
    <DynamicBusinessImage fallbackImage={schoolGuard} alt="schoolGuard" />
  );
}
