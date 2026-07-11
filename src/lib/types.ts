/*
 * TypeScript type definitions for CommitteeKart.
 * These mirror the database schema in supabase/migrations/.
 * Keep these in sync with the SQL migrations.
 */

/* ============ Enums ============ */

/** How the draw (pot winner) is decided each month. */
export type DrawType = "lottery" | "fixed" | "auction";

/** Lifecycle status of a committee. */
export type CommitteeStatus = "draft" | "active" | "completed" | "cancelled";

/** Payment status for a member's monthly contribution. */
export type ContributionStatus = "pending" | "paid" | "late" | "skipped";

/** How the member paid (record only, app does not handle money). */
export type PaymentMethod = "cash" | "bank_transfer" | "jazzcash" | "easypaisa" | "other";

/** Subscription tier for monetization. */
export type PlanTier = "free" | "pro" | "premium";

/* ============ Database Tables ============ */

/** A user account. Extends Supabase auth.users with app specific data. */
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  plan: PlanTier;
  created_at: string;
}

/** A savings circle / committee created by an organizer. */
export interface Committee {
  id: string;
  organizer_id: string;
  name: string;
  monthly_amount: number;
  member_count: number;
  duration_months: number;
  draw_type: DrawType;
  start_date: string;
  status: CommitteeStatus;
  description: string | null;
  created_at: string;
}

/** A participant in a committee. Can exist without a user account. */
export interface Member {
  id: string;
  committee_id: string;
  user_id: string | null;
  name: string;
  phone: string | null;
  /** Which month (0 based index) this member gets the pot. Null until draw is assigned. */
  draw_month_index: number | null;
  /** Unique token for invite links. Member uses this to claim their profile. */
  invite_token: string | null;
  created_at: string;
}

/** A single monthly payment from a member. */
export interface Contribution {
  id: string;
  committee_id: string;
  member_id: string;
  /** Month index (0 based) within the committee duration. */
  month_index: number;
  due_date: string;
  amount: number;
  status: ContributionStatus;
  paid_at: string | null;
  payment_method: PaymentMethod | null;
  note: string | null;
  created_at: string;
}

/** A scheduled pot payout to a member for a specific month. */
export interface Draw {
  id: string;
  committee_id: string;
  month_index: number;
  member_id: string;
  /** Total pot amount for this month (monthly_amount * member_count). */
  amount: number;
  status: "scheduled" | "completed";
  created_at: string;
}

/* ============ Derived / Helper Types ============ */

/** Committee with computed summary stats for dashboard display. */
export interface CommitteeWithStats extends Committee {
  /** How many members paid this current month. */
  paid_this_month: number;
  /** Total members pending payment this current month. */
  pending_this_month: number;
  /** Total amount collected across all months so far. */
  total_collected: number;
}

/** The role a user plays in a specific committee. */
export type CommitteeRole = "organizer" | "member";

/** Result of creating a committee with members. Used for the create flow. */
export interface CreateCommitteeInput {
  name: string;
  monthly_amount: number;
  member_count: number;
  duration_months: number;
  draw_type: DrawType;
  start_date: string;
  description?: string;
  members: { name: string; phone?: string }[];
}
