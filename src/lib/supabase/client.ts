/*
 * Supabase browser client.
 * Use this in Client Components for auth and data operations on the client side.
 *
 * For Server Components and Route Handlers, use server.ts instead.
 */

import { createBrowserClient } from "@supabase/ssr";

/**
 * Create a Supabase client configured for browser usage.
 * Reads credentials from environment variables.
 */
export function createSupabaseBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      "Missing Supabase environment variables. Check .env.local for " +
        "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY."
    );
  }

  return createBrowserClient(supabaseUrl, supabasePublishableKey);
}
