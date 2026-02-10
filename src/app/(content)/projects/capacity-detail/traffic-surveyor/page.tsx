// app/(content)/projects/capacity-detail/consumer-monitor/page.tsx
import Image from "next/image";

import TrafficImage from "@/assets/images/capacity/traffic.png";

export default function Traffic() {
  return (
    <div className="flex justify-center">
      <div className="relative w-full max-w-[700px] h-auto">
        <Image
          src={TrafficImage}
          alt="교통관리사"
          className="rounded-lg shadow"
          width={700}
          height={500}
        />
      </div>
    </div>
  );
}