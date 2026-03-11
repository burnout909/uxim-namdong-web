import DrugImage from "@/assets/images/public/drug.png";
import DynamicBusinessImage from "@/components/DynamicBusinessImage";

export default function Drug() {
  return (
    <DynamicBusinessImage fallbackImage={DrugImage} alt="esg" />
  );
}
