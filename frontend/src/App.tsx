import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import AppNav from "@/components/AppNav";
import Dashboard from "@/pages/Dashboard";
import Watchlist from "@/pages/Watchlist";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const location = useLocation();

  useEffect(() => {
    let initialized = false;
    supabase.auth.getSession().then(({ data: { session } }) => {
      initialized = true;
      setSession(session);
    });
    // Ignore auth-state-change events until getSession() has established the
    // initial truth — otherwise an early null event can bounce an authenticated
    // user before localStorage hydration completes.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (initialized) setSession(session);
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (session === null) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
};

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <AppNav />
      {children}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          <Route path="/" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
          <Route path="/watchlist" element={<ProtectedRoute><ProtectedLayout><Watchlist /></ProtectedLayout></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
