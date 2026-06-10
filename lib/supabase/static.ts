// Cookie-less anon Supabase client for statically rendered pages (SSG/ISR).
// The cookie-based client in ./server.ts calls next/headers cookies(), which
// forces dynamic rendering — public blog pages must use THIS client instead.
// Returns null when env vars are absent so builds without a DB still succeed.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function createStaticClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    // Deliberate degradation (envless CI builds succeed) — but never silently.
    console.warn("[blog] createStaticClient: missing NEXT_PUBLIC_SUPABASE_URL/ANON_KEY");
    return null;
  }

  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
