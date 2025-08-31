// app/(content)/projects/capacity-detail/consumer-monitor/page.tsx
import Image from "next/image";

import OK1Image from "@/assets/images/community/GuwolApartment.png";

export default function OK1() {
  return (
    <div className="flex justify-center">
      <div className="relative w-[700px] h-auto">
        <Image
          src={OK1Image}
          alt="OK1"
          className="rounded-lg shadow"
          width={700}
          height={500}
        />
      </div>
    </div>
  );
}