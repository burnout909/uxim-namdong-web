// app/(content)/projects/capacity-detail/consumer-monitor/page.tsx
import Image from "next/image";

import HelperImage from "@/assets/images/capacity/helper.png";

export default function Helper() {
  return (
    <div className="flex justify-center">
      <div className="relative w-[700px] h-auto">
        <Image
          src={HelperImage}
          alt="행정도우미"
          className="rounded-lg shadow"
          width={700}
          height={500}
        />
      </div>
    </div>
  );
}