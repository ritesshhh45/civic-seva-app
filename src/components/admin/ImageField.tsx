import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { AppImage } from "@/components/AppImage";
import { adminUploadImage } from "@/lib/admin";

/** Upload-or-paste image control used by every admin form. */
export function ImageField({
  label,
  value,
  onChange,
  token,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  token: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      onChange(await adminUploadImage(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  return (
    <div className="sm:col-span-2">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <div className="mt-1 flex items-start gap-3">
        <AppImage src={value} alt="" className="h-20 w-20 shrink-0 rounded-2xl" />
        <div className="min-w-0 flex-1 space-y-2">
          <input
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Upload a photo or paste an image link"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => input.current?.click()}
              disabled={busy}
              className="press flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-xs font-bold text-secondary-foreground disabled:opacity-60"
            >
              <Upload className="h-4 w-4" /> {busy ? "Uploading…" : "Upload photo"}
            </button>
            {value ? (
              <button
                type="button"
                onClick={() => onChange("")}
                className="text-xs font-semibold text-destructive"
              >
                Remove
              </button>
            ) : null}
          </div>
          {error ? <p className="text-xs font-semibold text-destructive">{error}</p> : null}
          <input
            ref={input}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => void pick(e.target.files?.[0])}
          />
        </div>
      </div>
    </div>
  );
}
