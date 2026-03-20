interface SummaryCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  className?: string;
}

const SummaryCard = ({ title, value, subtitle, className = "" }: SummaryCardProps) => (
  <div className={`rounded-lg border border-border bg-card p-5 ${className}`}>
    <p className="text-sm text-muted-foreground">{title}</p>
    <p className="mt-1 text-3xl font-semibold font-mono text-foreground">{value}</p>
    {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
  </div>
);

export default SummaryCard;
