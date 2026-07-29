import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

/**
 * Serves images stored in the `media_assets` table.
 * Using an app route (instead of a builder-only CDN path) means every image
 * keeps working on the published build and inside the native Capacitor apps.
 */
export const Route = createFileRoute("/api/public/img/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const id = params.id;
        if (!/^[0-9a-f-]{36}$/i.test(id)) {
          return new Response("Not found", { status: 404 });
        }

        const url = process.env.SUPABASE_URL;
        const key = process.env.SUPABASE_PUBLISHABLE_KEY;
        if (!url || !key) return new Response("Not configured", { status: 500 });

        const client = createClient(url, key, {
          auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
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

        const binary = atob(row.data);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);

        return new Response(bytes, {
          status: 200,
          headers: {
            "Content-Type": row.content_type || "image/jpeg",
            "Cache-Control": "public, max-age=31536000, immutable",
            "Access-Control-Allow-Origin": "*",
          },
        });
      },
    },
  },
});
