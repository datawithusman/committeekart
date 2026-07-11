# CommitteeKart - Architecture

## Overview

CommitteeKart is a digital committee (ROSCA) tracker built on the
"Track, Don't Hold" principle. The app never touches money. It only
records contributions, calculates draw schedules, and provides
transparency to organizers and members.

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 16 (App Router) | Server Components, file based routing, PWA ready |
| Language | TypeScript | Type safety, better DX for team |
| Database | Supabase (PostgreSQL) | Free tier, Auth + DB + RLS built in |
| Styling | Tailwind CSS v4 | Utility first, fast UI development |
| Hosting | Vercel | One click Next.js deploy, free tier |
| Version Control | Git + GitHub | Industry standard |

---

## Core Principle: Track, Don't Hold

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

---

## Data Model

```
profiles (1) ---- creates ----> committees (N)
                                   |
                                   | has
                                   v
                              members (N)
                                   |
                                   | has
                                   v
                           contributions (N)
                                   |
                              draws (N) <--- committees (1)
```

### Tables

| Table | Purpose |
|-------|---------|
| profiles | Extends auth.users with app data (name, phone, plan) |
| committees | A savings circle (amount, members, duration, draw type) |
| members | Participants in a committee (can exist without user account) |
| contributions | Monthly payments (one per member per month) |
| draws | Scheduled pot payouts (one per month per committee) |

### Key Design Decisions

1. **Members without accounts**: Organizers add people by name + phone.
   The `user_id` field is nullable so members can claim their profile later.

2. **Pre computed draw schedule**: When a committee is created, the entire
   draw schedule is generated immediately (lottery shuffle, fixed order, or
   auction placeholder). Each member gets the pot exactly once.

3. **Row Level Security (RLS)**: Every table has RLS enabled.
   Organizers can only access their own committees. Members can view
   committees they belong to.

4. **Auto profile creation**: A database trigger creates a `profiles` row
   automatically when a user signs up via Supabase Auth.

---

## Authentication Flow

```
User visits app
      |
      v
  middleware.ts checks auth session
      |
      +---> Logged in + on /login or /signup --> redirect to /dashboard
      |
      +---> Logged out + on protected route --> redirect to /login
      |
      +---> Otherwise --> continue to page
```

- Sessions are cookie based (Supabase SSR)
- Middleware refreshes the session on every request
- Protected routes: /dashboard, /committees, /settings

---

## Draw Types

| Type | How it works |
|------|-------------|
| lottery | Random shuffle of members. Each gets pot once, randomly. |
| fixed | Organizer sets the order manually beforehand. |
| auction | Members bid a discount. Highest bid wins the pot. |

All three pre compute the schedule at committee creation time.
The auction type stores a placeholder that can be updated monthly.

---

## File Structure

See README.md "Project Structure" section for the full tree.

Key directories:
- `src/app/` - Next.js pages (App Router)
- `src/components/` - Reusable UI components
- `src/lib/` - Utilities, Supabase clients, types
- `supabase/migrations/` - SQL schema migrations
- `docs/` - All project documentation
