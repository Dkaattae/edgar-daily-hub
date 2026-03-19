import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchFilingsByTicker } from "@/lib/api";
import WatchlistInput from "@/components/WatchlistInput";
import FilingsTable from "@/components/FilingsTable";

const Watchlist = () => {
  const [tickers, setTickers] = useState<string[]>(["AAPL", "MSFT"]);

  const { data: filings = [], isLoading } = useQuery({
    queryKey: ["watchlistFilings", tickers],
    queryFn: () => fetchFilingsByTicker(tickers.join(",")),
    enabled: tickers.length > 0
  });

  const handleAddTicker = (ticker: string) => {
    if (!tickers.includes(ticker)) {
      setTickers([...tickers, ticker]);
    }
  };

  const handleRemoveTicker = (ticker: string) => {
    setTickers(tickers.filter((t) => t !== ticker));
  };

  const sorted = [...filings].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="container py-6 max-w-4xl space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Your Watchlist</h1>
      
      <WatchlistInput 
        tickers={tickers} 
        onAdd={handleAddTicker} 
        onRemove={handleRemoveTicker} 
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
            <div className="p-8 text-center text-gray-500 font-semibold animate-pulse">Running dynamic queries against MotherDuck remote tables...</div>
        ) : sorted.length > 0 ? (
          <FilingsTable filings={sorted} title="Watchlist Filings" />
        ) : (
          <div className="p-8 text-center text-gray-500">
            No filings found for the selected tickers.
          </div>
        )}
      </div>
    </div>
  );
};

export default Watchlist;
