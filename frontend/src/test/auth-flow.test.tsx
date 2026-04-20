import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/lib/auth";
import { setPostLoginRedirect } from "@/lib/authRedirect";
import Login from "@/pages/Login";

const hardRedirectMock = vi.fn();
vi.mock("@/lib/authRedirect", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/authRedirect")>();
  return {
    ...actual,
    hardRedirectTo: (path: string) => hardRedirectMock(path),
  };
});

// Supabase mock — holds a listener for onAuthStateChange so tests can fire
// SIGNED_IN/SIGNED_OUT events on demand.
const supabaseState: {
  session: any;
  listener: ((event: string, session: any) => void) | null;
} = { session: null, listener: null };

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: vi.fn(async () => ({ data: { session: supabaseState.session } })),
      onAuthStateChange: vi.fn((cb: (event: string, session: any) => void) => {
        supabaseState.listener = cb;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      }),
      signInWithPassword: vi.fn(async ({ email }: { email: string; password: string }) => {
        const newSession = { access_token: "t", user: { email } };
        supabaseState.session = newSession;
        supabaseState.listener?.("SIGNED_IN", newSession);
        return { data: { session: newSession, user: newSession.user }, error: null };
      }),
      signOut: vi.fn(async () => {
        supabaseState.session = null;
        supabaseState.listener?.("SIGNED_OUT", null);
        return { error: null };
      }),
    },
  },
}));

const emitSessionPath = () => {
  const Emit = () => {
    const loc = useLocation();
    return <div data-testid="path">{loc.pathname}</div>;
  };
  return <Emit />;
};

const ProtectedStub = ({ children }: { children: React.ReactNode }) => {
  const { session } = useAuth();
  const loc = useLocation();
  if (session === undefined) return <div>Loading...</div>;
  if (session === null) {
    setPostLoginRedirect(loc.pathname);
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const renderApp = (initialEntries: string[]) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={initialEntries}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/watchlist"
              element={
                <ProtectedStub>
                  <div data-testid="watchlist-page">Watchlist content</div>
                </ProtectedStub>
              }
            />
            <Route path="/" element={<div data-testid="home-page">Home</div>} />
          </Routes>
          {emitSessionPath()}
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe("Auth flow", () => {
  beforeEach(() => {
    sessionStorage.clear();
    supabaseState.session = null;
    supabaseState.listener = null;
    hardRedirectMock.mockReset();
    vi.clearAllMocks();
  });

  it("redirects to /login when visiting /watchlist signed out and stashes path", async () => {
    renderApp(["/watchlist"]);
    await waitFor(() => {
      expect(screen.getByTestId("path").textContent).toBe("/login");
    });
    expect(sessionStorage.getItem("postLoginRedirect")).toBe("/watchlist");
  });

  it("hard-redirects to stashed /watchlist after successful login", async () => {
    renderApp(["/watchlist"]);
    await waitFor(() => {
      expect(screen.getByTestId("path").textContent).toBe("/login");
    });

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "password" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(hardRedirectMock).toHaveBeenCalledWith("/watchlist");
    });
    expect(sessionStorage.getItem("postLoginRedirect")).toBeNull();
  });

  it("hard-redirects to / when logging in with no stashed path", async () => {
    renderApp(["/login"]);
    await waitFor(() => {
      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "password" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(hardRedirectMock).toHaveBeenCalledWith("/");
    });
  });

  it("does not flash login form when already signed in; redirects to /", async () => {
    supabaseState.session = { access_token: "t", user: { email: "u@x.com" } };
    renderApp(["/login"]);
    await waitFor(() => {
      expect(hardRedirectMock).toHaveBeenCalledWith("/");
    });
    expect(screen.queryByLabelText(/Email/i)).toBeNull();
  });

  it("redirects existing session to stashed /watchlist", async () => {
    supabaseState.session = { access_token: "t", user: { email: "u@x.com" } };
    sessionStorage.setItem("postLoginRedirect", "/watchlist");
    renderApp(["/login"]);
    await waitFor(() => {
      expect(hardRedirectMock).toHaveBeenCalledWith("/watchlist");
    });
    expect(sessionStorage.getItem("postLoginRedirect")).toBeNull();
  });

  it("only hard-redirects once per session state change", async () => {
    renderApp(["/watchlist"]);
    await waitFor(() => {
      expect(screen.getByTestId("path").textContent).toBe("/login");
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "password" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() => {
      expect(hardRedirectMock).toHaveBeenCalled();
    });
    expect(hardRedirectMock).toHaveBeenCalledTimes(1);
  });
});
