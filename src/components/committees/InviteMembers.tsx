/*
 * Invite Members component (client component).
 *
 * Shows invite links for each member in the committee.
 * The organizer can copy a link or share it via WhatsApp.
 *
 * Shown on the committee detail page when the organizer clicks
 * "Invite Members".
 */

"use client";

import { useState } from "react";

export interface InviteMember {
  id: string;
  name: string;
  phone: string | null;
  inviteToken: string | null;
  userId: string | null;
}

export interface InviteMembersProps {
  members: InviteMember[];
  /** The origin (e.g. https://committeekart.vercel.app) for building invite URLs. */
  origin: string;
}

export default function InviteMembers({ members, origin }: InviteMembersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Only show members that have NOT been claimed yet (no userId)
  // and are not the organizer (organizer is auto-linked).
  const unclaimedMembers = members.filter(
    (m) => m.userId === null && m.inviteToken
  );

  function getInviteUrl(token: string): string {
    return `${origin}/invite/${token}`;
  }

  async function copyLink(memberId: string, token: string) {
    const url = getInviteUrl(token);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(memberId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback for older browsers.
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopiedId(memberId);
      setTimeout(() => setCopiedId(null), 2000);
    }
  }

  function shareOnWhatsApp(name: string, token: string) {
    const url = getInviteUrl(token);
    const message = `Salam ${name}! Aapko ek committee mein add kiya gaya hai CommitteeKart pe. Yahan click karke join karein: ${url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

    // Use direct location change for maximum reliability.
    // window.open can be blocked by popup blockers.
    window.location.href = whatsappUrl;
  }

  if (unclaimedMembers.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary-light"
      >
        {isOpen ? "Close Invites" : `Invite Members (${unclaimedMembers.length})`}
      </button>

      {/* Invite panel */}
      {isOpen && (
        <div className="mt-4 rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-1 text-lg font-semibold text-foreground">
            Invite Members
          </h3>
          <p className="mb-4 text-sm text-muted">
            Har member ka link share karein. Woh link pe click karke apna
            profile claim karenge aur committee ka status dekh sakenge.
          </p>

          <div className="space-y-3">
            {unclaimedMembers.map((member) => (
              <div
                key={member.id}
                className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                {/* Member info */}
                <div>
                  <p className="font-medium text-foreground">{member.name}</p>
                  {member.phone && (
                    <p className="text-xs text-muted">{member.phone}</p>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  {/* Copy link */}
                  <button
                    onClick={() =>
                      member.inviteToken &&
                      copyLink(member.id, member.inviteToken)
                    }
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted-light"
                  >
                    {copiedId === member.id ? "Copied!" : "Copy Link"}
                  </button>

                  {/* WhatsApp share */}
                  <button
                    onClick={() =>
                      member.inviteToken &&
                      shareOnWhatsApp(member.name, member.inviteToken)
                    }
                    className="rounded-lg bg-success px-3 py-1.5 text-xs font-medium text-white hover:bg-success/90"
                  >
                    WhatsApp
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
