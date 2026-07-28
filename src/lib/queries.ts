import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AppConfig = {
  id: string;
  rep_name_mr: string;
  rep_name_en: string;
  ward_mr: string;
  ward_en: string;
  slogan_mr: string;
  slogan_en: string;
  tagline_mr: string;
  tagline_en: string;
  party_name_mr: string;
  party_name_en: string;
  photo_url: string;
  party_logo_url: string;
  app_name: string;
  app_icon_url: string;
  phone: string;
  whatsapp: string;
  accent_color: string;
  admin_phone: string;
};

export type Category = {
  id: string;
  name_mr: string;
  name_en: string;
  icon: string;
  message_mr: string;
  message_en: string;
  sort_order: number;
  is_active: boolean;
};

export type NotificationRow = {
  id: string;
  title_mr: string;
  title_en: string;
  body_mr: string;
  body_en: string;
  created_at: string;
};

export type GalleryRow = {
  id: string;
  title_mr: string;
  title_en: string;
  image_url: string;
  sort_order: number;
};

export const configQuery = queryOptions({
  queryKey: ["app_config"],
  queryFn: async () => {
    const { data, error } = await supabase.from("app_config").select("*").limit(1).single();
    if (error) throw error;
    return data as unknown as AppConfig;
  },
});

export const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as unknown as Category[];
  },
});

export const notificationsQuery = queryOptions({
  queryKey: ["notifications"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as NotificationRow[];
  },
});

export const galleryQuery = queryOptions({
  queryKey: ["gallery"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("gallery")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as unknown as GalleryRow[];
  },
});

export function waLink(number: string, message: string) {
  const digits = number.replace(/\D/g, "");
  const withCc = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${withCc}?text=${encodeURIComponent(message)}`;
}
