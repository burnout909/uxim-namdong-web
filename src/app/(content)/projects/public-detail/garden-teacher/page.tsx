import TeacherImage from "@/assets/images/public/teacher.png";
import DynamicBusinessImage from "@/components/DynamicBusinessImage";

export default function Teacher() {
  return (
    <DynamicBusinessImage fallbackImage={TeacherImage} alt="teacher" />
  );
}
