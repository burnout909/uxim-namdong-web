import FoodImage from "@/assets/images/capacity/food.png";
import DynamicBusinessImage from "@/components/DynamicBusinessImage";

export default function Food() {
  return (
    <DynamicBusinessImage fallbackImage={FoodImage} alt="푸드뱅크관리사" />
  );
}
