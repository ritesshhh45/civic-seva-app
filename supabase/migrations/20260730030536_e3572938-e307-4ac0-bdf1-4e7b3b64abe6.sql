
REVOKE EXECUTE ON FUNCTION public.admin_save_row(text, jsonb) FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_delete_row(text, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_update_config(jsonb) FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_list_taps() FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_list_images() FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_delete_image(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_upload_image(text, text, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_list_admins() FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_set_admin_status(uuid, text, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.current_admin_role() FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_email() FROM anon;

GRANT EXECUTE ON FUNCTION public.admin_save_row(text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_row(text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_config(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_taps() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_images() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_image(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_upload_image(text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_admins() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_admin_status(uuid, text, text) TO authenticated;
