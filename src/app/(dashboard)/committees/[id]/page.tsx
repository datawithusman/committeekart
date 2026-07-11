/*
 * Committee Detail page.
 *
 * Shows the full committee overview:
 * - Committee name, amount, duration, status
 * - Members list with their draw month
 * - Contributions for the current month (paid/pending)
 * - Draw schedule
 *
 * Organizer can mark contributions as paid/pending.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";
import ContributionRow from "@/components/committees/ContributionRow";

export default async function CommitteeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  // Verify the user is authenticated (RLS will enforce access).
  await supabase.auth.getUser();

  // Fetch the committee.
  const { data: committee } = await supabase
    .from("committees")
    .select("*")
    .eq("id", id)
    .single();

  if (!committee) {
    notFound();
  }

  // Fetch all members.
  const { data: members } = await supabase
    .from("members")
    .select("*")
    .eq("committee_id", id)
    .order("created_at", { ascending: true });

  // Fetch all contributions.
  const { data: contributions } = await supabase
    .from("contributions")
    .select("*")
    .eq("committee_id", id)
    .order("month_index", { ascending: true })
    .order("created_at", { ascending: true });

  // Fetch draw schedule.
  const { data: draws } = await supabase
    .from("draws")
    .select("*")
    .eq("committee_id", id)
    .order("month_index", { ascending: true });

  // Calculate stats.
  const totalCollected = (contributions || [])
    .filter((c) => c.status === "paid")
    .reduce((sum, c) => sum + Number(c.amount), 0);

  const month0Contributions = (contributions || []).filter(
    (c) => c.month_index === 0
  );
  const paidThisMonth = month0Contributions.filter(
    (c) => c.status === "paid"
  ).length;
  const pendingThisMonth = month0Contributions.filter(
    (c) => c.status === "pending"
  ).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <nav className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link
            href="/dashboard"
            className="text-sm text-muted hover:text-foreground"
          >
            ← Dashboard
          </Link>
          <h1 className="text-lg font-semibold text-foreground">
            {committee.name}
          </h1>
          <div className="w-20"></div>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {/* Committee header card */}
        <div className="mb-6 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {committee.name}
              </h2>
              {committee.description && (
                <p className="mt-1 text-sm text-muted">{committee.description}</p>
              )}
            </div>
            <span className="rounded-full bg-success-light px-3 py-1 text-xs font-medium capitalize text-success">
              {committee.status}
            </span>
          </div>

          {/* Quick stats */}
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-muted">Monthly Amount</p>
              <p className="text-lg font-semibold text-foreground">
                {formatCurrency(Number(committee.monthly_amount))}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted">Total Pot</p>
              <p className="text-lg font-semibold text-foreground">
                {formatCurrency(
                  Number(committee.monthly_amount) * committee.member_count
                )}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted">Members</p>
              <p className="text-lg font-semibold text-foreground">
                {committee.member_count}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted">Duration</p>
              <p className="text-lg font-semibold text-foreground">
                {committee.duration_months} months
              </p>
            </div>
          </div>
        </div>

        {/* This Month Contributions */}
        <div className="mb-6 rounded-2xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Is Mahine ki Payments
              </h3>
              <p className="text-sm text-muted">
                Total Collected: {formatCurrency(totalCollected)}
              </p>
            </div>
            <div className="flex gap-2 text-sm">
              <span className="rounded-full bg-success-light px-3 py-1 text-success">
                {paidThisMonth} Paid
              </span>
              <span className="rounded-full bg-warning-light px-3 py-1 text-warning">
                {pendingThisMonth} Pending
              </span>
            </div>
          </div>

          {/* Contributions list */}
          <div className="space-y-2">
            {month0Contributions.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted">
                Abhi koi contribution record nahi hai.
              </p>
            ) : (
              month0Contributions.map((contribution) => {
                const member = (members || []).find(
                  (m) => m.id === contribution.member_id
                );
                if (!member) return null;

                return (
                  <ContributionRow
                    key={contribution.id}
                    contributionId={contribution.id}
                    committeeId={id}
                    memberName={member.name}
                    amount={Number(contribution.amount)}
                    status={contribution.status}
                  />
                );
              })
            )}
          </div>
        </div>

        {/* Draw Schedule */}
        <div className="mb-6 rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold text-foreground">
            Draw Schedule
          </h3>
          <p className="mb-4 text-sm text-muted">
            Kaunse member ko kab pot milega ({committee.draw_type} draw)
          </p>

          <div className="space-y-2">
            {(draws || []).length === 0 ? (
              <p className="py-4 text-center text-sm text-muted">
                Draw schedule generate nahi hua.
              </p>
            ) : (
              (draws || []).map((draw) => {
                const member = (members || []).find(
                  (m) => m.id === draw.member_id
                );
                const drawDate = new Date(committee.start_date);
                drawDate.setMonth(drawDate.getMonth() + draw.month_index);

                return (
                  <div
                    key={draw.id}
                    className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-light text-sm font-semibold text-accent-foreground">
                        M{draw.month_index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {member?.name || "Unknown"}
                        </p>
                        <p className="text-xs text-muted">
                          {formatDate(drawDate)}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(Number(draw.amount))}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* All Members */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold text-foreground">
            Saare Members ({committee.member_count})
          </h3>
          <div className="space-y-2">
            {(members || []).map((member, index) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-light text-sm font-semibold text-primary">
                    {getInitials(member.name)}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {member.name}
                      {index === 0 && (
                        <span className="ml-2 rounded bg-primary-light px-2 py-0.5 text-xs text-primary">
                          Organizer
                        </span>
                      )}
                    </p>
                    {member.phone && (
                      <p className="text-xs text-muted">{member.phone}</p>
                    )}
                  </div>
                </div>
                {member.draw_month_index !== null && (
                  <span className="text-xs text-muted">
                    Pot: Month {member.draw_month_index + 1}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
