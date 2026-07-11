/*
 * Login page.
 * Users enter their email and password to sign in.
 */

import Link from "next/link";
import { login } from "../actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; redirect?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary-light to-background px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="text-3xl font-bold text-primary">
            CommitteeKart
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <h1 className="mb-2 text-2xl font-bold text-foreground">
            Wapas khush aamdeed!
          </h1>
          <p className="mb-6 text-sm text-muted">
            Apna account login karein
          </p>

          {/* Error message */}
          {params.error && (
            <div className="mb-4 rounded-lg bg-danger-light px-4 py-3 text-sm text-danger">
              {decodeURIComponent(params.error)}
            </div>
          )}

          {/* Success message (e.g. after signup) */}
          {params.message && (
            <div className="mb-4 rounded-lg bg-success-light px-4 py-3 text-sm text-success">
              {decodeURIComponent(params.message)}
            </div>
          )}

          {/* Login form */}
          <form action={login} className="space-y-4">
            {/* Hidden redirect field for deep link support */}
            {params.redirect && (
              <input type="hidden" name="redirect" value={params.redirect} />
            )}

            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="aap@example.com"
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="Apna password"
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-primary px-4 py-2.5 font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
            >
              Login
            </button>
          </form>

          {/* Signup link */}
          <p className="mt-6 text-center text-sm text-muted">
            Account nahi hai?{" "}
            <Link
              href="/signup"
              className="font-medium text-primary hover:underline"
            >
              Sign up karein
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
