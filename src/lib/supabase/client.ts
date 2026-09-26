"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { readSupabaseConfig } from "./config";

let browserClient: SupabaseClient | null = null;

export function createBrowserClient(): SupabaseClient | null {
  const config = readSupabaseConfig();
  if (!config) return null;
  browserClient ??= createClient(config.url, config.key, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  return browserClient;
}
