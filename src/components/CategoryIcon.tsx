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
