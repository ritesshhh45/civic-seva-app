import { supabase } from "@/integrations/supabase/client";
import { rpc } from "./rpc";

export type AdminTableName =
  | "categories"
  | "notifications"
  | "gallery"
  | "updates"
  | "works"
  | "schemes";

export type AdminMe =
  | { status: "anon" }
  | {
      status: "pending" | "approved" | "denied" | "revoked";
      role: string;
      email: string;
      name: string;
    };

/** Who the currently signed-in email is, from the database. */
export function adminMe() {
  return rpc<AdminMe>("admin_me");
}

function redirectTo() {
  return typeof window === "undefined" ? undefined : `${window.location.origin}/admin`;
}

export async function adminSignIn(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) throw new Error(error.message);
  return adminMe();
}

export async function adminSignUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: { emailRedirectTo: redirectTo() },
  });
  if (error) throw new Error(error.message);
  // When email confirmation is on there is no session yet.
  return { needsVerification: !data.session };
}

export async function adminSendReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo: redirectTo(),
  });
  if (error) throw new Error(error.message);
}

export async function adminSetPassword(password: string) {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw new Error(error.message);
}

export async function adminSignOut() {
  await supabase.auth.signOut();
}

export type AdminAccountRow = {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  created_at: string;
};

export function adminListAdmins() {
  return rpc<AdminAccountRow[]>("admin_list_admins");
}

export function adminSetAdminStatus(
  id: string,
  status: "approved" | "denied" | "revoked",
  name?: string,
) {
  return rpc<{ ok: boolean }>("admin_set_admin_status", {
    _id: id,
    _status: status,
    _name: name ?? null,
  });
}

export function adminSaveRow(table: AdminTableName, row: Record<string, unknown>) {
  return rpc<{ ok: boolean }>("admin_save_row", { _table: table, _row: row });
}

export function adminDeleteRow(table: AdminTableName, id: string) {
  return rpc<{ ok: boolean }>("admin_delete_row", { _table: table, _id: id });
}

export function adminUpdateConfig(patch: Record<string, unknown>) {
  return rpc<{ ok: boolean }>("admin_update_config", { _patch: patch });
}

export const TAP_STATUSES = [
  "submitted",
  "under_review",
  "in_progress",
  "resolved",
  "rejected",
] as const;

export type TapStatus = (typeof TAP_STATUSES)[number];

export const TAP_STATUS_LABEL: Record<TapStatus, string> = {
  submitted: "Submitted",
  under_review: "Under review",
  in_progress: "In progress",
  resolved: "Resolved",
  rejected: "Rejected",
};

export type TapRow = {
  id: string;
  device_id: string;
  user_name: string;
  mobile: string;
  category_name: string;
  description: string;
  photo_url: string;
  status: TapStatus;
  created_at: string;
};

export function adminListTaps() {
  return rpc<TapRow[]>("admin_list_taps");
}

export function adminSetTapStatus(id: string, status: TapStatus) {
  return rpc<{ ok: boolean }>("admin_set_tap_status", { _id: id, _status: status });
}

export type PushResultSummary = {
  ok?: boolean;
  configured?: boolean;
  sent?: number;
  failed?: number;
  targets?: number;
  error?: string;
};

/** Sends a push notification to registered citizens (or one device). */
export async function adminSendPush(input: {
  kind: "notification" | "update" | "complaint_status" | "test";
  title: string;
  body: string;
  sourceId?: string;
  deviceId?: string;
}): Promise<PushResultSummary> {
  const { data, error } = await supabase.functions.invoke("send-push", { body: input });
  if (error) throw new Error(error.message);
  const res = data as PushResultSummary;
  if (res?.error) throw new Error(res.error);
  return res;
}

export type ImageRow = { id: string; filename: string; content_type: string; created_at: string };

export function adminListImages() {
  return rpc<ImageRow[]>("admin_list_images");
}

export function adminDeleteImage(id: string) {
  return rpc<{ ok: boolean }>("admin_delete_image", { _id: id });
}

/** Reads a picked file, downscales it and stores it in the app image library. */
export async function adminUploadImage(file: File): Promise<string> {
  const { dataUrl, contentType } = await prepareImage(file);
  const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  const res = await rpc<{ ok: boolean; id: string; url: string }>("admin_upload_image", {
    _filename: file.name,
    _content_type: contentType,
    _data: base64,
  });
  return res.url;
}

const MAX_EDGE = 1400;

function prepareImage(file: File): Promise<{ dataUrl: string; contentType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the image"));
    reader.onload = () => {
      const src = String(reader.result);
      const img = new Image();
      img.onerror = () => reject(new Error("That file is not a valid image"));
      img.onload = () => {
        const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Could not process the image"));
        ctx.drawImage(img, 0, 0, w, h);
        const keepAlpha = file.type === "image/png";
        const contentType = keepAlpha ? "image/png" : "image/jpeg";
        resolve({ dataUrl: canvas.toDataURL(contentType, 0.85), contentType });
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}
