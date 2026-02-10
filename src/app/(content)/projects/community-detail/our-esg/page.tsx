// app/(content)/projects/capacity-detail/consumer-monitor/page.tsx
import Image from "next/image";

import ESG from "@/assets/images/community/resourceUsage.png";

export default function Esg() {
  return (
    <div className="flex justify-center">
      <div className="relative w-full max-w-[700px] h-auto">
        <Image
          src={ESG}
          alt="esg"
          className="rounded-lg shadow"
          width={700}
          height={500}
        />
      </div>
    </div>
  );
}