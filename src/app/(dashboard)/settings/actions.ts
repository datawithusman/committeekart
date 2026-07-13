/*
 * Settings server actions.
 * Handles profile updates (name, phone).
 * Plan changes are deferred to Phase 4 (payment integration).
 */

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Update the current user's profile (full name and phone).
 */
export async function updateProfile(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const fullName = (formData.get("fullName") as string)?.trim() || "";
  const phone = (formData.get("phone") as string)?.trim() || null;

  // Validation
  if (!fullName || fullName.length > 100) {
    redirect("/settings?error=" + encodeURIComponent("Naam 1 se 100 characters ke beech hona chahiye."));
  }

  if (phone && phone.length > 20) {
    redirect("/settings?error=" + encodeURIComponent("Phone number 20 characters se lamba nahi ho sakta."));
  }

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, phone })
    .eq("id", user.id);

  if (error) {
    redirect("/settings?error=" + encodeURIComponent("Profile update mein masla ho gaya."));
  }

  // Also update the member rows where this user is linked.
  // Committee members see the name from the members table, not profiles.
  await supabase
    .from("members")
    .update({ name: fullName, phone })
    .eq("user_id", user.id);

  revalidatePath("/dashboard");
  revalidatePath("/settings");
  redirect("/settings?success=" + encodeURIComponent("Profile update ho gaya!"));
}
