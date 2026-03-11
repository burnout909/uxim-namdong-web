import MealImage from "@/assets/images/public/meal.png";
import DynamicBusinessImage from "@/components/DynamicBusinessImage";

export default function Meal() {
  return (
    <DynamicBusinessImage fallbackImage={MealImage} alt="meal" />
  );
}
