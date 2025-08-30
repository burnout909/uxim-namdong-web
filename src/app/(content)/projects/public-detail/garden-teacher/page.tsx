// app/(content)/projects/capacity-detail/consumer-monitor/page.tsx
import Image from "next/image";

import TeacherImage from "@/assets/images/public/teacher.png";

export default function Teacher() {
  return (
    <div className="flex justify-center">
      <div className="relative w-[700px] h-auto">
        <Image
          src={TeacherImage}
          alt="teacher"
          className="rounded-lg shadow"
          width={700}
          height={500}
        />
      </div>
    </div>
  );
}