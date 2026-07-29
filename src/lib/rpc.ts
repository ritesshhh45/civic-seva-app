import { supabase } from "@/integrations/supabase/client";

type RpcFn = (
  fn: string,
  args: Record<string, unknown>,
) => Promise<{ data: unknown; error: { message: string } | null }>;

/**
 * Calls a database function through the public API key.
 * Everything the app writes goes through these functions, so no server-only
 * secret is needed — the same code works in preview, on the published site and
 * inside the Android / iOS builds.
 */
export async function rpc<T>(fn: string, args: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await (supabase.rpc as unknown as RpcFn)(fn, args);
  if (error) throw new Error(error.message);
  return data as T;
}
