/*
 * Committee management actions.
 * Handles updating committee details and deleting committees.
 *
 * Both actions verify ownership before proceeding.
 */

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CommitteeStatus } from "@/lib/types";

/** Result type for client-side feedback. */
export interface CommitteeActionResult {
  success: boolean;
  error?: string;
}

/**
 * Update a committee's details (name, description, status).
 * Only the organizer can do this.
 */
export async function updateCommittee(
  committeeId: string,
  formData: FormData
): Promise<CommitteeActionResult> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Verify ownership.
  const { data: committee } = await supabase
    .from("committees")
    .select("organizer_id")
    .eq("id", committeeId)
    .maybeSingle();

  if (!committee || committee.organizer_id !== user.id) {
    return { success: false, error: "Not authorized" };
  }

  const name = (formData.get("name") as string)?.trim() || "";
  const description = (formData.get("description") as string)?.trim() || null;
  const status = (formData.get("status") as string) as CommitteeStatus;

  // Validation
  if (!name || name.length > 100) {
    return { success: false, error: "Naam 1 se 100 characters ke beech hona chahiye." };
  }

  const validStatuses = ["draft", "active", "completed", "cancelled"];
  if (!validStatuses.includes(status)) {
    return { success: false, error: "Invalid status" };
  }

  const { error } = await supabase
    .from("committees")
    .update({ name, description, status })
    .eq("id", committeeId);

  if (error) {
    return { success: false, error: "Database update failed" };
  }

  revalidatePath(`/committees/${committeeId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * Delete a committee and all related data (members, contributions, draws).
 * Uses cascade delete configured in the database schema.
 * Only the organizer can do this. Irreversible.
 */
export async function deleteCommittee(
  committeeId: string
): Promise<CommitteeActionResult> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Verify ownership.
  const { data: committee } = await supabase
    .from("committees")
    .select("organizer_id")
    .eq("id", committeeId)
    .maybeSingle();

  if (!committee || committee.organizer_id !== user.id) {
    return { success: false, error: "Not authorized" };
  }

  // Delete (cascades to members, contributions, draws).
  const { error } = await supabase
    .from("committees")
    .delete()
    .eq("id", committeeId);

  if (error) {
    return { success: false, error: "Delete failed" };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
