import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

interface WatchlistInputProps {
  tickers: string[];
  onAdd: (ticker: string) => void;
  onRemove: (ticker: string) => void;
}

const WatchlistInput = ({ tickers, onAdd, onRemove }: WatchlistInputProps) => {
  const [value, setValue] = useState("");

  const handleAdd = () => {
    const t = value.trim().toUpperCase();
    if (t && !tickers.includes(t)) {
      onAdd(t);
      setValue("");
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-5 space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground">Manage Watchlist</h3>
      <div className="flex gap-2">
        <Input
          placeholder="Enter ticker (e.g. AAPL)"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="bg-secondary border-border font-mono uppercase"
        />
        <Button onClick={handleAdd} size="sm" className="shrink-0">
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>
      {tickers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tickers.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 rounded-md bg-primary/15 text-primary border border-primary/30 px-2.5 py-1 text-sm font-mono"
            >
              {t}
              <button
                onClick={() => onRemove(t)}
                className="hover:text-destructive transition-colors"
                aria-label={`Remove ${t}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default WatchlistInput;
