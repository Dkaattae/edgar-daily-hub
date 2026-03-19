import { Filing, FORM_TYPES } from "@/data/types";
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

interface TimeSeriesChartProps {
  filings: Filing[];
}

const COLORS = [
  "hsl(174, 72%, 50%)",
  "hsl(38, 92%, 55%)",
  "hsl(262, 60%, 60%)",
  "hsl(340, 65%, 55%)",
  "hsl(150, 60%, 45%)",
  "hsl(215, 50%, 60%)",
  "hsl(30, 70%, 50%)",
];

const TimeSeriesChart = ({ filings }: TimeSeriesChartProps) => {
  // Group filings by hour and form type
  const hourlyData: Record<string, Record<string, number>> = {};

  filings.forEach((f) => {
    const hour = new Date(f.timestamp).getHours();
    const key = `${hour}:00`;
    if (!hourlyData[key]) hourlyData[key] = {};
    hourlyData[key][f.formType] = (hourlyData[key][f.formType] || 0) + 1;
  });

  const chartData = Object.keys(hourlyData)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .map((hour) => ({
      hour,
      ...hourlyData[hour],
    }));

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">Filings by Hour & Type</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 18%, 18%)" />
          <XAxis dataKey="hour" stroke="hsl(215, 15%, 55%)" fontSize={12} />
          <YAxis stroke="hsl(215, 15%, 55%)" fontSize={12} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(220, 22%, 10%)",
              border: "1px solid hsl(220, 18%, 18%)",
              borderRadius: "8px",
              color: "hsl(210, 20%, 90%)",
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: "hsl(215, 15%, 55%)" }} />
          {FORM_TYPES.map((type, i) => (
            <Line
              key={type}
              type="monotone"
              dataKey={type}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TimeSeriesChart;
