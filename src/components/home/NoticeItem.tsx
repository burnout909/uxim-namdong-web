interface NoticeItemProps {
  title: string;
  date: string;
}

export default function NoticeItem({ title, date }: NoticeItemProps) {
  return (
    <li className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0 group">
      <span className="text-gray-700 group-hover:text-blue-600 transition-colors truncate pr-4 flex-1">
        {title}
      </span>
      <span className="text-gray-400 text-xs whitespace-nowrap">{date}</span>
    </li>
  );
}
