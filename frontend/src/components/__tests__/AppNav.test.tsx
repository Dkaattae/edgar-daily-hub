import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AppNav from "../AppNav";

// Mock the API functions
vi.mock("../../lib/api", () => ({
  getUsername: vi.fn().mockResolvedValue("test@example.com"),
  logout: vi.fn(),
}));

// Mock Supabase
vi.mock("../../lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: { access_token: "mock-token" } } }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
  },
}));

const renderNav = () =>
  render(
    <MemoryRouter>
      <AppNav />
    </MemoryRouter>
  );

describe("AppNav", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows username and Log out button when authenticated", async () => {
    renderNav();
    await waitFor(() => {
      expect(screen.getByText("test@example.com")).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /log out/i })).toBeInTheDocument();
  });

  it("calls logout when Log out button is clicked", async () => {
    const { logout } = await import("../../lib/api");
    renderNav();
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /log out/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: /log out/i }));
    expect(logout).toHaveBeenCalled();
  });
});
