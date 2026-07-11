/*
 * Dashboard page (placeholder for Phase 1).
 * This is the protected landing page after login.
 * Phase 2 will add committee list, stats, and create flow.
 */

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { logout } from "@/app/(auth)/actions";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();

  // Get the current logged in user.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get the user's profile (name, plan, etc.).
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, plan")
    .eq("id", user?.id)
    .single();

  const displayName = profile?.full_name || user?.email || "User";

  return (
    <div className="min-h-screen bg-background">
      {/* Top navigation */}
      <nav className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-xl font-bold text-primary">CommitteeKart</span>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted">{user?.email}</span>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted-light"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="mx-auto max-w-6xl px-6 py-12">
        {/* Welcome message */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Salam, {displayName}! 👋
          </h1>
          <p className="mt-2 text-muted">
            Yahan aap apni committees dekhenge aur manage karenge.
          </p>
        </div>

        {/* Stats placeholder */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-6">
            <p className="text-sm text-muted">Total Committees</p>
            <p className="mt-1 text-3xl font-bold text-foreground">0</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <p className="text-sm text-muted">Total Collected</p>
            <p className="mt-1 text-3xl font-bold text-foreground">Rs. 0</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <p className="text-sm text-muted">Pending Payments</p>
            <p className="mt-1 text-3xl font-bold text-foreground">0</p>
          </div>
        </div>

        {/* Coming soon notice */}
        <div className="rounded-2xl border-2 border-dashed border-border bg-muted-light/50 p-12 text-center">
          <div className="mb-4 text-4xl">🏗️</div>
          <h2 className="text-xl font-semibold text-foreground">
            Phase 2 jald aa raha hai
          </h2>
          <p className="mx-auto mt-2 max-w-md text-muted">
            Yahan aap committees create karenge, members add karenge, aur
            payments track karenge. Auth system kaam kar raha hai!
          </p>
        </div>
      </main>
    </div>
  );
}
