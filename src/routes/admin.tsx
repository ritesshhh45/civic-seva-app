import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Phone, MessageCircle, Trash2, Plus, Save, ShieldCheck, ShieldX } from "lucide-react";
import {
  adminDeleteRow,
  adminListAdmins,
  adminListTaps,
  adminLogin,
  adminSaveRow,
  adminSessionInfo,
  adminSetAdminStatus,
  adminUpdateConfig,
  clearSession,
  loadSession,
  saveSession,
  type AdminSession,
} from "@/lib/admin";
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
import { ImageField } from "@/components/admin/ImageField";
import { AppImage } from "@/components/AppImage";
import { ICON_NAMES, CategoryIcon } from "@/components/CategoryIcon";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel — Ward Seva App" },
      {
        name: "description",
        content: "Manage representative details, categories, citizens and notices.",
      },
      { property: "og:title", content: "Admin Panel — Ward Seva App" },
      { property: "og:description", content: "Manage app content and citizen follow-ups." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

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
  const [session, setSession] = useState<AdminSession | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const s = loadSession();
    if (!s) {
      setChecked(true);
      return;
    }
    adminSessionInfo(s.token)
      .then((info) => {
        if (info.status === "ok") setSession(s);
        else clearSession();
      })
      .catch(() => clearSession())
      .finally(() => setChecked(true));
  }, []);

  if (!checked) return <div className="min-h-screen bg-background" />;
  if (!session) return <AdminLogin onSuccess={setSession} />;
  return (
    <AdminDashboard
      session={session}
      onLogout={() => {
        clearSession();
        setSession(null);
      }}
    />
  );
}

function AdminLogin({ onSuccess }: { onSuccess: (s: AdminSession) => void }) {
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const res = await adminLogin(phone, pin);
      if (res.status === "ok") {
        const s = { token: res.token, role: res.role, mobile: res.mobile };
        saveSession(s);
        onSuccess(s);
        return;
      }
      setMessage(
        res.status === "pending"
          ? "Access request sent. The main admin must approve your number."
          : res.status === "denied" || res.status === "revoked"
            ? "Your access request was not approved."
            : "Invalid phone number or PIN.",
      );
    } catch {
      setMessage("Could not sign in. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="tricolor-bar h-1.5 w-full" />
      <form onSubmit={submit} className="mx-auto max-w-sm px-5 pt-16">
        <h1 className="text-2xl font-extrabold">Admin panel</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Approved phone numbers only. New numbers are sent to the main admin for approval.
        </p>
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
          {message ? <p className="text-sm font-medium text-destructive">{message}</p> : null}
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
  "Admins",
] as const;

function AdminDashboard({
  session,
  onLogout,
}: {
  session: AdminSession;
  onLogout: () => void;
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Settings");
  const token = session.token;

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="tricolor-bar h-1.5 w-full" />
      <header className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
        <div>
          <h1 className="text-xl font-extrabold">Admin panel</h1>
          <p className="text-xs text-muted-foreground">
            {session.mobile} · {session.role.replace("_", " ")}
          </p>
        </div>
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
        {tab === "Settings" ? <SettingsTab token={token} /> : null}
        {tab === "Categories" ? <CategoriesTab token={token} /> : null}
        {tab === "Citizens" ? <CitizensTab token={token} /> : null}
        {tab === "Notices" ? <NoticesTab token={token} /> : null}
        {tab === "Gallery" ? <GalleryTab token={token} /> : null}
        {tab === "Admins" ? <AdminsTab session={session} /> : null}
        {tab === "Updates" ? (
          <CrudTab<UpdateRow>
            token={token}
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
              { key: "image_url", label: "Photo", type: "image" },
              { key: "publish_at", label: "Publish at (ISO)" },
              { key: "is_pinned", label: "Pinned", type: "bool" },
              { key: "is_important", label: "Breaking / important", type: "bool" },
              { key: "is_archived", label: "Archived", type: "bool" },
            ]}
          />
        ) : null}
        {tab === "Works" ? (
          <CrudTab<WorkRow>
            token={token}
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
              { key: "image_url", label: "Photo", type: "image" },
              { key: "icon", label: "Icon name" },
              { key: "sort_order", label: "Order", type: "number" },
              { key: "is_active", label: "Active", type: "bool" },
            ]}
          />
        ) : null}
        {tab === "Schemes" ? (
          <CrudTab<SchemeRow>
            token={token}
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
              { key: "logo_url", label: "Logo", type: "image" },
              { key: "banner_url", label: "Banner", type: "image" },
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

function SettingsTab({ token }: { token: string }) {
  const qc = useQueryClient();
  const { data } = useQuery(configQuery);
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
      await adminUpdateConfig(token, form);
      await qc.invalidateQueries({ queryKey: ["app_config"] });
      setStatus("Saved — live for everyone");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Could not save");
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
    ["app_name", "App name (store listing)"],
    ["phone", "Phone number"],
    ["whatsapp", "WhatsApp number"],
    ["accent_color", "Accent colour (hex)"],
    ["admin_phone", "Main admin phone number"],
    ["office_address_mr", "Office address (Marathi)"],
    ["office_address_en", "Office address (English)"],
    ["office_map_url", "Office map link"],
  ];

  const images: [string, string][] = [
    ["photo_url", "Representative photo"],
    ["party_logo_url", "Party logo"],
    ["app_icon_url", "App icon (store listing)"],
  ];

  return (
    <div className="card-soft space-y-4 p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        {images.map(([key, label]) => (
          <ImageField
            key={key}
            label={label}
            token={token}
            value={form[key] ?? ""}
            onChange={set(key)}
          />
        ))}
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

function AdminsTab({ session }: { session: AdminSession }) {
  const { data, refetch } = useQuery({
    queryKey: ["admin-admins"],
    queryFn: () => adminListAdmins(session.token),
  });
  const [busy, setBusy] = useState<string | null>(null);

  const act = async (id: string, status: "approved" | "denied" | "revoked") => {
    setBusy(id);
    try {
      await adminSetAdminStatus(session.token, id, status);
      await refetch();
    } finally {
      setBusy(null);
    }
  };

  const rows = data ?? [];
  const pending = rows.filter((r) => r.status === "pending");
  const others = rows.filter((r) => r.status !== "pending");
  const canManage = session.role === "super_admin";

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h2 className="text-sm font-extrabold uppercase tracking-wide text-muted-foreground">
          Pending access requests
        </h2>
        {pending.length === 0 ? (
          <p className="card-soft p-5 text-sm text-muted-foreground">No pending requests.</p>
        ) : (
          pending.map((r) => (
            <div key={r.id} className="card-soft flex items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="font-bold">{r.name || r.mobile}</p>
                <p className="text-xs text-muted-foreground">
                  {r.mobile} · requested {new Date(r.requested_at).toLocaleString("en-IN")}
                </p>
              </div>
              {canManage ? (
                <>
                  <button
                    disabled={busy === r.id}
                    onClick={() => act(r.id, "approved")}
                    className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-2 text-xs font-bold text-secondary-foreground"
                  >
                    <ShieldCheck className="h-4 w-4" /> Allow
                  </button>
                  <button
                    disabled={busy === r.id}
                    onClick={() => act(r.id, "denied")}
                    className="flex items-center gap-1.5 rounded-lg border border-destructive/30 px-3 py-2 text-xs font-bold text-destructive"
                  >
                    <ShieldX className="h-4 w-4" /> Deny
                  </button>
                </>
              ) : null}
            </div>
          ))
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-extrabold uppercase tracking-wide text-muted-foreground">
          Admins
        </h2>
        {others.map((r) => (
          <div key={r.id} className="card-soft flex items-center gap-3 p-4">
            <div className="min-w-0 flex-1">
              <p className="font-bold">{r.name || r.mobile}</p>
              <p className="text-xs text-muted-foreground">
                {r.mobile} · {r.role.replace("_", " ")} · {r.status}
              </p>
            </div>
            {canManage && r.role !== "super_admin" ? (
              <button
                disabled={busy === r.id}
                onClick={() => act(r.id, r.status === "approved" ? "revoked" : "approved")}
                className="rounded-lg border border-input px-3 py-2 text-xs font-bold"
              >
                {r.status === "approved" ? "Revoke" : "Allow"}
              </button>
            ) : null}
          </div>
        ))}
      </section>

      {!canManage ? (
        <p className="text-xs text-muted-foreground">
          Only the main admin can allow or deny access requests.
        </p>
      ) : null}
    </div>
  );
}

function CategoriesTab({ token }: { token: string }) {
  const qc = useQueryClient();
  const { data } = useQuery(categoriesQuery);
  const [rows, setRows] = useState<Category[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => setRows(data ?? []), [data]);

  const update = (i: number, patch: Partial<Category>) =>
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));

  const persist = async (row: Category) => {
    const { id, ...rest } = row;
    setStatus(null);
    try {
      await adminSaveRow(token, "categories", id.startsWith("new-") ? rest : { id, ...rest });
      await qc.invalidateQueries({ queryKey: ["categories"] });
      setStatus("Saved — live for everyone");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Could not save");
    }
  };

  const del = async (row: Category) => {
    if (row.id.startsWith("new-")) {
      setRows((r) => r.filter((x) => x.id !== row.id));
      return;
    }
    await adminDeleteRow(token, "categories", row.id);
    await qc.invalidateQueries({ queryKey: ["categories"] });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
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
        {status ? <span className="text-sm text-muted-foreground">{status}</span> : null}
      </div>

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
            <Field
              label="Name (Marathi)"
              value={row.name_mr}
              onChange={(v) => update(i, { name_mr: v })}
            />
            <Field
              label="Name (English)"
              value={row.name_en}
              onChange={(v) => update(i, { name_en: v })}
            />
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

function CitizensTab({ token }: { token: string }) {
  const { data } = useQuery({
    queryKey: ["admin-taps"],
    queryFn: () => adminListTaps(token),
  });

  if (!data || data.length === 0)
    return (
      <p className="card-soft p-6 text-center text-sm text-muted-foreground">No complaints yet.</p>
    );

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

function NoticesTab({ token }: { token: string }) {
  const qc = useQueryClient();
  const { data } = useQuery(notificationsQuery);
  const [rows, setRows] = useState<NotificationRow[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => setRows(data ?? []), [data]);

  const update = (i: number, patch: Partial<NotificationRow>) =>
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));

  const persist = async (row: NotificationRow) => {
    const { id, created_at, ...rest } = row;
    void created_at;
    setStatus(null);
    try {
      await adminSaveRow(token, "notifications", id.startsWith("new-") ? rest : { id, ...rest });
      await qc.invalidateQueries({ queryKey: ["notifications"] });
      setStatus("Saved — live for everyone");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Could not save");
    }
  };

  const del = async (row: NotificationRow) => {
    if (row.id.startsWith("new-")) return setRows((r) => r.filter((x) => x.id !== row.id));
    await adminDeleteRow(token, "notifications", row.id);
    await qc.invalidateQueries({ queryKey: ["notifications"] });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
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
        {status ? <span className="text-sm text-muted-foreground">{status}</span> : null}
      </div>

      {rows.map((row, i) => (
        <div key={row.id} className="card-soft space-y-3 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Title (Marathi)"
              value={row.title_mr}
              onChange={(v) => update(i, { title_mr: v })}
            />
            <Field
              label="Title (English)"
              value={row.title_en}
              onChange={(v) => update(i, { title_en: v })}
            />
            <Field
              label="Message (Marathi)"
              value={row.body_mr}
              onChange={(v) => update(i, { body_mr: v })}
            />
            <Field
              label="Message (English)"
              value={row.body_en}
              onChange={(v) => update(i, { body_en: v })}
            />
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

function GalleryTab({ token }: { token: string }) {
  const qc = useQueryClient();
  const { data } = useQuery(galleryQuery);
  const [rows, setRows] = useState<GalleryRow[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => setRows(data ?? []), [data]);

  const update = (i: number, patch: Partial<GalleryRow>) =>
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));

  const persist = async (row: GalleryRow) => {
    const { id, ...rest } = row;
    setStatus(null);
    try {
      await adminSaveRow(token, "gallery", id.startsWith("new-") ? rest : { id, ...rest });
      await qc.invalidateQueries({ queryKey: ["gallery"] });
      setStatus("Saved — live for everyone");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Could not save");
    }
  };

  const del = async (row: GalleryRow) => {
    if (row.id.startsWith("new-")) return setRows((r) => r.filter((x) => x.id !== row.id));
    await adminDeleteRow(token, "gallery", row.id);
    await qc.invalidateQueries({ queryKey: ["gallery"] });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
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
          <Plus className="h-4 w-4" /> Add photo / video
        </button>
        {status ? <span className="text-sm text-muted-foreground">{status}</span> : null}
      </div>

      {rows.map((row, i) => (
        <div key={row.id} className="card-soft space-y-3 p-4">
          <AppImage src={row.image_url} alt={row.title_en} className="h-32 w-full rounded-xl" />
          <div className="grid gap-3 sm:grid-cols-2">
            <ImageField
              label="Photo"
              token={token}
              value={row.image_url}
              onChange={(v) => update(i, { image_url: v })}
            />
            <Field
              label="Caption (Marathi)"
              value={row.title_mr}
              onChange={(v) => update(i, { title_mr: v })}
            />
            <Field
              label="Caption (English)"
              value={row.title_en}
              onChange={(v) => update(i, { title_en: v })}
            />
            <label className="block">
              <span className="text-xs font-semibold text-muted-foreground">Media type</span>
              <select
                value={row.media_type}
                onChange={(e) => update(i, { media_type: e.target.value })}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="photo">Photo</option>
                <option value="video">Video</option>
              </select>
            </label>
            <Field
              label="Video link (YouTube)"
              value={row.video_url}
              onChange={(v) => update(i, { video_url: v })}
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
