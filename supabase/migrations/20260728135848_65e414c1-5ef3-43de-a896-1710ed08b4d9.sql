DROP POLICY IF EXISTS "app_users self insert" ON public.app_users;
DROP POLICY IF EXISTS "app_users self update" ON public.app_users;
DROP POLICY IF EXISTS "taps insert" ON public.complaint_taps;
DROP POLICY IF EXISTS "taps own read" ON public.complaint_taps;
REVOKE ALL ON public.app_users FROM anon, authenticated;
REVOKE ALL ON public.complaint_taps FROM anon, authenticated;