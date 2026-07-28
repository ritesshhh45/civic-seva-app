import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type AdminAuth = { phone: string; pin: string };

export type AdminTable =
  | "categories"
  | "notifications"
  | "gallery"
  | "updates"
  | "works"
  | "schemes"
  | "admin_users";

function normaliseMobile(v: string) {
  return (v ?? "").replace(/\D/g, "").slice(-10);
}

export async function lookupRoleImpl(mobile: string) {
  const m = normaliseMobile(mobile);
  if (!m) return { role: null as string | null };
  const { data } = await supabaseAdmin
    .from("admin_users")
    .select("role")
    .eq("mobile", m)
    .maybeSingle();
  return { role: (data as { role?: string } | null)?.role ?? null };
}

export async function assertAdmin(auth: AdminAuth) {
  const pin = process.env.ADMIN_PIN;
  if (!pin) throw new Error("Admin PIN is not configured");
  if (!auth || auth.pin !== pin) throw new Error("Invalid admin phone number or PIN");
  const { role } = await lookupRoleImpl(auth.phone ?? "");
  if (role !== "admin" && role !== "super_admin") {
    throw new Error("Invalid admin phone number or PIN");
  }
  return role;
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

export async function adminListAdminsImpl() {
  const { data, error } = await supabaseAdmin
    .from("admin_users")
    .select("id, mobile, name, role")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as { id: string; mobile: string; name: string; role: string }[];
}

export async function saveRowImpl(table: AdminTable, row: Record<string, unknown>) {
  const payload = { ...row };
  if (table === "admin_users" && typeof payload.mobile === "string") {
    payload.mobile = normaliseMobile(payload.mobile);
  }
  const client = supabaseAdmin.from(table) as unknown as {
    update: (r: Record<string, unknown>) => {
      eq: (c: string, v: string) => Promise<{ error: { message: string } | null }>;
    };
    insert: (r: Record<string, unknown>) => Promise<{ error: { message: string } | null }>;
  };
  const id = payload.id as string | undefined;
  delete payload.id;
  const { error } = id ? await client.update(payload).eq("id", id) : await client.insert(payload);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function deleteRowImpl(table: AdminTable, id: string) {
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
