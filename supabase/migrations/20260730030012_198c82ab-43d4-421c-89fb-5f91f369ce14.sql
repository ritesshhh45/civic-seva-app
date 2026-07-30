
-- 1. Ward number + new photo slots -------------------------------------------
ALTER TABLE public.app_config
  ADD COLUMN IF NOT EXISTS splash_photo_url text,
  ADD COLUMN IF NOT EXISTS header_photo_url text;

UPDATE public.app_config SET
  ward_mr = 'प्रभाग क्र. १०',
  ward_en = 'Ward No. 10',
  splash_photo_url = COALESCE(NULLIF(splash_photo_url, ''), '/photos/portrait-splash.jpg'),
  header_photo_url = COALESCE(NULLIF(header_photo_url, ''), '/photos/portrait-header.jpg'),
  photo_url = '/photos/portrait-header.jpg',
  updated_at = now();

-- 2. Email based admin accounts ----------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'admin',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.admin_accounts TO service_role;
ALTER TABLE public.admin_accounts ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS admin_accounts_updated_at ON public.admin_accounts;
CREATE TRIGGER admin_accounts_updated_at BEFORE UPDATE ON public.admin_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.admin_accounts (email, name, role, status)
VALUES ('ritesshhh19@gmail.com', 'Primary admin', 'primary_admin', 'approved')
ON CONFLICT (email) DO UPDATE SET role = 'primary_admin', status = 'approved';

-- 3. Identity helpers ---------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_email()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT lower(nullif(coalesce(auth.jwt() ->> 'email', ''), ''))
$$;

CREATE OR REPLACE FUNCTION public.admin_me()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE e text; a public.admin_accounts%ROWTYPE;
BEGIN
  e := public.admin_email();
  IF e IS NULL THEN RETURN jsonb_build_object('status', 'anon'); END IF;

  SELECT * INTO a FROM public.admin_accounts WHERE email = e;
  IF a.id IS NULL THEN
    INSERT INTO public.admin_accounts (email, role, status)
    VALUES (e, CASE WHEN e = 'ritesshhh19@gmail.com' THEN 'primary_admin' ELSE 'admin' END,
               CASE WHEN e = 'ritesshhh19@gmail.com' THEN 'approved' ELSE 'pending' END)
    RETURNING * INTO a;
  END IF;

  RETURN jsonb_build_object('status', a.status, 'role', a.role, 'email', a.email, 'name', a.name);
END $$;

CREATE OR REPLACE FUNCTION public.current_admin_role()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.admin_accounts
  WHERE email = public.admin_email() AND status = 'approved'
$$;

-- 4. Replace token based admin functions --------------------------------------
DROP FUNCTION IF EXISTS public.admin_login(text, text);
DROP FUNCTION IF EXISTS public.admin_session_info(uuid);
DROP FUNCTION IF EXISTS public.admin_role_for_token(uuid);
DROP FUNCTION IF EXISTS public.admin_save_row(uuid, text, jsonb);
DROP FUNCTION IF EXISTS public.admin_delete_row(uuid, text, uuid);
DROP FUNCTION IF EXISTS public.admin_update_config(uuid, jsonb);
DROP FUNCTION IF EXISTS public.admin_list_taps(uuid);
DROP FUNCTION IF EXISTS public.admin_list_images(uuid);
DROP FUNCTION IF EXISTS public.admin_delete_image(uuid, uuid);
DROP FUNCTION IF EXISTS public.admin_upload_image(uuid, text, text, text);
DROP FUNCTION IF EXISTS public.admin_list_admins(uuid);
DROP FUNCTION IF EXISTS public.admin_set_admin_status(uuid, uuid, text, text);
DROP FUNCTION IF EXISTS public.lookup_admin_role(text);

CREATE OR REPLACE FUNCTION public.admin_save_row(_table text, _row jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE cols text; sel text; rid uuid;
BEGIN
  IF public.current_admin_role() IS NULL THEN RAISE EXCEPTION 'Not authorised'; END IF;
  IF _table NOT IN ('categories', 'notifications', 'gallery', 'updates', 'works', 'schemes') THEN
    RAISE EXCEPTION 'Unknown table';
  END IF;

  rid := nullif(_row->>'id', '')::uuid;
  _row := _row - 'id' - 'created_at';

  SELECT string_agg(format('%I', k), ', '), string_agg(format('x.%I', k), ', ')
    INTO cols, sel
  FROM jsonb_object_keys(_row) AS k
  WHERE k IN (SELECT column_name FROM information_schema.columns
              WHERE table_schema = 'public' AND table_name = _table);

  IF cols IS NULL THEN RAISE EXCEPTION 'Nothing to save'; END IF;

  IF rid IS NULL THEN
    EXECUTE format('INSERT INTO public.%I (%s) SELECT %s FROM jsonb_populate_record(null::public.%I, $1) x',
      _table, cols, sel, _table) USING _row;
  ELSE
    EXECUTE format('UPDATE public.%I SET (%s) = (SELECT %s FROM jsonb_populate_record(null::public.%I, $1) x) WHERE id = $2',
      _table, cols, sel, _table) USING _row, rid;
  END IF;
  RETURN jsonb_build_object('ok', true);
END $$;

CREATE OR REPLACE FUNCTION public.admin_delete_row(_table text, _id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.current_admin_role() IS NULL THEN RAISE EXCEPTION 'Not authorised'; END IF;
  IF _table NOT IN ('categories', 'notifications', 'gallery', 'updates', 'works', 'schemes') THEN
    RAISE EXCEPTION 'Unknown table';
  END IF;
  EXECUTE format('DELETE FROM public.%I WHERE id = $1', _table) USING _id;
  RETURN jsonb_build_object('ok', true);
END $$;

CREATE OR REPLACE FUNCTION public.admin_update_config(_patch jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE cols text; sel text; cid uuid;
BEGIN
  IF public.current_admin_role() IS NULL THEN RAISE EXCEPTION 'Not authorised'; END IF;
  SELECT id INTO cid FROM public.app_config LIMIT 1;
  IF cid IS NULL THEN RAISE EXCEPTION 'App configuration row missing'; END IF;

  _patch := _patch - 'id' - 'updated_at';
  SELECT string_agg(format('%I', k), ', '), string_agg(format('x.%I', k), ', ')
    INTO cols, sel
  FROM jsonb_object_keys(_patch) AS k
  WHERE k IN (SELECT column_name FROM information_schema.columns
              WHERE table_schema = 'public' AND table_name = 'app_config');
  IF cols IS NULL THEN RAISE EXCEPTION 'Nothing to save'; END IF;

  EXECUTE format(
    'UPDATE public.app_config SET (%s) = (SELECT %s FROM jsonb_populate_record(null::public.app_config, $1) x), updated_at = now() WHERE id = $2',
    cols, sel) USING _patch, cid;
  RETURN jsonb_build_object('ok', true);
END $$;

CREATE OR REPLACE FUNCTION public.admin_list_taps()
RETURNS SETOF public.complaint_taps LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.current_admin_role() IS NULL THEN RAISE EXCEPTION 'Not authorised'; END IF;
  RETURN QUERY SELECT * FROM public.complaint_taps ORDER BY created_at DESC LIMIT 500;
END $$;

CREATE OR REPLACE FUNCTION public.admin_list_images()
RETURNS TABLE (id uuid, filename text, content_type text, created_at timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.current_admin_role() IS NULL THEN RAISE EXCEPTION 'Not authorised'; END IF;
  RETURN QUERY SELECT m.id, m.filename, m.content_type, m.created_at
               FROM public.media_assets m ORDER BY m.created_at DESC;
END $$;

CREATE OR REPLACE FUNCTION public.admin_delete_image(_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.current_admin_role() IS NULL THEN RAISE EXCEPTION 'Not authorised'; END IF;
  DELETE FROM public.media_assets WHERE id = _id;
  RETURN jsonb_build_object('ok', true);
END $$;

CREATE OR REPLACE FUNCTION public.admin_upload_image(_filename text, _content_type text, _data text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE nid uuid;
BEGIN
  IF public.current_admin_role() IS NULL THEN RAISE EXCEPTION 'Not authorised'; END IF;
  INSERT INTO public.media_assets (filename, content_type, data)
  VALUES (coalesce(_filename, 'image'), coalesce(_content_type, 'image/jpeg'), _data)
  RETURNING id INTO nid;
  RETURN jsonb_build_object('ok', true, 'id', nid, 'url', '/api/public/img/' || nid);
END $$;

CREATE OR REPLACE FUNCTION public.admin_list_admins()
RETURNS SETOF public.admin_accounts LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.current_admin_role() IS NULL THEN RAISE EXCEPTION 'Not authorised'; END IF;
  RETURN QUERY SELECT * FROM public.admin_accounts ORDER BY created_at ASC;
END $$;

CREATE OR REPLACE FUNCTION public.admin_set_admin_status(_id uuid, _status text, _name text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.current_admin_role() <> 'primary_admin' THEN RAISE EXCEPTION 'Only the primary admin can do this'; END IF;
  IF _status NOT IN ('approved', 'denied', 'revoked') THEN RAISE EXCEPTION 'Bad status'; END IF;
  UPDATE public.admin_accounts
     SET status = _status, name = coalesce(nullif(_name, ''), name)
   WHERE id = _id AND role <> 'primary_admin';
  RETURN jsonb_build_object('ok', true);
END $$;

DROP TABLE IF EXISTS public.admin_sessions;
DROP TABLE IF EXISTS public.admin_auth;
DROP TABLE IF EXISTS public.admin_users;
