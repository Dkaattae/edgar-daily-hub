import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

type AuthState = { session: Session | null | undefined };

const AuthContext = createContext<AuthState>({ session: undefined });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // undefined = still resolving, null = confirmed signed out, Session = signed in
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    let initialized = false;
    supabase.auth.getSession().then(({ data: { session } }) => {
      initialized = true;
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (initialized) setSession(session);
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  return <AuthContext.Provider value={{ session }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
