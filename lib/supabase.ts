import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

// The publishable key is designed for browser use. Keep Vercel env vars as the
// preferred source, but retain a project fallback so a misconfigured build does
// not disable the public request form.
const DEFAULT_SUPABASE_URL = "https://srmluevaweuaasgjyezr.supabase.co";
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_gMzCgIJF1hwIdgQiasmF2w_8AfQcwcp";

export function getSupabase() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || DEFAULT_SUPABASE_PUBLISHABLE_KEY;

  client = createClient(url, key);
  return client;
}
