// app/(content)/projects/capacity-detail/consumer-monitor/page.tsx
import Image from "next/image";

import StudentImage from "@/assets/images/community/studentHealth.png";

export default function Student() {
  return (
    <div className="flex justify-center">
      <div className="relative w-[700px] h-auto">
        <Image
          src={StudentImage}
          alt="학생건강지킴이"
          className="rounded-lg shadow"
          width={700}
          height={500}
        />
      </div>
    </div>
  );
}