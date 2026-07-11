/*
 * Contribution status actions.
 *
 * Lets the organizer mark a contribution as paid or pending.
 * Records the payment method and timestamp when marked paid.
 *
 * Security: Each action verifies that the logged-in user is the
 * organizer of the committee that owns the contribution, in addition
 * to the RLS policies enforced by the database.
 */

"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { PaymentMethod } from "@/lib/types";

/** Result returned to the client so it can handle success/failure. */
export interface ActionResult {
  success: boolean;
  error?: string;
}

/**
 * Verify that the current user owns the committee.
 * Returns true if authorized, false otherwise.
 */
async function verifyCommitteeOwnership(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string,
  committeeId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("committees")
    .select("id")
    .eq("id", committeeId)
    .eq("organizer_id", userId)
    .maybeSingle();

  return !!data;
}

/**
 * Mark a contribution as paid.
 * Sets status to "paid", records the payment method and timestamp.
 *
 * Returns an ActionResult so the client can handle failures gracefully.
 */
export async function markContributionPaid(
  contributionId: string,
  committeeId: string,
  paymentMethod: PaymentMethod = "cash"
): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient();

  // Verify the user is logged in.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Verify the user owns this committee.
  const isOwner = await verifyCommitteeOwnership(supabase, user.id, committeeId);
  if (!isOwner) {
    return { success: false, error: "Not authorized" };
  }

  const { error } = await supabase
    .from("contributions")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      payment_method: paymentMethod,
    })
    .eq("id", contributionId);

  if (error) {
    console.error("Mark paid error:", error);
    return { success: false, error: "Database update failed" };
  }

  // Revalidate both the committee page and the dashboard (stats update).
  revalidatePath(`/committees/${committeeId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * Mark a contribution back to pending.
 * Clears the paid_at and payment_method fields.
 *
 * Returns an ActionResult so the client can handle failures gracefully.
 */
export async function markContributionPending(
  contributionId: string,
  committeeId: string
): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient();

  // Verify the user is logged in.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Verify the user owns this committee.
  const isOwner = await verifyCommitteeOwnership(supabase, user.id, committeeId);
  if (!isOwner) {
    return { success: false, error: "Not authorized" };
  }

  const { error } = await supabase
    .from("contributions")
    .update({
      status: "pending",
      paid_at: null,
      payment_method: null,
    })
    .eq("id", contributionId);

  if (error) {
    console.error("Mark pending error:", error);
    return { success: false, error: "Database update failed" };
  }

  // Revalidate both the committee page and the dashboard (stats update).
  revalidatePath(`/committees/${committeeId}`);
  revalidatePath("/dashboard");
  return { success: true };
}
