// app/(content)/projects/capacity-detail/consumer-monitor/page.tsx
import Image from "next/image";

import common2 from "@/assets/images/community/commonWork2.jpg";

export default function Common2() {
  return (
    <div className="flex justify-center">
      <div className="relative w-[700px] h-auto">
        <Image
          src={common2}
          alt="공동작업장2"
          className="rounded-lg shadow"
          width={700}
          height={500}
        />
      </div>
    </div>
  );
}