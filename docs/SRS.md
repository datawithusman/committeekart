# CommitteeKart - Software Requirements Specification (SRS)

> Software Requirements Specification for the CommitteeKart digital
> committee (ROSCA) tracker. Built on the "Track, Don't Hold" principle.

**Document Version:** 1.0
**Date:** 2026-07-11
**Status:** Active

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [Functional Requirements](#3-functional-requirements)
4. [Non-Functional Requirements](#4-non-functional-requirements)
5. [Constraints](#5-constraints)
6. [Assumptions and Dependencies](#6-assumptions-and-dependencies)
7. [Requirements Traceability Summary](#7-requirements-traceability-summary)

---

## 1. Introduction

### 1.1 Purpose

This document specifies the software requirements for CommitteeKart, a
web application that digitizes the management of committees (rotating
savings and credit associations, or ROSCAs). It defines the functional
and non-functional requirements that the system must satisfy, the
constraints under which it is built, and the assumptions that shape the
design.

The intended audience is the development team (currently a solo
developer), future contributors, and any reviewer evaluating the
product against its goals.

### 1.2 Scope

CommitteeKart allows an organizer to create committees, add members by
name and phone, track monthly contributions, auto-generate draw
schedules (lottery, fixed, or auction), and provide a transparency view
to members. The software deliberately does not process, hold, or move
money. It is a tracking and transparency tool only.

The scope of this document covers Phase 1 (Foundation, complete) and
Phase 2 (Core Features), with forward-looking notes for Phase 3
(Polish and Deploy) and Phase 4 (Growth).

### 1.3 Definitions and Acronyms

- **Committee:** A rotating savings and credit association (ROSCA). A
  group of members each contribute a fixed monthly amount, and one
  member receives the total pot each month.
- **ROSCA:** Rotating Savings and Credit Association.
- **Pot:** The total monthly collection (monthly amount multiplied by
  member count), paid to that month's draw winner.
- **Draw:** The scheduled payout of the pot to a specific member in a
  specific month.
- **Draw type:** How the draw winner is decided. Supported types:
  lottery, fixed, auction.
- **Organizer:** The user who creates and manages a committee.
- **Member:** A participant in a committee. May exist without a user
  account until they claim their profile.
- **RLS:** Row Level Security (Supabase/PostgreSQL feature) that
  restricts which rows a user can read or write.
- **MVP:** Minimum Viable Product (Phase 1 and Phase 2).
- **PWA:** Progressive Web Application.
- **FR:** Functional Requirement.
- **NFR:** Non-Functional Requirement.

### 1.4 References

- `README.md` - Project overview and quick start.
- `docs/ARCHITECTURE.md` - System design and data model.
- `docs/DECISIONS.md` - Technical decision records.
- `docs/PROJECT_PROPOSAL.md` - Product proposal and market context.
- `docs/USER_STORIES.md` - User stories by role and phase.
- `docs/USE_CASE_DIAGRAM.md` - Use case diagrams and descriptions.
- `supabase/migrations/0001_initial_schema.sql` - Database schema.
- `src/lib/types.ts` - TypeScript type definitions mirroring the schema.

### 1.5 Overview

Section 2 gives an overall description of the product, its users, and
its operating environment. Section 3 lists the functional requirements.
Section 4 lists the non-functional requirements. Sections 5 and 6 cover
constraints, assumptions, and dependencies.

---

## 2. Overall Description

### 2.1 Product Perspective

CommitteeKart is a self-contained web application. It is not a module
of a larger system. It relies on Supabase for database, authentication,
and Row Level Security, and on Vercel for hosting. There are no
external financial integrations because the app does not handle money.

### 2.2 Product Functions

At a high level, CommitteeKart must:

1. Authenticate organizers and members (email and password, with phone
   based profile claiming for members).
2. Let organizers create, view, update, and cancel committees.
3. Let organizers add, edit, and remove members by name and phone.
4. Auto-generate a complete draw schedule at committee creation time.
5. Let organizers record and update monthly contributions per member.
6. Show organizers a dashboard with live statistics across committees.
7. Let members view their own contributions, the draw schedule, and the
   overall committee progress.
8. Export reports (CSV) and, in later phases, send reminders.

### 2.3 User Characteristics

- **Organizer:** Typically aged 30 to 55, moderate technical comfort.
   Uses the app on a phone primarily. May be a homemaker, office
   worker, or family treasurer. Needs a simple, low-friction interface.
- **Member:** Any participant. May have low technical comfort. Needs to
   see their own status and the schedule without confusion.
- **Admin (system):** A platform operator role for support and abuse
   handling. Minimal UI in MVP, defined for future expansion.

### 2.4 Operating Environment

- **Client:** Modern web browsers (Chrome, Safari, Edge, Firefox) on
  mobile and desktop. Phone-first responsive design.
- **Server:** Next.js 16 running on Vercel (Node.js runtime).
- **Database:** Supabase (PostgreSQL) hosted in the cloud.
- **Connectivity:** Requires internet access. Offline support is a
  Phase 3+ consideration via PWA caching.

### 2.5 Design and Implementation Constraints

See Section 5 for the full list. Key constraints: Supabase free tier
limits, solo developer capacity, no money handling, and the project
style rule of no em dash characters anywhere.

### 2.6 Assumptions and Dependencies

See Section 6 for the full list.

---

## 3. Functional Requirements

Functional requirements are numbered (FR-001 through FR-nnn) and grouped
by capability area. Each requirement states what the system must do.
Priority codes: P0 (must have for MVP), P1 (should have), P2 (nice to
have / future).

### 3.1 Authentication and Account Management

**FR-001** (P0): The system SHALL allow a new user to register using an
email address and password, and SHALL capture the user's full name at
signup.

**FR-002** (P0): The system SHALL create a `profiles` row automatically
when a new auth user is created, copying the email and full name from
signup metadata.

**FR-003** (P0): The system SHALL allow a registered user to log in
with their email and password.

**FR-004** (P0): The system SHALL allow a logged-in user to log out.

**FR-005** (P0): The system SHALL protect routes under `/dashboard`,
`/committees`, and `/settings` so that unauthenticated users are
redirected to `/login`.

**FR-006** (P0): The system SHALL redirect already-authenticated users
away from `/login` and `/signup` to `/dashboard`.

**FR-007** (P0): The system SHALL refresh the user's session on every
request via middleware (proxy) so sessions remain valid across reloads.

**FR-008** (P1): The system SHALL allow a user to view and edit their
profile (full name, phone number).

**FR-009** (P1): The system SHALL validate that the email format is
well formed and that the password meets a minimum length of 8
characters at signup.

**FR-010** (P1): The system SHALL display clear error messages for
duplicate email registration, wrong password, and invalid email
format.

**FR-011** (P2, Phase 3): The system SHALL allow a member to claim a
profile that an organizer created for them, using phone OTP
verification.

**FR-012** (P2, Phase 3): The system SHALL support password reset via
email link.

### 3.2 Committee Management (Create, Read, Update, Delete)

**FR-101** (P0): The system SHALL allow an organizer to create a
committee by providing: name, monthly amount, member count, duration in
months, draw type, start date, and an optional description.

**FR-102** (P0): The system SHALL validate committee creation inputs as
follows:
- Name: 1 to 100 characters.
- Monthly amount: greater than 0.
- Member count: between 2 and 50.
- Duration in months: between 1 and 60.
- Draw type: one of lottery, fixed, auction.
- Start date: a valid date not in the past.

**FR-103** (P0): The system SHALL set the initial status of a new
committee to `draft`, and SHALL allow the organizer to change the
status to `active` once the committee is ready to run.

**FR-104** (P0): The system SHALL allow an organizer to view a list of
all committees they own, sorted by most recently created.

**FR-105** (P0): The system SHALL allow an organizer to open a
committee detail page showing configuration, members, contributions,
and draws.

**FR-106** (P0): The system SHALL allow an organizer to update a
committee's name, description, and start date while the status is
`draft`.

**FR-107** (P1): The system SHALL allow an organizer to cancel a
committee, setting its status to `cancelled`. Cancelled committees
remain visible in read-only form.

**FR-108** (P1): The system SHALL allow an organizer to mark a
committee as `completed` when all months and draws are finished.

**FR-109** (P0): The system SHALL restrict all committee write
operations to the organizer who owns the committee, enforced via Row
Level Security.

**FR-110** (P0): The system SHALL restrict committee reads so that
only the owning organizer and members of that committee can view it,
enforced via Row Level Security.

### 3.3 Member Management

**FR-201** (P0): The system SHALL allow an organizer to add a member to
a committee by providing a name and an optional phone number.

**FR-202** (P0): The system SHALL allow members to exist without a user
account. The member `user_id` field SHALL be nullable until the member
claims their profile.

**FR-203** (P0): The system SHALL validate member name length as 1 to
100 characters.

**FR-204** (P0): The system SHALL enforce that a given user account can
be linked to at most one member row per committee (unique constraint on
committee_id plus user_id).

**FR-205** (P0): The system SHALL allow an organizer to edit a member's
name and phone number.

**FR-206** (P0): The system SHALL allow an organizer to remove a member
from a committee, provided the member has not yet received the pot and
the committee status is `draft` or `active` with admin override.

**FR-207** (P1): The system SHALL display each member's draw month
(where assigned) and contribution status summary on the committee
detail page.

**FR-208** (P2, Phase 3): The system SHALL allow an organizer to invite
a member via a shareable link, so the member can claim their profile.

### 3.4 Contribution Tracking

**FR-301** (P0): The system SHALL generate, for each member, one
contribution row per month of the committee duration at activation
time. Each contribution has a month index, due date, and amount equal
to the committee monthly amount.

**FR-302** (P0): The system SHALL allow an organizer to set a
contribution's status to one of: `pending`, `paid`, `late`, `skipped`.

**FR-303** (P0): When a contribution is marked `paid`, the system SHALL
record the timestamp (`paid_at`) and SHALL allow the organizer to record
the payment method: one of cash, bank_transfer, jazzcash, easypaisa,
other.

**FR-304** (P0): The system SHALL allow an organizer to add an optional
note to a contribution (for example, a transaction reference).

**FR-305** (P0): The system SHALL enforce that a member can have at
most one contribution row per month per committee (unique constraint on
committee_id, member_id, month_index).

**FR-306** (P0): The system SHALL restrict contribution writes to the
organizer of the committee, enforced via Row Level Security.

**FR-307** (P0): The system SHALL restrict contribution reads so that
the organizer can see all contributions for their committees, and a
member can see only their own contributions, enforced via Row Level
Security.

**FR-308** (P1): The system SHALL allow an organizer to edit a
contribution's status and method after it was first set (to correct
mistakes), preserving the latest state.

**FR-309** (P1): The system SHALL validate that the contribution amount
is greater than or equal to 0.

### 3.5 Draw Schedule Generation

**FR-401** (P0): When a committee is activated (status changes to
`active`), the system SHALL generate a complete draw schedule: exactly
one draw per month, for each month of the duration, assigning the pot
to a single member per month.

**FR-402** (P0): The system SHALL guarantee fairness: across the full
schedule, every member receives the pot exactly once.

**FR-403** (P0): For a `lottery` draw type, the system SHALL assign
months by a random shuffle of all members.

**FR-404** (P0): For a `fixed` draw type, the system SHALL assign months
in the order provided by the organizer at creation time.

**FR-405** (P0): For an `auction` draw type, the system SHALL assign
months using the member order at creation as placeholders, to be
updated monthly once the auction for each month is resolved.

**FR-406** (P0): The system SHALL compute each draw's amount as the
monthly amount multiplied by the member count.

**FR-407** (P0): The system SHALL set each draw's status to `scheduled`
at creation, and SHALL allow the organizer to mark a draw as `completed`
once the pot has been paid out.

**FR-408** (P0): The system SHALL enforce that there is at most one draw
winner per month per committee (unique constraint on committee_id and
month_index).

**FR-409** (P0): The system SHALL restrict draw writes to the organizer
of the committee, enforced via Row Level Security.

**FR-410** (P0): The system SHALL allow members to view the full draw
schedule of committees they belong to, enforced via Row Level Security.

**FR-411** (P1): For auction committees, the system SHALL allow the
organizer to update the winner for a specific upcoming month.

### 3.6 Organizer Dashboard

**FR-501** (P0): The system SHALL display a dashboard for the organizer
listing all committees they own with a summary: name, status, member
count, and current month progress.

**FR-502** (P0): For each committee, the dashboard SHALL show how many
members have paid for the current month and how many are pending.

**FR-503** (P0): For each committee, the dashboard SHALL show the total
amount collected across all months to date.

**FR-504** (P0): The dashboard SHALL surface the next upcoming draw
(whose turn it is to receive the pot next).

**FR-505** (P1): The dashboard SHALL show a count of contributions that
are `late` across all committees.

**FR-506** (P1): The dashboard SHALL be usable on a phone screen with no
horizontal scrolling.

### 3.7 Member Transparency View

**FR-601** (P0): The system SHALL allow a member who has claimed their
profile to view a read-only summary of each committee they belong to:
name, monthly amount, duration, draw type, and status.

**FR-602** (P0): The member view SHALL show the member's own
contribution history: month, due date, amount, status, and paid date.

**FR-603** (P0): The member view SHALL show the full draw schedule,
highlighting the month in which this member receives the pot.

**FR-604** (P0): The member view SHALL show overall committee progress:
how many months are complete and how much has been collected.

**FR-605** (P1): The member view SHALL NOT show other members' payment
methods or notes, to preserve privacy. Only names and draw order are
visible.

### 3.8 Reporting and Reminders

**FR-701** (P1, Phase 3): The system SHALL allow an organizer to export
a committee's contribution history as a CSV file.

**FR-702** (P1, Phase 3): The system SHALL allow an organizer to export
the draw schedule as a CSV file.

**FR-703** (P2, Phase 3): The system SHALL generate WhatsApp-friendly
reminder text for members whose contributions are pending or late,
which the organizer can copy and share.

**FR-704** (P2, Phase 3): The system SHALL support automatic reminders
via the WhatsApp Business API, if configured.

### 3.9 Administration (Future)

**FR-801** (P2, Phase 4): The system SHALL provide an admin role that
can view aggregate platform statistics (number of organizers,
committees, members) without accessing individual committees' financial
details.

**FR-802** (P2, Phase 4): The system SHALL allow an admin to disable or
delete accounts that violate terms of use.

---

## 4. Non-Functional Requirements

Non-functional requirements are numbered (NFR-001 onward) and grouped
by category.

### 4.1 Performance

**NFR-001**: The landing page SHALL achieve a Largest Contentful Paint
of under 2.5 seconds on a 4G mobile connection.

**NFR-002**: The dashboard SHALL load with visible content (first
meaningful paint) in under 2 seconds on a 4G mobile connection for a
typical organizer (up to 5 committees).

**NFR-003**: Committee detail pages SHALL load in under 2 seconds for a
committee of up to 50 members.

**NFR-004**: Marking a contribution as paid SHALL return confirmation
to the user in under 1 second under normal conditions.

**NFR-005**: Draw schedule generation for a committee of up to 50
members SHALL complete in under 1 second.

**NFR-006**: Database queries SHALL use indexes on the foreign key
columns (organizer_id, committee_id, member_id, status) to keep query
times under 200 milliseconds for typical reads.

### 4.2 Security

**NFR-101**: The system SHALL enforce Row Level Security on every table
that stores user data, so that no user can read or write another user's
data through the database client.

**NFR-102**: The system SHALL NOT trust client-side validation alone.
All mutating operations SHALL be validated server side (database CHECK
constraints and server action validation).

**NFR-103**: Passwords SHALL be handled entirely by Supabase Auth. The
application SHALL NOT store, log, or transmit plaintext passwords.

**NFR-104**: The system SHALL use HTTP-only cookies for session
management, refreshed via middleware on every request.

**NFR-105**: The system SHALL NOT store payment credentials, because it
does not process payments. Only a payment method label is recorded.

**NFR-106**: Environment secrets (Supabase URL, keys) SHALL NOT be
committed to version control and SHALL NOT be exposed to the client
except for the publishable (anon) key.

**NFR-107**: The system SHALL protect against common web vulnerabilities
(CSRF, XSS, SQL injection) by using Supabase parameterized queries,
React's default output encoding, and server-side session cookies.

### 4.3 Usability

**NFR-201**: The interface SHALL be mobile-first and responsive,
working on screens from 320 pixels wide up to desktop widths.

**NFR-202**: The interface SHALL use clear, simple language. Help text
MAY use Roman Urdu terms naturally (for example, "committee", "pot",
"JazzCash", "EasyPaisa").

**NFR-203**: The most common action (marking a contribution as paid)
SHALL be achievable in 2 taps from the dashboard.

**NFR-204**: Forms SHALL validate inline and provide actionable error
messages that explain how to fix the problem.

**NFR-205**: The interface SHALL meet WCAG 2.1 AA color contrast
standards for text.

**NFR-206**: The interface SHALL be usable without a mouse (keyboard
navigation) for all core flows.

### 4.4 Reliability and Availability

**NFR-301**: The application SHALL target 99.5 percent uptime during
Phase 2, relying on Vercel and Supabase platform SLAs.

**NFR-302**: The system SHALL gracefully handle Supabase outages by
showing a clear message rather than a blank page or silent failure.

**NFR-303**: The system SHALL NOT lose contribution data due to client
errors. All mutations are server side and persisted in PostgreSQL.

**NFR-304**: The database SHALL be backed up via Supabase's scheduled
backups. Manual exports SHALL be possible via CSV.

**NFR-305**: The system SHALL be designed so that a failed write
returns a clear error to the user and does not leave the data in an
inconsistent state.

### 4.5 Scalability

**NFR-401**: The system SHALL support at least 1,000 organizers and
10,000 committees on the Supabase free or first paid tier without code
changes.

**NFR-402**: The system SHALL keep per-committee data volume bounded:
at most 50 members, at most 60 months, at most 3,000 contribution rows
per committee.

**NFR-403**: The architecture SHALL be stateless at the web tier so
that Vercel can scale horizontally without session affinity.

**NFR-404**: The database schema SHALL use indexes on all columns used
in WHERE and JOIN clauses for typical queries.

### 4.6 Maintainability

**NFR-501**: The codebase SHALL be written in TypeScript with strict
type checking enabled.

**NFR-502**: TypeScript type definitions SHALL mirror the database
schema, and SHALL be kept in sync with SQL migrations.

**NFR-503**: The codebase SHALL follow the project style rule: no em
dash characters anywhere. Hyphens, colons, commas, or parentheses SHALL
be used instead.

**NFR-504**: The project SHALL use Conventional Commits (feat:, fix:,
docs:, chore:, refactor:).

**NFR-505**: All documentation SHALL live in the `docs/` directory and
SHALL be kept in Markdown.

### 4.7 Compatibility and Localization

**NFR-601**: The application SHALL work on the latest two major
versions of Chrome, Safari, Firefox, and Edge.

**NFR-602**: The application SHALL default to English with Roman Urdu
terms. Full Urdu (RTL) localization is a Phase 4 goal.

**NFR-603**: Currency SHALL be displayed in Pakistani Rupees (PKR) by
default, with formatting that uses thousands separators.

### 4.8 Legal and Compliance

**NFR-701**: Because the system does not hold or move money, it SHALL
NOT require a financial services license to operate.

**NFR-702**: The system SHALL include a privacy policy and terms of
service before public launch (Phase 3).

**NFR-703**: The system SHALL allow a user to request export and
deletion of their personal data.

---

## 5. Constraints

### 5.1 Platform and Tier Constraints

- **C-001:** The project uses the Supabase free tier during Phase 1 and
  Phase 2. The free tier imposes limits on database size (500 MB),
  storage, and concurrent connections. If usage exceeds these limits,
  the project must upgrade to a paid tier.
- **C-002:** Hosting is on Vercel. The Hobby (free) tier has limits on
  bandwidth and serverless function executions per month. Paid tiers
  are required for commercial scale.
- **C-003:** There is no payment gateway integration in the MVP.
  Subscription billing is deferred to Phase 3 or later.

### 5.2 Team Constraints

- **C-004:** The project is built and maintained by a single developer.
  Scope must be bounded per phase. Gold plating and premature
  optimization are explicitly avoided.
- **C-005:** All features must be implementable and supportable by one
  person. Complex infrastructure (Kubernetes, message queues,
  microservices) is out of scope for the MVP.

### 5.3 Domain Constraints

- **C-006:** The application must NOT handle money. This is the core
  "Track, Don't Hold" constraint. It shapes the data model (no payment
  processing tables), the security model (no funds to protect), and the
  regulatory posture (no financial license required).

### 5.4 Style Constraints

- **C-007:** No em dash characters are allowed anywhere in the project:
  code, comments, documentation, README, and posts. Hyphens, colons,
  commas, or parentheses must be used instead. (See `docs/DECISIONS.md`
  Decision 6.)
- **C-008:** The product name and branding (CommitteeKart, trust green
  and amber colors) are fixed for the MVP.

### 5.5 Data Constraints

- **C-009:** Committee member count is constrained to between 2 and 50.
- **C-010:** Committee duration is constrained to between 1 and 60
  months.
- **C-011:** Monetary amounts are stored as numeric(12,2), supporting
  values up to 999,999,999.99, which is well above any realistic
  committee amount.

---

## 6. Assumptions and Dependencies

### 6.1 Assumptions

- **A-001:** Users have access to a smartphone or computer with a
  modern browser and an internet connection.
- **A-002:** Organizers are willing to adopt a digital tool for
  committees they currently manage manually.
- **A-003:** Members do not all need accounts. Most members will be
  tracked by name and phone only; profile claiming is optional.
- **A-004:** The "Track, Don't Hold" model is acceptable to users, who
  understand that the app records but does not move their money.
- **A-005:** Supabase and Vercel remain available and maintain their
  current free tier offerings (or affordable paid tiers) for the
  foreseeable future.
- **A-006:** The SECP and SBP regulatory environment in Pakistan does
  not classify a tracking-only app as a regulated financial service.
  This assumption should be confirmed with a legal advisor before
  paid plans launch.

### 6.2 Dependencies

- **D-001:** Supabase (PostgreSQL, Auth, Row Level Security). All data
  storage, authentication, and access control depend on Supabase.
- **D-002:** Vercel. Application hosting and serverless functions
  depend on Vercel.
- **D-003:** Next.js 16 and React. The entire front end and server
  action layer depend on the Next.js App Router.
- **D-004:** TypeScript and the broader npm ecosystem. Build, lint, and
  type checking depend on the Node.js toolchain.
- **D-005:** Tailwind CSS v4. Styling depends on the Tailwind utility
  framework and its configuration.
- **D-006, Phase 3:** A subscription billing provider (for example, a
  local Pakistani aggregator or Stripe) will be required before paid
  plans can be charged.
- **D-007, Phase 3:** The WhatsApp Business API (or equivalent) will be
  required for automatic reminders.

---

## 7. Requirements Traceability Summary

This matrix maps capability areas to their primary requirement numbers
and the user stories and use cases that realize them.

| Capability | Requirements | User Stories | Use Cases |
|-----------|--------------|--------------|-----------|
| Authentication | FR-001 to FR-012 | US-AUTH-01 to US-AUTH-05 | UC-01, UC-02 |
| Committee management | FR-101 to FR-110 | US-ORG-01 to US-ORG-04 | UC-03, UC-04, UC-05 |
| Member management | FR-201 to FR-208 | US-ORG-05 to US-ORG-07, US-MEM-01 | UC-06, UC-07 |
| Contribution tracking | FR-301 to FR-309 | US-ORG-08 to US-ORG-10, US-MEM-02 | UC-08, UC-09 |
| Draw schedule | FR-401 to FR-411 | US-ORG-11, US-MEM-03 | UC-10, UC-11 |
| Organizer dashboard | FR-501 to FR-506 | US-ORG-12, US-ORG-13 | UC-12 |
| Member transparency | FR-601 to FR-605 | US-MEM-04 to US-MEM-06 | UC-13 |
| Reporting and reminders | FR-701 to FR-704 | US-ORG-14, US-ORG-15, US-MEM-07 | UC-14, UC-15 |
| Administration | FR-801 to FR-802 | US-ADM-01 | UC-16 |

---

## Appendix A: Data Model Summary

The functional requirements above are realized by the following
database tables, defined in `supabase/migrations/0001_initial_schema.sql`
and mirrored in `src/lib/types.ts`.

| Table | Purpose | Key Constraints |
|-------|---------|-----------------|
| profiles | Extends auth.users with app data (name, phone, plan) | Primary key references auth.users(id) |
| committees | A savings circle | member_count 2 to 50, duration 1 to 60, monthly_amount > 0 |
| members | A participant in a committee | user_id nullable; unique (committee_id, user_id) |
| contributions | A monthly payment from a member | unique (committee_id, member_id, month_index) |
| draws | A scheduled pot payout | unique (committee_id, month_index) |

All tables have Row Level Security enabled. Organizers can fully manage
their own committees, members, contributions, and draws. Members can
view the committees they belong to and their own contributions.

## Appendix B: Priority Codes

- **P0:** Must have for the MVP (Phase 1 and Phase 2). The product is
  not usable without these.
- **P1:** Should have. Important for a complete product, can follow
  shortly after MVP.
- **P2:** Nice to have or explicitly future (Phase 3 and beyond).
