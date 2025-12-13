import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for Client Components (browser)
 * Use this in components with "use client" directive
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

