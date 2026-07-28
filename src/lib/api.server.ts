import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type AdminAuth = { phone: string; pin: string };

export async function assertAdmin(auth: AdminAuth) {
  const pin = process.env.ADMIN_PIN;
  if (!pin) throw new Error("Admin PIN is not configured");
  const { data } = await supabaseAdmin.from("app_config").select("admin_phone").limit(1).single();
  const allowed = (data as { admin_phone?: string } | null)?.admin_phone ?? "9422115394";
  if (!auth || auth.phone?.trim() !== allowed || auth.pin !== pin) {
    throw new Error("Invalid admin phone number or PIN");
  }
}

export async function registerUserImpl(input: {
  deviceId: string;
  name: string;
  mobile: string;
}) {
  const { error } = await supabaseAdmin
    .from("app_users")
    .upsert(
      { device_id: input.deviceId, name: input.name.trim(), mobile: input.mobile.trim() },
      { onConflict: "device_id" },
    );
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function logTapImpl(input: {
  deviceId: string;
  name: string;
  mobile: string;
  categoryId: string;
  categoryName: string;
}) {
  const { error } = await supabaseAdmin.from("complaint_taps").insert({
    device_id: input.deviceId,
    user_name: input.name,
    mobile: input.mobile,
    category_id: input.categoryId,
    category_name: input.categoryName,
  });
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function myHistoryImpl(deviceId: string) {
  const { data, error } = await supabaseAdmin
    .from("complaint_taps")
    .select("id, category_name, created_at")
    .eq("device_id", deviceId)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);
  return (data ?? []) as { id: string; category_name: string; created_at: string }[];
}

export async function adminListTapsImpl() {
  const { data, error } = await supabaseAdmin
    .from("complaint_taps")
    .select("id, user_name, mobile, category_name, created_at")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw new Error(error.message);
  return (data ?? []) as {
    id: string;
    user_name: string;
    mobile: string;
    category_name: string;
    created_at: string;
  }[];
}

export async function saveRowImpl(
  table: "categories" | "notifications" | "gallery",
  row: Record<string, unknown>,
) {
  const { error } = row.id
    ? await supabaseAdmin.from(table).update(row).eq("id", row.id as string)
    : await supabaseAdmin.from(table).insert(row);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function deleteRowImpl(
  table: "categories" | "notifications" | "gallery",
  id: string,
) {
  const { error } = await supabaseAdmin.from(table).delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function updateConfigImpl(patch: Record<string, unknown>) {
  const { data } = await supabaseAdmin.from("app_config").select("id").limit(1).single();
  const id = (data as { id?: string } | null)?.id;
  if (!id) throw new Error("App configuration row missing");
  const { error } = await supabaseAdmin
    .from("app_config")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true };
}
