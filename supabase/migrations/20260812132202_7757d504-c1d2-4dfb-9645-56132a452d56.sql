ALTER TABLE public.complaint_taps
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'submitted',
  ADD COLUMN IF NOT EXISTS description text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS photo_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.app_users
  ADD COLUMN IF NOT EXISTS platform text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS push_updated_at timestamptz;

CREATE TABLE IF NOT EXISTS public.push_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL,
  source_id text NOT NULL,
  title text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  sent integer NOT NULL DEFAULT 0,
  failed integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (kind, source_id)
);

GRANT ALL ON public.push_log TO service_role;
ALTER TABLE public.push_log ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.citizen_save_push_token(_device_id text, _token text, _platform text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF coalesce(_device_id, '') = '' OR coalesce(_token, '') = '' THEN
    RETURN jsonb_build_object('ok', false);
  END IF;

  UPDATE public.app_users
     SET push_token = _token,
         platform = coalesce(_platform, ''),
         push_updated_at = now()
   WHERE device_id = _device_id;

  RETURN jsonb_build_object('ok', true);
END;
$$;

REVOKE ALL ON FUNCTION public.citizen_save_push_token(text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.citizen_save_push_token(text, text, text) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.citizen_log_tap(
  _device_id text, _name text, _mobile text, _category_id uuid, _category_name text, _description text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _new_id uuid;
BEGIN
  INSERT INTO public.complaint_taps (device_id, user_name, mobile, category_id, category_name, description, status)
  VALUES (_device_id, _name, public.norm_mobile(_mobile), _category_id, _category_name, coalesce(_description, ''), 'submitted')
  RETURNING id INTO _new_id;

  RETURN jsonb_build_object('ok', true, 'id', _new_id);
END;
$$;

REVOKE ALL ON FUNCTION public.citizen_log_tap(text, text, text, uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.citizen_log_tap(text, text, text, uuid, text, text) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.admin_set_tap_status(_id uuid, _status text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.current_admin_role() IS NULL THEN
    RAISE EXCEPTION 'not authorised';
  END IF;

  IF _status NOT IN ('submitted', 'under_review', 'in_progress', 'resolved', 'rejected') THEN
    RAISE EXCEPTION 'invalid status';
  END IF;

  UPDATE public.complaint_taps
     SET status = _status,
         updated_at = now()
   WHERE id = _id;

  RETURN jsonb_build_object('ok', true);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_set_tap_status(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_set_tap_status(uuid, text) TO authenticated, service_role;