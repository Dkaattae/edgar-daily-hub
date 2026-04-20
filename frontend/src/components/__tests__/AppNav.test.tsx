import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AppNav from "../AppNav";

vi.mock("../../lib/api", () => ({
  logout: vi.fn(),
}));

const getSessionMock = vi.fn();

vi.mock("../../lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: (...args: unknown[]) => getSessionMock(...args),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
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
    getSessionMock.mockResolvedValue({
      data: { session: { access_token: "mock-token", user: { email: "test@example.com" } } },
    });
    renderNav();
    await waitFor(() => {
      expect(screen.getByText("test@example.com")).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /log out/i })).toBeInTheDocument();
  });

  it("calls logout when Log out button is clicked", async () => {
    getSessionMock.mockResolvedValue({
      data: { session: { access_token: "mock-token", user: { email: "test@example.com" } } },
    });
    const { logout } = await import("../../lib/api");
    renderNav();
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /log out/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: /log out/i }));
    expect(logout).toHaveBeenCalled();
  });

  it("shows Log in button when unauthenticated", async () => {
    getSessionMock.mockResolvedValue({ data: { session: null } });
    renderNav();
    await waitFor(() => {
      expect(screen.getByRole("link", { name: /log in/i })).toBeInTheDocument();
    });
    expect(screen.queryByRole("button", { name: /log out/i })).not.toBeInTheDocument();
  });
});
