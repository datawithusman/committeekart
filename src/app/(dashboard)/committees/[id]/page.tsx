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

import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";
import ContributionRow from "@/components/committees/ContributionRow";
import CommitteeSettings from "@/components/committees/CommitteeSettings";
import InviteMembers from "@/components/committees/InviteMembers";
import DashboardNav from "@/components/shared/DashboardNav";

export default async function CommitteeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  // Get the request origin for building invite URLs.
  const headersList = await headers();
  const requestOrigin = headersList.get("origin") || headersList.get("host")
    ? `${headersList.get("x-forwarded-proto") || "https"}://${headersList.get("host")}`
    : "https://committeekart.vercel.app";

  // Get the current user for the nav bar.
  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  // Determine the current month index based on start date.
  // Month 0 = first month, month 1 = second month, etc.
  const startDateObj = new Date(committee.start_date);
  const now = new Date();
  const currentMonthIndex = Math.max(
    0,
    (now.getFullYear() - startDateObj.getFullYear()) * 12 +
      (now.getMonth() - startDateObj.getMonth())
  );

  // Contributions for the current month.
  const currentMonthContributions = (contributions || []).filter(
    (c) => c.month_index === Math.min(currentMonthIndex, committee.duration_months - 1)
  );
  const paidThisMonth = currentMonthContributions.filter(
    (c) => c.status === "paid"
  ).length;
  const pendingThisMonth = currentMonthContributions.filter(
    (c) => c.status === "pending"
  ).length;

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav
        userEmail={user?.email}
        title={committee.name}
        backHref="/dashboard"
        backLabel="← Dashboard"
      />

      <main className="mx-auto max-w-4xl px-6 py-8">
        {/* Committee Settings (edit/delete) */}
        <CommitteeSettings
          committeeId={id}
          initialName={committee.name}
          initialDescription={committee.description}
          initialStatus={committee.status}
        />

        {/* Invite Members panel */}
        <InviteMembers
          members={(members || []).map((m) => ({
            id: m.id,
            name: m.name,
            phone: m.phone,
            inviteToken: m.invite_token,
            userId: m.user_id,
          }))}
          origin={requestOrigin}
        />
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
            <div className="flex flex-col items-end gap-2">
              <span className="rounded-full bg-success-light px-3 py-1 text-xs font-medium capitalize text-success">
                {committee.status}
              </span>
              <a
                href={`/committees/${id}/export`}
                className="rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary-light"
              >
                Download Report
              </a>
            </div>
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
            {currentMonthContributions.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted">
                Abhi koi contribution record nahi hai.
              </p>
            ) : (
              currentMonthContributions.map((contribution) => {
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
