import { describe, it, expect } from "vitest";
import { mockFilings } from "@/data/mockFilings";

describe("Filing filtering by ticker", () => {
  it("filters filings by single ticker", () => {
    const filtered = mockFilings.filter((f) => f.ticker === "AAPL");
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((f) => f.ticker === "AAPL")).toBe(true);
  });

  it("filters filings by multiple tickers", () => {
    const watchlist = ["AAPL", "TSLA"];
    const filtered = mockFilings.filter((f) => watchlist.includes(f.ticker));
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((f) => watchlist.includes(f.ticker))).toBe(true);
  });

  it("returns empty for unknown ticker", () => {
    const filtered = mockFilings.filter((f) => f.ticker === "ZZZZ");
    expect(filtered).toHaveLength(0);
  });
});
