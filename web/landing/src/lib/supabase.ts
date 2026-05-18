import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client with service role key
// IMPORTANT: Only use this in server-side code (API routes, Server Components)
// Never expose the service role key to the client
export function createServerSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "Missing Supabase environment variables. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Type for waitlist subscriber
export interface WaitlistSubscriber {
  id: string;
  email: string;
  source: string;
  referral_code: string | null;
  created_at: string;
  confirmed: boolean;
}
