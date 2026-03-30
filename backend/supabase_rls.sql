-- Supabase security: enable row-level security and create policies for the auth/watchlist tables

-- 1) Enable RLS on tables
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.watchlist_tickers ENABLE ROW LEVEL SECURITY;

-- 2) Prevent public access by default (Supabase may have a public role)
ALTER TABLE IF EXISTS public.users FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.watchlist_tickers FORCE ROW LEVEL SECURITY;

-- 3) Policies for authenticated sessions in Supabase

-- users: allow users to read their own user profile
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid()::text = id::text);

-- watchlist_tickers: allow users to view, insert, update, delete their own rows
CREATE POLICY "watchlist_select_own" ON public.watchlist_tickers
  FOR SELECT USING (user_id = auth.uid()::int);

CREATE POLICY "watchlist_insert_own" ON public.watchlist_tickers
  FOR INSERT WITH CHECK (user_id = auth.uid()::int);

CREATE POLICY "watchlist_update_own" ON public.watchlist_tickers
  FOR UPDATE USING (user_id = auth.uid()::int);

CREATE POLICY "watchlist_delete_own" ON public.watchlist_tickers
  FOR DELETE USING (user_id = auth.uid()::int);

-- Optionally, explicitly disable public role on these tables in Supabase
REVOKE ALL ON public.users FROM public;
REVOKE ALL ON public.watchlist_tickers FROM public;

-- Ensure authenticated role retains needed access (this is usually done through Supabase settings)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.watchlist_tickers TO authenticated;
GRANT SELECT ON public.users TO authenticated;
