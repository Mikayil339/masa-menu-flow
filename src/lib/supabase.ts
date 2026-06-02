import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && anon);

if (!isSupabaseConfigured) {
  // eslint-disable-next-line no-console
  console.warn(
    "[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Auth calls will fail until these are set."
  );
}

// Use safe placeholders so module import never throws. Any auth call will
// fail with a clear runtime error instead of crashing the whole app.
export const supabase: SupabaseClient = createClient(
  url || "https://placeholder.supabase.co",
  anon || "placeholder-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

export type MasaQrProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: "owner" | "waiter" | "kitchen" | "staff" | string;
  restaurant_id: string | null;
  branch_id: string | null;
  status: string | null;
};
