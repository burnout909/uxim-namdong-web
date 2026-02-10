// app/(content)/projects/capacity-detail/consumer-monitor/page.tsx
import Image from "next/image";

import LocalGuardImage from "@/assets/images/public/localGuard.png";

export default function LocalGuard() {
  return (
    <div className="flex justify-center">
      <div className="relative w-full max-w-[700px] h-auto">
        <Image
          src={LocalGuardImage}
          alt="LocalGuard"
          className="rounded-lg shadow"
          width={700}
          height={500}
        />
      </div>
    </div>
  );
}