interface ParticipationStepCardProps {
  step: string;
  description: string;
}

export default function ParticipationStepCard({
  step,
  description,
}: ParticipationStepCardProps) {
  return (
    <div className="border p-4 rounded flex flex-col items-center">
      <div className="text-lg font-semibold mb-2">{step}</div>
      <div className="text-gray-500 text-xs">{description}</div>
    </div>
  );
}
