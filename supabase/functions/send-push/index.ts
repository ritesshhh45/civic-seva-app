// Sends push notifications to registered citizens through Firebase Cloud Messaging.
// If FCM is not configured yet, the function still succeeds and simply reports
// that nothing was sent — the app must never depend on push being available.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Body = {
  kind: "notification" | "update" | "complaint_status" | "test";
  sourceId?: string;
  title: string;
  body: string;
  deviceId?: string;
};

function b64url(input: ArrayBuffer | string): string {
  const bytes =
    typeof input === "string" ? new TextEncoder().encode(input) : new Uint8Array(input);
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function accessToken(sa: { client_email: string; private_key: string }): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/firebase.messaging",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  );

  const pem = sa.private_key
    .replace(/\\n/g, "\n")
    .replace(/-----[A-Z ]+-----/g, "")
    .replace(/\s+/g, "");
  const der = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    "pkcs8",
    der,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key,
    new TextEncoder().encode(`${header}.${claim}`));
  const jwt = `${header}.${claim}.${b64url(sig)}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  const json = await res.json();
  if (!json.access_token) throw new Error("Could not authenticate with Firebase");
  return json.access_token as string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  const json = (payload: unknown, status = 200) =>
    new Response(JSON.stringify(payload), {
      status,
      headers: { ...cors, "content-type": "application/json" },
    });

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // --- caller must be an approved admin ---
    const jwt = req.headers.get("Authorization")?.replace("Bearer ", "") ?? "";
    const { data: userRes } = await admin.auth.getUser(jwt);
    const email = userRes?.user?.email?.toLowerCase();
    if (!email) return json({ error: "Not signed in" }, 401);

    const { data: account } = await admin
      .from("admin_accounts")
      .select("status")
      .eq("email", email)
      .maybeSingle();
    if (!account || account.status !== "approved") return json({ error: "Not authorised" }, 403);

    const payload = (await req.json()) as Body;
    if (!payload?.title) return json({ error: "Title is required" }, 400);

    // --- collect target tokens ---
    let query = admin.from("app_users").select("push_token").not("push_token", "is", null);
    if (payload.deviceId) query = query.eq("device_id", payload.deviceId);
    const { data: rows } = await query;
    const tokens = (rows ?? []).map((r) => r.push_token as string).filter((t) => !!t);

    // --- FCM configuration is optional ---
    const raw = Deno.env.get("FCM_SERVICE_ACCOUNT");
    if (!raw) {
      return json({ ok: true, configured: false, sent: 0, targets: tokens.length });
    }

    const sa = JSON.parse(raw) as {
      client_email: string;
      private_key: string;
      project_id: string;
    };
    const token = await accessToken(sa);

    let sent = 0;
    let failed = 0;
    for (const to of tokens) {
      const res = await fetch(
        `https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "content-type": "application/json" },
          body: JSON.stringify({
            message: {
              token: to,
              notification: { title: payload.title, body: payload.body ?? "" },
              android: { priority: "HIGH", notification: { sound: "default" } },
            },
          }),
        },
      );
      if (res.ok) sent++;
      else failed++;
    }

    if (payload.sourceId) {
      await admin.from("push_log").insert({
        kind: payload.kind ?? "notification",
        source_id: payload.sourceId,
        title: payload.title,
        body: payload.body ?? "",
        sent,
        failed,
      });
    }

    return json({ ok: true, configured: true, sent, failed, targets: tokens.length });
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "Push failed" }, 500);
  }
});
