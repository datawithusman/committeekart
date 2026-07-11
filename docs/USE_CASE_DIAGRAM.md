# CommitteeKart - Use Case Diagrams

> Text-based (ASCII) use case diagrams for CommitteeKart. Includes
> actors, system boundaries, all use cases, and a description for each
> use case.

**Document Version:** 1.0
**Date:** 2026-07-11
**Status:** Active

---

## Table of Contents

1. [Actors](#1-actors)
2. [Legend](#2-legend)
3. [Master Use Case Diagram](#3-master-use-case-diagram)
4. [Use Case Descriptions](#4-use-case-descriptions)
5. [Authentication Use Cases](#5-authentication-use-cases)
6. [Committee Management Use Cases](#6-committee-management-use-cases)
7. [Member Management Use Cases](#7-member-management-use-cases)
8. [Contribution Tracking Use Cases](#8-contribution-tracking-use-cases)
9. [Draw Schedule Use Cases](#9-draw-schedule-use-cases)
10. [Transparency and Reporting Use Cases](#10-transparency-and-reporting-use-cases)
11. [Administration Use Cases](#11-administration-use-cases)
12. [Actor to Use Case Matrix](#12-actor-to-use-case-matrix)

---

## 1. Actors

CommitteeKart has four actors. The first three are human; the fourth is
the automated backend.

| Actor | Type | Description |
|-------|------|-------------|
| Organizer | Human (primary) | The user who creates and manages committees. Records contributions and owns the data. |
| Member | Human (primary) | A participant in a committee. May exist without an account until they claim a profile. Views their own status and the schedule. |
| Admin | Human (secondary, future) | A platform operator who manages the service and handles abuse, without seeing individual committees' financial details. |
| System (Supabase) | Automated | The backend that performs authentication, data storage, Row Level Security enforcement, and scheduled jobs (such as reminders). |

### 1.1 Organizer

The organizer is the main user. They sign up, create committees, add
members, activate committees (which triggers draw schedule generation),
record contributions, and view the dashboard. Most use cases in the
system are initiated by the organizer.

### 1.2 Member

The member participates in committees. Once they claim their profile,
they can view a read-only summary of their committees, their own
contribution history, and the draw schedule with their pot month
highlighted. The member cannot edit any data.

### 1.3 Admin

The admin operates the platform. In the MVP, admin capabilities are
minimal. In Phase 4, the admin can view aggregate platform statistics
and disable abusive accounts. The admin cannot read individual
contribution details.

### 1.4 System (Supabase)

The system is an actor because it performs actions autonomously: it
creates profiles on signup, enforces Row Level Security, generates
contribution rows on activation, and (in Phase 3) sends scheduled
reminders.

---

## 2. Legend

The diagrams below use the following conventions:

```
[ Actor ]                  A human or automated actor (outside the system).
( Use Case )               A use case (inside the system boundary).
 ---->                     An association: the actor initiates or
                           participates in the use case.
 <include>                 The base use case always includes the target.
 <extend>                  The extending use case optionally extends the
                           base under certain conditions.
+-------------------+      The system boundary box.
|  CommitteeKart    |
+-------------------+
```

---

## 3. Master Use Case Diagram

This is the complete diagram showing all actors and all use cases within
the CommitteeKart system boundary.

```
                                +-------------------------------------------------+
                                |              CommitteeKart System               |
                                |                                                 |
   +----------+                 |  ( UC-01 Sign up )                              |
   |          |-----------------|-->                                              |
   |          |                 |  ( UC-02 Log in / Log out )                     |
   |          |-----------------|-->                                              |
   |          |                 |  ( UC-17 Subscribe / Upgrade plan ) <extend>    |
   |          |                 |                                                 |
   |          |                 |  ( UC-03 Create committee )                     |
   |          |-----------------|-->                                              |
   |          |                 |         |                                       |
   |          |                 |         | <include>                            |
   |          |                 |         v                                       |
   |          |                 |  ( UC-10 Generate draw schedule )               |
   |          |                 |                                                 |
   |          |                 |  ( UC-04 View my committees )                   |
   |          |-----------------|-->                                              |
   |          |                 |                                                 |
   | Organizer|                 |  ( UC-05 View committee detail )                |
   |          |-----------------|-->                                              |
   |          |                 |                                                 |
   |          |                 |  ( UC-06 Add / edit member )                    |
   |          |-----------------|-->                                              |
   |          |                 |                                                 |
   |          |                 |  ( UC-07 Remove member )                        |
   |          |-----------------|-->                                              |
   |          |                 |                                                 |
   |          |                 |  ( UC-08 Record / update contribution )         |
   |          |-----------------|-->                                              |
   |          |                 |                                                 |
   |          |                 |  ( UC-09 Change committee status )              |
   |          |-----------------|-->                                              |
   |          |                 |                                                 |
   |          |                 |  ( UC-11 View draw schedule )                   |
   |          |-----------------|-->                                              |
   |          |                 |                                                 |
   |          |                 |  ( UC-12 View organizer dashboard )             |
   |          |-----------------|-->                                              |
   |          |                 |                                                 |
   |          |                 |  ( UC-14 Export report (CSV) )                  |
   |          |-----------------|-->                                              |
   |          |                 |                                                 |
   |          |                 |  ( UC-15 Send reminder )                        |
   +----------+                 |-->                                              |
                                |                                                 |
                                |  ( UC-13 View member dashboard / status )       |
   +----------+                 |-->                                              |
   |          |                 |                                                 |
   |          |                 |  ( UC-11 View draw schedule )                   |
   |  Member  |                 |-->  (shared read-only with organizer)           |
   |          |                 |                                                 |
   |          |                 |  ( UC-18 Claim profile via OTP ) <extend>       |
   |          |-----------------|-->  (extends UC-01 / UC-02)                     |
   +----------+                 |                                                 |
                                |                                                 |
   +----------+                 |  ( UC-16 View platform statistics )             |
   |   Admin  |-----------------|-->                                              |
   |          |                 |  ( UC-16b Disable / delete account )            |
   |          |-----------------|-->                                              |
   +----------+                 |                                                 |
                                |                                                 |
   +----------+                 |  ( UC-99 Enforce Row Level Security )           |
   |  System  |=================|===  (participates in ALL use cases)            |
   | (Supabase)|                |  ( UC-100 Auto-create profile on signup )       |
   |          |                 |  ( UC-101 Auto-generate contributions )         |
   |          |                 |  ( UC-102 Auto-generate draw schedule )         |
   +----------+                 |                                                 |
                                +-------------------------------------------------+
```

Notes on the master diagram:

- The System actor participates in every use case by enforcing access
  control (Row Level Security) and by performing automatic actions
  (profile creation, schedule generation). It is shown with a double
  line to indicate this pervasive role.
- UC-10 (Generate draw schedule) is included by UC-03 (Create
  committee) and UC-09 (Change committee status to active).
- UC-17 (Subscribe / Upgrade plan) extends the auth and dashboard area
  and is a Phase 4 use case.
- UC-18 (Claim profile via OTP) extends sign-up and log-in for members
  who were added by an organizer.

---

## 4. Use Case Descriptions

Each use case below is described with: ID, name, primary actor,
participants, trigger, preconditions, main flow, alternate flows,
postconditions, and requirement reference.

---

## 5. Authentication Use Cases

### UC-01: Sign up

- **Primary actor:** Organizer (also Member claiming an account)
- **Participants:** System
- **Trigger:** A new user opens `/signup`.
- **Preconditions:** The user does not yet have an account.
- **Main flow:**
  1. The user enters full name, email, and password.
  2. The system validates the email format and password length.
  3. The system creates an auth user.
  4. The system auto-creates a `profiles` row (UC-100).
  5. The system logs the user in and redirects to `/dashboard`.
- **Alternate flows:**
  - A1: Email already exists. The system shows an error.
  - A2: Invalid email or short password. The system shows inline errors.
- **Postconditions:** A new profile exists and the user is logged in.
- **Requirement reference:** FR-001, FR-002, FR-009, FR-010.

### UC-02: Log in / Log out

- **Primary actor:** Organizer, Member, Admin
- **Participants:** System
- **Trigger:** The user opens `/login` or clicks logout.
- **Preconditions:** For login, an account exists. For logout, the user
  is logged in.
- **Main flow (login):**
  1. The user enters email and password.
  2. The system verifies the credentials.
  3. The system creates a session cookie and redirects to `/dashboard`.
- **Main flow (logout):**
  1. The user clicks logout.
  2. The system ends the session.
  3. The user is redirected to `/login`.
- **Alternate flows:**
  - A1: Wrong credentials. The system shows a generic error.
  - A2: Already logged in and visiting `/login`. The system redirects
    to `/dashboard`.
- **Postconditions:** The session state matches the user's intent.
- **Requirement reference:** FR-003 to FR-007.

### UC-17: Subscribe / Upgrade plan (Phase 4)

- **Primary actor:** Organizer
- **Participants:** System, external billing provider
- **Trigger:** The organizer chooses to upgrade from the dashboard or
  settings.
- **Preconditions:** The organizer is logged in.
- **Main flow:**
  1. The organizer views plan options and limits.
  2. The organizer selects Pro or Premium and pays via the billing
     provider.
  3. The system updates the profile's plan tier.
  4. The new limits take effect immediately.
- **Alternate flows:**
  - A1: Payment fails. The system shows an error and the plan is
    unchanged.
- **Postconditions:** The organizer's plan tier reflects the
  subscription.
- **Requirement reference:** Monetization (see PROJECT_PROPOSAL.md
  section 8).

### UC-18: Claim profile via OTP (Phase 3)

- **Primary actor:** Member
- **Participants:** System
- **Trigger:** A member who was added by an organizer wants to access
  their data.
- **Preconditions:** A member row exists with the member's phone number
  and a null user_id.
- **Main flow:**
  1. The member enters their phone number.
  2. The system sends an OTP.
  3. The member verifies the OTP.
  4. The system links the member rows to an account (new or existing).
- **Alternate flows:**
  - A1: OTP incorrect or expired. The system allows retry.
- **Postconditions:** The member can access the member view (UC-13).
- **Requirement reference:** FR-011.

---

## 6. Committee Management Use Cases

### UC-03: Create committee

- **Primary actor:** Organizer
- **Participants:** System
- **Trigger:** The organizer clicks "Create committee".
- **Preconditions:** The organizer is logged in.
- **Main flow:**
  1. The organizer enters name, monthly amount, member count, duration,
     draw type, start date, and optional description.
  2. The system validates all fields (FR-102).
  3. The system creates the committee with status `draft`.
  4. The system redirects to the new committee detail page.
- **Alternate flows:**
  - A1: Validation fails. The system shows inline errors and does not
    create the committee.
- **Postconditions:** A new committee exists, owned by the organizer.
- **Includes:** When the committee is later activated, UC-10 (Generate
  draw schedule) runs.
- **Requirement reference:** FR-101, FR-102, FR-103, FR-109.

### UC-04: View my committees

- **Primary actor:** Organizer
- **Participants:** System
- **Trigger:** The organizer opens the dashboard.
- **Preconditions:** The organizer is logged in and owns at least one
  committee (the list can be empty).
- **Main flow:**
  1. The system queries committees where organizer_id matches the user.
  2. The system displays them sorted by most recently created.
  3. Each item shows name, status, and member count.
- **Alternate flows:**
  - A1: No committees exist. The system shows an empty state with a
    "Create committee" prompt.
- **Postconditions:** None (read only).
- **Requirement reference:** FR-104, FR-110.

### UC-05: View committee detail

- **Primary actor:** Organizer (full view), Member (read-only subset)
- **Participants:** System
- **Trigger:** The user clicks a committee from the list.
- **Preconditions:** The user has access (organizer owns it, or member
  belongs to it).
- **Main flow:**
  1. The system loads the committee configuration.
  2. The system loads members, current month contributions, and draws.
  3. The system renders the detail page.
- **Alternate flows:**
  - A1: The user lacks access. Row Level Security blocks the read and
    the system shows "not found".
- **Postconditions:** None (read only). For the organizer, edit
  controls are available.
- **Requirement reference:** FR-105, FR-106, FR-110.

### UC-09: Change committee status

- **Primary actor:** Organizer
- **Participants:** System
- **Trigger:** The organizer activates, cancels, or completes a
  committee.
- **Preconditions:** The organizer owns the committee and the current
  status allows the transition.
- **Main flow:**
  1. The organizer chooses a new status (draft to active, active to
     cancelled, active to completed).
  2. The system validates the transition.
  3. On activation, the system generates contributions (UC-101) and the
     draw schedule (UC-10 / UC-102).
  4. The system updates the status.
- **Alternate flows:**
  - A1: Transition not allowed (for example, completing a committee
     with unpaid draws). The system blocks it with a message.
- **Postconditions:** The committee status is updated and, on
  activation, the schedule and contributions exist.
- **Requirement reference:** FR-103, FR-107, FR-108.

---

## 7. Member Management Use Cases

### UC-06: Add / edit member

- **Primary actor:** Organizer
- **Participants:** System
- **Trigger:** The organizer adds a new member or edits an existing one
  from the committee detail page.
- **Preconditions:** The organizer owns the committee.
- **Main flow (add):**
  1. The organizer enters a name and optional phone.
  2. The system validates the name length.
  3. The system creates a member row with a null user_id.
  4. The member appears in the list.
- **Main flow (edit):**
  1. The organizer opens a member's record.
  2. The organizer changes name or phone.
  3. The system validates and saves.
- **Alternate flows:**
  - A1: Duplicate user_id for the same committee. The system blocks it.
  - A2: Invalid name. The system shows an error.
- **Postconditions:** The member row is created or updated.
- **Requirement reference:** FR-201 to FR-205.

### UC-07: Remove member

- **Primary actor:** Organizer
- **Participants:** System
- **Trigger:** The organizer removes a member from a committee.
- **Preconditions:** The organizer owns the committee and the member has
  not yet received the pot.
- **Main flow:**
  1. The organizer clicks remove on a member.
  2. The system warns and asks for confirmation.
  3. On confirm, the system deletes the member row.
  4. If the committee is active, the system recomputes the draw schedule
     to preserve fairness.
- **Alternate flows:**
  - A1: The member already received the pot. The system blocks removal
    with an explanation.
- **Postconditions:** The member is removed and, if needed, the schedule
  is adjusted so every remaining member still gets the pot once.
- **Requirement reference:** FR-206.

---

## 8. Contribution Tracking Use Cases

### UC-08: Record / update contribution

- **Primary actor:** Organizer
- **Participants:** System
- **Trigger:** The organizer opens the contribution tracker for a month
  and updates a member's payment.
- **Preconditions:** The committee is active and the contribution row
  exists.
- **Main flow:**
  1. The organizer selects a member for a month.
  2. The organizer sets status (paid, pending, late, skipped).
  3. If paid, the organizer selects a payment method and optionally
     adds a note.
  4. The system records paid_at for paid status.
  5. The system saves the update.
- **Alternate flows:**
  - A1: The organizer reopens a past contribution to correct it. The
    system allows updates and keeps the latest state.
- **Postconditions:** The contribution reflects the latest status,
  method, and note.
- **Requirement reference:** FR-302 to FR-304, FR-306, FR-308, FR-309.

---

## 9. Draw Schedule Use Cases

### UC-10: Generate draw schedule

- **Primary actor:** System (on behalf of the organizer)
- **Participants:** Organizer (who triggers activation)
- **Trigger:** The organizer activates a committee (UC-09) or creates
  one with immediate activation.
- **Preconditions:** The committee has members and is moving to active
  status.
- **Main flow:**
  1. The system reads the draw type.
  2. For lottery, the system shuffles members randomly.
  3. For fixed, the system uses the organizer's provided order.
  4. For auction, the system assigns placeholders in member order.
  5. The system creates one draw row per month, assigning each member
     the pot exactly once.
  6. Each draw's amount equals monthly amount times member count.
- **Alternate flows:**
  - A1: Member count and duration do not match. The system uses the
    smaller value defensively and logs a warning.
- **Postconditions:** A complete draw schedule exists with fair
  distribution.
- **Requirement reference:** FR-401 to FR-406.

### UC-11: View draw schedule

- **Primary actor:** Organizer (full view), Member (read-only)
- **Participants:** System
- **Trigger:** The user opens the draw schedule section of a committee.
- **Preconditions:** The committee has been activated and a schedule
  exists.
- **Main flow:**
  1. The system loads the draws for the committee.
  2. The system renders them in month order with member names and pot
     amounts.
  3. For the organizer, completed draws can be marked paid out.
  4. For the member, their own pot month is highlighted.
- **Alternate flows:**
  - A1: No schedule yet (draft committee). The system shows a prompt to
    activate first.
- **Postconditions:** None (read only), unless the organizer marks a
  draw completed.
- **Requirement reference:** FR-407, FR-408, FR-410, FR-411.

---

## 10. Transparency and Reporting Use Cases

### UC-12: View organizer dashboard

- **Primary actor:** Organizer
- **Participants:** System
- **Trigger:** The organizer opens `/dashboard`.
- **Preconditions:** The organizer is logged in.
- **Main flow:**
  1. The system loads all committees owned by the organizer.
  2. For each committee, the system computes: paid and pending counts
     for the current month, total collected to date, and the next
     upcoming draw.
  3. The system renders the dashboard with one card per committee.
  4. The system surfaces a count of late contributions across all
     committees.
- **Alternate flows:**
  - A1: No committees. The system shows an empty state.
- **Postconditions:** None (read only).
- **Requirement reference:** FR-501 to FR-505.

### UC-13: View member dashboard / status

- **Primary actor:** Member
- **Participants:** System
- **Trigger:** A member who claimed their profile logs in.
- **Preconditions:** The member has claimed at least one profile.
- **Main flow:**
  1. The system loads committees the member belongs to.
  2. For each committee, the system shows a read-only summary
     (configuration, status, progress).
  3. The system shows the member's own contribution history.
  4. The system shows the draw schedule with the member's pot month
     highlighted.
- **Alternate flows:**
  - A1: The member has not claimed any profile. The system prompts them
    to claim via OTP (UC-18).
- **Postconditions:** None (read only).
- **Requirement reference:** FR-601 to FR-605.

### UC-14: Export report (CSV)

- **Primary actor:** Organizer (and Member for own history, Phase 4)
- **Participants:** System
- **Trigger:** The organizer clicks "Export CSV" on a committee.
- **Preconditions:** The committee has data to export.
- **Main flow:**
  1. The organizer chooses contributions or draw schedule.
  2. The system generates a CSV with the relevant rows.
  3. The browser downloads the file.
- **Alternate flows:**
  - A1: No data yet. The system disables the export button.
- **Postconditions:** A CSV file is downloaded.
- **Requirement reference:** FR-701, FR-702.

### UC-15: Send reminder

- **Primary actor:** Organizer (with System automating in Phase 3)
- **Participants:** System, external WhatsApp provider
- **Trigger:** The organizer clicks "Remind" on a late contribution, or
  a scheduled job fires.
- **Preconditions:** The contribution is pending or late.
- **Main flow:**
  1. The system composes a reminder with member name, amount, and due
     date.
  2. The organizer reviews and sends it (or the system sends
     automatically if enabled).
  3. The system records that a reminder was sent.
- **Alternate flows:**
  - A1: WhatsApp API not configured. The system provides a copyable
    text fallback.
- **Postconditions:** A reminder is sent or copied.
- **Requirement reference:** FR-703, FR-704.

---

## 11. Administration Use Cases

### UC-16: View platform statistics / Disable account

- **Primary actor:** Admin
- **Participants:** System
- **Trigger:** The admin opens the admin console.
- **Preconditions:** The admin is logged in with an admin role.
- **Main flow (statistics):**
  1. The system loads aggregate counts: total organizers, committees,
     members, and counts by plan tier.
  2. The admin reviews growth metrics.
- **Main flow (disable account):**
  1. The admin searches for a user account.
  2. The admin disables or deletes it with a reason.
  3. The system logs the action.
- **Alternate flows:**
  - A1: The admin attempts to open an individual committee's
    contribution details. The system denies access (privacy).
- **Postconditions:** Aggregate statistics are shown, or the account is
  disabled.
- **Requirement reference:** FR-801, FR-802.

### System-internal use cases

These use cases are performed by the System actor autonomously and are
invoked by other use cases.

- **UC-99: Enforce Row Level Security.** The system enforces RLS on
  every database read and write so that users only access their own
  data. Participates in all use cases. Requirement: NFR-101.
- **UC-100: Auto-create profile on signup.** When a new auth user is
  created (UC-01), the system creates a matching `profiles` row via a
  database trigger. Requirement: FR-002.
- **UC-101: Auto-generate contributions.** When a committee is
  activated (UC-09), the system creates one contribution row per
  member per month. Requirement: FR-301.
- **UC-102: Auto-generate draw schedule.** Same trigger as UC-10,
  invoked on activation. Requirement: FR-401 to FR-406.

---

## 12. Actor to Use Case Matrix

This matrix shows which actors interact with which use cases. An "X"
marks a primary initiator; an "x" marks a participant.

| Use Case | Organizer | Member | Admin | System |
|----------|:---------:|:------:|:-----:|:------:|
| UC-01 Sign up | X | X |  | x |
| UC-02 Log in / Log out | X | X | X | x |
| UC-03 Create committee | X |  |  | x |
| UC-04 View my committees | X |  |  | x |
| UC-05 View committee detail | X | x |  | x |
| UC-06 Add / edit member | X |  |  | x |
| UC-07 Remove member | X |  |  | x |
| UC-08 Record / update contribution | X |  |  | x |
| UC-09 Change committee status | X |  |  | x |
| UC-10 Generate draw schedule |  |  |  | X |
| UC-11 View draw schedule | X | x |  | x |
| UC-12 View organizer dashboard | X |  |  | x |
| UC-13 View member dashboard / status |  | X |  | x |
| UC-14 Export report (CSV) | X | x |  | x |
| UC-15 Send reminder | X |  |  | x |
| UC-16 View platform statistics / Disable account |  |  | X | x |
| UC-17 Subscribe / Upgrade plan | X |  |  | x |
| UC-18 Claim profile via OTP |  | X |  | x |
| UC-99 Enforce Row Level Security |  |  |  | X |
| UC-100 Auto-create profile on signup |  |  |  | X |
| UC-101 Auto-generate contributions |  |  |  | X |
| UC-102 Auto-generate draw schedule |  |  |  | X |

---

## Appendix A: Use Case to Story Mapping

For traceability with `docs/USER_STORIES.md`:

| Use Case | Primary Stories |
|----------|-----------------|
| UC-01 Sign up | US-AUTH-01 |
| UC-02 Log in / Log out | US-AUTH-02, US-AUTH-03, US-AUTH-04 |
| UC-03 Create committee | US-ORG-01 |
| UC-04 View my committees | US-ORG-02 |
| UC-05 View committee detail | US-ORG-03, US-ORG-04 |
| UC-06 Add / edit member | US-ORG-05, US-ORG-06, US-ORG-14 |
| UC-07 Remove member | US-ORG-07 |
| UC-08 Record / update contribution | US-ORG-09, US-ORG-10 |
| UC-09 Change committee status | US-ORG-08, US-ORG-17, US-ORG-18 |
| UC-10 Generate draw schedule | US-ORG-08 |
| UC-11 View draw schedule | US-ORG-11, US-MEM-03 |
| UC-12 View organizer dashboard | US-ORG-12, US-ORG-13 |
| UC-13 View member dashboard / status | US-MEM-01, US-MEM-02, US-MEM-04, US-MEM-05 |
| UC-14 Export report (CSV) | US-ORG-15, US-MEM-07 |
| UC-15 Send reminder | US-ORG-16, US-MEM-06 |
| UC-16 View platform statistics / Disable account | US-ADM-01, US-ADM-02 |
| UC-17 Subscribe / Upgrade plan | US-ORG-19 |
| UC-18 Claim profile via OTP | US-AUTH-05 |

## Appendix B: Related Documents

- `docs/SRS.md` - Functional and non-functional requirements.
- `docs/USER_STORIES.md` - User stories by role and phase.
- `docs/PROJECT_PROPOSAL.md` - Product proposal and market context.
- `docs/ARCHITECTURE.md` - System design and data model.
- `docs/DECISIONS.md` - Technical decision records.
