import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SummaryCard from "@/components/SummaryCard";

describe("SummaryCard", () => {
  it("renders title and value", () => {
    render(<SummaryCard title="Total Filings" value={42} />);
    expect(screen.getByText("Total Filings")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders subtitle when provided", () => {
    render(<SummaryCard title="Test" value={1} subtitle="extra info" />);
    expect(screen.getByText("extra info")).toBeInTheDocument();
  });
});
