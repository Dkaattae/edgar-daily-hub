import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DailyCount {
  date_filed: string;
  form_type: string;
  filing_count: number;
}

interface TimeSeriesChartProps {
  countsData: DailyCount[];
}

const COLORS = [
  "hsl(174, 72%, 50%)",
  "hsl(38, 92%, 55%)",
  "hsl(262, 60%, 60%)",
  "hsl(340, 65%, 55%)",
  "hsl(150, 60%, 45%)",
  "hsl(215, 50%, 60%)",
  "hsl(30, 70%, 50%)",
  "hsl(0, 60%, 55%)",
];

// Top N form types by total volume, to keep the chart readable
const TOP_N = 7;

const TimeSeriesChart = ({ countsData }: TimeSeriesChartProps) => {
  // Find the top form types by total count
  const totals: Record<string, number> = {};
  countsData.forEach((r) => {
    totals[r.form_type] = (totals[r.form_type] || 0) + r.filing_count;
  });
  const topFormTypes = Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, TOP_N)
    .map(([ft]) => ft);

  // Build chart data: one entry per date with a key per form_type
  const byDate: Record<string, Record<string, number>> = {};
  countsData.forEach((r) => {
    if (!topFormTypes.includes(r.form_type)) return;
    if (!byDate[r.date_filed]) byDate[r.date_filed] = {};
    byDate[r.date_filed][r.form_type] = r.filing_count;
  });

  const chartData = Object.keys(byDate)
    .sort()
    .map((date) => ({ date, ...byDate[date] }));

  // Abbreviate dates on x-axis
  const formatDate = (d: string) => {
    const dt = new Date(d + "T12:00:00");
    return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">
        All Filings by Date &amp; Type (top {TOP_N} form types)
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 18%, 18%)" />
          <XAxis
            dataKey="date"
            stroke="hsl(215, 15%, 55%)"
            fontSize={11}
            tickFormatter={formatDate}
            interval="preserveStartEnd"
          />
          <YAxis stroke="hsl(215, 15%, 55%)" fontSize={11} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(220, 22%, 10%)",
              border: "1px solid hsl(220, 18%, 18%)",
              borderRadius: "8px",
              color: "hsl(210, 20%, 90%)",
              fontSize: 12,
            }}
            labelFormatter={formatDate}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: "hsl(215, 15%, 55%)" }} />
          {topFormTypes.map((type, i) => (
            <Line
              key={type}
              type="monotone"
              dataKey={type}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={2}
              dot={{ r: 2 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TimeSeriesChart;
