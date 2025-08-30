// app/(content)/projects/capacity-detail/consumer-monitor/page.tsx
import Image from "next/image";

import school from "@/assets/images/community/schoolFood.png";

export default function School() {
  return (
    <div className="flex justify-center">
      <div className="relative w-[700px] h-auto">
        <Image
          src={school}
          alt="schoolmeal"
          className="rounded-lg shadow"
          width={700}
          height={500}
        />
      </div>
    </div>
  );
}