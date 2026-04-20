import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AppNav from "../AppNav";

vi.mock("../../lib/api", () => ({
  logout: vi.fn(),
}));

const useAuthMock = vi.fn();

vi.mock("../../lib/auth", () => ({
  useAuth: () => useAuthMock(),
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
    useAuthMock.mockReturnValue({
      session: { access_token: "mock-token", user: { email: "test@example.com" } },
    });
    renderNav();
    await waitFor(() => {
      expect(screen.getByText("test@example.com")).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /log out/i })).toBeInTheDocument();
  });

  it("calls logout when Log out button is clicked", async () => {
    useAuthMock.mockReturnValue({
      session: { access_token: "mock-token", user: { email: "test@example.com" } },
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
    useAuthMock.mockReturnValue({ session: null });
    renderNav();
    await waitFor(() => {
      expect(screen.getByRole("link", { name: /log in/i })).toBeInTheDocument();
    });
    expect(screen.queryByRole("button", { name: /log out/i })).not.toBeInTheDocument();
  });
});
