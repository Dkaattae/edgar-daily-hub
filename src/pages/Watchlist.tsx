import { useState } from "react";
import { mockFilings } from "@/data/mockFilings";
import WatchlistInput from "@/components/WatchlistInput";
import FilingsTable from "@/components/FilingsTable";
import SummaryCard from "@/components/SummaryCard";

const Watchlist = () => {
  const [tickers, setTickers] = useState<string[]>([]);

  const filtered = mockFilings
    .filter((f) => tickers.includes(f.ticker))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="container py-6 space-y-6">
      <WatchlistInput
        tickers={tickers}
        onAdd={(t) => setTickers((prev) => [...prev, t])}
        onRemove={(t) => setTickers((prev) => prev.filter((x) => x !== t))}
      />

      <div className="grid grid-cols-2 gap-3">
        <SummaryCard title="Watched Tickers" value={tickers.length} />
        <SummaryCard title="Matching Filings" value={filtered.length} />
      </div>

      <FilingsTable
        filings={filtered}
        title={tickers.length ? "Watchlist Filings" : "Add tickers to see filings"}
      />
    </div>
  );
};

export default Watchlist;
