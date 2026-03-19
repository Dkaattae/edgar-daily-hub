interface SummaryCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
}

const SummaryCard = ({ title, value, subtitle }: SummaryCardProps) => (
  <div className="rounded-lg border border-border bg-card p-5">
    <p className="text-sm text-muted-foreground">{title}</p>
    <p className="mt-1 text-3xl font-semibold font-mono text-foreground">{value}</p>
    {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
  </div>
);

export default SummaryCard;
