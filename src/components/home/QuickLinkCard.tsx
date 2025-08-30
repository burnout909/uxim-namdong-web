import Link from "next/link"

interface QuickLinkCardProps {
  label: string;
  to: string;
}

export default function QuickLinkCard({ label, to }: QuickLinkCardProps) {
  return (
    <Link
      href={to}
      className="flex flex-col items-center hover:opacity-80">
      <div className="text-4xl">★</div>
      <div className="mt-2 text-lg">{label}</div>
    </Link>
  );
}
