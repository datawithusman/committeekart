/*
 * Landing page for CommitteeKart.
 * First thing visitors see. Explains the app and links to auth.
 */

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-light to-background">
      {/* Navigation */}
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-primary">CommitteeKart</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-foreground hover:bg-muted-light"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-dark"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero section */}
      <main className="mx-auto max-w-4xl px-6 pt-20 pb-32 text-center">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent-light px-4 py-1.5 text-sm font-medium text-accent-foreground">
          <span className="h-2 w-2 rounded-full bg-accent"></span>
          Track, Don&apos;t Hold
        </div>

        {/* Headline */}
        <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
          Aapki committee,
          <br />
          <span className="text-primary">sahi tarah manage</span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted">
          CommitteeKart se apni savings committee ko digital banayein.
          Payments track karein, draw schedule set karein, aur sab kuch
          transparent rakhein. Bina kisi dispute ke.
        </p>

        {/* CTA buttons */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/signup"
            className="w-full rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-dark sm:w-auto"
          >
            Free Shuru Karein
          </Link>
          <Link
            href="/login"
            className="w-full rounded-xl border border-border bg-card px-8 py-3.5 text-base font-semibold text-foreground transition-colors hover:bg-muted-light sm:w-auto"
          >
            Login Karein
          </Link>
        </div>

        {/* Trust note */}
        <p className="mt-6 text-sm text-muted">
          No credit card required. Ham pesa hold nahi karte.
        </p>
      </main>

      {/* Features section */}
      <section className="mx-auto max-w-5xl px-6 pb-32">
        <div className="grid gap-6 sm:grid-cols-3">
          {/* Feature 1 */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-light text-2xl">
              💰
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              Payment Tracking
            </h3>
            <p className="text-sm leading-6 text-muted">
              Har member ka payment record. Paid, pending, ya late,
              sab kuch ek nazar mein.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-light text-2xl">
              🎯
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              Draw Schedule
            </h3>
            <p className="text-sm leading-6 text-muted">
              Auto generate draw schedule. Har member ko pata hota hai
              kiski baari kab hai.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-success-light text-2xl">
              🔒
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              Full Transparency
            </h3>
            <p className="text-sm leading-6 text-muted">
              Sab members dekh sakte hain apni records. Koi dispute nahi,
              koi confusion nahi.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-8 text-center text-sm text-muted">
          <p>CommitteeKart. Built with Next.js and Supabase.</p>
        </div>
      </footer>
    </div>
  );
}
