/*
 * Claim membership server action.
 *
 * Links the current logged-in user to a member row using the
 * claim_member_profile RPC function (SECURITY DEFINER, bypasses RLS).
 *
 * This is needed because RLS only allows organizers to UPDATE the
 * members table. Members cannot update their own row directly.
 */

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Shape of the claim_member_profile RPC result. */
interface ClaimResult {
  success: boolean;
  committee_id: string | null;
  error: string | null;
}

export async function claimMembership(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const token = formData.get("token") as string;

  // Call the SECURITY DEFINER function to claim the profile.
  const { data, error } = await supabase
    .rpc("claim_member_profile", { token })
    .single();

  const result = data as unknown as ClaimResult;

  if (error || !result || !result.success) {
    const message = result?.error || error?.message || "Claim karne mein masla ho gaya.";
    redirect("/?error=" + encodeURIComponent(message));
  }

  // Success: redirect to the committee page.
  revalidatePath(`/committees/${result.committee_id}`);
  revalidatePath("/dashboard");
  redirect(`/committees/${result.committee_id}`);
}
