/*
 * Shared utility functions
 * Used across the app for formatting and common operations.
 */

/**
 * Combine multiple class names into a single string.
 * Filters out falsy values (undefined, null, false).
 * This is a lightweight alternative to clsx.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Format a number as Pakistani Rupees.
 * Example: 50000 -> "Rs. 50,000"
 */
export function formatCurrency(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-PK")}`;
}

/**
 * Format an ISO date string to a readable format.
 * Example: "2026-07-15" -> "15 Jul 2026"
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Format a month index (0 based) and year to a readable label.
 * Example: (6, 2026) -> "Jul 2026"
 */
export function formatMonth(monthIndex: number, year: number): string {
  const date = new Date(year, monthIndex, 1);
  return date.toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
  });
}

/**
 * Get the initials from a name.
 * Example: "Fatima Khan" -> "FK"
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Calculate the next month from a given date.
 * Returns a new Date object shifted by 1 month.
 */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}
