/*
 * Draw schedule generator.
 *
 * When a committee is created, the entire draw schedule is pre-computed.
 * This determines which member receives the pot each month.
 *
 * Three draw types are supported:
 * - lottery: random shuffle, each member gets the pot exactly once
 * - fixed: organizer provides the order, we use it as-is
 * - auction: placeholder for monthly bidding (assigned later)
 *
 * Every member gets the pot exactly once across the committee duration.
 */

import type { DrawType } from "./types";

/** Input for generating a draw schedule. */
export interface GenerateScheduleInput {
  /** IDs of all members in the committee. */
  memberIds: string[];
  /** Total number of months (usually equals member count). */
  durationMonths: number;
  /** How the draw is decided. */
  drawType: DrawType;
  /** For "fixed" type: the explicit order of member IDs. */
  fixedOrder?: string[];
}

/** A single draw entry: which member gets the pot in which month. */
export interface DrawEntry {
  /** 0-based month index. */
  monthIndex: number;
  /** Member ID who receives the pot this month. */
  memberId: string;
}

/**
 * Shuffle an array using Fisher-Yates algorithm.
 * Returns a new array, does not mutate the input.
 */
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Generate the full draw schedule for a committee.
 * Returns an array of DrawEntry, one per month.
 *
 * Rules:
 * - Each member appears exactly once (if member count equals duration)
 * - If fewer members than months, some members may repeat (rare case)
 * - If more members than months, not everyone gets a pot (invalid config)
 */
export function generateDrawSchedule(
  input: GenerateScheduleInput
): DrawEntry[] {
  const { memberIds, durationMonths, drawType, fixedOrder } = input;

  if (memberIds.length === 0 || durationMonths === 0) {
    return [];
  }

  let orderedMemberIds: string[] = [];

  switch (drawType) {
    case "lottery":
      // Random shuffle of all members.
      orderedMemberIds = shuffle(memberIds);
      break;

    case "fixed":
      // Use the organizer provided order.
      if (!fixedOrder || fixedOrder.length === 0) {
        // Fallback to member order if no fixed order given.
        orderedMemberIds = [...memberIds];
      } else {
        orderedMemberIds = [...fixedOrder];
      }
      break;

    case "auction":
      // Auction is decided month by month later.
      // For now, assign members in their original order as placeholder.
      // These will be updated when auctions happen.
      orderedMemberIds = [...memberIds];
      break;

    default:
      orderedMemberIds = [...memberIds];
  }

  // Build schedule: one entry per month.
  // If duration > members, cycle through members again.
  const schedule: DrawEntry[] = [];
  for (let month = 0; month < durationMonths; month++) {
    schedule.push({
      monthIndex: month,
      memberId: orderedMemberIds[month % orderedMemberIds.length],
    });
  }

  return schedule;
}
