// app/(content)/projects/capacity-detail/consumer-monitor/page.tsx
import Image from "next/image";

import yettunImage2 from "@/assets/images/community/yettunCafeSorae.png";

export default function yettun2() {
  return (
    <div className="flex justify-center">
      <div className="relative w-full max-w-[700px] h-auto">
        <Image
          src={yettunImage2}
          alt="예뜰2"
          className="rounded-lg shadow"
          width={700}
          height={500}
        />
      </div>
    </div>
  );
}