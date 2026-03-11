import BookImage from "@/assets/images/capacity/book.png";
import DynamicBusinessImage from "@/components/DynamicBusinessImage";

export default function BookDelivery() {
  return (
    <DynamicBusinessImage fallbackImage={BookImage} alt="북딜리버리" />
  );
}
