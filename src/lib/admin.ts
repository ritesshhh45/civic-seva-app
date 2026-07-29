import { rpc } from "./rpc";

export type AdminSession = { token: string; role: string; mobile: string };
export type AdminTableName =
  | "categories"
  | "notifications"
  | "gallery"
  | "updates"
  | "works"
  | "schemes";

const TOKEN_KEY = "seva_admin_session";

export function loadSession(): AdminSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    return raw ? (JSON.parse(raw) as AdminSession) : null;
  } catch {
    return null;
  }
}

export function saveSession(s: AdminSession) {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(s));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
}

export type LoginResult =
  | { status: "ok"; token: string; role: string; mobile: string }
  | { status: "pending" | "denied" | "revoked" | "invalid" };

export function adminLogin(mobile: string, pin: string) {
  return rpc<LoginResult>("admin_login", { _mobile: mobile, _pin: pin });
}

export function adminSessionInfo(token: string) {
  return rpc<{ status: string; role?: string }>("admin_session_info", { _token: token });
}

export type AdminUserRow = {
  id: string;
  mobile: string;
  name: string;
  role: string;
  status: string;
  requested_at: string;
};

export function adminListAdmins(token: string) {
  return rpc<AdminUserRow[]>("admin_list_admins", { _token: token });
}

export function adminSetAdminStatus(
  token: string,
  id: string,
  status: "approved" | "denied" | "revoked",
  name?: string,
) {
  return rpc<{ ok: boolean }>("admin_set_admin_status", {
    _token: token,
    _id: id,
    _status: status,
    _name: name ?? null,
  });
}

export function adminSaveRow(token: string, table: AdminTableName, row: Record<string, unknown>) {
  return rpc<{ ok: boolean }>("admin_save_row", { _token: token, _table: table, _row: row });
}

export function adminDeleteRow(token: string, table: AdminTableName, id: string) {
  return rpc<{ ok: boolean }>("admin_delete_row", { _token: token, _table: table, _id: id });
}

export function adminUpdateConfig(token: string, patch: Record<string, unknown>) {
  return rpc<{ ok: boolean }>("admin_update_config", { _token: token, _patch: patch });
}

export type TapRow = {
  id: string;
  user_name: string;
  mobile: string;
  category_name: string;
  created_at: string;
};

export function adminListTaps(token: string) {
  return rpc<TapRow[]>("admin_list_taps", { _token: token });
}

export type ImageRow = { id: string; filename: string; content_type: string; created_at: string };

export function adminListImages(token: string) {
  return rpc<ImageRow[]>("admin_list_images", { _token: token });
}

export function adminDeleteImage(token: string, id: string) {
  return rpc<{ ok: boolean }>("admin_delete_image", { _token: token, _id: id });
}

/** Reads a picked file, downscales it and stores it in the app image library. */
export async function adminUploadImage(token: string, file: File): Promise<string> {
  const { dataUrl, contentType } = await prepareImage(file);
  const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  const res = await rpc<{ ok: boolean; id: string; url: string }>("admin_upload_image", {
    _token: token,
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
