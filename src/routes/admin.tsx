import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Phone, MessageCircle, Trash2, Plus, Save } from "lucide-react";
import {
  adminDeleteRow,
  adminListTaps,
  adminLogin,
  adminSaveRow,
  adminUpdateConfig,
} from "@/lib/api.functions";
import {
  categoriesQuery,
  configQuery,
  galleryQuery,
  notificationsQuery,
  updatesQuery,
  worksQuery,
  schemesQuery,
  waLink,
  type Category,
  type GalleryRow,
  type NotificationRow,
  type UpdateRow,
  type WorkRow,
  type SchemeRow,
} from "@/lib/queries";
import { CrudTab } from "@/components/admin/CrudTab";
import { ICON_NAMES, CategoryIcon } from "@/components/CategoryIcon";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel — Ward Seva App" },
      { name: "description", content: "Manage representative details, categories, citizens and notices." },
      { property: "og:title", content: "Admin Panel — Ward Seva App" },
      { property: "og:description", content: "Manage app content and citizen follow-ups." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const AUTH_KEY = "seva_admin_auth";
type Auth = { phone: string; pin: string };

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <input
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}

function AdminPage() {
  const [auth, setAuth] = useState<Auth | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(AUTH_KEY);
    if (raw) {
      try {
        setAuth(JSON.parse(raw) as Auth);
      } catch {
        /* ignore */
      }
    }
  }, []);

  if (!auth) return <AdminLogin onSuccess={setAuth} />;
  return <AdminDashboard auth={auth} onLogout={() => { localStorage.removeItem(AUTH_KEY); setAuth(null); }} />;
}

function AdminLogin({ onSuccess }: { onSuccess: (a: Auth) => void }) {
  const login = useServerFn(adminLogin);
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login({ data: { phone, pin } });
      const a = { phone, pin };
      localStorage.setItem(AUTH_KEY, JSON.stringify(a));
      onSuccess(a);
    } catch {
      setError("Invalid phone number or PIN");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="tricolor-bar h-1.5 w-full" />
      <form onSubmit={submit} className="mx-auto max-w-sm px-5 pt-16">
        <h1 className="text-2xl font-extrabold">Admin panel</h1>
        <p className="mt-1 text-sm text-muted-foreground">Authorised phone number only.</p>
        <div className="card-soft mt-6 space-y-4 p-5">
          <Field label="Phone number" value={phone} onChange={setPhone} />
          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground">Admin PIN</span>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </label>
          {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
          <button
            disabled={busy}
            className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
          >
            Sign in
          </button>
        </div>
      </form>
    </div>
  );
}

const TABS = [
  "Settings",
  "Updates",
  "Works",
  "Schemes",
  "Categories",
  "Citizens",
  "Notices",
  "Gallery",
] as const;

function AdminDashboard({ auth, onLogout }: { auth: Auth; onLogout: () => void }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Settings");

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="tricolor-bar h-1.5 w-full" />
      <header className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
        <h1 className="text-xl font-extrabold">Admin panel</h1>
        <button onClick={onLogout} className="text-sm font-semibold text-destructive">
          Log out
        </button>
      </header>
      <div className="mx-auto flex max-w-3xl gap-2 overflow-x-auto px-5 pb-4">
        {TABS.map((tItem) => (
          <button
            key={tItem}
            onClick={() => setTab(tItem)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold ${
              tab === tItem ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {tItem}
          </button>
        ))}
      </div>
      <main className="mx-auto max-w-3xl px-5">
        {tab === "Settings" ? <SettingsTab auth={auth} /> : null}
        {tab === "Categories" ? <CategoriesTab auth={auth} /> : null}
        {tab === "Citizens" ? <CitizensTab auth={auth} /> : null}
        {tab === "Notices" ? <NoticesTab auth={auth} /> : null}
        {tab === "Gallery" ? <GalleryTab auth={auth} /> : null}
        {tab === "Updates" ? (
          <CrudTab<UpdateRow>
            auth={auth}
            table="updates"
            queryKey="updates"
            options={updatesQuery}
            addLabel="New update"
            titleOf={(r) => r.title_mr || r.title_en}
            blank={() => ({
              title_mr: "",
              title_en: "",
              body_mr: "",
              body_en: "",
              image_url: "",
              category_mr: "",
              category_en: "",
              is_pinned: false,
              is_important: false,
              is_archived: false,
              publish_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
            })}
            fields={[
              { key: "title_mr", label: "Title (Marathi)" },
              { key: "title_en", label: "Title (English)" },
              { key: "body_mr", label: "Body (Marathi)", type: "textarea" },
              { key: "body_en", label: "Body (English)", type: "textarea" },
              { key: "category_mr", label: "Category (Marathi)" },
              { key: "category_en", label: "Category (English)" },
              { key: "image_url", label: "Image URL" },
              { key: "publish_at", label: "Publish at (ISO)" },
              { key: "is_pinned", label: "Pinned", type: "bool" },
              { key: "is_important", label: "Breaking / important", type: "bool" },
              { key: "is_archived", label: "Archived", type: "bool" },
            ]}
          />
        ) : null}
        {tab === "Works" ? (
          <CrudTab<WorkRow>
            auth={auth}
            table="works"
            queryKey="works"
            options={worksQuery}
            addLabel="New development work"
            titleOf={(r) => r.title_mr || r.title_en}
            blank={(n) => ({
              title_mr: "",
              title_en: "",
              desc_mr: "",
              desc_en: "",
              image_url: "",
              icon: "Construction",
              status_mr: "",
              status_en: "",
              sort_order: n + 1,
              is_active: true,
            })}
            fields={[
              { key: "title_mr", label: "Title (Marathi)" },
              { key: "title_en", label: "Title (English)" },
              { key: "desc_mr", label: "Description (Marathi)", type: "textarea" },
              { key: "desc_en", label: "Description (English)", type: "textarea" },
              { key: "status_mr", label: "Status (Marathi)" },
              { key: "status_en", label: "Status (English)" },
              { key: "image_url", label: "Image URL" },
              { key: "icon", label: "Icon name" },
              { key: "sort_order", label: "Order", type: "number" },
              { key: "is_active", label: "Active", type: "bool" },
            ]}
          />
        ) : null}
        {tab === "Schemes" ? (
          <CrudTab<SchemeRow>
            auth={auth}
            table="schemes"
            queryKey="schemes"
            options={schemesQuery}
            addLabel="New scheme"
            titleOf={(r) => r.name_mr || r.name_en}
            blank={(n) => ({
              name_mr: "",
              name_en: "",
              category_mr: "",
              category_en: "",
              logo_url: "",
              banner_url: "",
              desc_mr: "",
              desc_en: "",
              eligibility_mr: "",
              eligibility_en: "",
              documents_mr: "",
              documents_en: "",
              benefits_mr: "",
              benefits_en: "",
              last_date: "",
              website_url: "",
              is_new: true,
              is_featured: false,
              is_active: true,
              sort_order: n + 1,
            })}
            fields={[
              { key: "name_mr", label: "Name (Marathi)" },
              { key: "name_en", label: "Name (English)" },
              { key: "category_mr", label: "Category (Marathi)" },
              { key: "category_en", label: "Category (English)" },
              { key: "logo_url", label: "Logo URL" },
              { key: "banner_url", label: "Banner URL" },
              { key: "desc_mr", label: "Description (Marathi)", type: "textarea" },
              { key: "desc_en", label: "Description (English)", type: "textarea" },
              { key: "eligibility_mr", label: "Eligibility (Marathi)", type: "textarea" },
              { key: "eligibility_en", label: "Eligibility (English)", type: "textarea" },
              { key: "documents_mr", label: "Documents (Marathi)", type: "textarea" },
              { key: "documents_en", label: "Documents (English)", type: "textarea" },
              { key: "benefits_mr", label: "Benefits (Marathi)", type: "textarea" },
              { key: "benefits_en", label: "Benefits (English)", type: "textarea" },
              { key: "last_date", label: "Last date" },
              { key: "website_url", label: "Official website URL" },
              { key: "is_new", label: "New", type: "bool" },
              { key: "is_featured", label: "Featured", type: "bool" },
              { key: "is_active", label: "Active", type: "bool" },
              { key: "sort_order", label: "Order", type: "number" },
            ]}
          />
        ) : null}
      </main>
    </div>
  );
}


function SettingsTab({ auth }: { auth: Auth }) {
  const qc = useQueryClient();
  const { data } = useQuery(configQuery);
  const save = useServerFn(adminUpdateConfig);
  const [form, setForm] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      const { id, ...rest } = data;
      void id;
      setForm(rest as unknown as Record<string, string>);
    }
  }, [data]);

  const set = (k: string) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setStatus(null);
    try {
      await save({ data: { ...auth, patch: form } });
      await qc.invalidateQueries({ queryKey: ["app_config"] });
      setStatus("Saved");
    } catch {
      setStatus("Could not save");
    }
  };

  const fields: [string, string][] = [
    ["rep_name_mr", "Name (Marathi)"],
    ["rep_name_en", "Name (English)"],
    ["ward_mr", "Ward (Marathi)"],
    ["ward_en", "Ward (English)"],
    ["slogan_mr", "Slogan (Marathi)"],
    ["slogan_en", "Slogan (English)"],
    ["tagline_mr", "Tagline (Marathi)"],
    ["tagline_en", "Tagline (English)"],
    ["party_name_mr", "Party name (Marathi)"],
    ["party_name_en", "Party name (English)"],
    ["photo_url", "Representative photo URL"],
    ["party_logo_url", "Party logo URL"],
    ["app_name", "App name (store listing)"],
    ["app_icon_url", "App icon URL (store listing)"],
    ["phone", "Phone number"],
    ["whatsapp", "WhatsApp number"],
    ["accent_color", "Accent colour (hex)"],
    ["admin_phone", "Admin phone number"],
  ];

  return (
    <div className="card-soft space-y-4 p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map(([key, label]) => (
          <Field key={key} label={label} value={form[key] ?? ""} onChange={set(key)} />
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={submit}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"
        >
          <Save className="h-4 w-4" /> Save
        </button>
        {status ? <span className="text-sm text-muted-foreground">{status}</span> : null}
      </div>
    </div>
  );
}

function CategoriesTab({ auth }: { auth: Auth }) {
  const qc = useQueryClient();
  const { data } = useQuery(categoriesQuery);
  const save = useServerFn(adminSaveRow);
  const remove = useServerFn(adminDeleteRow);
  const [rows, setRows] = useState<Category[]>([]);

  useEffect(() => setRows(data ?? []), [data]);

  const update = (i: number, patch: Partial<Category>) =>
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));

  const persist = async (row: Category) => {
    const { id, ...rest } = row;
    await save({
      data: {
        ...auth,
        table: "categories",
        row: id.startsWith("new-") ? rest : { id, ...rest },
      },
    });
    await qc.invalidateQueries({ queryKey: ["categories"] });
  };

  const del = async (row: Category) => {
    if (row.id.startsWith("new-")) {
      setRows((r) => r.filter((x) => x.id !== row.id));
      return;
    }
    await remove({ data: { ...auth, table: "categories", id: row.id } });
    await qc.invalidateQueries({ queryKey: ["categories"] });
  };

  return (
    <div className="space-y-4">
      <button
        onClick={() =>
          setRows((r) => [
            ...r,
            {
              id: `new-${crypto.randomUUID()}`,
              name_mr: "",
              name_en: "",
              icon: "CircleAlert",
              message_mr: "",
              message_en: "",
              sort_order: r.length + 1,
              is_active: true,
            },
          ])
        }
        className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground"
      >
        <Plus className="h-4 w-4" /> Add category
      </button>

      {rows.map((row, i) => (
        <div key={row.id} className="card-soft space-y-3 p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/12 text-primary">
              <CategoryIcon name={row.icon} className="h-5 w-5" />
            </span>
            <select
              value={row.icon}
              onChange={(e) => update(i, { icon: e.target.value })}
              className="rounded-lg border border-input bg-background px-2 py-2 text-sm"
            >
              {ICON_NAMES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <label className="ml-auto flex items-center gap-2 text-xs font-semibold">
              <input
                type="checkbox"
                checked={row.is_active}
                onChange={(e) => update(i, { is_active: e.target.checked })}
              />
              Active
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Name (Marathi)" value={row.name_mr} onChange={(v) => update(i, { name_mr: v })} />
            <Field label="Name (English)" value={row.name_en} onChange={(v) => update(i, { name_en: v })} />
            <Field
              label="WhatsApp message (Marathi)"
              value={row.message_mr}
              onChange={(v) => update(i, { message_mr: v })}
            />
            <Field
              label="WhatsApp message (English)"
              value={row.message_en}
              onChange={(v) => update(i, { message_en: v })}
            />
            <Field
              label="Order"
              value={String(row.sort_order)}
              onChange={(v) => update(i, { sort_order: Number(v.replace(/\D/g, "")) || 0 })}
            />
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

function CitizensTab({ auth }: { auth: Auth }) {
  const listTaps = useServerFn(adminListTaps);
  const { data } = useQuery({
    queryKey: ["admin-taps"],
    queryFn: () => listTaps({ data: auth }),
  });

  if (!data || data.length === 0)
    return <p className="card-soft p-6 text-center text-sm text-muted-foreground">No complaints yet.</p>;

  return (
    <ul className="space-y-3">
      {data.map((row) => (
        <li key={row.id} className="card-soft flex items-center gap-3 p-4">
          <div className="min-w-0 flex-1">
            <p className="font-bold">{row.user_name}</p>
            <p className="text-xs text-muted-foreground">
              {row.mobile} · {row.category_name}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {new Date(row.created_at).toLocaleString("en-IN")}
            </p>
          </div>
          <a
            href={`tel:${row.mobile}`}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/12 text-primary"
          >
            <Phone className="h-4 w-4" />
          </a>
          <a
            href={waLink(row.mobile, "नमस्कार, आपल्या तक्रारीबाबत संपर्क करत आहे.")}
            target="_blank"
            rel="noreferrer"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-accent"
          >
            <MessageCircle className="h-4 w-4" />
          </a>
        </li>
      ))}
    </ul>
  );
}

function NoticesTab({ auth }: { auth: Auth }) {
  const qc = useQueryClient();
  const { data } = useQuery(notificationsQuery);
  const save = useServerFn(adminSaveRow);
  const remove = useServerFn(adminDeleteRow);
  const [rows, setRows] = useState<NotificationRow[]>([]);

  useEffect(() => setRows(data ?? []), [data]);

  const update = (i: number, patch: Partial<NotificationRow>) =>
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));

  const persist = async (row: NotificationRow) => {
    const { id, created_at, ...rest } = row;
    void created_at;
    await save({
      data: { ...auth, table: "notifications", row: id.startsWith("new-") ? rest : { id, ...rest } },
    });
    await qc.invalidateQueries({ queryKey: ["notifications"] });
  };

  const del = async (row: NotificationRow) => {
    if (row.id.startsWith("new-")) return setRows((r) => r.filter((x) => x.id !== row.id));
    await remove({ data: { ...auth, table: "notifications", id: row.id } });
    await qc.invalidateQueries({ queryKey: ["notifications"] });
  };

  return (
    <div className="space-y-4">
      <button
        onClick={() =>
          setRows((r) => [
            {
              id: `new-${crypto.randomUUID()}`,
              title_mr: "",
              title_en: "",
              body_mr: "",
              body_en: "",
              created_at: new Date().toISOString(),
            },
            ...r,
          ])
        }
        className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground"
      >
        <Plus className="h-4 w-4" /> New notification
      </button>

      {rows.map((row, i) => (
        <div key={row.id} className="card-soft space-y-3 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Title (Marathi)" value={row.title_mr} onChange={(v) => update(i, { title_mr: v })} />
            <Field label="Title (English)" value={row.title_en} onChange={(v) => update(i, { title_en: v })} />
            <Field label="Message (Marathi)" value={row.body_mr} onChange={(v) => update(i, { body_mr: v })} />
            <Field label="Message (English)" value={row.body_en} onChange={(v) => update(i, { body_en: v })} />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => persist(row)}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
            >
              <Save className="h-4 w-4" /> Send / Save
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

function GalleryTab({ auth }: { auth: Auth }) {
  const qc = useQueryClient();
  const { data } = useQuery(galleryQuery);
  const save = useServerFn(adminSaveRow);
  const remove = useServerFn(adminDeleteRow);
  const [rows, setRows] = useState<GalleryRow[]>([]);

  useEffect(() => setRows(data ?? []), [data]);

  const update = (i: number, patch: Partial<GalleryRow>) =>
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));

  const persist = async (row: GalleryRow) => {
    const { id, ...rest } = row;
    await save({
      data: { ...auth, table: "gallery", row: id.startsWith("new-") ? rest : { id, ...rest } },
    });
    await qc.invalidateQueries({ queryKey: ["gallery"] });
  };

  const del = async (row: GalleryRow) => {
    if (row.id.startsWith("new-")) return setRows((r) => r.filter((x) => x.id !== row.id));
    await remove({ data: { ...auth, table: "gallery", id: row.id } });
    await qc.invalidateQueries({ queryKey: ["gallery"] });
  };

  return (
    <div className="space-y-4">
      <button
        onClick={() =>
          setRows((r) => [
            ...r,
            {
              id: `new-${crypto.randomUUID()}`,
              title_mr: "",
              title_en: "",
              image_url: "",
              sort_order: r.length + 1,
              video_url: "",
              media_type: "photo",
            },
          ])
        }
        className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground"
      >
        <Plus className="h-4 w-4" /> Add photo
      </button>

      {rows.map((row, i) => (
        <div key={row.id} className="card-soft space-y-3 p-4">
          {row.image_url ? (
            <img src={row.image_url} alt={row.title_en} className="h-32 w-full rounded-xl object-cover" />
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Caption (Marathi)" value={row.title_mr} onChange={(v) => update(i, { title_mr: v })} />
            <Field label="Caption (English)" value={row.title_en} onChange={(v) => update(i, { title_en: v })} />
            <Field label="Image URL" value={row.image_url} onChange={(v) => update(i, { image_url: v })} />
            <Field
              label="Order"
              value={String(row.sort_order)}
              onChange={(v) => update(i, { sort_order: Number(v.replace(/\D/g, "")) || 0 })}
            />
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
