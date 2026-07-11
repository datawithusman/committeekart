/*
 * Committee server actions.
 * Handles creating a committee with members and generating the draw schedule.
 *
 * Flow:
 * 1. Validate form data
 * 2. Insert committee row
 * 3. Insert member rows (including the organizer as a member)
 * 4. Generate draw schedule and insert draw rows
 * 5. Redirect to committee detail page
 */

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { generateDrawSchedule } from "@/lib/draw-schedule";
import type { DrawType } from "@/lib/types";

/**
 * Create a new committee with members and auto-generated draw schedule.
 *
 * The organizer is automatically added as the first member.
 * All other members are added by name and phone (no account required).
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

  // Extract and validate committee fields.
  const name = (formData.get("name") as string).trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const monthlyAmount = parseFloat(formData.get("monthlyAmount") as string);
  const durationMonths = parseInt(formData.get("durationMonths") as string, 10);
  const drawType = (formData.get("drawType") as string) as DrawType;
  const startDate = formData.get("startDate") as string;

  // Extract members. The form sends member names as member_0, member_1, etc.
  // And optionally member_phone_0, member_phone_1, etc.
  const memberNames: string[] = [];
  const memberPhones: string[] = [];
  let memberIndex = 0;

  while (formData.has(`member_${memberIndex}`)) {
    const memberName = (formData.get(`member_${memberIndex}`) as string).trim();
    const memberPhone = (formData.get(`member_phone_${memberIndex}`) as string)?.trim() || "";
    if (memberName) {
      memberNames.push(memberName);
      memberPhones.push(memberPhone);
    }
    memberIndex++;
  }

  // The organizer is automatically added as a member.
  // So total member count = entered members + 1 (organizer).
  const totalMemberCount = memberNames.length + 1;

  // Basic validation.
  if (!name || monthlyAmount <= 0 || durationMonths < 1) {
    redirect("/committees/new?error=" + encodeURIComponent("Form data sahi nahi hai."));
  }

  if (totalMemberCount < 2) {
    redirect("/committees/new?error=" + encodeURIComponent("Kam az kam 2 members chahiye (aap + 1 aur)."));
  }

  // 1. Insert the committee.
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
    redirect("/committees/new?error=" + encodeURIComponent("Committee banane mein masla ho gaya."));
  }

  // 2. Insert members. Organizer is the first member.
  // We need their profile name.
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
    ...memberNames.map((memberName, i) => ({
      committee_id: committee.id,
      user_id: null,
      name: memberName,
      phone: memberPhones[i] || null,
    })),
  ];

  const { data: insertedMembers, error: membersError } = await supabase
    .from("members")
    .insert(membersToInsert)
    .select();

  if (membersError || !insertedMembers) {
    console.error("Members insert error:", membersError);
    redirect("/committees/new?error=" + encodeURIComponent("Members add karne mein masla ho gaya."));
  }

  // 3. Generate draw schedule and insert draw rows.
  const memberIds = insertedMembers.map((m) => m.id);
  const schedule = generateDrawSchedule({
    memberIds,
    durationMonths,
    drawType,
  });

  // 4. Update each member's draw_month_index.
  for (const entry of schedule) {
    await supabase
      .from("members")
      .update({ draw_month_index: entry.monthIndex })
      .eq("id", entry.memberId);

    // Insert the draw row.
    await supabase.from("draws").insert({
      committee_id: committee.id,
      month_index: entry.monthIndex,
      member_id: entry.memberId,
      amount: monthlyAmount * totalMemberCount,
      status: "scheduled",
    });
  }

  // 5. Create contribution rows for month 0 (first month).
  // Each member owes their first payment.
  const contributionsToInsert = insertedMembers.map((m) => ({
    committee_id: committee.id,
    member_id: m.id,
    month_index: 0,
    due_date: startDate,
    amount: monthlyAmount,
    status: "pending",
  }));

  await supabase.from("contributions").insert(contributionsToInsert);

  revalidatePath("/dashboard");
  redirect(`/committees/${committee.id}`);
}
