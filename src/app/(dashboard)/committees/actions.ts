/*
 * Committee server actions.
 * Handles creating a committee with members and generating the draw schedule.
 *
 * Flow:
 * 1. Validate form data (thorough server-side checks)
 * 2. Insert committee row
 * 3. Insert member rows (including the organizer as a member)
 * 4. Generate draw schedule and insert draw rows
 * 5. Create contribution rows for ALL months (not just month 0)
 * 6. Redirect to committee detail page
 *
 * Note: Creation is not wrapped in a DB transaction yet (Supabase client
 * limitation). If a step fails, the committee row is deleted via cascade
 * cleanup to avoid orphaned partial data.
 */

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { generateDrawSchedule } from "@/lib/draw-schedule";
import { addMonths } from "@/lib/utils";

/** Allowed draw type values from the database enum. */
const VALID_DRAW_TYPES = ["lottery", "fixed", "auction"] as const;
type ValidDrawType = (typeof VALID_DRAW_TYPES)[number];

/** Safely parse and validate a draw type string. */
function parseDrawType(value: string): ValidDrawType | null {
  return VALID_DRAW_TYPES.includes(value as ValidDrawType)
    ? (value as ValidDrawType)
    : null;
}

/** Redirect helper that preserves the error message in the URL. */
function redirectToError(message: string): never {
  redirect(`/committees/new?error=${encodeURIComponent(message)}`);
}

/**
 * Create a new committee with members and auto-generated draw schedule.
 *
 * The organizer is automatically added as the first member.
 * All other members are added by name and phone (no account required).
 *
 * Validation rules:
 * - Name: 1-100 characters
 * - Monthly amount: positive number, at least 100
 * - Duration: must equal total member count (ROSCA fairness guarantee)
 * - Draw type: must be one of lottery, fixed, auction
 * - Start date: valid date string
 * - Members: at least 1 external member (organizer is member 1)
 * - Member names: 1-100 characters each
 */
export async function createCommittee(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  // Get the current user (organizer).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // ---- Extract and validate committee fields ----

  const name = (formData.get("name") as string)?.trim() || "";
  const description = (formData.get("description") as string)?.trim() || null;

  const monthlyAmountRaw = formData.get("monthlyAmount") as string;
  const monthlyAmount = parseFloat(monthlyAmountRaw);
  const monthlyAmountIsValid =
    !Number.isNaN(monthlyAmount) && monthlyAmount >= 100;

  const durationRaw = formData.get("durationMonths") as string;
  const durationMonths = parseInt(durationRaw, 10);
  const durationIsValid =
    !Number.isNaN(durationMonths) && durationMonths >= 1 && durationMonths <= 60;

  const drawTypeRaw = (formData.get("drawType") as string) || "";
  const drawType = parseDrawType(drawTypeRaw);

  const startDate = (formData.get("startDate") as string)?.trim() || "";

  // ---- Extract members ----
  // The form sends member names as member_0, member_1, etc.
  // And optionally member_phone_0, member_phone_1, etc.
  const memberEntries: { name: string; phone: string }[] = [];
  let memberIndex = 0;

  while (formData.has(`member_${memberIndex}`)) {
    const memberName = (formData.get(`member_${memberIndex}`) as string)?.trim() || "";
    const memberPhone =
      (formData.get(`member_phone_${memberIndex}`) as string)?.trim() || "";
    if (memberName) {
      memberEntries.push({ name: memberName, phone: memberPhone });
    }
    memberIndex++;
  }

  // The organizer is automatically added as a member.
  // So total member count = entered members + 1 (organizer).
  const totalMemberCount = memberEntries.length + 1;

  // ---- Validation ----

  if (!name || name.length > 100) {
    redirectToError("Committee ka naam 1 se 100 characters ke beech hona chahiye.");
  }

  if (!monthlyAmountIsValid) {
    redirectToError("Monthly amount kam az kam Rs. 100 hona chahiye.");
  }

  if (!durationIsValid) {
    redirectToError("Duration 1 se 60 months ke beech hona chahiye.");
  }

  if (!drawType) {
    redirectToError("Draw type sahi nahi hai. Lottery, Fixed, ya Auction chunein.");
  }

  if (!startDate || Number.isNaN(new Date(startDate).getTime())) {
    redirectToError("Start date sahi nahi hai.");
  }

  if (totalMemberCount < 2) {
    redirectToError("Kam az kam 2 members chahiye (aap + 1 aur).");
  }

  // ROSCA fairness guarantee: duration must equal member count.
  // Each member gets the pot exactly once.
  if (durationMonths !== totalMemberCount) {
    redirectToError(
      `Duration (${durationMonths} months) aur members (${totalMemberCount}) barabar hone chahiye. ` +
        "Har member ko ek baar pot milna chahiye."
    );
  }

  // Validate member name lengths.
  for (const entry of memberEntries) {
    if (entry.name.length > 100) {
      redirectToError("Member ka naam 100 characters se lamba nahi ho sakta.");
    }
  }

  // ---- 1. Insert the committee ----
  const { data: committee, error: committeeError } = await supabase
    .from("committees")
    .insert({
      organizer_id: user.id,
      name,
      description,
      monthly_amount: monthlyAmount,
      member_count: totalMemberCount,
      duration_months: durationMonths,
      draw_type: drawType,
      start_date: startDate,
      status: "active",
    })
    .select()
    .single();

  if (committeeError || !committee) {
    console.error("Committee insert error:", committeeError);
    redirectToError("Committee banane mein masla ho gaya. Dobara koshish karein.");
  }

  // ---- 2. Insert members ----
  // Get organizer's profile name.
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const organizerName = profile?.full_name || user.email || "Organizer";

  const membersToInsert = [
    {
      committee_id: committee.id,
      user_id: user.id,
      name: organizerName,
      phone: null,
    },
    ...memberEntries.map((entry) => ({
      committee_id: committee.id,
      user_id: null,
      name: entry.name,
      phone: entry.phone || null,
    })),
  ];

  const { data: insertedMembers, error: membersError } = await supabase
    .from("members")
    .insert(membersToInsert)
    .select();

  if (membersError || !insertedMembers) {
    console.error("Members insert error:", membersError);
    // Cleanup: delete the committee (cascades to members/draws/contributions).
    await supabase.from("committees").delete().eq("id", committee.id);
    redirectToError("Members add karne mein masla ho gaya.");
  }

  // ---- 3. Generate draw schedule and insert draw rows ----
  const memberIds = insertedMembers.map((m) => m.id);
  const schedule = generateDrawSchedule({
    memberIds,
    durationMonths,
    drawType,
  });

  // Update each member's draw_month_index and insert the draw row.
  // Build batch arrays for efficiency.
  const drawsToInsert = schedule.map((entry) => ({
    committee_id: committee.id,
    month_index: entry.monthIndex,
    member_id: entry.memberId,
    amount: monthlyAmount * totalMemberCount,
    status: "scheduled" as const,
  }));

  const { error: drawsError } = await supabase.from("draws").insert(drawsToInsert);

  if (drawsError) {
    console.error("Draws insert error:", drawsError);
    await supabase.from("committees").delete().eq("id", committee.id);
    redirectToError("Draw schedule banane mein masla ho gaya.");
  }

  // Update members' draw_month_index values.
  for (const entry of schedule) {
    await supabase
      .from("members")
      .update({ draw_month_index: entry.monthIndex })
      .eq("id", entry.memberId);
  }

  // ---- 4. Create contribution rows for ALL months ----
  // Each member owes a payment every month for the full duration.
  const startDateObj = new Date(startDate);
  const contributionsToInsert: {
    committee_id: string;
    member_id: string;
    month_index: number;
    due_date: string;
    amount: number;
    status: "pending";
  }[] = [];

  for (let month = 0; month < durationMonths; month++) {
    for (const member of insertedMembers) {
      contributionsToInsert.push({
        committee_id: committee.id,
        member_id: member.id,
        month_index: month,
        due_date: addMonths(startDateObj, month).toISOString().split("T")[0],
        amount: monthlyAmount,
        status: "pending",
      });
    }
  }

  const { error: contributionsError } = await supabase
    .from("contributions")
    .insert(contributionsToInsert);

  if (contributionsError) {
    console.error("Contributions insert error:", contributionsError);
    await supabase.from("committees").delete().eq("id", committee.id);
    redirectToError("Contributions setup mein masla ho gaya.");
  }

  revalidatePath("/dashboard");
  redirect(`/committees/${committee.id}`);
}
