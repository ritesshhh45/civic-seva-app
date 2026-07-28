import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Save, Trash2 } from "lucide-react";
import { adminDeleteRow, adminSaveRow, type AdminTableName } from "@/lib/api.functions";

export type FieldSpec<T> = {
  key: keyof T & string;
  label: string;
  type?: "text" | "textarea" | "bool" | "number";
};

type Row = { id: string } & Record<string, unknown>;

export function CrudTab<T extends Row>({
  auth,
  table,
  queryKey,
  options,
  fields,
  blank,
  addLabel,
  titleOf,
}: {
  auth: { phone: string; pin: string };
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
  const { data } = useQuery(options);
  const save = useServerFn(adminSaveRow);
  const remove = useServerFn(adminDeleteRow);
  const [rows, setRows] = useState<T[]>([]);

  useEffect(() => setRows(data ?? []), [data]);

  const update = (i: number, patch: Partial<T>) =>
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));

  const persist = async (row: T) => {
    const { id, created_at, ...rest } = row as T & { created_at?: string };
    void created_at;
    await save({
      data: {
        ...auth,
        table,
        row: (id.startsWith("new-") ? rest : { id, ...rest }) as Record<string, unknown>,
      },
    });
    await qc.invalidateQueries({ queryKey: [queryKey] });
  };

  const del = async (row: T) => {
    if (row.id.startsWith("new-")) return setRows((r) => r.filter((x) => x.id !== row.id));
    await remove({ data: { ...auth, table, id: row.id } });
    await qc.invalidateQueries({ queryKey: [queryKey] });
  };

  return (
    <div className="space-y-4">
      <button
        onClick={() =>
          setRows((r) => [{ id: `new-${crypto.randomUUID()}`, ...blank(r.length) } as T, ...r])
        }
        className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground"
      >
        <Plus className="h-4 w-4" /> {addLabel}
      </button>

      {rows.map((row, i) => (
        <div key={row.id} className="card-soft space-y-3 p-4">
          <p className="text-sm font-bold">{titleOf(row) || "—"}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {fields.map((f) => {
              const value = row[f.key];
              if (f.type === "bool") {
                return (
                  <label key={f.key} className="flex items-center gap-2 text-sm font-semibold">
                    <input
                      type="checkbox"
                      checked={Boolean(value)}
                      onChange={(e) => update(i, { [f.key]: e.target.checked } as Partial<T>)}
                      className="h-4 w-4 accent-[var(--primary)]"
                    />
                    {f.label}
                  </label>
                );
              }
              if (f.type === "textarea") {
                return (
                  <label key={f.key} className="block sm:col-span-2">
                    <span className="text-xs font-semibold text-muted-foreground">{f.label}</span>
                    <textarea
                      rows={3}
                      value={String(value ?? "")}
                      onChange={(e) => update(i, { [f.key]: e.target.value } as Partial<T>)}
                      className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                  </label>
                );
              }
              return (
                <label key={f.key} className="block">
                  <span className="text-xs font-semibold text-muted-foreground">{f.label}</span>
                  <input
                    type={f.type === "number" ? "number" : "text"}
                    value={String(value ?? "")}
                    onChange={(e) =>
                      update(i, {
                        [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value,
                      } as Partial<T>)
                    }
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </label>
              );
            })}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => persist(row)}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
            >
              <Save className="h-4 w-4" /> Save
            </button>
            <button
              onClick={() => del(row)}
              className="flex items-center gap-2 rounded-lg border border-destructive/30 px-4 py-2 text-sm font-bold text-destructive"
            >
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
