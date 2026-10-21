import { createClient } from "@supabase/supabase-js";

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "GET") return new Response("Method not allowed", { status: 405 });

  const id = new URL(request.url).pathname.split("/").pop() ?? "";
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response("Not found", { status: 404 });

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return new Response("Not configured", { status: 500 });

  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
  const { data, error } = await client
    .from("media_assets")
    .select("data, content_type")
    .eq("id", id)
    .maybeSingle();

  const row = data as { data: string; content_type: string } | null;
  if (error || !row) return new Response("Not found", { status: 404 });

  const bytes = Uint8Array.from(atob(row.data), (character) => character.charCodeAt(0));
  return new Response(bytes, {
    headers: {
      "Content-Type": row.content_type || "image/jpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
      "Access-Control-Allow-Origin": "*",
    },
  });
}