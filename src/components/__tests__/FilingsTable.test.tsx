import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import FilingsTable from "@/components/FilingsTable";
import { Filing } from "@/data/types";

const filings: Filing[] = [
  {
    id: "1",
    ticker: "AAPL",
    companyName: "Apple Inc.",
    formType: "10-K",
    timestamp: new Date().toISOString(),
    filingUrl: "https://sec.gov/test",
  },
];

describe("FilingsTable", () => {
  it("renders filings data", () => {
    render(<FilingsTable filings={filings} />);
    expect(screen.getByText("AAPL")).toBeInTheDocument();
    expect(screen.getByText("Apple Inc.")).toBeInTheDocument();
    expect(screen.getByText("10-K")).toBeInTheDocument();
  });

  it("shows empty state when no filings", () => {
    render(<FilingsTable filings={[]} />);
    expect(screen.getByText("No filings found")).toBeInTheDocument();
  });

  it("renders title when provided", () => {
    render(<FilingsTable filings={filings} title="Recent Filings" />);
    expect(screen.getByText("Recent Filings")).toBeInTheDocument();
  });
});
