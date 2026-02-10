// app/(content)/projects/capacity-detail/consumer-monitor/page.tsx
import Image from "next/image";

import GuardImage from "@/assets/images/public/guard.png";

export default function Guard() {
  return (
    <div className="flex justify-center">
      <div className="relative w-full max-w-[700px] h-auto">
        <Image
          src={GuardImage}
          alt="guard"
          className="rounded-lg shadow"
          width={700}
          height={500}
        />
      </div>
    </div>
  );
}