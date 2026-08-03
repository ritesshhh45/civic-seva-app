import {
  Droplets,
  Construction,
  Trash2,
  Zap,
  Lightbulb,
  HeartPulse,
  GraduationCap,
  Trees,
  CircleAlert,
  Bus,
  ShieldCheck,
  Wifi,
  Home,
  Hospital,
  Wrench,
  Users,
  type LucideIcon,
} from "lucide-react";

export const ICONS: Record<string, LucideIcon> = {
  Droplets,
  Construction,
  Trash2,
  Zap,
  Lightbulb,
  HeartPulse,
  GraduationCap,
  Trees,
  CircleAlert,
  Bus,
  ShieldCheck,
  Wifi,
  Home,
  Hospital,
  Wrench,
  Users,
};

export const ICON_NAMES = Object.keys(ICONS);

export function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? CircleAlert;
  return <Icon className={className} strokeWidth={1.8} />;
}

/** Friendly aliases so admins can type "Road", "Water", "Garden" etc. */
const WORK_ALIASES: Record<string, string> = {
  road: "Construction",
  roads: "Construction",
  water: "Droplets",
  garden: "Trees",
  park: "Trees",
  light: "Lightbulb",
  streetlight: "Lightbulb",
  "street light": "Lightbulb",
  health: "Hospital",
  clinic: "Hospital",
  school: "GraduationCap",
  education: "GraduationCap",
  drainage: "Wrench",
  cleanliness: "Trash2",
  electricity: "Zap",
};

/** Soft themed backgrounds so each work type reads instantly. */
const WORK_TONES: Record<string, string> = {
  Construction: "from-primary/22 to-primary/5 text-primary",
  Droplets: "from-secondary/25 to-secondary/5 text-secondary",
  Trees: "from-accent/25 to-accent/5 text-accent",
  Lightbulb: "from-primary/25 to-accent/10 text-primary",
  Hospital: "from-destructive/18 to-destructive/5 text-destructive",
  GraduationCap: "from-accent/22 to-primary/8 text-accent",
};

export function resolveWorkIcon(name?: string | null) {
  if (!name) return "Construction";
  if (ICONS[name]) return name;
  return WORK_ALIASES[name.trim().toLowerCase()] ?? "Construction";
}

/** Premium icon tile used on development-work cards without a photo. */
export function WorkIcon({ name, className }: { name?: string | null; className?: string }) {
  const key = resolveWorkIcon(name);
  const tone = WORK_TONES[key] ?? "from-primary/20 to-primary/5 text-primary";
  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br ${tone} ${className ?? ""}`}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-card/80 shadow-soft ring-1 ring-border/60">
        <CategoryIcon name={key} className="h-6 w-6" />
      </span>
    </div>
  );
}
