import { useQuery } from "@tanstack/react-query";
import { fetchDailyCounts, fetchFilingsByTicker } from "@/lib/api";
import { FORM_TYPES } from "@/data/types";
import SummaryCard from "@/components/SummaryCard";
import TimeSeriesChart from "@/components/TimeSeriesChart";
import FilingsTable from "@/components/FilingsTable";

const defaultTickers = "AAPL,MSFT,GOOGL,AMZN,TSLA,META,NVDA,JPM,V";

const Dashboard = () => {
  const { data: countsData = [] } = useQuery({
    queryKey: ["dailyCounts"],
    queryFn: fetchDailyCounts,
  });

  const { data: filings = [] } = useQuery({
    queryKey: ["recentFilings"],
    queryFn: () => fetchFilingsByTicker(defaultTickers),
  });

  const sorted = [...filings].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const countsByType = FORM_TYPES.reduce<Record<string, number>>((acc, t) => {
    acc[t] = countsData.filter((c: any) => c.form_type === t).reduce((sum: number, c: any) => sum + (c.filing_count || 0), 0);
    return acc;
  }, {});

  const totalFilings = countsData.reduce((sum: number, c: any) => sum + (c.filing_count || 0), 0);

  return (
    <div className="container py-6 space-y-6 flex flex-col min-h-screen">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="col-span-2">
          <SummaryCard title="Total Filings" value={totalFilings} subtitle="All form types natively loaded from MotherDuck!" />
        </div>
        {FORM_TYPES.map((t) => (
          <SummaryCard key={t} title={t} value={countsByType[t] || 0} />
        ))}
      </div>

      <TimeSeriesChart filings={filings} />

      <FilingsTable filings={sorted} title="Recent Filings" />
    </div>
  );
};

export default Dashboard;
