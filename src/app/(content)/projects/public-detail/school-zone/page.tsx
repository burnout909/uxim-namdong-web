// app/(content)/projects/capacity-detail/consumer-monitor/page.tsx
import Image from "next/image";

import schoolGuard from "@/assets/images/public/schoolGuard.png";

export default function SchoolGuard() {
  return (
    <div className="flex justify-center">
      <div className="relative w-full max-w-[700px] h-auto">
        <Image
          src={schoolGuard}
          alt="schoolGuard"
          className="rounded-lg shadow"
          width={700}
          height={500}
        />
      </div>
    </div>
  );
}