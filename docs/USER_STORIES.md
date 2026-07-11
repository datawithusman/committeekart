# CommitteeKart - User Stories

> User stories organized by role and phase. Each story follows the
> format "As a [role], I want to [action] so that [benefit]" and
> includes acceptance criteria.

**Document Version:** 1.0
**Date:** 2026-07-11
**Status:** Active

---

## Table of Contents

1. [How to Read This Document](#1-how-to-read-this-document)
2. [Roles](#2-roles)
3. [Phase Mapping](#3-phase-mapping)
4. [Organizer Stories - MVP (Phase 1 and Phase 2)](#4-organizer-stories---mvp-phase-1-and-phase-2)
5. [Member Stories - MVP (Phase 1 and Phase 2)](#5-member-stories---mvp-phase-1-and-phase-2)
6. [Organizer Stories - Future (Phase 3 and Beyond)](#6-organizer-stories---future-phase-3-and-beyond)
7. [Member Stories - Future (Phase 3 and Beyond)](#7-member-stories---future-phase-3-and-beyond)
8. [Admin Stories - Future (Phase 4)](#8-admin-stories---future-phase-4)
9. [Story to Requirement Mapping](#9-story-to-requirement-mapping)

---

## 1. How to Read This Document

Each user story has:

- **ID:** a stable identifier (for example, US-ORG-01).
- **Story:** written in the standard "As a ... I want to ... so that ..."
  format.
- **Priority:** P0 (must have for MVP), P1 (should have), P2 (future).
- **Phase:** when the story is planned.
- **Acceptance criteria:** a list of testable conditions that must be
  true for the story to be considered done.
- **Requirement reference:** the functional requirement(s) this story
  realizes, from `docs/SRS.md`.

A story is "done" only when all acceptance criteria are met.

---

## 2. Roles

- **Organizer:** The user who creates and manages committees. Owns the
  data, records contributions, and shares transparency with members.
- **Member:** A participant in a committee. May or may not have a user
  account. Views their own status and the draw schedule.
- **Admin:** A platform operator (future) who manages the service and
  handles abuse, without seeing individual committees' financial
  details.
- **System (Supabase):** The automated backend that performs
  authentication, data storage, access control, and scheduled jobs.

---

## 3. Phase Mapping

- **Phase 1 (Foundation, complete):** authentication, schema, landing
  page, dashboard placeholder.
- **Phase 2 (Core Features):** committee CRUD, member management,
  contribution tracking, draw schedule, dashboard, member view.
- **Phase 3 (Polish and Deploy):** invites, reminders, CSV export, PWA,
  Vercel deploy.
- **Phase 4 (Growth):** billing, advanced reports, localization, admin
  tooling.

Stories marked MVP (Phase 1 and Phase 2) define the minimum viable
product. Stories marked Future belong to Phase 3 or later.

---

## 4. Organizer Stories - MVP (Phase 1 and Phase 2)

### US-AUTH-01: Sign up as an organizer

- **Story:** As a prospective organizer, I want to create an account
  with my email and password so that I can start running committees on
  CommitteeKart.
- **Priority:** P0
- **Phase:** 1
- **Requirement reference:** FR-001, FR-002, FR-009, FR-010
- **Acceptance criteria:**
  1. I can reach a signup page at `/signup`.
  2. I can enter my full name, email, and password.
  3. The email must be well formed; otherwise an inline error is shown.
  4. The password must be at least 8 characters; otherwise an inline
     error is shown.
  5. If the email is already registered, I see a clear error message.
  6. On successful signup, a `profiles` row is created automatically
     with my email and full name.
  7. After signup, I am logged in and redirected to `/dashboard`.

### US-AUTH-02: Log in to my account

- **Story:** As a returning organizer, I want to log in with my email
  and password so that I can access my committees.
- **Priority:** P0
- **Phase:** 1
- **Requirement reference:** FR-003, FR-005, FR-006, FR-007, FR-010
- **Acceptance criteria:**
  1. I can reach a login page at `/login`.
  2. I can enter my email and password.
  3. If the credentials are wrong, I see a clear error without
     revealing which of email or password was incorrect.
  4. On success, I am redirected to `/dashboard`.
  5. My session persists across page reloads.
  6. If I am already logged in and visit `/login` or `/signup`, I am
     redirected to `/dashboard`.

### US-AUTH-03: Log out

- **Story:** As a logged-in organizer, I want to log out so that no one
  else using my device can access my committees.
- **Priority:** P0
- **Phase:** 1
- **Requirement reference:** FR-004
- **Acceptance criteria:**
  1. There is a visible logout control on the dashboard.
  2. Clicking logout ends my session immediately.
  3. After logout, any attempt to reach a protected route redirects me
     to `/login`.

### US-AUTH-04: Stay logged in across reloads

- **Story:** As an organizer, I want my login to persist when I reload
  the page or return the next day, so that I do not have to log in
  repeatedly.
- **Priority:** P0
- **Phase:** 1
- **Requirement reference:** FR-007
- **Acceptance criteria:**
  1. Reloading the dashboard keeps me logged in.
  2. The session is refreshed automatically by middleware on each
     request.
  3. When the session expires, I am redirected to `/login` with a
     message.

### US-ORG-01: Create a new committee

- **Story:** As an organizer, I want to create a committee by entering
  its details so that I can start tracking it digitally.
- **Priority:** P0
- **Phase:** 2
- **Requirement reference:** FR-101, FR-102, FR-103, FR-109
- **Acceptance criteria:**
  1. From the dashboard I can open a "Create committee" form.
  2. I can enter: name, monthly amount, member count, duration in
     months, draw type (lottery, fixed, auction), start date, and an
     optional description.
  3. The form validates: name 1 to 100 chars, monthly amount > 0,
     member count 2 to 50, duration 1 to 60, start date not in the past.
  4. On submit, the committee is created with status `draft` and I am
     its organizer.
  5. I am redirected to the new committee's detail page.
  6. Only I can see or edit this committee (Row Level Security).

### US-ORG-02: View my list of committees

- **Story:** As an organizer, I want to see all the committees I run in
  one place so that I can quickly pick up where I left off.
- **Priority:** P0
- **Phase:** 2
- **Requirement reference:** FR-104, FR-110
- **Acceptance criteria:**
  1. The dashboard lists every committee I own.
  2. Committees are sorted by most recently created.
  3. Each list item shows name, status, and member count.
  4. Clicking a committee opens its detail page.
  5. Committees owned by other organizers are never visible to me.

### US-ORG-03: Open a committee detail page

- **Story:** As an organizer, I want to open a committee and see its
  configuration, members, contributions, and draws so that I have the
  full picture in one screen.
- **Priority:** P0
- **Phase:** 2
- **Requirement reference:** FR-105, FR-110
- **Acceptance criteria:**
  1. The committee detail page shows the configuration (amount,
     member count, duration, draw type, start date, status).
  2. It shows the members list.
  3. It shows the contribution tracker for the current month.
  4. It shows the draw schedule.
  5. Only the owning organizer can open the edit controls.

### US-ORG-04: Edit a committee before it starts

- **Story:** As an organizer, I want to edit a committee's name,
  description, and start date while it is still in draft, so that I can
  correct mistakes before activating it.
- **Priority:** P0
- **Phase:** 2
- **Requirement reference:** FR-106
- **Acceptance criteria:**
  1. While status is `draft`, I can edit name, description, and start
     date.
  2. After the committee is `active`, these fields become read-only
     (or require cancellation first).
  3. Changes are saved and reflected immediately.

### US-ORG-05: Add a member to a committee

- **Story:** As an organizer, I want to add a member by entering their
  name and phone number so that they are part of the committee without
  needing to sign up first.
- **Priority:** P0
- **Phase:** 2
- **Requirement reference:** FR-201, FR-202, FR-203, FR-204
- **Acceptance criteria:**
  1. On the committee detail page I can add a member with a name and an
     optional phone.
  2. The name must be 1 to 100 characters.
  3. The member is created without a user account (user_id null).
  4. The same user account cannot be added twice to the same committee.
  5. The member appears in the members list immediately.

### US-ORG-06: Edit a member's details

- **Story:** As an organizer, I want to correct a member's name or
  phone number so that my records stay accurate.
- **Priority:** P0
- **Phase:** 2
- **Requirement reference:** FR-205
- **Acceptance criteria:**
  1. I can open a member's record and edit name and phone.
  2. Validation matches the add-member rules.
  3. Changes are saved and visible immediately.

### US-ORG-07: Remove a member

- **Story:** As an organizer, I want to remove a member who has left the
  committee so that the member list and schedule stay correct.
- **Priority:** P0
- **Phase:** 2
- **Requirement reference:** FR-206
- **Acceptance criteria:**
  1. I can remove a member who has not yet received the pot.
  2. The system warns me before deletion.
  3. After removal, the draw schedule is recomputed to keep fairness
     (every remaining member gets the pot exactly once).
  4. Removal is blocked if the member already received the pot, with a
     clear message.

### US-ORG-08: Activate a committee and generate the draw schedule

- **Story:** As an organizer, I want to activate a committee so that
  the draw schedule is generated automatically and contributions are
  created for each member each month.
- **Priority:** P0
- **Phase:** 2
- **Requirement reference:** FR-103, FR-301, FR-401 to FR-406
- **Acceptance criteria:**
  1. When I change status from `draft` to `active`, the draw schedule is
     generated for the full duration.
  2. Every member is assigned the pot in exactly one month.
  3. For lottery, the order is random.
  4. For fixed, the order matches what I provided.
  5. For auction, placeholders are assigned in member order.
  6. One contribution row per member per month is created with the
     correct due date and amount.
  7. Each draw's amount equals monthly amount times member count.

### US-ORG-09: Mark a contribution as paid

- **Story:** As an organizer, I want to mark a member's monthly
  contribution as paid and record how they paid, so that the record
  reflects what actually happened.
- **Priority:** P0
- **Phase:** 2
- **Requirement reference:** FR-302, FR-303, FR-304, FR-306
- **Acceptance criteria:**
  1. For each member each month I can set the contribution status to
     paid, pending, late, or skipped.
  2. When I mark it paid, the timestamp is recorded automatically.
  3. I can select a payment method: cash, bank_transfer, jazzcash,
     easypaisa, or other.
  4. I can add an optional note (for example, a transaction reference).
  5. Only I can change contribution data for my committees.

### US-ORG-10: Correct a contribution mistake

- **Story:** As an organizer, I want to change a contribution's status
  or method after the fact so that I can fix an entry I marked wrong.
- **Priority:** P1
- **Phase:** 2
- **Requirement reference:** FR-308, FR-309
- **Acceptance criteria:**
  1. I can reopen any past contribution and change its status, method,
     or note.
  2. The amount cannot be negative.
  3. The latest state is what is shown to members.

### US-ORG-11: View the draw schedule

- **Story:** As an organizer, I want to see the full draw schedule (who
  gets the pot in which month) so that I can announce it to members and
  avoid disputes.
- **Priority:** P0
- **Phase:** 2
- **Requirement reference:** FR-407, FR-408, FR-410
- **Acceptance criteria:**
  1. The committee detail page shows a month-by-month schedule.
  2. Each month shows the member receiving the pot and the pot amount.
  3. Past draws are marked completed once I confirm payout.
  4. Future draws are marked scheduled.

### US-ORG-12: See dashboard statistics

- **Story:** As an organizer, I want my dashboard to show, at a glance,
  how many paid this month, how much is pending, and whose turn is
  next, so that I do not have to open every committee to know what is
  going on.
- **Priority:** P0
- **Phase:** 2
- **Requirement reference:** FR-501 to FR-504
- **Acceptance criteria:**
  1. Each committee card shows paid and pending counts for the current
     month.
  2. Each card shows total collected to date.
  3. Each card shows the next upcoming draw (member name and month).
  4. The dashboard works on a phone with no horizontal scrolling.

### US-ORG-13: Spot late payers quickly

- **Story:** As an organizer, I want to see which contributions are
  late across all my committees so that I can follow up with those
  members first.
- **Priority:** P1
- **Phase:** 2
- **Requirement reference:** FR-505
- **Acceptance criteria:**
  1. The dashboard shows a count of late contributions.
  2. I can drill into the list to see which committee, member, and
     month each late item belongs to.

---

## 5. Member Stories - MVP (Phase 1 and Phase 2)

### US-MEM-01: View my committee summary

- **Story:** As a member who has claimed my profile, I want to see a
  read-only summary of each committee I belong to so that I know the
  rules and current status without asking the organizer.
- **Priority:** P0
- **Phase:** 2
- **Requirement reference:** FR-601, FR-110
- **Acceptance criteria:**
  1. After claiming my profile, I see a list of committees I belong to.
  2. Each shows name, monthly amount, duration, draw type, and status.
  3. I cannot edit any committee configuration.

### US-MEM-02: View my own contribution history

- **Story:** As a member, I want to see my own payment history so that
  I know what I have paid and what is still due.
- **Priority:** P0
- **Phase:** 2
- **Requirement reference:** FR-602, FR-307
- **Acceptance criteria:**
  1. I see a list of my contributions: month, due date, amount, status,
     and paid date.
  2. I cannot see other members' contributions.
  3. I cannot change any contribution data.

### US-MEM-03: See when I receive the pot

- **Story:** As a member, I want to see the draw schedule with my month
  highlighted so that I know exactly when I will receive the pot.
- **Priority:** P0
- **Phase:** 2
- **Requirement reference:** FR-603, FR-410
- **Acceptance criteria:**
  1. I see the full draw schedule (member names and months).
  2. My own pot month is highlighted.
  3. Past draws are marked completed.

### US-MEM-04: See overall committee progress

- **Story:** As a member, I want to see how far along the committee is
  so that I trust the process is on track.
- **Priority:** P0
- **Phase:** 2
- **Requirement reference:** FR-604
- **Acceptance criteria:**
  1. I see how many months are complete out of the total.
  2. I see the total amount collected to date.
  3. The numbers match what the organizer sees.

### US-MEM-05: Privacy over other members' payment details

- **Story:** As a member, I want the app to keep other members' payment
  methods and notes private so that only the organizer and the member
  themselves see that detail.
- **Priority:** P1
- **Phase:** 2
- **Requirement reference:** FR-605
- **Acceptance criteria:**
  1. In the member view, I see other members' names and draw order
     only.
  2. I do not see other members' payment methods, notes, or paid dates.

---

## 6. Organizer Stories - Future (Phase 3 and Beyond)

### US-AUTH-05: Claim a member profile via phone OTP

- **Story:** As a member whose organizer added me by phone, I want to
  claim my profile using an OTP so that I can log in and see my
  committees myself.
- **Priority:** P2
- **Phase:** 3
- **Requirement reference:** FR-011
- **Acceptance criteria:**
  1. I can enter my phone number and receive an OTP.
  2. On verifying the OTP, my member rows are linked to a new or
     existing account.
  3. After claiming, I can access the member view.

### US-AUTH-06: Reset my password

- **Story:** As an organizer, I want to reset my password by email so
  that I can regain access if I forget it.
- **Priority:** P2
- **Phase:** 3
- **Requirement reference:** FR-012
- **Acceptance criteria:**
  1. From the login page I can request a password reset link by email.
  2. The link lets me set a new password.
  3. After reset, I can log in with the new password.

### US-ORG-14: Invite a member by link

- **Story:** As an organizer, I want to generate an invite link for a
  committee so that members can join and claim their profiles
  themselves.
- **Priority:** P2
- **Phase:** 3
- **Requirement reference:** FR-208
- **Acceptance criteria:**
  1. From the committee detail page I can copy an invite link.
  2. A member opening the link can add themselves (subject to my
     approval) and claim a profile.
  3. The link can be disabled by me at any time.

### US-ORG-15: Export a committee report as CSV

- **Story:** As an organizer, I want to export a committee's
  contribution history and draw schedule as CSV so that I can keep my
  own offline records or share with an accountant.
- **Priority:** P1
- **Phase:** 3
- **Requirement reference:** FR-701, FR-702
- **Acceptance criteria:**
  1. From the committee detail page I can download a contributions CSV.
  2. I can download a draw schedule CSV.
  3. The CSV opens correctly in Excel and Google Sheets.
  4. The CSV contains one row per contribution (or per draw) with all
     relevant fields.

### US-ORG-16: Send a WhatsApp reminder to late payers

- **Story:** As an organizer, I want the app to give me a ready-made
  WhatsApp reminder for members who are late, so that I do not have to
  type the same message every month.
- **Priority:** P2
- **Phase:** 3
- **Requirement reference:** FR-703, FR-704
- **Acceptance criteria:**
  1. For each late contribution, I see a "Remind" action.
  2. Clicking it produces a polite, pre-filled WhatsApp message with
     the member's name, amount, and due date.
  3. (Future) Automatic reminders can be enabled per committee via
     WhatsApp Business API.

### US-ORG-17: Cancel a committee

- **Story:** As an organizer, I want to cancel a committee that is no
  longer running so that it is clearly marked and stopped.
- **Priority:** P1
- **Phase:** 2/3
- **Requirement reference:** FR-107
- **Acceptance criteria:**
  1. I can cancel an active committee.
  2. The status becomes `cancelled` and the committee becomes
     read-only.
  3. Past data is preserved for the record.

### US-ORG-18: Complete a committee

- **Story:** As an organizer, I want to mark a committee as completed
  once all months and draws are done, so that the history is closed
  cleanly.
- **Priority:** P1
- **Phase:** 2/3
- **Requirement reference:** FR-108
- **Acceptance criteria:**
  1. When all months are finished and all draws paid, I can mark the
     committee completed.
  2. The status becomes `completed` and no further edits are allowed.

### US-ORG-19: Upgrade to a paid plan

- **Story:** As an organizer, I want to upgrade from Free to Pro or
  Premium so that I can run more committees and use export and reminder
  features.
- **Priority:** P2
- **Phase:** 4
- **Requirement reference:** Monetization (see PROJECT_PROPOSAL.md)
- **Acceptance criteria:**
  1. I can view plan options and limits (Free, Pro PKR 500, Premium
     PKR 1,500).
  2. I can subscribe and the limits update immediately after payment.
  3. I can downgrade or cancel my subscription.

---

## 7. Member Stories - Future (Phase 3 and Beyond)

### US-MEM-06: Receive a payment reminder

- **Story:** As a member, I want to receive a reminder before my
  contribution is due so that I do not forget to pay.
- **Priority:** P2
- **Phase:** 3
- **Requirement reference:** FR-703, FR-704
- **Acceptance criteria:**
  1. A few days before my due date, I receive a WhatsApp (or in-app)
     reminder.
  2. The reminder states the amount and due date.

### US-MEM-07: Export my own contribution history

- **Story:** As a member, I want to download my own contribution
  history so that I have a personal record.
- **Priority:** P2
- **Phase:** 4
- **Requirement reference:** FR-701 (extended to members)
- **Acceptance criteria:**
  1. I can download a CSV of my own contributions only.
  2. The CSV does not include any other member's data.

---

## 8. Admin Stories - Future (Phase 4)

### US-ADM-01: View platform statistics

- **Story:** As an admin, I want to see aggregate platform statistics
  so that I can monitor growth without invading any organizer's
  privacy.
- **Priority:** P2
- **Phase:** 4
- **Requirement reference:** FR-801
- **Acceptance criteria:**
  1. I can see total organizers, total committees, and total members.
  2. I cannot open any individual committee's contribution details.
  3. I can see aggregated counts by plan tier.

### US-ADM-02: Disable an abusive account

- **Story:** As an admin, I want to disable or delete an account that
  violates terms of use so that the platform stays safe.
- **Priority:** P2
- **Phase:** 4
- **Requirement reference:** FR-802
- **Acceptance criteria:**
  1. I can disable a user account.
  2. A disabled user can no longer log in.
  3. The action is logged with a reason.

---

## 9. Story to Requirement Mapping

The table below maps each story to its primary functional requirements
in `docs/SRS.md` and its use case(s) in `docs/USE_CASE_DIAGRAM.md`.

| Story ID | Story (short) | Requirements | Use Case(s) |
|----------|---------------|--------------|-------------|
| US-AUTH-01 | Sign up | FR-001, FR-002, FR-009, FR-010 | UC-01 |
| US-AUTH-02 | Log in | FR-003, FR-005 to FR-007, FR-010 | UC-02 |
| US-AUTH-03 | Log out | FR-004 | UC-02 |
| US-AUTH-04 | Stay logged in | FR-007 | UC-02 |
| US-AUTH-05 | Claim profile (OTP) | FR-011 | UC-01 |
| US-AUTH-06 | Reset password | FR-012 | UC-02 |
| US-ORG-01 | Create committee | FR-101 to FR-103, FR-109 | UC-03 |
| US-ORG-02 | View committees | FR-104, FR-110 | UC-04 |
| US-ORG-03 | Committee detail | FR-105, FR-110 | UC-05 |
| US-ORG-04 | Edit committee | FR-106 | UC-05 |
| US-ORG-05 | Add member | FR-201 to FR-204 | UC-06 |
| US-ORG-06 | Edit member | FR-205 | UC-06 |
| US-ORG-07 | Remove member | FR-206 | UC-07 |
| US-ORG-08 | Activate and generate schedule | FR-103, FR-301, FR-401 to FR-406 | UC-10 |
| US-ORG-09 | Mark contribution paid | FR-302 to FR-304, FR-306 | UC-08 |
| US-ORG-10 | Correct contribution | FR-308, FR-309 | UC-08 |
| US-ORG-11 | View draw schedule | FR-407, FR-408, FR-410 | UC-11 |
| US-ORG-12 | Dashboard stats | FR-501 to FR-504 | UC-12 |
| US-ORG-13 | Spot late payers | FR-505 | UC-12 |
| US-ORG-14 | Invite member by link | FR-208 | UC-06 |
| US-ORG-15 | Export CSV report | FR-701, FR-702 | UC-14 |
| US-ORG-16 | Send WhatsApp reminder | FR-703, FR-704 | UC-15 |
| US-ORG-17 | Cancel committee | FR-107 | UC-09 |
| US-ORG-18 | Complete committee | FR-108 | UC-09 |
| US-ORG-19 | Upgrade plan | Monetization | UC-17 |
| US-MEM-01 | View committee summary | FR-601, FR-110 | UC-13 |
| US-MEM-02 | View own contributions | FR-602, FR-307 | UC-13 |
| US-MEM-03 | See my pot month | FR-603, FR-410 | UC-11, UC-13 |
| US-MEM-04 | See progress | FR-604 | UC-13 |
| US-MEM-05 | Privacy over others | FR-605 | UC-13 |
| US-MEM-06 | Receive reminder | FR-703, FR-704 | UC-15 |
| US-MEM-07 | Export own history | FR-701 | UC-14 |
| US-ADM-01 | Platform stats | FR-801 | UC-16 |
| US-ADM-02 | Disable account | FR-802 | UC-16 |

---

## Appendix A: Priority Codes

- **P0:** Must have for the MVP (Phase 1 and Phase 2). The product is
  not usable without these.
- **P1:** Should have. Important for a complete product, can follow
  shortly after MVP.
- **P2:** Nice to have or explicitly future (Phase 3 and beyond).
