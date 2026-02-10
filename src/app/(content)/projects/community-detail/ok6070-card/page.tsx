// app/(content)/projects/capacity-detail/consumer-monitor/page.tsx
import Image from "next/image";

import CardImage from "@/assets/images/community/cardDeliver.png";

export default function Card() {
  return (
    <div className="flex justify-center">
      <div className="relative w-full max-w-[700px] h-auto">
        <Image
          src={CardImage}
          alt="카드배송"
          className="rounded-lg shadow"
          width={700}
          height={500}
        />
      </div>
    </div>
  );
}