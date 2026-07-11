/*
 * Claim membership server action.
 *
 * Links the current logged-in user to a member row.
 * This "claims" the invite so the member can see their committee data.
 */

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function claimMembership(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const token = formData.get("token") as string;
  const memberId = formData.get("memberId") as string;

  // Verify the token matches the member.
  const { data: member } = await supabase
    .from("members")
    .select("id, user_id, committee_id")
    .eq("id", memberId)
    .eq("invite_token", token)
    .maybeSingle();

  if (!member) {
    redirect("/?error=" + encodeURIComponent("Invalid invite token."));
  }

  // Already claimed by this user.
  if (member.user_id === user.id) {
    redirect(`/committees/${member.committee_id}`);
  }

  // Already claimed by someone else.
  if (member.user_id !== null) {
    redirect("/?error=" + encodeURIComponent("Yeh invite pehle se use ho chuka hai."));
  }

  // Claim it: link the user account to this member.
  const { error } = await supabase
    .from("members")
    .update({ user_id: user.id })
    .eq("id", memberId)
    .is("user_id", "null"); // Safety: only if not already claimed

  if (error) {
    redirect("/?error=" + encodeURIComponent("Claim karne mein masla ho gaya."));
  }

  revalidatePath(`/committees/${member.committee_id}`);
  redirect(`/committees/${member.committee_id}`);
}
