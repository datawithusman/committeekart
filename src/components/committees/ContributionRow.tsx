/*
 * Contribution Row component (client component).
 *
 * Displays a single member's contribution with a toggle button
 * to mark it as paid or pending.
 *
 * Used in the committee detail page.
 */

"use client";

import { useTransition } from "react";
import { markContributionPaid, markContributionPending } from "@/app/(dashboard)/committees/[id]/actions";
import { formatCurrency, getInitials } from "@/lib/utils";

export interface ContributionRowProps {
  contributionId: string;
  committeeId: string;
  memberName: string;
  amount: number;
  status: string;
}

export default function ContributionRow({
  contributionId,
  committeeId,
  memberName,
  amount,
  status,
}: ContributionRowProps) {
  const [isPending, startTransition] = useTransition();

  const isPaid = status === "paid";

  function handleToggle() {
    startTransition(() => {
      if (isPaid) {
        markContributionPending(contributionId, committeeId);
      } else {
        markContributionPaid(contributionId, committeeId, "cash");
      }
    });
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-light text-sm font-semibold text-primary">
          {getInitials(memberName)}
        </div>
        <div>
          <p className="font-medium text-foreground">{memberName}</p>
          <p className="text-xs text-muted">{formatCurrency(amount)}</p>
        </div>
      </div>

      <button
        onClick={handleToggle}
        disabled={isPending}
        className={
          isPaid
            ? "rounded-full bg-success-light px-4 py-1.5 text-xs font-medium text-success transition-colors hover:bg-success hover:text-white disabled:opacity-50"
            : "rounded-full bg-warning-light px-4 py-1.5 text-xs font-medium text-warning transition-colors hover:bg-warning hover:text-white disabled:opacity-50"
        }
      >
        {isPending ? "⏳..." : isPaid ? "✓ Paid" : "⏳ Pending"}
      </button>
    </div>
  );
}
