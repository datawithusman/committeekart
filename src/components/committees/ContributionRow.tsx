/*
 * Contribution Row component (client component).
 *
 * Displays a single member's contribution with:
 * - A toggle button to mark it as paid or pending
 * - A WhatsApp reminder button (shown when pending and phone exists)
 *
 * Handles server action results: if the update fails, it does NOT
 * flip the UI state and shows an error message.
 *
 * Used in the committee detail page.
 */

"use client";

import { useTransition, useState } from "react";
import {
  markContributionPaid,
  markContributionPending,
} from "@/app/(dashboard)/committees/[id]/actions";
import { formatCurrency, getInitials } from "@/lib/utils";

export interface ContributionRowProps {
  contributionId: string;
  committeeId: string;
  memberName: string;
  memberPhone: string | null;
  amount: number;
  status: string;
  committeeName: string;
}

export default function ContributionRow({
  contributionId,
  committeeId,
  memberName,
  memberPhone,
  amount,
  status,
  committeeName,
}: ContributionRowProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isPaid = status === "paid";

  function handleToggle() {
    setErrorMsg(null);
    startTransition(async () => {
      const action = isPaid
        ? markContributionPending(contributionId, committeeId)
        : markContributionPaid(contributionId, committeeId, "cash");

      const result = await action;
      if (!result.success) {
        setErrorMsg(result.error || "Update failed");
      }
    });
  }

  /**
   * Build the WhatsApp URL for this member's reminder.
   * Returns null if no phone number is available.
   */
  function getWhatsAppUrl(): string | null {
    const cleanPhone = (memberPhone || "").replace(/[\s\-+]/g, "");
    if (!cleanPhone) return null;

    const message =
      `Salam ${memberName}! Yeh ${committeeName} committee ki reminder hai. ` +
      `Aapka is mahine ka payment ${formatCurrency(amount)} pending hai. ` +
      `Jald pay karein. Shukriya!`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  }

  const whatsappUrl = getWhatsAppUrl();

  return (
    <div className="rounded-lg border border-border px-4 py-3">
      <div className="flex items-center justify-between gap-2">
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

        <div className="flex items-center gap-2">
          {/* WhatsApp reminder button: only for pending with phone */}
          {!isPaid && whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="WhatsApp pe reminder bhejein"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-success-light text-success transition-colors hover:bg-success hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.359.101 11.892c0 2.096.549 4.142 1.595 5.945L0 24l6.305-1.654a11.95 11.95 0 005.683 1.448h.005c6.582 0 11.94-5.359 11.944-11.892a11.86 11.86 0 00-3.483-8.453" />
              </svg>
            </a>
          )}

          {/* Status toggle button */}
          <button
            onClick={handleToggle}
            disabled={isPending}
            className={
              isPaid
                ? "rounded-full bg-success-light px-4 py-1.5 text-xs font-medium text-success transition-colors hover:bg-success hover:text-white disabled:opacity-50"
                : "rounded-full bg-warning-light px-4 py-1.5 text-xs font-medium text-warning transition-colors hover:bg-warning hover:text-white disabled:opacity-50"
            }
          >
            {isPending ? "..." : isPaid ? "Paid" : "Pending"}
          </button>
        </div>
      </div>

      {/* Error feedback */}
      {errorMsg && (
        <p className="mt-2 text-xs text-danger">{errorMsg}</p>
      )}
    </div>
  );
}
