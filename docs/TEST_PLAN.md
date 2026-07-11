# CommitteeKart - Test Plan

> Comprehensive testing strategy and detailed test cases for the
> CommitteeKart digital committee (ROSCA) tracker.
>
> Applies to: Phase 1 (Foundation) and Phase 2 (Core Features).

---

## Table of Contents

1. [Testing Strategy Overview](#1-testing-strategy-overview)
2. [Test Categories](#2-test-categories)
3. [Test Environment](#3-test-environment)
4. [Authentication Test Cases](#4-authentication-test-cases)
5. [Committee Creation Test Cases](#5-committee-creation-test-cases)
6. [Contribution Tracking Test Cases](#6-contribution-tracking-test-cases)
7. [Draw Schedule Generation Test Cases](#7-draw-schedule-generation-test-cases)
8. [Dashboard Stats Accuracy Test Cases](#8-dashboard-stats-accuracy-test-cases)
9. [RLS Security Test Cases](#9-rls-security-test-cases)
10. [UI and E2E Test Cases](#10-ui-and-e2e-test-cases)
11. [Known Issues and Limitations](#11-known-issues-and-limitations)
12. [Future Testing Improvements](#12-future-testing-improvements)

---

## 1. Testing Strategy Overview

CommitteeKart follows a layered testing approach. The app handles
financial records (even though it does not hold money), so data accuracy
and security are the top priorities. The testing strategy is designed to
answer four questions before any release:

1. **Does authentication work correctly?** Can users sign up, log in,
   log out, and are protected routes actually protected?
2. **Is the data correct?** Are committees, members, contributions, and
   draws created with the right values and relationships?
3. **Is the money math right?** Does the pot amount equal
   monthly_amount times member_count? Do dashboard totals match the
   underlying contribution records?
4. **Is the data secure?** Can a user see or modify another user's
   committees, members, contributions, or draws?

### Current Status

The project is in Phase 1 (Foundation) and Phase 2 (Core Features).
Testing is currently **manual**. Automated test suites (unit, integration,
E2E) are planned for Phase 3 as described in
[Section 12](#12-future-testing-improvements).

| Aspect | Current | Target (Phase 3) |
|--------|---------|-------------------|
| Unit tests | Not yet | Vitest, 80%+ coverage |
| Integration tests | Not yet | Vitest + Supabase local |
| E2E tests | Not yet | Playwright |
| Manual testing | Active | Ongoing |
| CI/CD pipeline | Not yet | GitHub Actions |

---

## 2. Test Categories

### 2.1 Unit Testing

Tests individual functions and modules in isolation.

**Scope:**
- `src/lib/draw-schedule.ts` - Draw schedule generation logic
  (Fisher-Yates shuffle, lottery, fixed, auction)
- `src/lib/utils.ts` - Helper functions (`formatCurrency`,
  `formatDate`, `getInitials`, `addMonths`, `cn`)
- `src/lib/types.ts` - Type definitions (compile-time check only)

**Why it matters:** The draw schedule generator is the core business
logic. A bug here means the wrong member gets the pot. The Fisher-Yates
shuffle must guarantee each member appears exactly once.

### 2.2 Integration Testing

Tests how multiple modules work together, especially the interaction
between Server Actions and the Supabase database.

**Scope:**
- `src/app/(auth)/actions.ts` - signup, login, logout with real Supabase
  Auth
- `src/app/(dashboard)/committees/actions.ts` - createCommittee with
  real database inserts
- `src/app/(dashboard)/committees/[id]/actions.ts` -
  markContributionPaid, markContributionPending with RLS enforcement
- Database trigger: auto-create profile on signup
- RLS policy enforcement on all five tables

### 2.3 UI and E2E Testing

Tests the full user journey through the browser, from landing page to
committee creation to contribution tracking.

**Scope:**
- Landing page renders correctly
- Signup and login forms submit and redirect properly
- Dashboard shows committees and stats
- Committee creation form with dynamic member rows
- Committee detail page with contribution toggles
- Draw schedule display
- Protected route redirects (unauthenticated users sent to /login)
- Authenticated users redirected away from /login and /signup

### 2.4 User Acceptance Testing (UAT)

Tests the app from a real user's perspective. Performed by the developer
acting as both organizer and member, using realistic scenarios.

**Acceptance criteria:**
- An organizer can create a committee, add members, and see the full
  draw schedule within 2 minutes
- Contribution status toggles reflect instantly in the UI
- Dashboard stats match the committee detail page stats
- A user cannot access another user's data

---

## 3. Test Environment

### 3.1 Development Environment

| Component | Value |
|-----------|-------|
| OS | Windows 11 (win32 10.0.26200) |
| Node.js | 18+ (built with Node 24) |
| Package manager | npm 10+ |
| Framework | Next.js 16.2.10 |
| Database | Supabase project (josuxzrioqpufdidtbct) |
| Dev server | `npm run dev` at http://localhost:3000 |

### 3.2 Test Data

Use the following test accounts and scenarios:

| Role | Email pattern | Purpose |
|------|---------------|---------|
| Organizer A | testorg1@example.com | Primary test organizer |
| Organizer B | testorg2@example.com | Second organizer for RLS tests |
| Member (no account) | N/A (name + phone only) | Added by organizer |

**Test committee parameters:**
- Name: "Test Committee"
- Monthly amount: Rs. 5,000
- Member count: 10 (organizer + 9 added members)
- Duration: 10 months (must equal member count)
- Draw type: lottery
- Start date: 1st of next month

### 3.3 Setup Steps Before Testing

1. Ensure the development server is running (`npm run dev`)
2. Confirm Supabase env variables are set in `.env.local`
3. Confirm the database schema migrations have been run
4. Clear test data from previous runs if needed
5. Open the app at http://localhost:3000 in a fresh browser session
   (incognito recommended)

---

## 4. Authentication Test Cases

### TC-AUTH-001: New user signup with valid data

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-AUTH-001 |
| **Description** | A new user can create an account with a valid name, email, and password |
| **Pre-conditions** | No account exists with the test email. Dev server is running. |
| **Steps** | 1. Navigate to /signup. 2. Enter full name "Test User". 3. Enter email "newuser@example.com". 4. Enter password "testpass123" (at least 6 characters). 5. Click "Account Banao". |
| **Expected Result** | User is redirected to /dashboard. The profiles table has a new row with the correct email and full_name. |
| **Status** | Pass |

### TC-AUTH-002: Signup with already registered email

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-AUTH-002 |
| **Description** | Signup fails when the email is already in use |
| **Pre-conditions** | An account exists with "existing@example.com" |
| **Steps** | 1. Navigate to /signup. 2. Enter any name. 3. Enter email "existing@example.com". 4. Enter a valid password. 5. Click "Account Banao". |
| **Expected Result** | User is redirected back to /signup with an error message: "Yeh email pehle se registered hai. Login karein." |
| **Status** | Pass |

### TC-AUTH-003: Signup with short password (under 6 characters)

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-AUTH-003 |
| **Description** | Signup fails when the password is shorter than 6 characters |
| **Pre-conditions** | Dev server is running |
| **Steps** | 1. Navigate to /signup. 2. Enter valid name and email. 3. Enter password "12345" (5 characters). 4. Click "Account Banao". |
| **Expected Result** | Supabase Auth rejects the password. User sees an error message about weak password: "Password kam az kam 6 characters ka hona chahiye." |
| **Status** | Pass |

### TC-AUTH-004: Signup auto-creates a profile row

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-AUTH-004 |
| **Description** | The database trigger `on_auth_user_created` creates a profiles row when a user signs up |
| **Pre-conditions** | The trigger from migration 0001 is installed |
| **Steps** | 1. Sign up with a new email. 2. Check the Supabase profiles table in the dashboard. |
| **Expected Result** | A row exists in profiles with: id matching auth.users.id, email matching, full_name from signup form, plan = "free". |
| **Status** | Pass |

### TC-AUTH-005: Login with valid credentials

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-AUTH-005 |
| **Description** | An existing user can log in with correct email and password |
| **Pre-conditions** | Account exists for "testorg1@example.com" with password "testpass123" |
| **Steps** | 1. Log out if logged in. 2. Navigate to /login. 3. Enter email "testorg1@example.com". 4. Enter password "testpass123". 5. Click "Login". |
| **Expected Result** | User is redirected to /dashboard and greeted by name. |
| **Status** | Pass |

### TC-AUTH-006: Login with incorrect password

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-AUTH-006 |
| **Description** | Login fails with a wrong password |
| **Pre-conditions** | Account exists for "testorg1@example.com" |
| **Steps** | 1. Navigate to /login. 2. Enter "testorg1@example.com". 3. Enter "wrongpassword". 4. Click "Login". |
| **Expected Result** | Redirect back to /login with error: "Email ya password ghalat hai." |
| **Status** | Pass |

### TC-AUTH-007: Logout clears the session

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-AUTH-007 |
| **Description** | Logging out ends the session and redirects to /login |
| **Pre-conditions** | User is logged in and on /dashboard |
| **Steps** | 1. Click the "Logout" button in the top nav. |
| **Expected Result** | User is redirected to /login. Attempting to navigate to /dashboard redirects back to /login. |
| **Status** | Pass |

### TC-AUTH-008: Protected route redirect when logged out

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-AUTH-008 |
| **Description** | An unauthenticated user cannot access protected routes |
| **Pre-conditions** | User is logged out (incognito session) |
| **Steps** | 1. Navigate directly to http://localhost:3000/dashboard. |
| **Expected Result** | Middleware (proxy.ts) redirects to /login with a redirect query param. |
| **Status** | Pass |

### TC-AUTH-009: Protected route redirect for /committees

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-AUTH-009 |
| **Description** | The /committees route is protected by the middleware |
| **Pre-conditions** | User is logged out |
| **Steps** | 1. Navigate directly to http://localhost:3000/committees/new. |
| **Expected Result** | Redirect to /login. |
| **Status** | Pass |

### TC-AUTH-010: Authenticated user redirected away from login page

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-AUTH-010 |
| **Description** | A logged-in user visiting /login or /signup is sent to /dashboard |
| **Pre-conditions** | User is logged in |
| **Steps** | 1. Navigate to http://localhost:3000/login. |
| **Expected Result** | Immediate redirect to /dashboard. |
| **Status** | Pass |

### TC-AUTH-011: Session persistence across page reloads

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-AUTH-011 |
| **Description** | The session cookie persists across page reloads and browser restarts |
| **Pre-conditions** | User is logged in |
| **Steps** | 1. Reload the page. 2. Close and reopen the browser. 3. Navigate to /dashboard. |
| **Expected Result** | User remains logged in and reaches /dashboard without being sent to /login. |
| **Status** | Pass |

---

## 5. Committee Creation Test Cases

### TC-CC-001: Create a committee with valid data

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-CC-001 |
| **Description** | An organizer can create a fully valid committee with members |
| **Pre-conditions** | User is logged in on /dashboard |
| **Steps** | 1. Click "+ New Committee". 2. Enter name "Office Committee". 3. Enter monthly amount 5000. 4. Enter duration 10. 5. Select draw type "Lottery". 6. Enter a start date. 7. Add 9 member names (organizer is member 1). 8. Click "Create Committee". |
| **Expected Result** | Redirect to the new committee detail page. A committees row exists with the correct values. 10 members exist. 10 draw rows exist (one per month). 100 contribution rows exist (10 members times 10 months). |
| **Status** | Pass |

### TC-CC-002: Validation - name is required

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-CC-002 |
| **Description** | Committee creation fails if the name is empty |
| **Pre-conditions** | User is on /committees/new |
| **Steps** | 1. Leave the name field empty. 2. Fill all other fields validly. 3. Submit the form. |
| **Expected Result** | Redirect back with error: "Committee ka naam 1 se 100 characters ke beech hona chahiye." |
| **Status** | Pass |

### TC-CC-003: Validation - monthly amount must be at least Rs. 100

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-CC-003 |
| **Description** | Amounts below Rs. 100 are rejected |
| **Pre-conditions** | User is on /committees/new |
| **Steps** | 1. Enter monthly amount 50. 2. Fill all other fields validly. 3. Submit. |
| **Expected Result** | Error: "Monthly amount kam az kam Rs. 100 hona chahiye." |
| **Status** | Pass |

### TC-CC-004: Validation - member count must equal duration

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-CC-004 |
| **Description** | The ROSCA fairness guarantee: duration_months must equal total member count |
| **Pre-conditions** | User is on /committees/new |
| **Steps** | 1. Set duration to 10. 2. Add 5 members (total 6 including organizer). 3. Submit. |
| **Expected Result** | Error: "Duration (10 months) aur members (6) barabar hone chahiye. Har member ko ek baar pot milna chahiye." |
| **Status** | Pass |

### TC-CC-005: Validation - minimum 2 members required

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-CC-005 |
| **Description** | A committee requires at least 2 members (organizer + 1) |
| **Pre-conditions** | User is on /committees/new with 0 added members |
| **Steps** | 1. Do not add any external members. 2. Set duration to 1. 3. Submit. |
| **Expected Result** | Error: "Kam az kam 2 members chahiye (aap + 1 aur)." |
| **Status** | Pass |

### TC-CC-006: Validation - duration must be between 1 and 60

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-CC-006 |
| **Description** | Duration values outside the 1 to 60 range are rejected |
| **Pre-conditions** | User is on /committees/new |
| **Steps** | 1. Enter duration 0 or 61. 2. Fill other fields. 3. Submit. |
| **Expected Result** | Error: "Duration 1 se 60 months ke beech hona chahiye." |
| **Status** | Pass |

### TC-CC-007: Organizer is automatically added as member 1

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-CC-007 |
| **Description** | The organizer does not need to add themselves. The system adds them. |
| **Pre-conditions** | User is logged in and has a profile with full_name set |
| **Steps** | 1. Create a committee with 2 added members. 2. Check the members table. |
| **Expected Result** | 3 members exist. The first member has user_id = organizer's id and name = organizer's full_name. The other 2 have user_id = null. |
| **Status** | Pass |

### TC-CC-008: Cascade cleanup on partial failure

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-CC-008 |
| **Description** | If a step fails during creation, the committee and all partial data are deleted |
| **Pre-conditions** | Simulate an error (for example, temporarily break a constraint) |
| **Steps** | 1. Attempt to create a committee that will fail at the draws insert step. 2. Check the database. |
| **Expected Result** | The committee row, member rows, and any partial draw rows are all removed. No orphaned data remains. |
| **Status** | Pass |

### TC-CC-009: Member names with phone numbers are stored

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-CC-009 |
| **Description** | Optional phone numbers are stored in the members table |
| **Pre-conditions** | User is on /committees/new |
| **Steps** | 1. Add a member with name "Ahmed Ali" and phone "03001234567". 2. Create the committee. 3. Check the members table. |
| **Expected Result** | The member row has phone = "03001234567". |
| **Status** | Pass |

### TC-CC-010: Member names without phone numbers store null

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-CC-010 |
| **Description** | Empty phone fields are stored as null, not empty strings |
| **Pre-conditions** | User is on /committees/new |
| **Steps** | 1. Add a member with a name but leave the phone field empty. 2. Create the committee. 3. Check the members table. |
| **Expected Result** | The member row has phone = null. |
| **Status** | Pass |

---

## 6. Contribution Tracking Test Cases

### TC-CT-001: Mark a pending contribution as paid

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-CT-001 |
| **Description** | The organizer can mark a member's contribution as paid |
| **Pre-conditions** | A committee exists with contributions in "pending" status |
| **Steps** | 1. Open the committee detail page. 2. Find a member with "Pending" status. 3. Click the "Pending" button. |
| **Expected Result** | The button changes to "Paid" (green). The contributions row has status = "paid", paid_at = current timestamp, payment_method = "cash". |
| **Status** | Pass |

### TC-CT-002: Mark a paid contribution back to pending

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-CT-002 |
| **Description** | The organizer can revert a paid contribution to pending |
| **Pre-conditions** | A contribution is in "paid" status |
| **Steps** | 1. Open the committee detail page. 2. Find the paid member. 3. Click the "Paid" button. |
| **Expected Result** | The button changes to "Pending" (amber). The contributions row has status = "pending", paid_at = null, payment_method = null. |
| **Status** | Pass |

### TC-CT-003: Contribution toggle is optimistic-safe

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-CT-003 |
| **Description** | If the server action fails, the UI does not flip to the wrong state |
| **Pre-conditions** | Simulate a network failure or server error |
| **Steps** | 1. Click the toggle button. 2. The server action returns success: false. |
| **Expected Result** | The button stays in its original state. An error message appears below the row. |
| **Status** | Pass |

### TC-CT-004: Only the organizer can mark contributions

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-CT-004 |
| **Description** | A non-organizer cannot mark contributions as paid or pending |
| **Pre-conditions** | Two users exist. User A is the organizer. User B is not. |
| **Steps** | 1. Log in as User B. 2. Attempt to call markContributionPaid for User A's committee. |
| **Expected Result** | The action returns { success: false, error: "Not authorized" } because verifyCommitteeOwnership fails. RLS also blocks the update. |
| **Status** | Pass |

### TC-CT-005: Contribution rows are pre-created for all months

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-CT-005 |
| **Description** | When a committee is created, contribution rows exist for every member for every month |
| **Pre-conditions** | A committee with 10 members and 10 months duration exists |
| **Steps** | 1. Check the contributions table. |
| **Expected Result** | 100 contribution rows exist (10 members times 10 months). All have status = "pending". due_date increments by month from the start date. |
| **Status** | Pass |

### TC-CT-006: Due dates are calculated correctly per month

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-CT-006 |
| **Description** | Each contribution's due_date is the start_date plus month_index months |
| **Pre-conditions** | Committee start_date is 2026-07-01 |
| **Steps** | 1. Check contribution rows for month_index 0, 1, 2. |
| **Expected Result** | Month 0 due_date = 2026-07-01. Month 1 = 2026-08-01. Month 2 = 2026-09-01. |
| **Status** | Pass |

### TC-CT-007: Dashboard pending count updates after marking paid

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-CT-007 |
| **Description** | The dashboard "Pending Payments" stat updates when a contribution is marked paid |
| **Pre-conditions** | A contribution is pending |
| **Steps** | 1. Note the dashboard pending count. 2. Mark a contribution as paid. 3. Return to the dashboard. |
| **Expected Result** | The pending count decreases by 1. The total collected increases by the contribution amount. |
| **Status** | Pass |

---

## 7. Draw Schedule Generation Test Cases

### TC-DS-001: Lottery draw generates a random schedule

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-DS-001 |
| **Description** | A lottery draw shuffles all members randomly |
| **Pre-conditions** | A committee with draw_type = "lottery" and 10 members |
| **Steps** | 1. Create the committee. 2. Check the draws table. |
| **Expected Result** | 10 draw rows exist. Each member appears exactly once. The order is random (differs across multiple test runs). |
| **Status** | Pass |

### TC-DS-002: Lottery draw - every member gets the pot exactly once

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-DS-002 |
| **Description** | The fairness guarantee: no member is duplicated or missing |
| **Pre-conditions** | Committee with 10 members, lottery draw |
| **Steps** | 1. Query all member_ids from the draws table. 2. Count unique values. |
| **Expected Result** | 10 unique member_ids, each appearing exactly once across months 0 through 9. |
| **Status** | Pass |

### TC-DS-003: Fixed draw preserves the provided order

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-DS-003 |
| **Description** | A fixed draw uses the organizer-provided order as-is |
| **Pre-conditions** | Committee with draw_type = "fixed" |
| **Steps** | 1. Create a committee with fixed draw type. 2. Check the draws table order. |
| **Expected Result** | Members appear in the same order as they were added (the insertion order). |
| **Status** | Pass |

### TC-DS-004: Auction draw stores placeholder order

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-DS-004 |
| **Description** | An auction draw stores a placeholder that can be updated monthly |
| **Pre-conditions** | Committee with draw_type = "auction" |
| **Steps** | 1. Create the committee. 2. Check the draws table. |
| **Expected Result** | Draw rows exist with members in their original insertion order (placeholder). These can be updated later when bids are placed. |
| **Status** | Pass |

### TC-DS-005: Draw amount equals monthly_amount times member_count

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-DS-005 |
| **Description** | Each draw's pot amount is calculated correctly |
| **Pre-conditions** | Committee with monthly_amount = 5000 and member_count = 10 |
| **Steps** | 1. Check the amount field of any draw row. |
| **Expected Result** | amount = 50000 (5000 times 10). |
| **Status** | Pass |

### TC-DS-006: Draw month_index is sequential from 0

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-DS-006 |
| **Description** | Draw rows have month_index values 0, 1, 2, ..., (duration - 1) with no gaps |
| **Pre-conditions** | Committee with duration 10 |
| **Steps** | 1. Query month_index values from the draws table. |
| **Expected Result** | Values are 0 through 9, each appearing exactly once. |
| **Status** | Pass |

### TC-DS-007: Members get draw_month_index updated

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-DS-007 |
| **Description** | Each member's draw_month_index is set to the month they receive the pot |
| **Pre-conditions** | Committee with 10 members |
| **Steps** | 1. Create the committee. 2. Check the members table. |
| **Expected Result** | Every member has a non-null draw_month_index between 0 and 9. Each value 0-9 is assigned to exactly one member. |
| **Status** | Pass |

### TC-DS-008: Draw schedule visible on committee detail page

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-DS-008 |
| **Description** | The draw schedule section shows each month, the winner name, and the date |
| **Pre-conditions** | A committee with draws exists |
| **Steps** | 1. Open the committee detail page. 2. Scroll to the "Draw Schedule" section. |
| **Expected Result** | A list shows entries like "M1, [Member Name], [Date], Rs. 50,000" for each month. |
| **Status** | Pass |

---

## 8. Dashboard Stats Accuracy Test Cases

### TC-DS-001 (STAT): Total committees count is correct

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-STAT-001 |
| **Description** | The dashboard shows the correct number of committees owned by the user |
| **Pre-conditions** | User has 3 committees |
| **Steps** | 1. Log in. 2. Open /dashboard. |
| **Expected Result** | "Total Committees" shows 3. |
| **Status** | Pass |

### TC-STAT-002: Total collected is the sum of all paid contributions

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-STAT-002 |
| **Description** | The total collected stat sums the amount of all "paid" contributions across all committees |
| **Pre-conditions** | User has contributions with mixed statuses |
| **Steps** | 1. Calculate the expected total manually. 2. Compare with the dashboard. |
| **Expected Result** | The dashboard "Total Collected" matches the manual calculation. Only "paid" contributions are counted. |
| **Status** | Pass |

### TC-STAT-003: Pending payments count is correct

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-STAT-003 |
| **Description** | The pending count reflects all "pending" contributions across all committees |
| **Pre-conditions** | User has contributions with mixed statuses |
| **Steps** | 1. Count pending contributions in the database. 2. Compare with dashboard. |
| **Expected Result** | The dashboard "Pending Payments" matches the database count. |
| **Status** | Pass |

### TC-STAT-004: Committee detail page stats match dashboard

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-STAT-004 |
| **Description** | Stats on the committee detail page are consistent with the dashboard |
| **Pre-conditions** | A committee exists with contributions |
| **Steps** | 1. Note the committee detail page "Total Collected". 2. Note the dashboard "Total Collected". 3. The dashboard total should be greater than or equal to the single committee total. |
| **Expected Result** | The numbers are consistent and do not contradict each other. |
| **Status** | Pass |

### TC-STAT-005: Empty state when no committees exist

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-STAT-005 |
| **Description** | A new user with no committees sees the empty state |
| **Pre-conditions** | User has 0 committees |
| **Steps** | 1. Log in as a new user. 2. Open /dashboard. |
| **Expected Result** | "Total Committees" = 0, "Total Collected" = Rs. 0, "Pending Payments" = 0. The committees section shows the empty state with a "Pehli Committee Banao" button. |
| **Status** | Pass |

### TC-STAT-006: Current month contributions filter is correct

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-STAT-006 |
| **Description** | The committee detail page shows contributions for the current month based on start_date |
| **Pre-conditions** | Committee started 2 months ago |
| **Steps** | 1. Open the committee detail page. 2. Check the "Is Mahine ki Payments" section. |
| **Expected Result** | Only contributions for month_index = 2 (current month relative to start) are shown. Paid and pending counts match. |
| **Status** | Pass |

---

## 9. RLS Security Test Cases

These tests verify that Row Level Security policies prevent users from
accessing or modifying data they do not own. They require two test
accounts (Organizer A and Organizer B).

### TC-RLS-001: User cannot read another user's committees

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-RLS-001 |
| **Description** | Organizer B cannot query Organizer A's committees |
| **Pre-conditions** | Organizer A has a committee. Organizer B is logged in. |
| **Steps** | 1. Log in as Organizer B. 2. Using the Supabase client, query committees where organizer_id = Organizer A's id. |
| **Expected Result** | The query returns 0 rows. The "Organizers manage their committees" RLS policy blocks the read. |
| **Status** | Pass |

### TC-RLS-002: User cannot read another user's members

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-RLS-002 |
| **Description** | Organizer B cannot read members belonging to Organizer A's committee |
| **Pre-conditions** | Organizer A has a committee with members |
| **Steps** | 1. Log in as Organizer B. 2. Query members where committee_id = Organizer A's committee. |
| **Expected Result** | 0 rows returned. The "Organizers manage members" policy blocks the read. |
| **Status** | Pass |

### TC-RLS-003: User cannot read another user's contributions

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-RLS-003 |
| **Description** | Organizer B cannot read Organizer A's contributions |
| **Pre-conditions** | Organizer A has contributions |
| **Steps** | 1. Log in as Organizer B. 2. Query contributions for Organizer A's committee. |
| **Expected Result** | 0 rows returned. |
| **Status** | Pass |

### TC-RLS-004: User cannot read another user's draws

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-RLS-004 |
| **Description** | Organizer B cannot read Organizer A's draw schedule |
| **Pre-conditions** | Organizer A has draws |
| **Steps** | 1. Log in as Organizer B. 2. Query draws for Organizer A's committee. |
| **Expected Result** | 0 rows returned. |
| **Status** | Pass |

### TC-RLS-005: User cannot mark another user's contribution

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-RLS-005 |
| **Description** | Organizer B cannot mark a contribution in Organizer A's committee as paid |
| **Pre-conditions** | Organizer A has a pending contribution |
| **Steps** | 1. Log in as Organizer B. 2. Call markContributionPaid with Organizer A's contribution_id and committee_id. |
| **Expected Result** | The action returns { success: false, error: "Not authorized" }. The contribution status remains "pending". |
| **Status** | Pass |

### TC-RLS-006: User can only view their own profile

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-RLS-006 |
| **Description** | A user can only select their own profile row |
| **Pre-conditions** | Two users exist |
| **Steps** | 1. Log in as User A. 2. Query profiles for User B's id. |
| **Expected Result** | 0 rows returned. The "Users can view own profile" policy blocks it. |
| **Status** | Pass |

### TC-RLS-007: Direct database insert is blocked by RLS

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-RLS-007 |
| **Description** | Organizer B cannot insert a committee with organizer_id set to Organizer A's id |
| **Pre-conditions** | Both users exist |
| **Steps** | 1. Log in as Organizer B. 2. Attempt to insert a committee with organizer_id = Organizer A's id. |
| **Expected Result** | The insert is blocked by the WITH CHECK clause of the RLS policy. |
| **Status** | Pass |

### TC-RLS-008: Member can view their own committee (future feature)

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-RLS-008 |
| **Description** | A member (with a user_id) can view the committee they belong to |
| **Pre-conditions** | A member row exists with user_id = logged-in user. Note: member claim flow is a Phase 2 feature. |
| **Steps** | 1. Log in as the member. 2. Query the committee they belong to. |
| **Expected Result** | The committee row is returned. The "Members can view their committees" policy (adjusted in migration 0002) allows this. |
| **Status** | Pending (feature not fully implemented yet) |

---

## 10. UI and E2E Test Cases

### TC-UI-001: Landing page loads correctly

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-UI-001 |
| **Description** | The landing page at / renders with the CommitteeKart branding |
| **Pre-conditions** | Dev server running |
| **Steps** | 1. Navigate to http://localhost:3000. |
| **Expected Result** | The page shows the CommitteeKart logo, a hero section, and links to login or signup. No console errors. |
| **Status** | Pass |

### TC-UI-002: Signup form layout and labels

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-UI-002 |
| **Description** | The signup page shows the correct form fields and Roman Urdu labels |
| **Pre-conditions** | User is logged out |
| **Steps** | 1. Navigate to /signup. |
| **Expected Result** | Form shows "Pura Naam", "Email", "Password" fields. Submit button says "Account Banao". Link to login is present. |
| **Status** | Pass |

### TC-UI-003: Login form layout and labels

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-UI-003 |
| **Description** | The login page shows the correct form fields and greeting |
| **Pre-conditions** | User is logged out |
| **Steps** | 1. Navigate to /login. |
| **Expected Result** | Page says "Wapas khush aamdeed!". Form shows email and password. Submit button says "Login". |
| **Status** | Pass |

### TC-UI-004: Dashboard shows user greeting and logout

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-UI-004 |
| **Description** | The dashboard greets the user by name and shows the logout button |
| **Pre-conditions** | User is logged in with full_name "Ali Khan" |
| **Steps** | 1. Navigate to /dashboard. |
| **Expected Result** | Heading says "Salam, Ali Khan!". The top nav shows the user email and a Logout button. |
| **Status** | Pass |

### TC-UI-005: Add and remove member rows dynamically

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-UI-005 |
| **Description** | The committee creation form lets the user add and remove member rows |
| **Pre-conditions** | User is on /committees/new |
| **Steps** | 1. Click "+ Add Member" multiple times. 2. Click "Remove". |
| **Expected Result** | Member rows are added and removed. At least 1 row always remains. |
| **Status** | Pass |

### TC-UI-006: Committee detail page renders all sections

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-UI-006 |
| **Description** | The committee detail page shows header, contributions, draw schedule, and members |
| **Pre-conditions** | A committee exists |
| **Steps** | 1. Open the committee detail page. |
| **Expected Result** | The page shows: committee header card with stats, "Is Mahine ki Payments" section with ContributionRow components, "Draw Schedule" section, and "Saare Members" list. |
| **Status** | Pass |

### TC-UI-007: ContributionRow button states

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-UI-007 |
| **Description** | The contribution toggle button shows correct visual states |
| **Pre-conditions** | A committee with mixed paid/pending contributions exists |
| **Steps** | 1. Open the committee detail page. 2. Observe the contribution rows. |
| **Expected Result** | Paid rows show a green "Paid" button. Pending rows show an amber "Pending" button. Clicking toggles the state with a loading indicator. |
| **Status** | Pass |

### TC-UI-008: Error message display on committee creation

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-UI-008 |
| **Description** | Validation errors are shown in a red error banner on the create page |
| **Pre-conditions** | User is on /committees/new |
| **Steps** | 1. Submit an invalid form (for example, duration not equal to member count). |
| **Expected Result** | The page reloads with a red error banner at the top showing the Roman Urdu validation message. |
| **Status** | Pass |

### TC-UI-009: Currency formatting

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-UI-009 |
| **Description** | All amounts are formatted as Pakistani Rupees |
| **Pre-conditions** | A committee exists with monthly_amount = 50000 |
| **Steps** | 1. View the dashboard and committee detail page. |
| **Expected Result** | Amounts display as "Rs. 50,000" (with the en-PK locale formatting). |
| **Status** | Pass |

### TC-UI-010: Mobile responsiveness

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-UI-010 |
| **Description** | Key pages are usable on a mobile-width viewport |
| **Pre-conditions** | Dev server running |
| **Steps** | 1. Open the browser DevTools device toolbar. 2. Set width to 375px (iPhone). 3. Check /login, /dashboard, /committees/new, and /committees/[id]. |
| **Expected Result** | All pages are readable and usable. Stat cards stack vertically. Forms are full width. No horizontal scrolling. |
| **Status** | Pass |

---

## 11. Known Issues and Limitations

### 11.1 No Automated Test Suite

The project currently has no unit, integration, or E2E test suites.
All testing is manual. This means regressions can be introduced without
detection until a user encounters them.

### 11.2 No Database Transactions

Committee creation is not wrapped in a database transaction (a Supabase
client limitation). If a step fails mid-creation, cascade cleanup
deletes the committee, but there is a small window where partial data
exists. A future improvement would use a Supabase Edge Function or RPC
to perform the entire creation atomically.

### 11.3 Member Claim Flow Not Implemented

Members can be added by name and phone, but there is no flow for a
member to "claim" their profile by linking their phone to a user account.
This is planned for Phase 2 but not yet built. Test case TC-RLS-008
depends on this.

### 11.4 No Email Confirmation Testing

If email confirmation is enabled in Supabase Auth, signup requires the
user to click an email link before logging in. This flow is not tested
in the current manual testing phase. In development, email confirmation
is typically disabled for convenience.

### 11.5 No Rate Limiting Tests

The app does not currently have rate limiting on login or signup
attempts. Brute-force attacks are not tested against.

### 11.6 Lottery Randomness Not Statistically Tested

The Fisher-Yates shuffle in `draw-schedule.ts` is correct by algorithm,
but no statistical test verifies that the output distribution is uniform
across many runs.

### 11.7 Time Zone Sensitivity

The "current month" calculation on the committee detail page uses the
server's local time. If the server time zone differs from the user's
time zone, the current month index may be off by one near month
boundaries.

### 11.8 No Cross-Browser Testing

Testing is done on the developer's primary browser. Cross-browser
testing (Chrome, Firefox, Safari, Edge) is not yet performed.

---

## 12. Future Testing Improvements

### 12.1 Automated Unit Tests with Vitest

**Tool:** Vitest

**Priority targets:**
- `src/lib/draw-schedule.ts` - Test all three draw types, edge cases
  (0 members, mismatched counts), and the shuffle fairness
- `src/lib/utils.ts` - Test formatCurrency, formatDate, getInitials,
  addMonths with various inputs

**Example test file structure:**
```
src/lib/__tests__/draw-schedule.test.ts
src/lib/__tests__/utils.test.ts
```

### 12.2 Integration Tests with Supabase Local

**Tool:** Vitest + Supabase CLI (local Docker instance)

**Approach:** Spin up a local Supabase instance via Docker, run migrations,
and test Server Actions against real database tables with RLS enabled.

### 12.3 E2E Tests with Playwright

**Tool:** Playwright

**Critical user journeys to automate:**
1. Signup -> Dashboard -> Create Committee -> View Detail -> Mark Paid
2. Login -> Dashboard -> Logout
3. Protected route access when logged out
4. RLS isolation between two users

### 12.4 CI/CD Pipeline with GitHub Actions

**Trigger:** On every pull request and push to main

**Pipeline stages:**
1. Install dependencies (`npm ci`)
2. Lint (`npm run lint`)
3. Type check (`npx tsc --noEmit`)
4. Build (`npm run build`)
5. Run unit tests (when implemented)
6. Run E2E tests (when implemented, against a preview deployment)

### 12.5 Visual Regression Testing

**Tool:** Playwright snapshots or Chromatic

**Purpose:** Catch unintended UI changes by comparing screenshots across
builds.

### 12.6 Load Testing

**Tool:** k6 or Artillery

**Purpose:** Verify the app handles realistic load. Supabase free tier
has connection limits, so understanding the ceiling is important before
scaling.

### 12.7 Security Testing

**Tools:** Supabase CLI (RLS policy testing), OWASP ZAP

**Purpose:** Systematically verify every RLS policy and check for common
web vulnerabilities (XSS, CSRF, injection).

### 12.8 Test Coverage Tracking

**Tool:** Istanbul/c8 (via Vitest)

**Target:** 80% or higher coverage on `src/lib/` and `src/app/*/actions.ts`
files, which contain the core business logic.

---

## Appendix A: Test Case ID Convention

Test case IDs follow the pattern `TC-{AREA}-{NUMBER}`:

| Prefix | Area |
|--------|------|
| TC-AUTH | Authentication |
| TC-CC | Committee Creation |
| TC-CT | Contribution Tracking |
| TC-DS | Draw Schedule |
| TC-STAT | Dashboard Stats |
| TC-RLS | Row Level Security |
| TC-UI | UI and E2E |

---

## Appendix B: Quick Test Runbook

For a fast smoke test before any deployment:

1. Start the dev server (`npm run dev`)
2. Open an incognito browser at http://localhost:3000
3. Sign up with a new email (TC-AUTH-001)
4. Verify the dashboard empty state (TC-STAT-005)
5. Create a committee with 5 members and 5 months duration (TC-CC-001)
6. Verify the committee detail page renders (TC-UI-006)
7. Mark one contribution as paid (TC-CT-001)
8. Check the dashboard stats updated (TC-STAT-002)
9. Log out and log back in (TC-AUTH-007, TC-AUTH-005)
10. Run `npm run build` to verify the production build passes

If all 10 steps pass, the app is in a deployable state for a smoke
check.
