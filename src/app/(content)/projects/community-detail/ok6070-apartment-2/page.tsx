// app/(content)/projects/capacity-detail/consumer-monitor/page.tsx
import Image from "next/image";

import OK2Image from "@/assets/images/community/nonhyunapartment.png";

export default function OK2() {
  return (
    <div className="flex justify-center">
      <div className="relative w-[700px] h-auto">
        <Image
          src={OK2Image}
          alt="OK2"
          className="rounded-lg shadow"
          width={700}
          height={500}
        />
      </div>
    </div>
  );
}