import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Save, Search, Trash2, Upload } from "lucide-react";
import { AppImage } from "@/components/AppImage";
import { adminDeleteRow, adminSaveRow, adminUploadImage } from "@/lib/admin";
import { galleryQuery, type GalleryRow } from "@/lib/queries";

type Row = GalleryRow & { created_at?: string };

/** Full gallery management: bulk upload, edit, reorder, search, delete. */
export function GalleryManager() {
  const qc = useQueryClient();
  const { data } = useQuery(galleryQuery);
  const [rows, setRows] = useState<Row[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const dragFrom = useRef<number | null>(null);

  useEffect(() => setRows((data ?? []) as Row[]), [data]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => `${r.title_mr} ${r.title_en}`.toLowerCase().includes(q));
  }, [rows, search]);

  const patch = (id: string, p: Partial<Row>) =>
    setRows((r) => r.map((row) => (row.id === id ? { ...row, ...p } : row)));

  const refresh = () => qc.invalidateQueries({ queryKey: ["gallery"] });

  const save = async (row: Row) => {
    setStatus(null);
    try {
      await adminSaveRow("gallery", {
        id: row.id,
        title_mr: row.title_mr,
        title_en: row.title_en,
        image_url: row.image_url,
        video_url: row.video_url,
        media_type: row.media_type,
        sort_order: row.sort_order,
      });
      await refresh();
      setStatus("Saved — live for everyone");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Could not save");
    }
  };

  /** Upload many files at once; each becomes a gallery row immediately. */
  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setStatus(null);
    try {
      let order = rows.length;
      for (const file of Array.from(files)) {
        const url = await adminUploadImage(file);
        order += 1;
        await adminSaveRow("gallery", {
          title_mr: "",
          title_en: file.name.replace(/\.[^.]+$/, ""),
          image_url: url,
          video_url: "",
          media_type: "photo",
          sort_order: order,
        });
      }
      await refresh();
      setStatus(`${files.length} photo(s) uploaded`);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const remove = async (row: Row) => {
    setConfirmId(null);
    await adminDeleteRow("gallery", row.id);
    await refresh();
    setStatus("Photo deleted");
  };

  /** Persist a new visual order for every row. */
  const commitOrder = async (next: Row[]) => {
    setRows(next);
    setBusy(true);
    try {
      await Promise.all(
        next.map((row, i) => adminSaveRow("gallery", { id: row.id, sort_order: i + 1 })),
      );
      await refresh();
      setStatus("Order saved");
    } finally {
      setBusy(false);
    }
  };

  const move = (index: number, delta: number) => {
    const next = [...rows];
    const to = index + delta;
    if (to < 0 || to >= next.length) return;
    const [item] = next.splice(index, 1);
    next.splice(to, 0, item);
    void commitOrder(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => void upload(e.target.files)}
        />
        <button
          onClick={() => fileInput.current?.click()}
          disabled={busy}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60"
        >
          <Upload className="h-4 w-4" /> {busy ? "Working…" : "Upload photos"}
        </button>
        <label className="flex flex-1 items-center gap-2 rounded-xl border border-input px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search photos"
            className="w-full bg-transparent text-sm outline-none"
          />
        </label>
        {status ? <span className="text-sm text-muted-foreground">{status}</span> : null}
      </div>

      <p className="text-xs text-muted-foreground">
        Drag a card, or use the arrows, to change the order shown in the app.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {visible.map((row) => {
          const index = rows.findIndex((r) => r.id === row.id);
          return (
            <div
              key={row.id}
              draggable
              onDragStart={() => (dragFrom.current = index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                const from = dragFrom.current;
                dragFrom.current = null;
                if (from === null || from === index) return;
                const next = [...rows];
                const [item] = next.splice(from, 1);
                next.splice(index, 0, item);
                void commitOrder(next);
              }}
              className="card-soft space-y-3 p-4"
            >
              <AppImage src={row.image_url} alt={row.title_en} className="h-40 w-full rounded-2xl" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {row.created_at
                    ? new Date(row.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </span>
                <span className="flex gap-1">
                  <button
                    onClick={() => move(index, -1)}
                    aria-label="Move up"
                    className="rounded-lg border border-input p-1"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => move(index, 1)}
                    aria-label="Move down"
                    className="rounded-lg border border-input p-1"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </span>
              </div>
              <input
                value={row.title_mr}
                onChange={(e) => patch(row.id, { title_mr: e.target.value })}
                placeholder="Caption (Marathi)"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <input
                value={row.title_en}
                onChange={(e) => patch(row.id, { title_en: e.target.value })}
                placeholder="Caption (English)"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <input
                value={row.video_url}
                onChange={(e) =>
                  patch(row.id, {
                    video_url: e.target.value,
                    media_type: e.target.value ? "video" : "photo",
                  })
                }
                placeholder="Video link (optional)"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => void save(row)}
                  className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-bold text-primary-foreground"
                >
                  <Save className="h-4 w-4" /> Save
                </button>
                <button
                  onClick={() => setConfirmId(row.id)}
                  className="flex items-center gap-2 rounded-lg border border-destructive/30 px-3 py-2 text-sm font-bold text-destructive"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </div>

              {confirmId === row.id ? (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm">
                  <p className="font-semibold">Delete this photo permanently?</p>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => void remove(row)}
                      className="rounded-lg bg-destructive px-3 py-1.5 text-xs font-bold text-destructive-foreground"
                    >
                      Yes, delete
                    </button>
                    <button
                      onClick={() => setConfirmId(null)}
                      className="rounded-lg border border-input px-3 py-1.5 text-xs font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
