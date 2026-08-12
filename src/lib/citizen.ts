import { rpc } from "./rpc";

export function registerCitizen(input: { deviceId: string; name: string; mobile: string }) {
  return rpc<{ ok: boolean }>("citizen_register", {
    _device_id: input.deviceId,
    _name: input.name,
    _mobile: input.mobile,
  });
}

/** Stores the device's push token so the admin panel can notify this citizen. */
export function savePushToken(deviceId: string, token: string, platform: string) {
  return rpc<{ ok: boolean }>("citizen_save_push_token", {
    _device_id: deviceId,
    _token: token,
    _platform: platform,
  });
}

export function logComplaintTap(input: {
  deviceId: string;
  name: string;
  mobile: string;
  categoryId: string;
  categoryName: string;
  description?: string;
}) {
  return rpc<{ ok: boolean; id: string }>("citizen_log_tap", {
    _device_id: input.deviceId,
    _name: input.name,
    _mobile: input.mobile,
    _category_id: input.categoryId,
    _category_name: input.categoryName,
    _description: input.description ?? "",
  });
}

export type HistoryRow = { id: string; category_name: string; created_at: string };

export function fetchMyHistory(deviceId: string) {
  return rpc<HistoryRow[]>("citizen_history", { _device_id: deviceId });
}
