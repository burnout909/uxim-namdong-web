// app/(content)/projects/capacity-detail/consumer-monitor/page.tsx
import Image from "next/image";

import BookImage from "@/assets/images/capacity/book.png";

export default function BookDelivery() {
  return (
    <div className="flex justify-center">
      <div className="relative w-full max-w-[700px] h-auto">
        <Image
          src={BookImage}
          alt="북딜리버리"
          className="rounded-lg shadow"
          width={700}
          height={500}
        />
      </div>
    </div>
  );
}