import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  /** One plain sentence under the number. */
  hint: string;
  icon: LucideIcon;
  /** Colour class: stat-cyan, stat-violet, stat-blue, stat-amber, stat-coral. */
  tone: string;
}

/** One number card in the stats row at the top of Live traffic. */
export default function StatCard({ label, value, hint, icon: Icon, tone }: StatCardProps) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${tone}`}>
        <Icon />
      </div>
      <div className="stat-detail">
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{hint}</small>
      </div>
    </article>
  );
}
