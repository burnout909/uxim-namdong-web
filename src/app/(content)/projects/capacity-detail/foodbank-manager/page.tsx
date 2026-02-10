// app/(content)/projects/capacity-detail/consumer-monitor/page.tsx
import Image from "next/image";

import FoodImage from "@/assets/images/capacity/food.png";

export default function Food() {
  return (
    <div className="flex justify-center">
      <div className="relative w-full max-w-[700px] h-auto">
        <Image
          src={FoodImage}
          alt="푸드뱅크관리사"
          className="rounded-lg shadow"
          width={700}
          height={500}
        />
      </div>
    </div>
  );
}