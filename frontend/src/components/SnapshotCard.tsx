import type { LucideIcon } from "lucide-react";

interface SnapshotCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  tone: "brand" | "warm" | "rain" | "neutral";
}

export function SnapshotCard({ icon: Icon, label, value, tone }: SnapshotCardProps) {
  return (
    <article className={`snapshot-card card snapshot-${tone}`}>
      <div className="snapshot-label-row">
        <span>{label}</span>
        <Icon size={16} />
      </div>
      <strong>{value}</strong>
    </article>
  );
}
