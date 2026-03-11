import StudentImage from "@/assets/images/community/studentHealth.png";
import DynamicBusinessImage from "@/components/DynamicBusinessImage";

export default function Student() {
  return (
    <DynamicBusinessImage fallbackImage={StudentImage} alt="학생건강지킴이" />
  );
}
