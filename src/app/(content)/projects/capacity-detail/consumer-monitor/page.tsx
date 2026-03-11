import ConsumerMonitorImage from "@/assets/images/capacity/monitor.png";
import DynamicBusinessImage from "@/components/DynamicBusinessImage";

export default function ConsumerMonitor() {
  return (
    <DynamicBusinessImage fallbackImage={ConsumerMonitorImage} alt="시니어소비피해예방모니터요원" />
  );
}
