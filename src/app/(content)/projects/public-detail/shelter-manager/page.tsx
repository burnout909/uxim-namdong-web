import ManagerImage from "@/assets/images/public/manager.png";
import DynamicBusinessImage from "@/components/DynamicBusinessImage";

export default function Manager() {
  return (
    <DynamicBusinessImage fallbackImage={ManagerImage} alt="manager" />
  );
}
