/*
 * Settings / Profile page.
 *
 * Users can view and edit their profile (full name, phone).
 * Also shows their current subscription plan.
 *
 * Navigation: accessible from the dashboard nav bar.
 */

import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { logout } from "@/app/(auth)/actions";
import { updateProfile } from "./actions";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();

  // Get the current user.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get the user's profile.
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id)
    .single();

  return (
    <div className="min-h-screen bg-background">
      {/* Top navigation */}
      <nav className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="text-sm text-muted hover:text-foreground">
            ← Dashboard
          </Link>
          <h1 className="text-lg font-semibold text-foreground">Settings</h1>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted-light"
            >
              Logout
            </button>
          </form>
        </div>
      </nav>

      <main className="mx-auto max-w-2xl px-6 py-8">
        {/* Error or success message */}
        {params.error && (
          <div className="mb-6 rounded-lg bg-danger-light px-4 py-3 text-sm text-danger">
            {decodeURIComponent(params.error)}
          </div>
        )}
        {params.success && (
          <div className="mb-6 rounded-lg bg-success-light px-4 py-3 text-sm text-success">
            {decodeURIComponent(params.success)}
          </div>
        )}

        {/* Profile section */}
        <div className="mb-6 rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-1 text-lg font-semibold text-foreground">Profile</h2>
          <p className="mb-6 text-sm text-muted">
            Apna naam aur phone number update karein.
          </p>

          <form action={updateProfile} className="space-y-4">
            {/* Email (read-only, comes from Supabase Auth) */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Email
              </label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full cursor-not-allowed rounded-lg border border-border bg-muted-light px-4 py-2.5 text-muted"
              />
              <p className="mt-1 text-xs text-muted">Email change nahi ho sakta.</p>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-foreground">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                defaultValue={profile?.full_name || ""}
                placeholder="Aapka naam"
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-foreground">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={profile?.phone || ""}
                placeholder="03001234567"
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <button
              type="submit"
              className="rounded-lg bg-primary px-6 py-2.5 font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
            >
              Save Changes
            </button>
          </form>
        </div>

        {/* Subscription section */}
        <div className="mb-6 rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-1 text-lg font-semibold text-foreground">Subscription</h2>
          <p className="mb-4 text-sm text-muted">
            Aapka current plan aur limits.
          </p>

          <div className="flex items-center justify-between rounded-lg bg-muted-light px-4 py-3">
            <div>
              <p className="font-semibold capitalize text-foreground">
                {profile?.plan || "free"} Plan
              </p>
              <p className="text-xs text-muted">
                {profile?.plan === "free"
                  ? "1 committee, max 8 members"
                  : profile?.plan === "pro"
                  ? "Unlimited committees, reminders, reports"
                  : "Sab features unlocked"}
              </p>
            </div>
            {profile?.plan === "free" && (
              <span className="rounded-lg bg-accent-light px-3 py-1.5 text-xs font-medium text-accent-foreground">
                Upgrade available
              </span>
            )}
          </div>

          <p className="mt-3 text-xs text-muted">
            Plan upgrades jald aa rahe hain (payment integration Phase 4).
          </p>
        </div>

        {/* Danger zone */}
        <div className="rounded-2xl border border-danger/30 bg-danger-light/30 p-6">
          <h2 className="mb-1 text-lg font-semibold text-danger">Danger Zone</h2>
          <p className="mb-4 text-sm text-muted">
            Account related sensitive actions.
          </p>
          <button
            type="button"
            className="cursor-not-allowed rounded-lg border border-danger/50 px-4 py-2 text-sm font-medium text-danger opacity-50"
            title="Coming soon"
          >
            Delete Account (Coming Soon)
          </button>
        </div>
      </main>
    </div>
  );
}
