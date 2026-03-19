import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchFilingsByTicker } from "@/lib/api";
import { Filing } from "@/data/types";
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

  // Group filings by ticker, preserving the order of the user's tickers list
  const filingsByTicker: Record<string, Filing[]> = {};
  tickers.forEach((t) => { filingsByTicker[t] = []; });
  filings.forEach((f) => {
    if (filingsByTicker[f.ticker]) {
      filingsByTicker[f.ticker].push(f);
    } else {
      filingsByTicker[f.ticker] = [f];
    }
  });

  return (
    <div className="container py-6 max-w-4xl space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Your Watchlist</h1>

      <WatchlistInput
        tickers={tickers}
        onAdd={handleAddTicker}
        onRemove={handleRemoveTicker}
      />

      {isLoading ? (
        <div className="p-8 text-center text-gray-500 font-semibold animate-pulse">
          Running dynamic queries against MotherDuck remote tables...
        </div>
      ) : filings.length > 0 ? (
        tickers.map((ticker) => {
          const tickerFilings = (filingsByTicker[ticker] || []).sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          if (tickerFilings.length === 0) return null;
          return (
            <div key={ticker} className="space-y-1">
              <div className="flex items-center gap-3 px-1">
                <span className="font-mono font-bold text-xl text-primary">{ticker}</span>
                <span className="text-sm text-muted-foreground">
                  {tickerFilings[0]?.companyName}
                </span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {tickerFilings.length} filing{tickerFilings.length !== 1 ? "s" : ""}
                </span>
              </div>
              <FilingsTable filings={tickerFilings} hideTicker />
            </div>
          );
        })
      ) : (
        <div className="p-8 text-center text-gray-500">
          No filings found for the selected tickers.
        </div>
      )}
    </div>
  );
};

export default Watchlist;
