// app/(content)/projects/capacity-detail/consumer-monitor/page.tsx
import Image from "next/image";

import FacilityImage from "@/assets/images/public/safe.png";

export default function Facility() {
  return (
    <div className="flex justify-center">
      <div className="relative w-full max-w-[700px] h-auto">
        <Image
          src={FacilityImage}
          alt="시설"
          className="rounded-lg shadow"
          width={700}
          height={500}
        />
      </div>
    </div>
  );
}