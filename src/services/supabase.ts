import { createClient } from "@supabase/supabase-js";

// Support both naming conventions: VITE_SUPABASE_* and VITE_PUBLIC_SUPABASE_*
const supabaseUrl = (
  import.meta.env.VITE_SUPABASE_URL ??
  import.meta.env.VITE_PUBLIC_SUPABASE_URL
) as string;
const supabaseAnonKey = (
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY
) as string;

if (!supabaseUrl || !supabaseAnonKey) {
  // Fail fast to make misconfiguration obvious during development
  // eslint-disable-next-line no-console
  console.error(
    "Missing Supabase environment variables. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type SupabaseClientType = typeof supabase;


