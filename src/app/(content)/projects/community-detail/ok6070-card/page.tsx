import CardImage from "@/assets/images/community/cardDeliver.png";
import DynamicBusinessImage from "@/components/DynamicBusinessImage";

export default function Card() {
  return (
    <DynamicBusinessImage fallbackImage={CardImage} alt="카드배송" />
  );
}
