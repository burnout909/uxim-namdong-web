// app/(content)/projects/capacity-detail/consumer-monitor/page.tsx
import Image from "next/image";

import FinaceImage from "@/assets/images/capacity/coin.png";

export default function FianeSupportor() {
  return (
    <div className="flex justify-center">
      <div className="relative w-full max-w-[700px] h-auto">
        <Image
          src={FinaceImage}
          alt="시니어금융업무지원사업"
          className="rounded-lg shadow"
          width={700}
          height={500}
        />
      </div>
    </div>
  );
}