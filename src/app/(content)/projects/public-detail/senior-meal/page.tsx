// app/(content)/projects/capacity-detail/consumer-monitor/page.tsx
import Image from "next/image";

import MealImage from "@/assets/images/public/meal.png";

export default function Meal() {
  return (
    <div className="flex justify-center">
      <div className="relative w-[700px] h-auto">
        <Image
          src={MealImage}
          alt="meal"
          className="rounded-lg shadow"
          width={700}
          height={500}
        />
      </div>
    </div>
  );
}