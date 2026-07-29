import { rpc } from "./rpc";

export function registerCitizen(input: { deviceId: string; name: string; mobile: string }) {
  return rpc<{ ok: boolean }>("citizen_register", {
    _device_id: input.deviceId,
    _name: input.name,
    _mobile: input.mobile,
  });
}

export function logComplaintTap(input: {
  deviceId: string;
  name: string;
  mobile: string;
  categoryId: string;
  categoryName: string;
}) {
  return rpc<{ ok: boolean }>("citizen_log_tap", {
    _device_id: input.deviceId,
    _name: input.name,
    _mobile: input.mobile,
    _category_id: input.categoryId,
    _category_name: input.categoryName,
  });
}

export type HistoryRow = { id: string; category_name: string; created_at: string };

export function fetchMyHistory(deviceId: string) {
  return rpc<HistoryRow[]>("citizen_history", { _device_id: deviceId });
}

export function lookupAdminRole(mobile: string) {
  return rpc<string | null>("lookup_admin_role", { _mobile: mobile });
}
