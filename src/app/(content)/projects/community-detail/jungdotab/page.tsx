// app/(content)/projects/capacity-detail/consumer-monitor/page.tsx
import Image from "next/image";

import jungdodam from "@/assets/images/community/jungdodam.png";

export default function Jungdodam() {
  return (
    <div className="flex justify-center">
      <div className="relative w-[700px] h-auto">
        <Image
          src={jungdodam}
          alt="jungdodam"
          className="rounded-lg shadow"
          width={700}
          height={500}
        />
      </div>
    </div>
  );
}