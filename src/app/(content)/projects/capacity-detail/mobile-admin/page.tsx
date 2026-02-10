// app/(content)/projects/capacity-detail/consumer-monitor/page.tsx
import Image from "next/image";

import OfficeImage from "@/assets/images/capacity/office.png";

export default function Moblile() {
  return (
    <div className="flex justify-center">
      <div className="relative w-full max-w-[700px] h-auto">
        <Image
          src={OfficeImage}
          alt="모바일도우미"
          className="rounded-lg shadow"
          width={700}
          height={500}
        />
      </div>
    </div>
  );
}