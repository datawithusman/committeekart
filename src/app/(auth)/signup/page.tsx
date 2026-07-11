/*
 * Signup page.
 * New users create an account with name, email, and password.
 */

import Link from "next/link";
import { signup } from "../actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
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
            Account banayein
          </h1>
          <p className="mb-6 text-sm text-muted">
            Free shuru karein, credit card ki zaroorat nahi
          </p>

          {/* Error message */}
          {params.error && (
            <div className="mb-4 rounded-lg bg-danger-light px-4 py-3 text-sm text-danger">
              {decodeURIComponent(params.error)}
            </div>
          )}

          {/* Signup form */}
          <form action={signup} className="space-y-4">
            <div>
              <label
                htmlFor="fullName"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Pura Naam
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                placeholder="Ali Khan"
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

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
                minLength={6}
                placeholder="Kam az kam 6 characters"
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-primary px-4 py-2.5 font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
            >
              Account Banao
            </button>
          </form>

          {/* Login link */}
          <p className="mt-6 text-center text-sm text-muted">
            Pehle se account hai?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Login karein
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
