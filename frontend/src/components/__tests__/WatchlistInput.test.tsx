import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import WatchlistInput from "@/components/WatchlistInput";

describe("WatchlistInput", () => {
  it("calls onAdd when adding a ticker", () => {
    const onAdd = vi.fn();
    render(<WatchlistInput tickers={[]} onAdd={onAdd} onRemove={vi.fn()} />);

    const input = screen.getByPlaceholderText(/enter ticker/i);
    fireEvent.change(input, { target: { value: "AAPL" } });
    fireEvent.click(screen.getByText("Add"));

    expect(onAdd).toHaveBeenCalledWith("AAPL");
  });

  it("displays existing tickers", () => {
    render(<WatchlistInput tickers={["AAPL", "MSFT"]} onAdd={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.getByText("AAPL")).toBeInTheDocument();
    expect(screen.getByText("MSFT")).toBeInTheDocument();
  });

  it("calls onRemove when removing a ticker", () => {
    const onRemove = vi.fn();
    render(<WatchlistInput tickers={["AAPL"]} onAdd={vi.fn()} onRemove={onRemove} />);

    fireEvent.click(screen.getByLabelText("Remove AAPL"));
    expect(onRemove).toHaveBeenCalledWith("AAPL");
  });

  it("does not add duplicate tickers", () => {
    const onAdd = vi.fn();
    render(<WatchlistInput tickers={["AAPL"]} onAdd={onAdd} onRemove={vi.fn()} />);

    const input = screen.getByPlaceholderText(/enter ticker/i);
    fireEvent.change(input, { target: { value: "aapl" } });
    fireEvent.click(screen.getByText("Add"));

    expect(onAdd).not.toHaveBeenCalled();
  });
});
