/*
 * Create Committee page.
 *
 * Organizer fills out:
 * - Committee name and description
 * - Monthly contribution amount
 * - Duration in months
 * - Draw type (lottery, fixed, auction)
 * - Start date
 * - Member names and phones (organizer is added automatically)
 *
 * This is a client component because it has dynamic member rows
 * (add/remove members on the fly).
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCommittee } from "../actions";

export default function NewCommitteePage() {
  const router = useRouter();
  const [memberCount, setMemberCount] = useState(1);

  // Add a new member input row.
  function addMember() {
    setMemberCount((prev) => prev + 1);
  }

  // Remove the last member input row (keep at least 1).
  function removeMember() {
    setMemberCount((prev) => Math.max(1, prev - 1));
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <nav className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm text-muted hover:text-foreground"
          >
            ← Dashboard
          </button>
          <h1 className="text-lg font-semibold text-foreground">
            Nai Committee
          </h1>
          <div className="w-20"></div>
        </div>
      </nav>

      {/* Form */}
      <main className="mx-auto max-w-2xl px-6 py-8">
        <form action={createCommittee} className="space-y-8">
          {/* Section: Committee Details */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Committee ki Details
            </h2>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-foreground">
                  Committee ka Naam <span className="text-danger">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="e.g. Office Committee"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-foreground">
                  Description (optional)
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={2}
                  placeholder="Committee ke baare mein kuch info..."
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Amount and Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="monthlyAmount" className="mb-1.5 block text-sm font-medium text-foreground">
                    Monthly Amount (Rs.) <span className="text-danger">*</span>
                  </label>
                  <input
                    id="monthlyAmount"
                    name="monthlyAmount"
                    type="number"
                    required
                    min="100"
                    step="100"
                    placeholder="5000"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label htmlFor="durationMonths" className="mb-1.5 block text-sm font-medium text-foreground">
                    Duration (Months) <span className="text-danger">*</span>
                  </label>
                  <input
                    id="durationMonths"
                    name="durationMonths"
                    type="number"
                    required
                    min="1"
                    max="60"
                    placeholder="10"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Draw Type */}
              <div>
                <label htmlFor="drawType" className="mb-1.5 block text-sm font-medium text-foreground">
                  Draw Type <span className="text-danger">*</span>
                </label>
                <select
                  id="drawType"
                  name="drawType"
                  required
                  defaultValue="lottery"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="lottery">Lottery (Random)</option>
                  <option value="fixed">Fixed Order</option>
                  <option value="auction">Auction (Bidding)</option>
                </select>
                <p className="mt-1.5 text-xs text-muted">
                  Lottery = random shuffle. Fixed = aap decide karenge. Auction = monthly bidding.
                </p>
              </div>

              {/* Start Date */}
              <div>
                <label htmlFor="startDate" className="mb-1.5 block text-sm font-medium text-foreground">
                  Start Date <span className="text-danger">*</span>
                </label>
                <input
                  id="startDate"
                  name="startDate"
                  type="date"
                  required
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>

          {/* Section: Members */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-1 text-lg font-semibold text-foreground">
              Members
            </h2>
            <p className="mb-4 text-sm text-muted">
              Aap khud automatically pehle member ho. Dusre members yahan add karein.
            </p>

            <div className="space-y-3">
              {/* Dynamic member rows */}
              {Array.from({ length: memberCount }).map((_, index) => (
                <div key={index} className="flex gap-3">
                  <input
                    name={`member_${index}`}
                    type="text"
                    required
                    placeholder={`Member ${index + 2} ka naam`}
                    className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <input
                    name={`member_phone_${index}`}
                    type="tel"
                    placeholder="Phone (optional)"
                    className="w-40 rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              ))}
            </div>

            {/* Add/Remove buttons */}
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={addMember}
                className="rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary-light"
              >
                + Member Add Karein
              </button>
              {memberCount > 1 && (
                <button
                  type="button"
                  onClick={removeMember}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted hover:bg-muted-light"
                >
                  − Remove
                </button>
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full rounded-xl bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
          >
            Committee Banao
          </button>
        </form>
      </main>
    </div>
  );
}
