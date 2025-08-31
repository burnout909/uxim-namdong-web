// app/(content)/projects/capacity-detail/consumer-monitor/page.tsx
import Image from "next/image";

import common from "@/assets/images/community/sarang.png";

export default function Common() {
  return (
    <div className="flex justify-center">
      <div className="relative w-[700px] h-auto">
        <Image
          src={common}
          alt="공동작업장"
          className="rounded-lg shadow"
          width={700}
          height={500}
        />
      </div>
    </div>
  );
}