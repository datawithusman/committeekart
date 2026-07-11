/*
 * Dashboard page.
 *
 * Shows the organizer's committees pulled from the database.
 * Includes stats (total committees, total collected, pending payments)
 * and a button to create new committees.
 */

import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { logout } from "@/app/(auth)/actions";
import { formatCurrency } from "@/lib/utils";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();

  // Get the current logged in user.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get the user's profile.
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, plan")
    .eq("id", user?.id)
    .single();

  const displayName = profile?.full_name || user?.email || "User";

  // Fetch all committees owned by this user.
  const { data: committees } = await supabase
    .from("committees")
    .select("*")
    .eq("organizer_id", user?.id)
    .order("created_at", { ascending: false });

  // Fetch all contributions for committees owned by this user.
  // We need the committee IDs first.
  const committeeIds = (committees || []).map((c) => c.id);
  const { data: contributions } = committeeIds.length
    ? await supabase
        .from("contributions")
        .select("*")
        .in("committee_id", committeeIds)
    : { data: [] };

  // Calculate stats.
  const totalCollected = (contributions || [])
    .filter((c) => c.status === "paid")
    .reduce((sum, c) => sum + Number(c.amount), 0);

  const pendingCount = (contributions || []).filter(
    (c) => c.status === "pending"
  ).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Top navigation */}
      <nav className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-xl font-bold text-primary">CommitteeKart</span>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted">{user?.email}</span>
            <Link
              href="/settings"
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted-light"
            >
              Settings
            </Link>
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
        {/* Welcome and create button */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Salam, {displayName}! 👋
            </h1>
            <p className="mt-2 text-muted">
              Yahan aap apni committees dekhenge aur manage karenge.
            </p>
          </div>
          <Link
            href="/committees/new"
            className="rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
          >
            + New Committee
          </Link>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-6">
            <p className="text-sm text-muted">Total Committees</p>
            <p className="mt-1 text-3xl font-bold text-foreground">
              {committees?.length || 0}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <p className="text-sm text-muted">Total Collected</p>
            <p className="mt-1 text-3xl font-bold text-foreground">
              {formatCurrency(totalCollected)}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <p className="text-sm text-muted">Pending Payments</p>
            <p className="mt-1 text-3xl font-bold text-foreground">
              {pendingCount}
            </p>
          </div>
        </div>

        {/* Committees list */}
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Meri Committees
        </h2>

        {committees && committees.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {committees.map((committee) => (
              <Link
                key={committee.id}
                href={`/committees/${committee.id}`}
                className="block rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary"
              >
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-foreground">
                    {committee.name}
                  </h3>
                  <span className="rounded-full bg-success-light px-3 py-1 text-xs font-medium capitalize text-success">
                    {committee.status}
                  </span>
                </div>
                {committee.description && (
                  <p className="mt-1 text-sm text-muted">
                    {committee.description}
                  </p>
                )}
                <div className="mt-4 flex gap-6 text-sm">
                  <div>
                    <p className="text-xs text-muted">Monthly</p>
                    <p className="font-medium text-foreground">
                      {formatCurrency(Number(committee.monthly_amount))}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">Members</p>
                    <p className="font-medium text-foreground">
                      {committee.member_count}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">Draw</p>
                    <p className="font-medium text-foreground capitalize">
                      {committee.draw_type}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="rounded-2xl border-2 border-dashed border-border bg-muted-light/50 p-12 text-center">
            <div className="mb-4 text-4xl">📋</div>
            <h3 className="text-lg font-semibold text-foreground">
              Abhi koi committee nahi hai
            </h3>
            <p className="mx-auto mt-2 max-w-md text-muted">
              Apni pehli committee banayein aur members add karna shuru karein.
            </p>
            <Link
              href="/committees/new"
              className="mt-6 inline-block rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
            >
              Pehli Committee Banao
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
