/*
 * Manage Members component (client component).
 *
 * Lets the organizer:
 * - Add new members to an existing committee
 * - Remove members (except the organizer)
 *
 * Each new member gets an invite token automatically.
 * Removed members' contributions and draws are deleted (cascade).
 *
 * Shown on the committee detail page.
 */

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getInitials } from "@/lib/utils";

/** Shape of add_committee_member RPC result. */
interface AddMemberResult {
  member_id: string | null;
  invite_token: string | null;
  error_msg: string | null;
}

/** Shape of remove_committee_member RPC result. */
interface RemoveMemberResult {
  success: boolean;
  error_msg: string | null;
}

export interface ManageMember {
  id: string;
  name: string;
  phone: string | null;
  userId: string | null;
}

export interface ManageMembersProps {
  committeeId: string;
  organizerId: string;
  members: ManageMember[];
}

export default function ManageMembers({
  committeeId,
  organizerId,
  members,
}: ManageMembersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!newName.trim()) {
      setErrorMsg("Naam likhna zaroori hai.");
      return;
    }

    startTransition(async () => {
      const supabase = createSupabaseBrowserClient();
      const { data: rawData, error } = await supabase
        .rpc("add_committee_member", {
          p_committee_id: committeeId,
          p_name: newName.trim(),
          p_phone: newPhone.trim() || null,
        })
        .single();

      const data = rawData as unknown as AddMemberResult;

      if (error || !data || data.error_msg) {
        setErrorMsg(data?.error_msg || error?.message || "Member add nahi hua.");
        return;
      }

      setSuccessMsg(`${newName.trim()} add ho gaya! Invite link share karein.`);
      setNewName("");
      setNewPhone("");
      router.refresh();
    });
  }

  function handleRemove(memberId: string, memberName: string) {
    if (!confirm(`Kya aap ${memberName} ko remove karna chahte hain? Yeh action wapas nahi ho sakta.`)) {
      return;
    }

    setErrorMsg(null);
    startTransition(async () => {
      const supabase = createSupabaseBrowserClient();
      const { data: rawData, error } = await supabase
        .rpc("remove_committee_member", {
          p_committee_id: committeeId,
          p_member_id: memberId,
        })
        .single();

      const data = rawData as unknown as RemoveMemberResult;

      if (error || !data || !data.success) {
        setErrorMsg(data?.error_msg || error?.message || "Remove nahi hua.");
        return;
      }

      setSuccessMsg(`${memberName} remove ho gaya.`);
      router.refresh();
    });
  }

  return (
    <div className="mb-6">
      {/* Toggle button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setErrorMsg(null);
          setSuccessMsg(null);
        }}
        className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted-light"
      >
        {isOpen ? "Close Manage Members" : "Manage Members"}
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="mt-4 rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold text-foreground">
            Manage Members
          </h3>

          {/* Messages */}
          {errorMsg && (
            <div className="mb-4 rounded-lg bg-danger-light px-4 py-3 text-sm text-danger">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="mb-4 rounded-lg bg-success-light px-4 py-3 text-sm text-success">
              {successMsg}
            </div>
          )}

          {/* Add new member form */}
          <div className="mb-6 rounded-xl bg-muted-light p-4">
            <h4 className="mb-3 text-sm font-semibold text-foreground">
              Naya Member Add Karein
            </h4>
            <form onSubmit={handleAdd} className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Member ka naam"
                className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <input
                type="tel"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="Phone (optional)"
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 sm:w-40"
              />
              <button
                type="submit"
                disabled={isPending}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-dark disabled:opacity-50"
              >
                {isPending ? "Adding..." : "Add"}
              </button>
            </form>
          </div>

          {/* Current members list with remove buttons */}
          <h4 className="mb-3 text-sm font-semibold text-foreground">
            Current Members
          </h4>
          <div className="space-y-2">
            {members.map((member) => {
              const isOrganizer = member.userId === organizerId;
              return (
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
                        {isOrganizer && (
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

                  {/* Remove button: only for non-organizer members */}
                  {!isOrganizer && (
                    <button
                      onClick={() => handleRemove(member.id, member.name)}
                      disabled={isPending}
                      className="rounded-lg border border-danger/50 px-3 py-1.5 text-xs font-medium text-danger hover:bg-danger-light disabled:opacity-50"
                    >
                      Remove
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
