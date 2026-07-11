/*
 * CSV Export route.
 *
 * Generates a CSV file of all contributions for a committee.
 * The organizer can download this for record keeping or sharing.
 *
 * URL: /committees/[id]/export
 * Returns: text/csv file download
 */

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";

/**
 * Convert a value to a CSV-safe string.
 * Wraps in quotes if it contains commas, quotes, or newlines.
 */
function csvEscape(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  // Verify the user is authenticated.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Fetch the committee (RLS ensures only the organizer can access).
  const { data: committee } = await supabase
    .from("committees")
    .select("*")
    .eq("id", id)
    .single();

  if (!committee) {
    return new NextResponse("Not found", { status: 404 });
  }

  // Fetch all members.
  const { data: members } = await supabase
    .from("members")
    .select("*")
    .eq("committee_id", id)
    .order("created_at", { ascending: true });

  // Fetch all contributions.
  const { data: contributions } = await supabase
    .from("contributions")
    .select("*")
    .eq("committee_id", id)
    .order("month_index", { ascending: true })
    .order("created_at", { ascending: true });

  // Build CSV content.
  const rows: string[] = [];

  // Header: Committee info.
  rows.push("CommitteeKart - Committee Report");
  rows.push("");
  rows.push(`Committee Name,${csvEscape(committee.name)}`);
  rows.push(`Monthly Amount,${csvEscape(formatCurrency(Number(committee.monthly_amount)))}`);
  rows.push(`Total Members,${csvEscape(committee.member_count)}`);
  rows.push(`Duration (Months),${csvEscape(committee.duration_months)}`);
  rows.push(`Draw Type,${csvEscape(committee.draw_type)}`);
  rows.push(`Start Date,${csvEscape(committee.start_date)}`);
  rows.push(`Status,${csvEscape(committee.status)}`);
  rows.push("");
  rows.push("");

  // Contributions table header.
  rows.push("Month,Member Name,Phone,Amount,Due Date,Status,Paid At,Payment Method");

  // Create a lookup map for members.
  const memberMap = new Map((members || []).map((m) => [m.id, m]));

  // Contribution rows.
  if (contributions && contributions.length > 0) {
    for (const c of contributions) {
      const member = memberMap.get(c.member_id);
      const monthLabel = `Month ${c.month_index + 1}`;
      const memberName = member?.name || "Unknown";
      const phone = member?.phone || "";
      const amount = formatCurrency(Number(c.amount));
      const dueDate = c.due_date;
      const status = c.status;
      const paidAt = c.paid_at ? new Date(c.paid_at).toLocaleDateString("en-GB") : "";
      const paymentMethod = c.payment_method || "";

      rows.push(
        [
          csvEscape(monthLabel),
          csvEscape(memberName),
          csvEscape(phone),
          csvEscape(amount),
          csvEscape(dueDate),
          csvEscape(status),
          csvEscape(paidAt),
          csvEscape(paymentMethod),
        ].join(",")
      );
    }
  } else {
    rows.push("No contributions found");
  }

  rows.push("");
  rows.push("");

  // Draw schedule section.
  rows.push("Draw Schedule");
  rows.push("Month,Member Name,Pot Amount,Status");

  const { data: draws } = await supabase
    .from("draws")
    .select("*")
    .eq("committee_id", id)
    .order("month_index", { ascending: true });

  if (draws && draws.length > 0) {
    for (const d of draws) {
      const member = memberMap.get(d.member_id);
      const monthLabel = `Month ${d.month_index + 1}`;
      const memberName = member?.name || "Unknown";
      const potAmount = formatCurrency(Number(d.amount));
      const status = d.status;

      rows.push(
        [
          csvEscape(monthLabel),
          csvEscape(memberName),
          csvEscape(potAmount),
          csvEscape(status),
        ].join(",")
      );
    }
  }

  // Generate the final CSV.
  const csvContent = rows.join("\n");

  // Return as downloadable CSV file.
  const fileName = `${committee.name.replace(/\s+/g, "_").toLowerCase()}_report.csv`;

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
