/*
 * Landing page for CommitteeKart.
 * First thing visitors see. Explains the app and links to auth.
 *
 * Sections:
 * 1. Navigation bar
 * 2. Hero section with CTA
 * 3. How it works (3 steps)
 * 4. Features grid
 * 5. Testimonials
 * 6. Final CTA
 * 7. Footer
 */

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-light to-background">
      {/* ==================== Navigation ==================== */}
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

      {/* ==================== Hero Section ==================== */}
      <main className="mx-auto max-w-4xl px-6 pt-16 pb-20 text-center">
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

      {/* ==================== How It Works ==================== */}
      <section className="bg-card py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="mb-12 text-center text-3xl font-bold text-foreground">
            Kaise Kaam Karta Hai
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {/* Step 1 */}
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                1
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                Committee Banao
              </h3>
              <p className="text-sm leading-6 text-muted">
                Naam, monthly amount, aur members add karein.
                Draw type choose karein (lottery, fixed, ya auction).
              </p>
            </div>
            {/* Step 2 */}
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                2
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                Payments Track Karo
              </h3>
              <p className="text-sm leading-6 text-muted">
                Har mahine kaunne kitna diya, ek tap mein mark karein.
                Pending payments clearly dikhte hain.
              </p>
            </div>
            {/* Step 3 */}
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                3
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                Draw Dekho
              </h3>
              <p className="text-sm leading-6 text-muted">
                Poora draw schedule pehle se generated. Har member ko
                pata hai kiski baari kab hai.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== Features Grid ==================== */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold text-foreground">
          Features
        </h2>
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
          {/* Feature 4 */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-light text-2xl">
              📊
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              Reports Export
            </h3>
            <p className="text-sm leading-6 text-muted">
              Committee ka poora data CSV mein download karein.
              Record keeping aur sharing ke liye.
            </p>
          </div>
          {/* Feature 5 */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-light text-2xl">
              👵
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              Aunty-Friendly
            </h3>
            <p className="text-sm leading-6 text-muted">
              Simple design, bada text, aasan navigation.
              Tech-savvy hone ki zaroorat nahi.
            </p>
          </div>
          {/* Feature 6 */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-success-light text-2xl">
              🚫💰
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              No Money Held
            </h3>
            <p className="text-sm leading-6 text-muted">
              App kabhi paisa hold nahi karta. Organizer khud collect
              karta hai, app sirf track karta hai.
            </p>
          </div>
        </div>
      </section>

      {/* ==================== Testimonials ==================== */}
      <section className="bg-card py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="mb-12 text-center text-3xl font-bold text-foreground">
            Log Kya Kehte Hain
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {/* Testimonial 1 */}
            <div className="rounded-2xl border border-border bg-background p-6">
              <div className="mb-3 text-accent">★★★★★</div>
              <p className="mb-4 text-sm leading-6 text-foreground">
                &quot;Pehle WhatsApp pe manage karti thi, har mahine
                arguments hote the. Ab sab clear hai!&quot;
              </p>
              <p className="text-xs font-medium text-muted">
                Saima, Office Committee Organizer
              </p>
            </div>
            {/* Testimonial 2 */}
            <div className="rounded-2xl border border-border bg-background p-6">
              <div className="mb-3 text-accent">★★★★★</div>
              <p className="mb-4 text-sm leading-6 text-foreground">
                &quot;Draw schedule pehle se pata hota hai, is liye
                plan kar sakte hain kab pot aayega.&quot;
              </p>
              <p className="text-xs font-medium text-muted">
                Bilal, Family Committee Member
              </p>
            </div>
            {/* Testimonial 3 */}
            <div className="rounded-2xl border border-border bg-background p-6">
              <div className="mb-3 text-accent">★★★★★</div>
              <p className="mb-4 text-sm leading-6 text-foreground">
                &quot;CSV report download karke accountant ko bhej
                deti hun. Life itni aasan ho gayi!&quot;
              </p>
              <p className="text-xs font-medium text-muted">
                Nida, Multiple Committees Organizer
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== Final CTA ==================== */}
      <section className="py-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground">
            Aaj hi shuru karein
          </h2>
          <p className="mb-8 text-muted">
            Apni pehli committee free mein banayein. Koi credit card
            ki zaroorat nahi.
          </p>
          <Link
            href="/signup"
            className="inline-block rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
          >
            Free Account Banao
          </Link>
        </div>
      </section>

      {/* ==================== Footer ==================== */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <span className="text-lg font-bold text-primary">CommitteeKart</span>
            <p className="text-sm text-muted">
              Track, Don&apos;t Hold. Built with Next.js and Supabase.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
