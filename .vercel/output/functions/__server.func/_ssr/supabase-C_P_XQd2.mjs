import { c as createClient } from "../_libs/supabase__supabase-js.mjs";
const url = "https://tylqisikppnfoxgihjan.supabase.co/";
const anon = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5bHFpc2lrcHBuZm94Z2loamFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzODkyMzQsImV4cCI6MjA5NTk2NTIzNH0.LqyLKxB_XSsZtrYqh3kvar5pmg-1kG-lNsMdFlmk8v8";
const isSupabaseConfigured = Boolean(anon);
if (!isSupabaseConfigured) {
  console.warn(
    "[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Auth calls will fail until these are set."
  );
}
const supabase = createClient(
  url,
  anon,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);
export {
  supabase as s
};
