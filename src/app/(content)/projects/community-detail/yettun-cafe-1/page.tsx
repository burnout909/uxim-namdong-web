// app/(content)/projects/capacity-detail/consumer-monitor/page.tsx
import Image from "next/image";

import yettunImage from "@/assets/images/community/yettunCafeNamdong.png";

export default function yettun() {
  return (
    <div className="flex justify-center">
      <div className="relative w-[700px] h-auto">
        <Image
          src={yettunImage}
          alt="예뜰"
          className="rounded-lg shadow"
          width={700}
          height={500}
        />
      </div>
    </div>
  );
}