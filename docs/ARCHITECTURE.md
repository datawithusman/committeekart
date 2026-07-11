# CommitteeKart - Architecture

> System design, data model, security, and technical decisions for the
> CommitteeKart digital committee (ROSCA) tracker.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Tech Stack](#2-tech-stack)
3. [System Architecture Diagram](#3-system-architecture-diagram)
4. [Core Principle: Track, Don't Hold](#4-core-principle-track-dont-hold)
5. [Component Architecture](#5-component-architecture)
6. [Data Model](#6-data-model)
7. [Data Flow Diagrams](#7-data-flow-diagrams)
8. [Security Architecture](#8-security-architecture)
9. [Authentication Flow](#9-authentication-flow)
10. [Draw Types](#10-draw-types)
11. [Third-Party Integrations](#11-third-party-integrations)
12. [Scalability Considerations](#12-scalability-considerations)
13. [Technology Decisions Rationale](#13-technology-decisions-rationale)
14. [File Structure](#14-file-structure)

---

## 1. Overview

CommitteeKart is a digital committee (ROSCA) tracker built on the
"Track, Don't Hold" principle. The app never touches money. It only
records contributions, calculates draw schedules, and provides
transparency to organizers and members.

In South Asia, "committees" (also called ROSCAs, chit funds, or
savings circles) are a popular informal way to save money. A group
of people contribute a fixed amount monthly, and one member receives
the total "pot" each month in rotation.

**The problem:** Most committees are managed via WhatsApp messages
and Excel sheets. This leads to disputes, forgotten payments, and
confusion about whose turn it is.

**The solution:** CommitteeKart tracks everything digitally:
contributions, draw schedules, and member transparency. No more
arguments.

---

## 2. Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 16 (App Router) | Server Components, file based routing, PWA ready |
| Language | TypeScript | Type safety, better DX for team |
| Database | Supabase (PostgreSQL) | Free tier, Auth + DB + RLS built in |
| Styling | Tailwind CSS v4 | Utility first, fast UI development |
| Hosting | Vercel | One click Next.js deploy, free tier |
| Version Control | Git + GitHub | Industry standard |
| Auth | Supabase Auth (email/password) | Built into Supabase, no separate service |

**Runtime versions (from package.json):**
- Next.js: 16.2.10
- React: 19.2.4
- @supabase/ssr: ^0.12.0
- @supabase/supabase-js: ^2.110.2
- Tailwind CSS: ^4
- TypeScript: ^5

---

## 3. System Architecture Diagram

```
                        +-------------------+
                        |     User Browser   |
                        |  (Client Side)     |
                        +---------+---------+
                                  |
                          HTTPS (cookies)
                                  |
                                  v
               +------------------+------------------+
               |            Vercel (Hosting)          |
               |         Next.js 16 App Router        |
               |                                      |
               |  +-----------+    +---------------+  |
               |  |  Server   |    |   Client      |  |
               |  |Components |    | Components    |  |
               |  | (RSC)     |    | ("use client")|  |
               |  +-----+-----+    +-------+-------+  |
               |        |                   |          |
               |  +-----+-----+    +-------+-------+  |
               |  |  Server   |    | Browser Supa. |  |
               |  | Actions   |    | Client        |  |
               |  |("use server")|  +-------+-------+  |
               |  +-----+-----+            |          |
               |        |                  |          |
               +--------+------------------+----------+
                         |                  |
                         |   Supabase API   |
                         |   (HTTPS + RLS)  |
                         v                  v
               +------------------+------------------+
               |          Supabase (Backend)         |
               |     PostgreSQL Database              |
               |                                      |
               |  +-------+  +--------+  +---------+ |
               |  | Auth  |  |Database|  |Storage  | |
               |  |(users)|  |(tables)|  |(future) | |
               |  +-------+  +---+----+  +---------+ |
               |                 |                   |
               |          +------+------+            |
               |          |  RLS Policies |           |
               |          | (per table)   |           |
               |          +---------------+           |
               +--------------------------------------+
```

### Simplified Request Flow

```
User Browser
    |
    | HTTP request (with auth cookie)
    v
Vercel Edge / proxy.ts (middleware)
    |
    |-- Refreshes auth session cookie
    |-- Checks protected vs auth routes
    |-- Redirects if unauthorized
    |
    v
Next.js Server Component (RSC)
    |
    |-- Reads data via createSupabaseServerClient()
    |-- Queries database (RLS filters by user)
    |-- Renders HTML on the server
    |
    v
Client Component (if interactive)
    |
    |-- Receives initial HTML
    |-- Handles user interactions
    |-- Calls Server Actions on events
    |-- Optimistic UI updates
```

---

## 4. Core Principle: Track, Don't Hold

The app does NOT process payments. There is no payment gateway.
This decision was made because:

1. **No regulation needed** - holding money requires financial licenses
2. **Solo dev friendly** - no compliance overhead
3. **User trust** - people are cautious about giving money to new apps
4. **Faster MVP** - payment integration deferred to Phase 3+

Instead, the organizer collects money however they prefer
(cash, JazzCash, EasyPaisa, bank transfer) and the app records:
- Who paid
- How much
- When
- What method

This is documented as a formal decision in `docs/DECISIONS.md`
(Decision 1).

---

## 5. Component Architecture

CommitteeKart uses the Next.js App Router with React Server Components
(RSC) as the default. This section explains how the different component
types interact.

### 5.1 Server Components vs Client Components

```
+--------------------------------------------------+
|              Next.js App Router                   |
|                                                   |
|  Server Components (default, no "use client")    |
|  ================================================|
|  - Run on the server only                        |
|  - Can query the database directly               |
|  - Send HTML to the browser (zero JS)            |
|  - Cannot use hooks (useState, useEffect)        |
|  - Cannot handle browser events                  |
|                                                   |
|  Examples in this app:                            |
|  - dashboard/page.tsx                            |
|  - committees/[id]/page.tsx                      |
|  - login/page.tsx, signup/page.tsx              |
|  - layout.tsx                                    |
|                                                   |
|  Client Components ("use client")                |
|  ================================================|
|  - Run in the browser                            |
|  - Can use hooks and event handlers             |
|  - Can call Server Actions                       |
|  - Ship JavaScript to the browser                |
|                                                   |
|  Examples in this app:                            |
|  - committees/new/page.tsx (dynamic member rows)|
|  - ContributionRow.tsx (toggle button)          |
+--------------------------------------------------+
```

### 5.2 Server Actions

Server Actions are functions that run on the server but can be called
from Client Components. They replace traditional API routes for form
submissions and mutations.

```
+-------------------+        invoke         +-------------------+
|  Client Component |  ------------------>  |  Server Action    |
|  (ContributionRow)|                      |  (markContribution|
|                   |  <------------------  |   Paid)           |
|  - shows button   |     ActionResult     |                   |
|  - optimistic UI  |     {success,error}  |  - verifies user  |
|  - error display  |                      |  - checks RLS     |
+-------------------+                      |  - updates DB     |
                                           |  - revalidates    |
                                           +-------------------+
```

**Server Actions in this app:**

| File | Actions |
|------|---------|
| `src/app/(auth)/actions.ts` | `signup`, `login`, `logout` |
| `src/app/(dashboard)/committees/actions.ts` | `createCommittee` |
| `src/app/(dashboard)/committees/[id]/actions.ts` | `markContributionPaid`, `markContributionPending` |

### 5.3 The Middleware (proxy.ts)

In Next.js 16, the middleware file is `proxy.ts` (renamed from
`middleware.ts`). It runs on every matched request before the page
renders.

```
Request arrives
    |
    v
proxy.ts runs
    |
    +-- Creates a Supabase server client with cookie handling
    |
    +-- Calls supabase.auth.getUser()
    |       |
    |       +-- This refreshes the session cookie
    |       +-- Returns the user object (or null)
    |
    +-- Checks the route:
    |
    +-- If logged out AND protected route (/dashboard, /committees,
    |   /settings): redirect to /login?redirect=<original>
    |
    +-- If logged in AND auth route (/login, /signup):
    |   redirect to /dashboard
    |
    +-- Otherwise: continue to the page
```

### 5.4 Route Groups

The app uses Next.js route groups (folders in parentheses) to organize
pages without affecting URLs:

```
src/app/
    (auth)/              <- Auth pages group
        login/page.tsx   <- /login
        signup/page.tsx  <- /signup
        actions.ts       <- Auth server actions

    (dashboard)/         <- Protected pages group
        dashboard/page.tsx     <- /dashboard
        committees/
            new/page.tsx       <- /committees/new
            [id]/page.tsx      <- /committees/[id]
            actions.ts         <- Committee server actions

    page.tsx             <- / (landing page)
    layout.tsx           <- Root layout
```

### 5.5 Supabase Client Strategy

Two Supabase clients exist for different contexts:

| Client | File | Used In | Cookie Handling |
|--------|------|---------|-----------------|
| Server client | `src/lib/supabase/server.ts` | Server Components, Server Actions | Reads/writes via `next/headers` cookies |
| Browser client | `src/lib/supabase/client.ts` | Client Components | Uses `createBrowserClient` (cookie auto-sync) |
| Middleware client | Inline in `proxy.ts` | Middleware | Reads request cookies, sets response cookies |

All three use the same Supabase URL and publishable key from
environment variables.

---

## 6. Data Model

### 6.1 Entity Relationship Diagram

```
profiles (1) ---- creates ----> committees (N)
   ^                                |
   | extends                        | has
   |                                v
auth.users                      members (N)
                                    |
                                    | has
                                    v
                              contributions (N)

                              draws (N) <--- committees (1)
                                 ^
                                 |
                              members (1)
```

### 6.2 Tables

| Table | Purpose |
|-------|---------|
| profiles | Extends auth.users with app data (name, phone, plan) |
| committees | A savings circle (amount, members, duration, draw type) |
| members | Participants in a committee (can exist without user account) |
| contributions | Monthly payments (one per member per month) |
| draws | Scheduled pot payouts (one per month per committee) |

### 6.3 Enums

```sql
draw_type:           'lottery' | 'fixed' | 'auction'
committee_status:    'draft' | 'active' | 'completed' | 'cancelled'
contribution_status: 'pending' | 'paid' | 'late' | 'skipped'
payment_method:      'cash' | 'bank_transfer' | 'jazzcash' | 'easypaisa' | 'other'
plan_tier:           'free' | 'pro' | 'premium'
```

### 6.4 Key Constraints

| Constraint | Table | Rule |
|------------|-------|------|
| Name length | committees | 1 to 100 characters |
| Monthly amount | committees | Must be > 0 (app enforces >= 100) |
| Member count | committees | Between 2 and 50 |
| Duration | committees | Between 1 and 60 months |
| Unique member | members | (committee_id, user_id) must be unique |
| Unique contribution | contributions | (committee_id, member_id, month_index) unique |
| Unique draw | draws | (committee_id, month_index) unique |

### 6.5 Key Design Decisions

1. **Members without accounts**: Organizers add people by name + phone.
   The `user_id` field is nullable so members can claim their profile
   later. (Decision 4 in DECISIONS.md)

2. **Pre-computed draw schedule**: When a committee is created, the
   entire draw schedule is generated immediately (lottery shuffle, fixed
   order, or auction placeholder). Each member gets the pot exactly
   once. (Decision 5 in DECISIONS.md)

3. **Row Level Security (RLS)**: Every table has RLS enabled.
   Organizers can only access their own committees. Members can view
   committees they belong to.

4. **Auto profile creation**: A database trigger (`on_auth_user_created`)
   creates a `profiles` row automatically when a user signs up via
   Supabase Auth.

5. **Duration equals member count**: The app enforces that
   `duration_months === member_count`. This is the ROSCA fairness
   guarantee: every member receives the pot exactly once.

6. **Pre-created contribution rows**: When a committee is created,
   contribution rows for ALL months (for all members) are generated
   upfront with status "pending". This makes monthly tracking simple
   (just update the status, no need to create new rows each month).

---

## 7. Data Flow Diagrams

### 7.1 Committee Creation Flow

```
Organizer fills form on /committees/new (Client Component)
    |
    |  FormData: name, amount, duration, drawType,
    |            startDate, member_0, member_1, ...
    v
createCommittee (Server Action)
    |
    +-- 1. Get current user (auth.getUser)
    |
    +-- 2. Validate all fields:
    |       - name: 1-100 chars
    |       - amount: >= 100
    |       - duration: 1-60
    |       - drawType: lottery|fixed|auction
    |       - duration === memberCount (ROSCA rule)
    |       - at least 2 members
    |       (if invalid -> redirect with error message)
    |
    +-- 3. Insert committee row
    |       (if fails -> redirect with error)
    |
    +-- 4. Insert member rows
    |       - Organizer (with user_id) as member 1
    |       - Added members (user_id = null)
    |       (if fails -> delete committee, redirect)
    |
    +-- 5. Generate draw schedule (generateDrawSchedule)
    |       - lottery: Fisher-Yates shuffle
    |       - fixed: insertion order
    |       - auction: placeholder order
    |       Insert draw rows (one per month)
    |       Update members.draw_month_index
    |       (if fails -> delete committee, redirect)
    |
    +-- 6. Create contribution rows for ALL months
    |       - members * duration rows
    |       - all status = "pending"
    |       - due_date = startDate + monthIndex
    |       (if fails -> delete committee, redirect)
    |
    +-- 7. revalidatePath("/dashboard")
    |
    +-- 8. redirect to /committees/[id]
```

### 7.2 Contribution Tracking Flow

```
Organizer views /committees/[id] (Server Component)
    |
    | Fetches: committee, members, contributions, draws
    | Renders ContributionRow (Client Component) for each
    |
    v
User clicks "Pending" button on a ContributionRow
    |
    v
handleToggle() in ContributionRow
    |
    +-- startTransition (useTransition for non-blocking)
    |
    +-- Calls markContributionPaid(contributionId, committeeId)
    |       |
    |       v
    |   Server Action: markContributionPaid
    |       |
    |       +-- Get current user (auth.getUser)
    |       +-- Verify ownership (committees.organizer_id === user.id)
    |       +-- Update contributions row:
    |       |       status = "paid"
    |       |       paid_at = now()
    |       |       payment_method = "cash"
    |       +-- revalidatePath("/committees/[id]")
    |       +-- revalidatePath("/dashboard")
    |       +-- return { success: true }
    |
    +-- If success: UI already updated (revalidation)
    +-- If failure: show error message, do NOT flip UI state
```

### 7.3 Dashboard Data Flow

```
User navigates to /dashboard (Server Component)
    |
    v
DashboardPage()
    |
    +-- auth.getUser() -> get current user
    |
    +-- Query profiles -> get user's full_name, plan
    |
    +-- Query committees WHERE organizer_id = user.id
    |       (RLS ensures only own committees are returned)
    |
    +-- Query contributions WHERE committee_id IN (user's committees)
    |       (RLS ensures only own contributions are returned)
    |
    +-- Calculate stats:
    |       - totalCollected = SUM(amount WHERE status = "paid")
    |       - pendingCount = COUNT(WHERE status = "pending")
    |
    +-- Render:
            - Greeting (Salam, [name]!)
            - Stat cards (Total Committees, Total Collected, Pending)
            - Committee list (or empty state)
```

---

## 8. Security Architecture

Security is multi-layered. No single layer is trusted alone.

### 8.1 Security Layers

```
Layer 1: Vercel (HTTPS, DDoS protection)
    |
Layer 2: Next.js proxy.ts (route-level auth checks)
    |
Layer 3: Server Action ownership verification
    |       (verifyCommitteeOwnership before any mutation)
    |
Layer 4: Supabase Row Level Security (RLS)
    |       (database-enforced, cannot be bypassed by client)
    |
Layer 5: PostgreSQL constraints (CHECK, UNIQUE, NOT NULL)
            (data integrity at the database level)
```

### 8.2 Row Level Security (RLS) Details

RLS is enabled on all five tables. Policies enforce:

| Table | Organizer Can | Member Can |
|-------|---------------|------------|
| profiles | Read/update own row only | Read/update own row only |
| committees | Full CRUD on own committees | View committees they belong to |
| members | Full CRUD on members of own committees | View own member row |
| contributions | Full CRUD on contributions of own committees | View own contributions |
| draws | Full CRUD on draws of own committees | View draws of their committees |

#### RLS Policy Architecture

```
Committees Table
    |
    +-- "Organizers manage their committees"
    |       USING (auth.uid() = organizer_id)
    |       WITH CHECK (auth.uid() = organizer_id)
    |
    +-- (Note: "Members can view their committees" was dropped in
         migration 0002 to fix infinite recursion. Member view goes
         through the draws/members policies instead.)

Members Table
    |
    +-- "Organizers manage members"
    |       USING (EXISTS committees WHERE id = committee_id
    |              AND organizer_id = auth.uid())
    |
    +-- "Members view their own row"
    |       USING (user_id = auth.uid() OR organizer check)

Contributions Table
    |
    +-- "Organizers manage contributions"
    |       USING (EXISTS committees WHERE id = committee_id
    |              AND organizer_id = auth.uid())
    |
    +-- "Members view their contributions"
    |       USING (EXISTS members WHERE id = member_id
    |              AND user_id = auth.uid())

Draws Table
    |
    +-- "Organizers manage draws"
    |       USING (EXISTS committees WHERE id = committee_id
    |              AND organizer_id = auth.uid())
    |
    +-- "Members view draws"
    |       USING (organizer check OR member check)
```

#### The RLS Recursion Fix (Migration 0002)

The initial schema had an infinite recursion bug:
- The "Members can view their committees" policy on the `committees`
  table queried the `members` table
- The `members` table policies queried the `committees` table
- This created a circular reference that PostgreSQL rejected

**Fix (in migration 0002):**
- Dropped the cross-referencing policy on `committees`
- Simplified all policies to reference `committees.organizer_id`
  (which does NOT reference back to members)
- Member access is now handled through the draws and contributions
  policies, not through a committees-level policy

### 8.3 Auth Session Management

```
Browser                          Supabase
   |                                |
   |  Login (email + password)      |
   |------------------------------->|
   |                                |-- Verifies credentials
   |                                |-- Creates JWT session
   |<-------------------------------|
   |  Set auth cookie (httpOnly,    |
   |  secure in production,         |
   |  sameSite: lax)                |
   |                                |
   |  Every subsequent request      |
   |  carries the cookie            |
   |------------------------------->|
   |                                |-- proxy.ts calls getUser()
   |                                |-- Refreshes token if needed
   |                                |-- Sets updated cookie
   |<-------------------------------|
```

Cookie security attributes (set in `proxy.ts`):
- `httpOnly: true` - JavaScript cannot read the cookie (XSS protection)
- `secure: true` in production - only sent over HTTPS
- `sameSite: "lax"` - CSRF protection
- `path: "/"` - available on all routes

### 8.4 Application-Level Authorization

In addition to RLS, Server Actions perform explicit ownership checks
before any mutation:

```typescript
// Example from committees/[id]/actions.ts
async function verifyCommitteeOwnership(supabase, userId, committeeId) {
  const { data } = await supabase
    .from("committees")
    .select("id")
    .eq("id", committeeId)
    .eq("organizer_id", userId)
    .maybeSingle();
  return !!data;
}
```

This is defense-in-depth: even if a client somehow bypasses RLS (which
should not be possible), the Server Action still rejects unauthorized
operations.

---

## 9. Authentication Flow

```
User visits app
      |
      v
  proxy.ts checks auth session
      |
      +---> Logged in + on /login or /signup --> redirect to /dashboard
      |
      +---> Logged out + on protected route --> redirect to /login
      |                                        (?redirect=<original>)
      |
      +---> Otherwise --> continue to page
```

### Auth Pages

| Route | Access | Behavior |
|-------|--------|----------|
| `/login` | Logged out only | Shows login form, redirects to /dashboard if logged in |
| `/signup` | Logged out only | Shows signup form, redirects to /dashboard if logged in |
| `/` (landing) | Public | Anyone can view |
| `/dashboard` | Protected | Requires login, redirects to /login if logged out |
| `/committees/*` | Protected | Requires login |
| `/settings` | Protected | Requires login (planned) |

### Signup Process

1. User submits signup form (name, email, password)
2. `signup` Server Action calls `supabase.auth.signUp()`
3. Supabase creates a user in `auth.users`
4. The `on_auth_user_created` trigger fires and creates a `profiles` row
5. If email confirmation is enabled: user gets an email, must click link
6. If email confirmation is disabled (dev): user is logged in immediately
7. Redirect to /dashboard

### Error Messages (Roman Urdu)

Auth errors are shown in Roman Urdu for user friendliness:

| Error Code | Message |
|------------|---------|
| invalid_credentials | Email ya password ghalat hai. |
| email_taken | Yeh email pehle se registered hai. Login karein. |
| weak_password | Password kam az kam 6 characters ka hona chahiye. |
| default | Kuch masla ho gaya. Dobara koshish karein. |

---

## 10. Draw Types

| Type | How it works |
|------|-------------|
| lottery | Random shuffle of members (Fisher-Yates algorithm). Each gets pot once, randomly. |
| fixed | Organizer provides the order (members appear in insertion order). |
| auction | Members bid a discount. Highest bid wins the pot. Placeholder assigned at creation. |

All three pre-compute the schedule at committee creation time.
The auction type stores a placeholder that can be updated monthly.

### Draw Schedule Generation Algorithm

```typescript
// From src/lib/draw-schedule.ts

function generateDrawSchedule(input): DrawEntry[] {
  const effectiveCount = Math.min(memberIds.length, durationMonths);

  switch (drawType) {
    case "lottery":
      orderedMemberIds = shuffle(memberIds);  // Fisher-Yates
      break;
    case "fixed":
      orderedMemberIds = fixedOrder || [...memberIds];
      break;
    case "auction":
      orderedMemberIds = [...memberIds];  // placeholder
      break;
  }

  // Build one entry per month, each member appears exactly once
  for (month = 0; month < effectiveCount; month++) {
    schedule.push({ monthIndex: month, memberId: orderedMemberIds[month] });
  }

  return schedule;
}
```

**Fairness guarantee:** `memberIds.length` must equal `durationMonths`
(enforced in the `createCommittee` Server Action). This ensures every
member receives the pot exactly once.

---

## 11. Third-Party Integrations

### 11.1 Current Integrations

#### Supabase (Core Backend)

Supabase provides three services that CommitteeKart uses:

| Service | Usage |
|---------|-------|
| **PostgreSQL Database** | All data storage (profiles, committees, members, contributions, draws) |
| **Auth** | Email/password authentication, session management, JWT tokens |
| **RLS** | Row Level Security policies for data isolation |

**Integration points:**
- `@supabase/ssr` - Server-side rendering cookie handling
- `@supabase/supabase-js` - Core Supabase client
- Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

**Data flow:** The app communicates with Supabase over HTTPS. The
publishable (anon) key is safe to expose because RLS policies enforce
authorization at the database level.

### 11.2 Future Integrations

#### Payment Gateways (Phase 3+, optional)

If the app adds optional payment facilitation in the future:

| Gateway | Region | Use Case |
|---------|--------|----------|
| JazzCash | Pakistan | Local mobile wallet payments |
| EasyPaisa | Pakistan | Local mobile wallet payments |
| Stripe | International | Card payments for global users |
| Razorpay | India | Indian users |

> **Note:** Adding payment processing would change the "Track, Don't
> Hold" model and require financial regulation compliance. This is
> explicitly deferred and may never be added.

#### WhatsApp API (Phase 3)

For sending payment reminders and committee updates:

| Feature | Trigger |
|---------|---------|
| Payment reminder | 3 days before due date, member has not paid |
| Payment confirmation | Organizer marks contribution as paid |
| Draw reminder | 1 day before a member's pot month |
| Committee summary | Monthly summary to all members |

**Integration approach:** Use the WhatsApp Business API via a provider
like Twilio or directly through Meta. Messages would be sent from
Server Actions or a Supabase Edge Function (scheduled).

#### Push Notifications (Mobile App, Phase 4)

| Provider | Platform |
|----------|----------|
| Firebase Cloud Messaging (FCM) | Android |
| Apple Push Notification Service (APNs) | iOS |
| Expo Notifications | Cross-platform (if using Expo) |

#### Email Service (Phase 3)

For transactional emails (welcome, password reset, summaries):

| Provider | Free Tier |
|----------|-----------|
| Resend | 3,000 emails/month |
| SendGrid | 100 emails/day |
| Postmark | 100 emails/month |

Resend integrates well with React Email templates and Next.js.

#### Analytics (Phase 3)

For understanding user behavior:

| Provider | Purpose |
|----------|---------|
| Vercel Analytics | Built-in, privacy-friendly, free |
| PostHog | Open-source product analytics |
| Google Analytics | Industry standard (heavier) |

> **Recommendation:** Start with Vercel Analytics (no setup, built-in)
> and add PostHog later for deeper insights.

---

## 12. Scalability Considerations

### 12.1 Current Scale (MVP)

The app is designed for:
- Hundreds of users (organizers)
- Thousands of committees
- Tens of thousands of members
- Hundreds of thousands of contribution rows

At this scale, the current architecture (Vercel free tier + Supabase
free/pro tier) is sufficient.

### 12.2 Potential Bottlenecks

| Bottleneck | When It Hits | Mitigation |
|------------|-------------|------------|
| Committee creation writes many rows (members + draws + contributions) | Committees with 50 members create 50 + 50 + 2500 = 2600 rows | Use a Supabase RPC/Edge Function with a single transaction |
| Dashboard fetches all contributions at once | User with many committees, months of data | Add server-side aggregation (SQL views or RPCs) |
| Supabase connection pool limit | High concurrent traffic | Supabase handles pooling; upgrade plan if needed |
| Vercel serverless function cold starts | Infrequent traffic | Acceptable for this app type |
| N+1 queries in draw_month_index updates | Committee creation loops over members | Batch update in a single query |

### 12.3 Scaling Strategy

**Database (Supabase):**
- Add database indexes on frequently queried columns (already indexed:
  organizer_id, committee_id, status)
- Use SQL views or stored procedures for complex aggregations
- Consider read replicas for reporting if traffic grows
- Upgrade Supabase plan: Free -> Pro ($25/mo) -> Team -> Enterprise

**Application (Vercel):**
- Vercel auto-scales serverless functions
- Use `revalidatePath` and `revalidateTag` for caching (already in use)
- Consider static generation for public pages (landing page)
- Add ISR (Incremental Static Regeneration) for semi-static content

**Frontend:**
- Code splitting is automatic with App Router
- Client Components are kept minimal (only interactive parts)
- Images use `next/image` for optimization (when added)

### 12.4 Multi-Region Considerations

Currently, Supabase runs in a single region. For users in South Asia
(Pakistan, India, Bangladesh), choose the Supabase region closest to
the target audience (Singapore is typically closest). Vercel's edge
network handles global distribution of the frontend.

### 12.5 Database Growth

The biggest growth is in the `contributions` table. A single committee
with 50 members and 50 months generates 2,500 contribution rows. With
1,000 such committees, that is 2.5 million rows. PostgreSQL handles
this well with proper indexing, but monitoring query performance is
important as data grows.

---

## 13. Technology Decisions Rationale

This section summarizes the key technology decisions. Full details are
in `docs/DECISIONS.md`.

### 13.1 Why Next.js 16 App Router?

| Reason | Detail |
|--------|--------|
| Server Components | Less JavaScript sent to the browser, faster page loads |
| File-based routing | Intuitive, less boilerplate |
| Server Actions | No need to build separate API routes for mutations |
| PWA ready | Can be installed on mobile, future React Native migration path |
| Vercel integration | Zero-config deployment, automatic previews |
| React 19 | Latest features (useTransition, use server) |

### 13.2 Why Supabase over Custom Backend?

| Reason | Detail |
|--------|--------|
| PostgreSQL | Relational, type-safe, industry standard |
| Built-in Auth | Email/password out of the box, no separate auth service |
| Row Level Security | Database-enforced security, cannot be bypassed |
| Free tier | Covers MVP, generous limits |
| Direct client queries | No API layer needed (RLS handles security) |
| Open source option | Can self-host if needed (reduces vendor lock-in) |

**Trade-off:** Vendor lock-in risk. Mitigated by the fact that
Supabase is open source and can be self-hosted.

### 13.3 Why TypeScript?

| Reason | Detail |
|--------|--------|
| Type safety | Catches bugs at compile time |
| Better DX | Autocomplete, inline documentation |
| Team scalability | Easier onboarding for future contributors |
| Database type sync | Types in `src/lib/types.ts` mirror the SQL schema |

### 13.4 Why Tailwind CSS v4?

| Reason | Detail |
|--------|--------|
| Utility-first | Fast UI development, no context switching |
| No CSS naming | Avoids BEM/CSS Modules complexity |
| Small bundle | Only ships used utilities |
| Design system | Brand colors defined in globals.css as CSS variables |

### 13.5 Why "Track, Don't Hold"?

| Reason | Detail |
|--------|--------|
| No regulation | Holding money requires financial licenses (SBP in Pakistan) |
| Solo dev friendly | No compliance overhead, faster launch |
| User trust | Users are cautious about giving money to new apps |
| Faster MVP | No payment gateway integration needed |

**Trade-off:** Cannot earn from transaction fees. Monetization is via
subscriptions (pro/premium plans) instead.

### 13.6 Why Pre-compute Draw Schedules?

| Reason | Detail |
|--------|--------|
| Transparency | Members know their pot month from day one |
| Simplicity | No month-by-month logic at runtime |
| Dispute reduction | Schedule is fixed and visible to everyone |
| Fairness | Each member is guaranteed the pot exactly once |

**Trade-off:** Less flexibility. Rescheduling requires manual override
(planned as a future feature).

### 13.7 Why Members Without Accounts?

| Reason | Detail |
|--------|--------|
| Zero friction | Organizers add people by name + phone instantly |
| Non-tech-savvy users | Older relatives may never sign up |
| Lower barrier | Committee starts immediately, no waiting for signups |

**Trade-off:** Claiming profiles requires extra logic (phone OTP,
planned for Phase 2).

---

## 14. File Structure

```
committeekart/
|
+-- docs/                           # Project documentation
|   +-- ARCHITECTURE.md             # This file
|   +-- TEST_PLAN.md                # Testing strategy and test cases
|   +-- USER_MANUAL.md              # End-user guide
|   +-- DEPLOYMENT_GUIDE.md         # Deployment instructions
|   +-- PROGRESS.md                 # Progress tracker
|   +-- DECISIONS.md                # Technical decision records
|   +-- linkedin-posts/             # LinkedIn post drafts per phase
|
+-- src/
|   +-- app/                        # Next.js App Router pages
|   |   +-- (auth)/                 # Auth route group
|   |   |   +-- login/page.tsx      # Login page (/login)
|   |   |   +-- signup/page.tsx     # Signup page (/signup)
|   |   |   +-- actions.ts          # signup, login, logout actions
|   |   +-- (dashboard)/            # Protected route group
|   |   |   +-- dashboard/page.tsx  # Dashboard (/dashboard)
|   |   |   +-- committees/
|   |   |       +-- new/page.tsx    # Create committee (/committees/new)
|   |   |       +-- [id]/page.tsx   # Committee detail (/committees/[id])
|   |   |       +-- actions.ts      # createCommittee action
|   |   |       +-- [id]/actions.ts # markPaid/markPending actions
|   |   +-- layout.tsx              # Root layout
|   |   +-- page.tsx                # Landing page (/)
|   |   +-- globals.css             # Global styles + Tailwind + brand vars
|   |   +-- favicon.ico
|   |
|   +-- components/                 # Reusable UI components
|   |   +-- committees/
|   |       +-- ContributionRow.tsx # Contribution toggle (Client Component)
|   |
|   +-- lib/                        # Shared utilities and logic
|   |   +-- supabase/
|   |   |   +-- server.ts           # Server-side Supabase client
|   |   |   +-- client.ts           # Browser-side Supabase client
|   |   +-- types.ts                # TypeScript type definitions
|   |   +-- utils.ts                # formatCurrency, formatDate, etc.
|   |   +-- draw-schedule.ts        # Draw schedule generation logic
|   |
|   +-- proxy.ts                    # Auth middleware (Next.js 16)
|
+-- supabase/
|   +-- migrations/
|   |   +-- 0001_initial_schema.sql # Tables, enums, RLS, trigger
|   |   +-- 0002_fix_rls_recursion.sql # RLS recursion fix
|   +-- seed.sql                    # Test data template (dev only)
|
+-- public/                         # Static assets
+-- .env.local.example              # Environment variable template
+-- .env.local                      # Local env vars (not committed)
+-- package.json                    # Dependencies and scripts
+-- next.config.ts                  # Next.js configuration
+-- tsconfig.json                   # TypeScript configuration
+-- eslint.config.mjs               # ESLint configuration
+-- postcss.config.mjs              # PostCSS / Tailwind configuration
+-- README.md                       # Project overview
```

### Key Directories Explained

- **`src/app/`** - All pages using the App Router. Route groups
  `(auth)` and `(dashboard)` organize without affecting URLs.
- **`src/components/`** - Reusable components. Currently has one
  client component (`ContributionRow`).
- **`src/lib/`** - Shared code: Supabase clients, types, utilities,
  and the draw schedule generator.
- **`supabase/migrations/`** - SQL migration files applied to the
  database. Numbered for ordering.
- **`docs/`** - All project documentation.

---

## Appendix: Architecture Principles Summary

1. **Track, Don't Hold** - The app never touches money
2. **Security by default** - RLS on every table, defense in depth
3. **Server-first** - Server Components and Server Actions minimize
   client-side JavaScript
4. **Type safety** - TypeScript types mirror the database schema
5. **Pre-compute for transparency** - Draw schedules are generated at
   creation, not runtime
6. **Zero friction onboarding** - Members do not need accounts
7. **No em dashes** - Consistent style rule across the project
   (use hyphens, colons, or commas instead)
