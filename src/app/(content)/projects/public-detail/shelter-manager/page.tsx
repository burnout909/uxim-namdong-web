// app/(content)/projects/capacity-detail/consumer-monitor/page.tsx
import Image from "next/image";

import ManagerImage from "@/assets/images/public/manager.png";

export default function Manager() {
  return (
    <div className="flex justify-center">
      <div className="relative w-full max-w-[700px] h-auto">
        <Image
          src={ManagerImage}
          alt="manager"
          className="rounded-lg shadow"
          width={700}
          height={500}
        />
      </div>
    </div>
  );
}