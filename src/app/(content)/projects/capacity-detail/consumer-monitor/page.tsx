// app/(content)/projects/capacity-detail/consumer-monitor/page.tsx
import Image from "next/image";

import ConsumerMonitorImage from "@/assets/images/capacity/monitor.png";

export default function ConsumerMonitor() {
  return (
    <div className="flex justify-center">
      <div className="relative w-[700px] h-auto">
        <Image
          src={ConsumerMonitorImage}
          alt="시니어소비피해예방모니터요원"
          className="rounded-lg shadow"
          width={700}
          height={500}
        />
      </div>
    </div>
  );
}