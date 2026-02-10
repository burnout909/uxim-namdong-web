interface TitleProps {
  text: string;
}

export default function Title({ text }: TitleProps) {
  return <p className="text-[24px] md:text-[32px] font-semibold text-[#003675]">{text}</p>;
}
