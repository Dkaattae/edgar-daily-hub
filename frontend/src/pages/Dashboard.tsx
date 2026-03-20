import { useQuery } from "@tanstack/react-query";
import { fetchDailyCounts, fetchAllDailyCounts } from "@/lib/api";
import { FORM_TYPES } from "@/data/types";
import SummaryCard from "@/components/SummaryCard";
import TimeSeriesChart from "@/components/TimeSeriesChart";

const Dashboard = () => {
  // Latest date counts — used for summary cards
  const { data: countsData = [] } = useQuery({
    queryKey: ["dailyCounts"],
    queryFn: fetchDailyCounts,
  });

  // All-date counts — used for the time series chart
  const { data: allCounts = [] } = useQuery({
    queryKey: ["allDailyCounts"],
    queryFn: fetchAllDailyCounts,
  });

  const countsByType = FORM_TYPES.reduce<Record<string, number>>((acc, t) => {
    acc[t] = countsData.filter((c: any) => c.form_type === t).reduce((sum: number, c: any) => sum + (c.filing_count || 0), 0);
    return acc;
  }, {});

  const totalFilings = countsData.reduce((sum: number, c: any) => sum + (c.filing_count || 0), 0);
  const latestDate = countsData.length > 0 ? countsData[0].date_filed : "No data";

  return (
    <div className="container py-6 space-y-6 flex flex-col min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Left Side: Big Total Card */}
        <div className="lg:col-span-1">
          <SummaryCard 
            title="Total Filings" 
            value={totalFilings} 
            subtitle={latestDate} 
            className="flex flex-col justify-center h-full min-h-[120px]" 
          />
        </div>
        
        {/* Right Side: 2x4 Grid of individual forms */}
        <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          {FORM_TYPES.map((t) => (
            <SummaryCard key={t} title={t} value={countsByType[t] || 0} />
          ))}
        </div>
      </div>

      <TimeSeriesChart countsData={allCounts} />
    </div>
  );
};

export default Dashboard;
