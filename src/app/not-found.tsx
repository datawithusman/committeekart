/*
 * Custom 404 page.
 * Shown when a user visits a URL that does not exist.
 */

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="mb-4 text-6xl font-bold text-primary">404</div>
        <h1 className="mb-2 text-2xl font-bold text-foreground">
          Page nahi mila
        </h1>
        <p className="mb-6 text-sm text-muted">
          Jo page aap dhoondh rahe hain woh exist nahi karta.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            href="/"
            className="inline-block rounded-lg border border-border px-6 py-2.5 font-semibold text-foreground hover:bg-muted-light"
          >
            Home
          </Link>
          <Link
            href="/dashboard"
            className="inline-block rounded-lg bg-primary px-6 py-2.5 font-semibold text-primary-foreground hover:bg-primary-dark"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
