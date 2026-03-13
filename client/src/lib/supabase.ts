import { createClient, SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;
let initPromise: Promise<SupabaseClient> | null = null;

async function fetchSupabaseConfig(): Promise<{ supabaseUrl: string; supabaseAnonKey: string }> {
  const res = await fetch("/api/config");
  if (!res.ok) throw new Error("Failed to fetch Supabase config");
  return res.json();
}

export async function getSupabaseClient(): Promise<SupabaseClient> {
  if (client) return client;
  if (initPromise) return initPromise;

  initPromise = fetchSupabaseConfig().then(({ supabaseUrl, supabaseAnonKey }) => {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    return client;
  });

  return initPromise;
}
