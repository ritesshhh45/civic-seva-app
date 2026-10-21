import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Save, Trash2 } from "lucide-react";
import {
  adminDeleteRow,
  adminSaveRow,
  adminSendPush,
  type AdminTableName,
} from "@/lib/admin";
import { ImageField } from "./ImageField";
import { translateMrToEn } from "@/lib/translate";

export type FieldSpec<T> = {
  key: keyof T & string;
  label: string;
  type?: "text" | "textarea" | "bool" | "number" | "image";
};

type Row = { id: string } & Record<string, unknown>;

export function CrudTab<T extends Row>({
  table,
  queryKey,
  options,
  fields,
  blank,
  addLabel,
  titleOf,
}: {
  table: AdminTableName;
  queryKey: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options: any;
  fields: FieldSpec<T>[];
  blank: (count: number) => Omit<T, "id">;
  addLabel: string;
  titleOf: (row: T) => string;
}) {
  const qc = useQueryClient();

  const { data } = useQuery(options) as {
    data: T[] | undefined;
  };

  const [rows, setRows] = useState<T[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    setRows(data ?? []);
  }, [data]);

  const update = (i: number, patch: Partial<T>) => {
    setRows((r) =>
      r.map((row, idx) =>
        idx === i ? { ...row, ...patch } : row,
      ),
    );
  };

  const persist = async (inputRow: T) => {
    let row = inputRow;

    // Updates: Marathi is the source. Auto-fill English before saving (never blocks on failure).
    if (table === "updates") {
      setStatus("English translate hot aahe...");
      const r = row as T & Record<string, unknown>;
      const [t, b, c] = await Promise.all([
        translateMrToEn(String(r.title_mr ?? "")),
        translateMrToEn(String(r.body_mr ?? "")),
        translateMrToEn(String(r.category_mr ?? "")),
      ]);
      row = {
        ...row,
        title_en: t || String(r.title_mr ?? ""),
        body_en: b || String(r.body_mr ?? ""),
        category_en: c || String(r.category_mr ?? ""),
        publish_at: String(r.publish_at ?? "") || new Date().toISOString(),
      } as T;
    }

    const { id, created_at, updated_at, ...rest } = row as T & {
      created_at?: string;
      updated_at?: string;
    };

    void created_at;
    void updated_at;

    setStatus(null);

    try {
      // ------------------------------------------------------------
      // 1. FIRST SAVE THE UPDATE / ROW TO SUPABASE
      // ------------------------------------------------------------
      await adminSaveRow(
        table,
        (
          id.startsWith("new-")
            ? rest
            : { id, ...rest }
        ) as Record<string, unknown>,
      );

      // Refresh the data after successful database save.
      await qc.invalidateQueries({
        queryKey: [queryKey],
      });

      // ------------------------------------------------------------
      // 2. IF THIS IS AN UPDATE, SEND PUSH AUTOMATICALLY
      // ------------------------------------------------------------
      if (table === "updates") {
        const updateRow = row as T & Record<string, unknown>;

        const titleMr = String(updateRow.title_mr ?? "").trim();
        const titleEn = String(updateRow.title_en ?? "").trim();

        const bodyMr = String(updateRow.body_mr ?? "").trim();
        const bodyEn = String(updateRow.body_en ?? "").trim();

        // Marathi first, English fallback.
        const title =
          titleMr ||
          titleEn ||
          "नवीन अपडेट उपलब्ध आहे";

        const body =
          bodyMr ||
          bodyEn ||
          "Civic Seva मध्ये नवीन अपडेट उपलब्ध आहे.";

        try {
          const result = await adminSendPush({
            kind: "update",
            title,
            body,

            // IMPORTANT:
            // Do NOT pass the temporary "new-..." id.
            // Existing saved rows can safely use their real id.
            ...(id.startsWith("new-")
              ? {}
              : { sourceId: id }),
          });

          if (result.configured === false) {
            setStatus(
              "Update saved. Push is not configured yet.",
            );
          } else {
            setStatus(
              `Update saved. Push sent to ${result.sent ?? 0} device(s).`,
            );
          }
        } catch (pushErr) {
          // IMPORTANT:
          // Database save already succeeded.
          // Push failure must NEVER undo/block the update.
          setStatus(
            pushErr instanceof Error
              ? `Update saved, but push failed: ${pushErr.message}`
              : "Update saved, but push notification failed.",
          );
        }

        return;
      }

      // ------------------------------------------------------------
      // 3. NORMAL CRUD TABLE
      // ------------------------------------------------------------
      setStatus("Saved — live for everyone");
    } catch (err) {
      setStatus(
        err instanceof Error
          ? err.message
          : "Could not save",
      );
    }
  };

  const del = async (row: T) => {
    if (row.id.startsWith("new-")) {
      setRows((r) =>
        r.filter((x) => x.id !== row.id),
      );
      return;
    }

    try {
      await adminDeleteRow(table, row.id);

      await qc.invalidateQueries({
        queryKey: [queryKey],
      });

      setStatus("Deleted");
    } catch (err) {
      setStatus(
        err instanceof Error
          ? err.message
          : "Could not delete",
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* ADD BUTTON + STATUS */}
      <div className="flex items-center gap-3">
        <button
          onClick={() =>
            setRows((r) => [
              {
                id: `new-${crypto.randomUUID()}`,
                ...blank(r.length),
              } as T,
              ...r,
            ])
          }
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground"
        >
          <Plus className="h-4 w-4" />
          {addLabel}
        </button>

        {status ? (
          <span className="text-sm text-muted-foreground">
            {status}
          </span>
        ) : null}
      </div>

      {/* ROWS */}
      {rows.map((row, i) => (
        <div
          key={row.id}
          className="card-soft space-y-3 p-4"
        >
          <p className="text-sm font-bold">
            {titleOf(row) || "—"}
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            {fields.map((f) => {
              const value = row[f.key];

              {/* IMAGE */}
              if (f.type === "image") {
                return (
                  <ImageField
                    key={f.key}
                    label={f.label}
                    value={String(value ?? "")}
                    onChange={(url) =>
                      update(i, {
                        [f.key]: url,
                      } as Partial<T>)
                    }
                  />
                );
              }

              {/* BOOLEAN */}
              if (f.type === "bool") {
                return (
                  <label
                    key={f.key}
                    className="flex items-center gap-2 text-sm font-semibold"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(value)}
                      onChange={(e) =>
                        update(i, {
                          [f.key]: e.target.checked,
                        } as Partial<T>)
                      }
                      className="h-4 w-4 accent-[var(--primary)]"
                    />

                    {f.label}
                  </label>
                );
              }

              {/* TEXTAREA */}
              if (f.type === "textarea") {
                return (
                  <label
                    key={f.key}
                    className="block sm:col-span-2"
                  >
                    <span className="text-xs font-semibold text-muted-foreground">
                      {f.label}
                    </span>

                    <textarea
                      rows={3}
                      value={String(value ?? "")}
                      onChange={(e) =>
                        update(i, {
                          [f.key]: e.target.value,
                        } as Partial<T>)
                      }
                      className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                  </label>
                );
              }

              {/* TEXT / NUMBER */}
              return (
                <label
                  key={f.key}
                  className="block"
                >
                  <span className="text-xs font-semibold text-muted-foreground">
                    {f.label}
                  </span>

                  <input
                    type={
                      f.type === "number"
                        ? "number"
                        : "text"
                    }
                    value={String(value ?? "")}
                    onChange={(e) =>
                      update(i, {
                        [f.key]:
                          f.type === "number"
                            ? Number(e.target.value)
                            : e.target.value,
                      } as Partial<T>)
                    }
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </label>
              );
            })}
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex gap-3">
            <button
              onClick={() => persist(row)}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
            >
              <Save className="h-4 w-4" />

              {table === "updates"
                ? "Save & Send Push"
                : "Save"}
            </button>

            <button
              onClick={() => del(row)}
              className="flex items-center gap-2 rounded-lg border border-destructive/30 px-4 py-2 text-sm font-bold text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}