# CommitteeKart - Technical Decisions Log

> ADR (Architecture Decision Record) style log.
> Records WHY each decision was made, not just WHAT.

---

## Decision 1: "Track, Don't Hold" Model

**Date:** Phase 1
**Status:** Accepted

**Context:**
Committee apps that hold money (like Oraan) require financial licenses
and regulatory compliance. This is impossible for a solo developer
and adds massive risk.

**Decision:**
The app will NEVER process payments. It only tracks who paid what,
when, and how. Organizers collect money independently.

**Consequences:**
- (+) No financial regulation needed
- (+) Solo dev can build and launch
- (+) Users trust the app more (no money at risk)
- (+) Faster MVP (no payment gateway integration)
- (-) Cannot earn from transaction fees
- (-) Monetization via subscriptions instead

---

## Decision 2: Supabase over Custom Backend

**Date:** Phase 1
**Status:** Accepted

**Context:**
Need a database + auth + API. Options were:
1. Custom Node.js backend (Express + Prisma + PostgreSQL)
2. Firebase (NoSQL)
3. Supabase (PostgreSQL + Auth + Realtime)

**Decision:**
Use Supabase.

**Consequences:**
- (+) PostgreSQL (relational, type safe)
- (+) Built in auth with email/password
- (+) Row Level Security for data protection
- (+) Free tier covers MVP
- (+) Direct client queries (no API layer needed)
- (-) Vendor lock in risk (mitigated by open source option)

---

## Decision 3: Next.js App Router + Server Components

**Date:** Phase 1
**Status:** Accepted

**Context:**
Next.js offers Pages Router and App Router. App Router is newer
with Server Components support.

**Decision:**
Use App Router with React Server Components as default.

**Consequences:**
- (+) Less client side JavaScript
- (+) Better SEO and performance
- (+) Direct database queries from server components
- (-) Learning curve (mental model shift)

---

## Decision 4: Members Can Exist Without User Accounts

**Date:** Phase 1
**Status:** Accepted

**Context:**
Organizers add people to committees. If we required every member
to sign up first, it would create huge friction. Many members
(like older relatives) may never sign up.

**Decision:**
The `members` table has a nullable `user_id`. Organizers add people
by name + phone only. Members can optionally "claim" their profile
later via phone OTP.

**Consequences:**
- (+) Zero friction for organizers
- (+) Works for non tech savvy participants
- (-) Claiming profiles requires extra logic (Phase 2)

---

## Decision 5: Pre Compute Draw Schedule

**Date:** Phase 1
**Status:** Accepted

**Context:**
When a committee starts, the draw schedule (who gets the pot each month)
needs to be decided. Two options:
1. Decide month by month at runtime
2. Pre compute the entire schedule at creation

**Decision:**
Pre compute the entire schedule when the committee is created.

**Consequences:**
- (+) Members know their pot month from day one (transparency)
- (+) Simpler month to month logic
- (+) Disputes reduced (schedule is fixed and visible)
- (-) Less flexibility (rescheduling requires manual override)

---

## Decision 6: No Em Dashes Anywhere

**Date:** Phase 1
**Status:** Accepted

**Context:**
Project owner requested no em dash characters anywhere in the project.

**Decision:**
Use hyphens, colons, parentheses, or commas instead of em dashes in
all code, comments, documentation, README, and LinkedIn posts.

**Consequences:**
- (+) Consistent style across the project
- (+) Avoids rendering issues in different editors
