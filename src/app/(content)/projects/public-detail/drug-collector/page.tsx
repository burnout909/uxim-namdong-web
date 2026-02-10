// app/(content)/projects/capacity-detail/consumer-monitor/page.tsx
import Image from "next/image";

import DrugImage from "@/assets/images/public/drug.png";

export default function Drug() {
  return (
    <div className="flex justify-center">
      <div className="relative w-full max-w-[700px] h-auto">
        <Image
          src={DrugImage}
          alt="esg"
          className="rounded-lg shadow"
          width={700}
          height={500}
        />
      </div>
    </div>
  );
}