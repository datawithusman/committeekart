/*
 * Contribution status actions.
 *
 * Lets the organizer mark a contribution as paid or pending.
 * Records the payment method and timestamp when marked paid.
 */

"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { PaymentMethod } from "@/lib/types";

/**
 * Mark a contribution as paid.
 * Sets status to "paid", records the payment method and timestamp.
 */
export async function markContributionPaid(
  contributionId: string,
  committeeId: string,
  paymentMethod: PaymentMethod = "cash"
) {
  const supabase = await createSupabaseServerClient();

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
  }

  revalidatePath(`/committees/${committeeId}`);
}

/**
 * Mark a contribution back to pending.
 * Clears the paid_at and payment_method fields.
 */
export async function markContributionPending(
  contributionId: string,
  committeeId: string
) {
  const supabase = await createSupabaseServerClient();

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
  }

  revalidatePath(`/committees/${committeeId}`);
}
