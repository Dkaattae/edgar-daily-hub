import { mockFilings } from "@/data/mockFilings";
import { FORM_TYPES } from "@/data/types";
import SummaryCard from "@/components/SummaryCard";
import TimeSeriesChart from "@/components/TimeSeriesChart";
import FilingsTable from "@/components/FilingsTable";

const Dashboard = () => {
  const sorted = [...mockFilings].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const countsByType = FORM_TYPES.reduce<Record<string, number>>((acc, t) => {
    acc[t] = mockFilings.filter((f) => f.formType === t).length;
    return acc;
  }, {});

  return (
    <div className="container py-6 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="col-span-2">
          <SummaryCard title="Total Filings Today" value={mockFilings.length} subtitle="All form types" />
        </div>
        {FORM_TYPES.map((t) => (
          <SummaryCard key={t} title={t} value={countsByType[t]} />
        ))}
      </div>

      {/* Chart */}
      <TimeSeriesChart filings={mockFilings} />

      {/* Table */}
      <FilingsTable filings={sorted} title="Recent Filings" />
    </div>
  );
};

export default Dashboard;
