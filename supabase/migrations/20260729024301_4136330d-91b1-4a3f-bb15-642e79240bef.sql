-- 1. Admin PIN store (locked: reachable only through security-definer functions)
CREATE TABLE public.admin_auth (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  pin_hash text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_auth ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.admin_auth TO service_role;
INSERT INTO public.admin_auth (id, pin_hash) VALUES (true, md5('sanjay2026' || 'seva-pin-salt'));

-- 2. Admin users: approval workflow
ALTER TABLE public.admin_users
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS requested_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS decided_at timestamptz;

UPDATE public.admin_users SET status = 'approved';
UPDATE public.admin_users SET role = 'super_admin' WHERE mobile = '9422115394';
INSERT INTO public.admin_users (mobile, name, role, status)
SELECT '9422115394', 'Sanjay Chaudhary', 'super_admin', 'approved'
WHERE NOT EXISTS (SELECT 1 FROM public.admin_users WHERE mobile = '9422115394');

CREATE UNIQUE INDEX IF NOT EXISTS admin_users_mobile_key ON public.admin_users (mobile);

-- 3. Admin sessions (locked table)
CREATE TABLE public.admin_sessions (
  token uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mobile text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT now() + interval '30 days'
);
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.admin_sessions TO service_role;

-- 4. Helpers
CREATE OR REPLACE FUNCTION public.norm_mobile(_v text)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT right(regexp_replace(coalesce(_v, ''), '\D', '', 'g'), 10)
$$;

CREATE OR REPLACE FUNCTION public.admin_role_for_token(_token uuid)
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT u.role
  FROM public.admin_sessions s
  JOIN public.admin_users u ON u.mobile = s.mobile
  WHERE s.token = _token AND s.expires_at > now() AND u.status = 'approved'
$$;

-- 5. Admin login -> session token, or pending access request
CREATE OR REPLACE FUNCTION public.admin_login(_mobile text, _pin text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE m text; h text; u public.admin_users%ROWTYPE; tok uuid;
BEGIN
  m := public.norm_mobile(_mobile);
  SELECT pin_hash INTO h FROM public.admin_auth WHERE id;
  IF length(m) <> 10 OR h IS NULL OR md5(coalesce(_pin, '') || 'seva-pin-salt') <> h THEN
    RETURN jsonb_build_object('status', 'invalid');
  END IF;

  SELECT * INTO u FROM public.admin_users WHERE mobile = m;
  IF u.id IS NULL THEN
    INSERT INTO public.admin_users (mobile, name, role, status)
    VALUES (m, '', 'admin', 'pending')
    RETURNING * INTO u;
  END IF;

  IF u.status <> 'approved' THEN
    RETURN jsonb_build_object('status', u.status);
  END IF;

  INSERT INTO public.admin_sessions (mobile) VALUES (m) RETURNING token INTO tok;
  RETURN jsonb_build_object('status', 'ok', 'token', tok, 'role', u.role, 'mobile', m);
END $$;

CREATE OR REPLACE FUNCTION public.admin_session_info(_token uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r text;
BEGIN
  r := public.admin_role_for_token(_token);
  IF r IS NULL THEN RETURN jsonb_build_object('status', 'invalid'); END IF;
  RETURN jsonb_build_object('status', 'ok', 'role', r);
END $$;

-- 6. Admin management
CREATE OR REPLACE FUNCTION public.admin_list_admins(_token uuid)
RETURNS TABLE (id uuid, mobile text, name text, role text, status text, requested_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.admin_role_for_token(_token) IS NULL THEN RAISE EXCEPTION 'Not authorised'; END IF;
  RETURN QUERY
    SELECT u.id, u.mobile, u.name, u.role, u.status, u.requested_at
    FROM public.admin_users u
    ORDER BY (u.status = 'pending') DESC, u.requested_at DESC;
END $$;

CREATE OR REPLACE FUNCTION public.admin_set_admin_status(_token uuid, _id uuid, _status text, _name text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE target public.admin_users%ROWTYPE;
BEGIN
  IF public.admin_role_for_token(_token) <> 'super_admin' THEN
    RAISE EXCEPTION 'Only the main admin can change admin access';
  END IF;
  IF _status NOT IN ('approved', 'denied', 'revoked') THEN
    RAISE EXCEPTION 'Invalid status';
  END IF;
  SELECT * INTO target FROM public.admin_users WHERE id = _id;
  IF target.id IS NULL THEN RAISE EXCEPTION 'Request not found'; END IF;
  IF target.role = 'super_admin' THEN RAISE EXCEPTION 'The main admin cannot be changed'; END IF;

  UPDATE public.admin_users
     SET status = _status,
         name = coalesce(nullif(_name, ''), name),
         decided_at = now()
   WHERE id = _id;

  IF _status <> 'approved' THEN
    DELETE FROM public.admin_sessions WHERE mobile = target.mobile;
  END IF;
  RETURN jsonb_build_object('ok', true);
END $$;

-- 7. Content CRUD through the session token
CREATE OR REPLACE FUNCTION public.admin_save_row(_token uuid, _table text, _row jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE cols text; sel text; rid uuid;
BEGIN
  IF public.admin_role_for_token(_token) IS NULL THEN RAISE EXCEPTION 'Not authorised'; END IF;
  IF _table NOT IN ('categories', 'notifications', 'gallery', 'updates', 'works', 'schemes') THEN
    RAISE EXCEPTION 'Unknown table';
  END IF;

  rid := nullif(_row->>'id', '')::uuid;
  _row := _row - 'id' - 'created_at';

  SELECT string_agg(format('%I', k), ', '), string_agg(format('x.%I', k), ', ')
    INTO cols, sel
  FROM jsonb_object_keys(_row) AS k
  WHERE k IN (
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = _table
  );

  IF cols IS NULL THEN RAISE EXCEPTION 'Nothing to save'; END IF;

  IF rid IS NULL THEN
    EXECUTE format(
      'INSERT INTO public.%I (%s) SELECT %s FROM jsonb_populate_record(null::public.%I, $1) x',
      _table, cols, sel, _table) USING _row;
  ELSE
    EXECUTE format(
      'UPDATE public.%I SET (%s) = (SELECT %s FROM jsonb_populate_record(null::public.%I, $1) x) WHERE id = $2',
      _table, cols, sel, _table) USING _row, rid;
  END IF;
  RETURN jsonb_build_object('ok', true);
END $$;

CREATE OR REPLACE FUNCTION public.admin_delete_row(_token uuid, _table text, _id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.admin_role_for_token(_token) IS NULL THEN RAISE EXCEPTION 'Not authorised'; END IF;
  IF _table NOT IN ('categories', 'notifications', 'gallery', 'updates', 'works', 'schemes') THEN
    RAISE EXCEPTION 'Unknown table';
  END IF;
  EXECUTE format('DELETE FROM public.%I WHERE id = $1', _table) USING _id;
  RETURN jsonb_build_object('ok', true);
END $$;

CREATE OR REPLACE FUNCTION public.admin_update_config(_token uuid, _patch jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE cols text; sel text; cid uuid;
BEGIN
  IF public.admin_role_for_token(_token) IS NULL THEN RAISE EXCEPTION 'Not authorised'; END IF;
  SELECT id INTO cid FROM public.app_config LIMIT 1;
  IF cid IS NULL THEN RAISE EXCEPTION 'App configuration row missing'; END IF;

  _patch := _patch - 'id' - 'updated_at';
  SELECT string_agg(format('%I', k), ', '), string_agg(format('x.%I', k), ', ')
    INTO cols, sel
  FROM jsonb_object_keys(_patch) AS k
  WHERE k IN (
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'app_config'
  );
  IF cols IS NULL THEN RAISE EXCEPTION 'Nothing to save'; END IF;

  EXECUTE format(
    'UPDATE public.app_config SET (%s) = (SELECT %s FROM jsonb_populate_record(null::public.app_config, $1) x), updated_at = now() WHERE id = $2',
    cols, sel) USING _patch, cid;
  RETURN jsonb_build_object('ok', true);
END $$;

CREATE OR REPLACE FUNCTION public.admin_list_taps(_token uuid)
RETURNS TABLE (id uuid, user_name text, mobile text, category_name text, created_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.admin_role_for_token(_token) IS NULL THEN RAISE EXCEPTION 'Not authorised'; END IF;
  RETURN QUERY
    SELECT t.id, t.user_name, t.mobile, t.category_name, t.created_at
    FROM public.complaint_taps t
    ORDER BY t.created_at DESC
    LIMIT 500;
END $$;

-- 8. Citizen-side writes (no service key needed)
CREATE OR REPLACE FUNCTION public.citizen_register(_device_id text, _name text, _mobile text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE m text;
BEGIN
  m := public.norm_mobile(_mobile);
  IF coalesce(trim(_name), '') = '' OR length(m) <> 10 OR coalesce(_device_id, '') = '' THEN
    RAISE EXCEPTION 'Please enter a valid name and 10 digit mobile number';
  END IF;
  INSERT INTO public.app_users (device_id, name, mobile)
  VALUES (_device_id, left(trim(_name), 80), m)
  ON CONFLICT (device_id) DO UPDATE SET name = excluded.name, mobile = excluded.mobile;
  RETURN jsonb_build_object('ok', true);
END $$;

CREATE OR REPLACE FUNCTION public.citizen_log_tap(
  _device_id text, _name text, _mobile text, _category_id uuid, _category_name text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF coalesce(_device_id, '') = '' THEN RAISE EXCEPTION 'Missing device'; END IF;
  INSERT INTO public.complaint_taps (device_id, user_name, mobile, category_id, category_name)
  VALUES (_device_id, left(coalesce(_name, ''), 80), public.norm_mobile(_mobile), _category_id, left(coalesce(_category_name, ''), 120));
  RETURN jsonb_build_object('ok', true);
END $$;

CREATE OR REPLACE FUNCTION public.citizen_history(_device_id text)
RETURNS TABLE (id uuid, category_name text, created_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF coalesce(_device_id, '') = '' THEN RETURN; END IF;
  RETURN QUERY
    SELECT t.id, t.category_name, t.created_at
    FROM public.complaint_taps t
    WHERE t.device_id = _device_id
    ORDER BY t.created_at DESC
    LIMIT 200;
END $$;

CREATE OR REPLACE FUNCTION public.lookup_admin_role(_mobile text)
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT u.role FROM public.admin_users u
  WHERE u.mobile = public.norm_mobile(_mobile) AND u.status = 'approved'
$$;

-- 9. Execute grants
GRANT EXECUTE ON FUNCTION public.admin_login(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_session_info(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_admins(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_admin_status(uuid, uuid, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_save_row(uuid, text, jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_row(uuid, text, uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_config(uuid, jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_taps(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.citizen_register(text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.citizen_log_tap(text, text, text, uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.citizen_history(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.lookup_admin_role(text) TO anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_role_for_token(uuid) FROM anon, authenticated, public;