import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Eye, LogIn, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/watchlist", label: "Watchlist", icon: Eye },
];

const AppNav = () => {
  const { pathname } = useLocation();
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-mono font-bold text-primary text-lg tracking-tight">
            EDGAR<span className="text-muted-foreground">/crawler</span>
          </span>
          <nav className="flex gap-1">
            {links.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors ${
                  pathname === to
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground font-mono hidden sm:inline">
            {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
          </span>
          {loggedIn ? (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-sm text-foreground">
                <User className="h-4 w-4 text-primary" />
                <span className="font-mono">mock_user</span>
              </span>
              <Button variant="ghost" size="sm" onClick={() => setLoggedIn(false)} aria-label="Log out">
                <LogOut className="h-4 w-4" />
                Log out
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setLoggedIn(true)} aria-label="Log in">
              <LogIn className="h-4 w-4" />
              Log in
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppNav;
