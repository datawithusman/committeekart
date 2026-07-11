/*
 * Global error boundary.
 * Catches unexpected errors in any route and shows a friendly message
 * with a retry button instead of a raw 500 page.
 */

"use client";

import Link from "next/link";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="mb-4 text-5xl">😕</div>
        <h1 className="mb-2 text-2xl font-bold text-foreground">
          Kuch masla ho gaya
        </h1>
        <p className="mb-6 text-sm text-muted">
          Page load karne mein error aaya. Dobara koshish karein.
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-lg bg-primary px-6 py-2.5 font-semibold text-primary-foreground hover:bg-primary-dark"
          >
            Dobara Koshish
          </button>
          <Link
            href="/"
            className="rounded-lg border border-border px-6 py-2.5 font-semibold text-foreground hover:bg-muted-light"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
