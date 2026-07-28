import { createServerFn } from "@tanstack/react-start";

export type AdminTableName =
  | "categories"
  | "notifications"
  | "gallery"
  | "updates"
  | "works"
  | "schemes"
  | "admin_users";

export const registerUser = createServerFn({ method: "POST" })
  .inputValidator((d: { deviceId: string; name: string; mobile: string }) => d)
  .handler(async ({ data }) => {
    const { registerUserImpl } = await import("./api.server");
    return registerUserImpl(data);
  });

export const logTap = createServerFn({ method: "POST" })
  .inputValidator(
    (d: {
      deviceId: string;
      name: string;
      mobile: string;
      categoryId: string;
      categoryName: string;
    }) => d,
  )
  .handler(async ({ data }) => {
    const { logTapImpl } = await import("./api.server");
    return logTapImpl(data);
  });

export const myHistory = createServerFn({ method: "POST" })
  .inputValidator((d: { deviceId: string }) => d)
  .handler(async ({ data }) => {
    const { myHistoryImpl } = await import("./api.server");
    return myHistoryImpl(data.deviceId);
  });

export const lookupRole = createServerFn({ method: "POST" })
  .inputValidator((d: { mobile: string }) => d)
  .handler(async ({ data }) => {
    const { lookupRoleImpl } = await import("./api.server");
    return lookupRoleImpl(data.mobile);
  });

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((d: { phone: string; pin: string }) => d)
  .handler(async ({ data }) => {
    const { assertAdmin } = await import("./api.server");
    const role = await assertAdmin(data);
    return { ok: true, role };
  });

export const adminListTaps = createServerFn({ method: "POST" })
  .inputValidator((d: { phone: string; pin: string }) => d)
  .handler(async ({ data }) => {
    const { assertAdmin, adminListTapsImpl } = await import("./api.server");
    await assertAdmin(data);
    return adminListTapsImpl();
  });

export const adminListRows = createServerFn({ method: "POST" })
  .inputValidator((d: { phone: string; pin: string; table: AdminTableName }) => d)
  .handler(async ({ data }) => {
    const { assertAdmin, adminListRowsImpl } = await import("./api.server");
    await assertAdmin(data);
    return adminListRowsImpl(data.table);
  });

export const adminUpdateConfig = createServerFn({ method: "POST" })
  .inputValidator((d: { phone: string; pin: string; patch: Record<string, unknown> }) => d)
  .handler(async ({ data }) => {
    const { assertAdmin, updateConfigImpl } = await import("./api.server");
    await assertAdmin(data);
    return updateConfigImpl(data.patch);
  });

export const adminSaveRow = createServerFn({ method: "POST" })
  .inputValidator(
    (d: {
      phone: string;
      pin: string;
      table: AdminTableName;
      row: Record<string, unknown>;
    }) => d,
  )
  .handler(async ({ data }) => {
    const { assertAdmin, saveRowImpl } = await import("./api.server");
    await assertAdmin(data);
    return saveRowImpl(data.table, data.row);
  });

export const adminDeleteRow = createServerFn({ method: "POST" })
  .inputValidator((d: { phone: string; pin: string; table: AdminTableName; id: string }) => d)
  .handler(async ({ data }) => {
    const { assertAdmin, deleteRowImpl } = await import("./api.server");
    await assertAdmin(data);
    return deleteRowImpl(data.table, data.id);
  });
