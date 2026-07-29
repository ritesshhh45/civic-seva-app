CREATE TABLE public.media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL DEFAULT '',
  content_type text NOT NULL DEFAULT 'image/jpeg',
  data text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.media_assets TO anon, authenticated;
GRANT ALL ON public.media_assets TO service_role;

ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "media assets are public"
  ON public.media_assets FOR SELECT TO anon, authenticated USING (true);

CREATE OR REPLACE FUNCTION public.admin_upload_image(_token uuid, _filename text, _content_type text, _data text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE new_id uuid;
BEGIN
  IF public.admin_role_for_token(_token) IS NULL THEN RAISE EXCEPTION 'Not authorised'; END IF;
  IF coalesce(_data, '') = '' THEN RAISE EXCEPTION 'No image data'; END IF;
  IF length(_data) > 4000000 THEN RAISE EXCEPTION 'Image is too large (max ~3 MB)'; END IF;
  IF _content_type NOT IN ('image/jpeg', 'image/png', 'image/webp') THEN
    RAISE EXCEPTION 'Only JPG, PNG or WebP images are allowed';
  END IF;

  INSERT INTO public.media_assets (filename, content_type, data)
  VALUES (left(coalesce(_filename, ''), 120), _content_type, _data)
  RETURNING id INTO new_id;

  RETURN jsonb_build_object('ok', true, 'id', new_id, 'url', '/api/public/img/' || new_id);
END $$;

CREATE OR REPLACE FUNCTION public.admin_delete_image(_token uuid, _id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.admin_role_for_token(_token) IS NULL THEN RAISE EXCEPTION 'Not authorised'; END IF;
  DELETE FROM public.media_assets WHERE id = _id;
  RETURN jsonb_build_object('ok', true);
END $$;

CREATE OR REPLACE FUNCTION public.admin_list_images(_token uuid)
RETURNS TABLE (id uuid, filename text, content_type text, created_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.admin_role_for_token(_token) IS NULL THEN RAISE EXCEPTION 'Not authorised'; END IF;
  RETURN QUERY
    SELECT m.id, m.filename, m.content_type, m.created_at
    FROM public.media_assets m ORDER BY m.created_at DESC;
END $$;

GRANT EXECUTE ON FUNCTION public.admin_upload_image(uuid, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_image(uuid, uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_images(uuid) TO anon, authenticated;