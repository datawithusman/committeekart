/*
 * Member Invite page.
 *
 * When an organizer shares an invite link, the member opens this page.
 * The member sees the committee info and their name.
 * If they are logged in, they can click "Join" to link their account.
 * If they are not logged in, they are prompted to sign up first.
 *
 * URL: /invite/[token]
 */

import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import { claimMembership } from "./actions";

/** Shape of the member data returned by get_member_by_invite_token RPC. */
interface InviteMember {
  id: string;
  committee_id: string;
  user_id: string | null;
  name: string;
  phone: string | null;
  draw_month_index: number | null;
  invite_token: string | null;
}

/** Shape of the committee data returned by get_committee_for_invite RPC. */
interface InviteCommittee {
  id: string;
  name: string;
  description: string | null;
  monthly_amount: number;
  member_count: number;
  duration_months: number;
  draw_type: string;
  start_date: string;
  status: string;
}

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createSupabaseServerClient();

  // Look up the member by invite token using the public RPC function.
  // Direct table reads are blocked by RLS for unauthenticated users.
  const { data: memberData } = await supabase
    .rpc("get_member_by_invite_token", { token })
    .maybeSingle();

  const member = memberData as unknown as InviteMember | null;

  // Invalid or expired token.
  if (!member) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md text-center">
          <div className="mb-4 text-5xl">🔗</div>
          <h1 className="mb-2 text-2xl font-bold text-foreground">
            Invite link sahi nahi
          </h1>
          <p className="mb-6 text-sm text-muted">
            Yeh invite link expire ho gaya ya ghalat hai. Organizer se naya link mangein.
          </p>
          <Link
            href="/"
            className="inline-block rounded-lg bg-primary px-6 py-2.5 font-semibold text-primary-foreground hover:bg-primary-dark"
          >
            Home
          </Link>
        </div>
      </div>
    );
  }

  // Get committee info using the public RPC function.
  const { data: committeeData } = await supabase
    .rpc("get_committee_for_invite", { committee_uuid: member.committee_id })
    .maybeSingle();

  const committee = committeeData as unknown as InviteCommittee | null;

  if (!committee) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md text-center">
          <p className="text-sm text-muted">Committee nahi mili.</p>
        </div>
      </div>
    );
  }

  // Check if the current user is logged in.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check if already claimed.
  const alreadyClaimed = member.user_id !== null;

  // Check if this user already claimed this membership.
  const isCurrentUser = user && member.user_id === user.id;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary-light to-background px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="text-3xl font-bold text-primary">
            CommitteeKart
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <h1 className="mb-2 text-2xl font-bold text-foreground">
            Aapko invite mila hai!
          </h1>
          <p className="mb-6 text-sm text-muted">
            Aapko ek committee mein add kiya gaya hai.
          </p>

          {/* Committee info card */}
          <div className="mb-6 rounded-xl bg-muted-light p-4">
            <h2 className="text-lg font-semibold text-foreground">
              {committee.name}
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted">Monthly Amount</p>
                <p className="font-medium text-foreground">
                  {formatCurrency(Number(committee.monthly_amount))}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted">Total Members</p>
                <p className="font-medium text-foreground">
                  {committee.member_count}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted">Duration</p>
                <p className="font-medium text-foreground">
                  {committee.duration_months} months
                </p>
              </div>
              <div>
                <p className="text-xs text-muted">Draw Type</p>
                <p className="font-medium text-foreground capitalize">
                  {committee.draw_type}
                </p>
              </div>
            </div>
          </div>

          {/* Member name confirmation */}
          <p className="mb-6 text-sm text-foreground">
            Aapka naam committee mein: <strong>{member.name}</strong>
          </p>

          {/* Action area */}
          {alreadyClaimed && isCurrentUser ? (
            // Already claimed by current user.
            <div>
              <div className="mb-4 rounded-lg bg-success-light px-4 py-3 text-sm text-success">
                Aap pehle se is committee mein joined hain!
              </div>
              <Link
                href={`/committees/${committee.id}`}
                className="block w-full rounded-lg bg-primary px-4 py-2.5 text-center font-semibold text-primary-foreground hover:bg-primary-dark"
              >
                Committee Dekho
              </Link>
            </div>
          ) : alreadyClaimed ? (
            // Claimed by someone else.
            <div className="rounded-lg bg-warning-light px-4 py-3 text-sm text-warning">
              Yeh invite link pehle se use ho chuka hai. Agar yeh aapki committee
              hai, to organizer se contact karein.
            </div>
          ) : user ? (
            // Logged in but not claimed yet.
            <form action={claimMembership}>
              <input type="hidden" name="token" value={token} />
              <input type="hidden" name="memberId" value={member.id} />
              <button
                type="submit"
                className="w-full rounded-lg bg-primary px-4 py-2.5 font-semibold text-primary-foreground hover:bg-primary-dark"
              >
                Join Committee
              </button>
            </form>
          ) : (
            // Not logged in.
            <div className="space-y-3">
              <p className="text-sm text-muted">
                Join karne ke liye pehle account banayein ya login karein.
              </p>
              <Link
                href={`/signup?redirect=/invite/${token}`}
                className="block w-full rounded-lg bg-primary px-4 py-2.5 text-center font-semibold text-primary-foreground hover:bg-primary-dark"
              >
                Sign Up Karein
              </Link>
              <Link
                href={`/login?redirect=/invite/${token}`}
                className="block w-full rounded-lg border border-border px-4 py-2.5 text-center font-semibold text-foreground hover:bg-muted-light"
              >
                Login Karein
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
