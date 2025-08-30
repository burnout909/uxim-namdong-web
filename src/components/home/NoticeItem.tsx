interface NoticeItemProps {
  title: string;
  date: string;
}

export default function NoticeItem({ title, date }: NoticeItemProps) {
  return (
    <li className="flex justify-between border-b pb-1">
      <span>{title}</span>
      <span>{date}</span>
    </li>
  );
}
