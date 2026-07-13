/*
 * Shared Dashboard Navigation component.
 *
 * Used on all authenticated pages (dashboard, settings, committees).
 * Provides consistent navigation with:
 * - Clickable logo (goes to dashboard)
 * - Link to home page (landing)
 * - Settings link
 * - Logout button
 *
 * Mobile responsive: email hidden on small screens.
 *
 * This is a client component because it wraps the logout form action.
 */

"use client";

import Link from "next/link";
import { useTransition } from "react";
import { logout } from "@/app/(auth)/actions";
import ThemeToggle from "./ThemeToggle";

export interface DashboardNavProps {
  userEmail?: string | null;
  title?: string;
  backHref?: string;
  backLabel?: string;
}

export default function DashboardNav({
  userEmail,
  title = "CommitteeKart",
  backHref,
  backLabel,
}: DashboardNavProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <nav className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Left: Back link + Logo */}
        <div className="flex items-center gap-3 sm:gap-4">
          {backHref && (
            <Link
              href={backHref}
              className="text-sm text-muted hover:text-foreground"
            >
              {backLabel || "Back"}
            </Link>
          )}
          <Link
            href="/dashboard"
            className="text-lg font-bold text-primary sm:text-xl"
          >
            {title}
          </Link>
        </div>

        {/* Right: User email (hidden on mobile) + Theme + Settings + Logout */}
        <div className="flex items-center gap-2 sm:gap-4">
          {userEmail && (
            <span className="hidden text-sm text-muted lg:inline">
              {userEmail}
            </span>
          )}
          <ThemeToggle />
          <Link
            href="/settings"
            className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted-light"
          >
            Settings
          </Link>
          <form
            action={() => startTransition(() => logout())}
          >
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted-light disabled:opacity-50"
            >
              {isPending ? "..." : "Logout"}
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}
