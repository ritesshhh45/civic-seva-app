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
  office_address_mr: string;
  office_address_en: string;
  office_map_url: string;
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

export type UpdateRow = {
  id: string;
  title_mr: string;
  title_en: string;
  body_mr: string;
  body_en: string;
  image_url: string;
  category_mr: string;
  category_en: string;
  is_pinned: boolean;
  is_important: boolean;
  is_archived: boolean;
  publish_at: string;
  created_at: string;
};

export type WorkRow = {
  id: string;
  title_mr: string;
  title_en: string;
  desc_mr: string;
  desc_en: string;
  image_url: string;
  icon: string;
  status_mr: string;
  status_en: string;
  sort_order: number;
  is_active: boolean;
};

export type SchemeRow = {
  id: string;
  name_mr: string;
  name_en: string;
  category_mr: string;
  category_en: string;
  logo_url: string;
  banner_url: string;
  desc_mr: string;
  desc_en: string;
  eligibility_mr: string;
  eligibility_en: string;
  documents_mr: string;
  documents_en: string;
  benefits_mr: string;
  benefits_en: string;
  last_date: string;
  website_url: string;
  is_new: boolean;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
};

export type GalleryRow = {
  id: string;
  title_mr: string;
  title_en: string;
  image_url: string;
  video_url: string;
  media_type: string;
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

export const updatesQuery = queryOptions({
  queryKey: ["updates"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("updates")
      .select("*")
      .order("is_pinned", { ascending: false })
      .order("publish_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as UpdateRow[];
  },
});

export const worksQuery = queryOptions({
  queryKey: ["works"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("works")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as unknown as WorkRow[];
  },
});

export const schemesQuery = queryOptions({
  queryKey: ["schemes"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("schemes")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as unknown as SchemeRow[];
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

/** Compose the WhatsApp text for a service tap: citizen details + admin message. */
export function serviceMessage(opts: {
  name: string;
  mobile: string;
  service: string;
  body: string;
  lang: "mr" | "en";
}) {
  const l = opts.lang === "mr";
  return [
    l ? "नमस्कार साहेब 🙏" : "Hello sir 🙏",
    "",
    `${l ? "नाव" : "Name"}: ${opts.name}`,
    `${l ? "मोबाइल" : "Mobile"}: ${opts.mobile}`,
    `${l ? "सेवा" : "Service"}: ${opts.service}`,
    "",
    opts.body,
  ].join("\n");
}
