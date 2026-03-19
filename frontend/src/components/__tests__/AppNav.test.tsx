import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import AppNav from "../AppNav";

const renderNav = () =>
  render(
    <MemoryRouter>
      <AppNav />
    </MemoryRouter>
  );

describe("AppNav login button", () => {
  it("shows Log in button by default", () => {
    renderNav();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
  });

  it("switches to logged-in state on click", () => {
    renderNav();
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));
    expect(screen.getByText("mock_user")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log out/i })).toBeInTheDocument();
  });

  it("logs out when Log out is clicked", () => {
    renderNav();
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));
    fireEvent.click(screen.getByRole("button", { name: /log out/i }));
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
  });
});
