/*
 * Unit tests for the draw schedule generator.
 *
 * Tests verify the core ROSCA fairness guarantee:
 * - Each member appears exactly once in the schedule
 * - Schedule length equals duration (which equals member count)
 * - Lottery produces different orders across runs (randomness)
 * - Fixed type respects the provided order
 * - Edge cases (empty, single member)
 */

import { describe, it, expect } from "vitest";
import { generateDrawSchedule } from "../draw-schedule";

describe("generateDrawSchedule", () => {
  const memberIds = ["m1", "m2", "m3", "m4", "m5"];

  // ---- Lottery Type ----

  describe("lottery draw type", () => {
    it("should generate a schedule with the correct number of entries", () => {
      const schedule = generateDrawSchedule({
        memberIds,
        durationMonths: 5,
        drawType: "lottery",
      });

      expect(schedule).toHaveLength(5);
    });

    it("should include every member exactly once", () => {
      const schedule = generateDrawSchedule({
        memberIds,
        durationMonths: 5,
        drawType: "lottery",
      });

      const assignedMembers = schedule.map((entry) => entry.memberId);

      // Every member should appear exactly once.
      for (const memberId of memberIds) {
        const count = assignedMembers.filter((id) => id === memberId).length;
        expect(count).toBe(1);
      }
    });

    it("should produce month indices 0 through duration-1", () => {
      const schedule = generateDrawSchedule({
        memberIds,
        durationMonths: 5,
        drawType: "lottery",
      });

      const monthIndices = schedule.map((entry) => entry.monthIndex).sort();
      expect(monthIndices).toEqual([0, 1, 2, 3, 4]);
    });

    it("should produce different orders across multiple runs (randomness)", () => {
      // Run the lottery 10 times and collect results.
      const results: string[] = [];
      for (let i = 0; i < 10; i++) {
        const schedule = generateDrawSchedule({
          memberIds,
          durationMonths: 5,
          drawType: "lottery",
        });
        // Record who gets month 0 (first pot).
        results.push(schedule[0].memberId);
      }

      // With 5 members, getting the same first member 10 times in a row
      // is astronomically unlikely (1 in 5^9). So there should be at least
      // 2 different values.
      const uniqueResults = new Set(results);
      expect(uniqueResults.size).toBeGreaterThan(1);
    });
  });

  // ---- Fixed Type ----

  describe("fixed draw type", () => {
    it("should respect the provided order", () => {
      const fixedOrder = ["m3", "m1", "m5", "m2", "m4"];
      const schedule = generateDrawSchedule({
        memberIds,
        durationMonths: 5,
        drawType: "fixed",
        fixedOrder,
      });

      for (let i = 0; i < fixedOrder.length; i++) {
        expect(schedule[i].memberId).toBe(fixedOrder[i]);
        expect(schedule[i].monthIndex).toBe(i);
      }
    });

    it("should fall back to member order if no fixedOrder provided", () => {
      const schedule = generateDrawSchedule({
        memberIds,
        durationMonths: 5,
        drawType: "fixed",
      });

      for (let i = 0; i < memberIds.length; i++) {
        expect(schedule[i].memberId).toBe(memberIds[i]);
      }
    });
  });

  // ---- Auction Type ----

  describe("auction draw type", () => {
    it("should assign members in original order as placeholder", () => {
      const schedule = generateDrawSchedule({
        memberIds,
        durationMonths: 5,
        drawType: "auction",
      });

      for (let i = 0; i < memberIds.length; i++) {
        expect(schedule[i].memberId).toBe(memberIds[i]);
      }
    });
  });

  // ---- Edge Cases ----

  describe("edge cases", () => {
    it("should return empty array for no members", () => {
      const schedule = generateDrawSchedule({
        memberIds: [],
        durationMonths: 5,
        drawType: "lottery",
      });

      expect(schedule).toEqual([]);
    });

    it("should return empty array for zero duration", () => {
      const schedule = generateDrawSchedule({
        memberIds,
        durationMonths: 0,
        drawType: "lottery",
      });

      expect(schedule).toEqual([]);
    });

    it("should handle a single member", () => {
      const schedule = generateDrawSchedule({
        memberIds: ["only-member"],
        durationMonths: 1,
        drawType: "lottery",
      });

      expect(schedule).toHaveLength(1);
      expect(schedule[0].memberId).toBe("only-member");
      expect(schedule[0].monthIndex).toBe(0);
    });

    it("should handle mismatched duration and member count gracefully", () => {
      // Duration < member count: only first N members get assigned.
      const schedule = generateDrawSchedule({
        memberIds: ["m1", "m2", "m3"],
        durationMonths: 2,
        drawType: "fixed",
      });

      expect(schedule).toHaveLength(2);
      // Only 2 entries, not 3 (uses min of member/duration).
      expect(schedule[0].monthIndex).toBe(0);
      expect(schedule[1].monthIndex).toBe(1);
    });
  });

  // ---- Schedule Integrity ----

  describe("schedule integrity", () => {
    it("should never assign the same member twice in a valid schedule", () => {
      const schedule = generateDrawSchedule({
        memberIds,
        durationMonths: 5,
        drawType: "lottery",
      });

      const seen = new Set<string>();
      for (const entry of schedule) {
        expect(seen.has(entry.memberId)).toBe(false);
        seen.add(entry.memberId);
      }
    });

    it("should never have duplicate month indices", () => {
      const schedule = generateDrawSchedule({
        memberIds,
        durationMonths: 5,
        drawType: "lottery",
      });

      const seen = new Set<number>();
      for (const entry of schedule) {
        expect(seen.has(entry.monthIndex)).toBe(false);
        seen.add(entry.monthIndex);
      }
    });
  });
});
