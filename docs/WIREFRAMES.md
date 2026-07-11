# CommitteeKart Wireframes

ASCII wireframes for every screen in the application. Each wireframe
shows the layout, key components, and navigation structure.

Status legend:
- IMPLEMENTED: the screen exists and is functional in the current codebase
- PLANNED: the screen is designed but not yet built

Brand colors used in the real UI:
- Primary: deep green (#0F766E)
- Accent: amber (#F59E0B)
- Background: light neutral
- Card: white


---

## Table of Contents

1. Landing Page (IMPLEMENTED)
2. Login Page (IMPLEMENTED)
3. Signup Page (IMPLEMENTED)
4. Dashboard, Organizer View (IMPLEMENTED)
5. Create Committee Form (IMPLEMENTED)
6. Committee Detail Page (IMPLEMENTED)
   - Overview and stats
   - Current month contributions
   - Draw schedule
   - Members list
7. Settings / Profile Page (PLANNED)
8. Navigation Map


---

## 1. Landing Page (IMPLEMENTED)

Route: `/`
Source: `src/app/page.tsx`

```
+--------------------------------------------------------------------+
|  CommitteeKart                          [ Login ]  [ Get Started ]  |
+--------------------------------------------------------------------+
|                                                                    |
|                                                                    |
|                        (* ) Track, Don't Hold                      |
|                                                                    |
|                 Aapki committee,                                   |
|                 sahi tarah manage                                  |
|                                                                    |
|        CommitteeKart se apni savings committee ko digital          |
|        banayein. Payments track karein, draw schedule set          |
|        karein, aur sab kuch transparent rakhein.                   |
|                                                                    |
|           [ Free Shuru Karein ]    [ Login Karein ]                |
|                                                                    |
|         No credit card required. Ham pesa hold nahi karte.         |
|                                                                    |
|                                                                    |
+--------------------------------------------------------------------+
|                                                                    |
|  +-----------------+  +-----------------+  +-----------------+     |
|  |  (primary bg)   |  |  (amber bg)     |  |  (success bg)   |     |
|  |                 |  |                 |  |                 |     |
|  |  Payment        |  |  Draw Schedule  |  |  Full           |     |
|  |  Tracking       |  |                 |  |  Transparency   |     |
|  |                 |  |                 |  |                 |     |
|  |  Har member ka  |  |  Auto generate  |  |  Sab members    |     |
|  |  payment record |  |  draw schedule. |  |  dekh sakte     |     |
|  |  sab kuch ek    |  |  Har member ko  |  |  hain apni      |     |
|  |  nazar mein.    |  |  pata kab hai.  |  |  records.       |     |
|  +-----------------+  +-----------------+  +-----------------+     |
|                                                                    |
+--------------------------------------------------------------------+
|  CommitteeKart. Built with Next.js and Supabase.                   |
+--------------------------------------------------------------------+
```

Components:
- Top nav: logo on left, Login and Get Started buttons on right
- Hero section: badge, headline (primary green highlight), subtitle
- CTA buttons: primary (green) and secondary (outlined)
- Features grid: 3 cards with icons and descriptions
- Footer: simple text

Navigation:
- "Get Started" and "Free Shuru Karein" go to /signup
- "Login" and "Login Karein" go to /login


---

## 2. Login Page (IMPLEMENTED)

Route: `/login`
Source: `src/app/(auth)/login/page.tsx`

```
+--------------------------------------------------------------------+
|                                                                    |
|                       (primary green gradient background)          |
|                                                                    |
|                        CommitteeKart                                |
|                                                                    |
|         +------------------------------------------------+         |
|         |                                                |         |
|         |  Wapas khush aamdeed!                          |         |
|         |  Apna account login karein                     |         |
|         |                                                |         |
|         |  +--------------------------------------------+|         |
|         |  | (danger bg) Error: <message>              ||         |
|         |  +--------------------------------------------+|         |
|         |  (shown only if ?error= in URL)               |         |
|         |                                                |         |
|         |  +--------------------------------------------+|         |
|         |  | (success bg) <message>                    ||         |
|         |  +--------------------------------------------+|         |
|         |  (shown only if ?message= in URL)             |         |
|         |                                                |         |
|         |  Email                                         |         |
|         |  +--------------------------------------------+|         |
|         |  | aap@example.com                            ||         |
|         |  +--------------------------------------------+|         |
|         |                                                |         |
|         |  Password                                      |         |
|         |  +--------------------------------------------+|         |
|         |  | Apna password                              ||         |
|         |  +--------------------------------------------+|         |
|         |                                                |         |
|         |  +--------------------------------------------+|         |
|         |  |               Login                       ||         |
|         |  +--------------------------------------------+|         |
|         |                                                |         |
|         |  Account nahi hai? Sign up karein             |         |
|         |                                                |         |
|         +------------------------------------------------+         |
|                                                                    |
+--------------------------------------------------------------------+
```

Components:
- Centered card on a green gradient background
- Logo link back to /
- Error alert (conditional, danger styling)
- Success alert (conditional, success styling)
- Email input
- Password input
- Login button (primary green)
- Signup link

Navigation:
- "Login" submits to login() server action, redirects to /dashboard
- "Sign up karein" goes to /signup


---

## 3. Signup Page (IMPLEMENTED)

Route: `/signup`
Source: `src/app/(auth)/signup/page.tsx`

```
+--------------------------------------------------------------------+
|                                                                    |
|                       (primary green gradient background)          |
|                                                                    |
|                        CommitteeKart                                |
|                                                                    |
|         +------------------------------------------------+         |
|         |                                                |         |
|         |  Account banayein                              |         |
|         |  Free shuru karein, credit card ki zaroorat    |         |
|         |  nahi                                          |         |
|         |                                                |         |
|         |  +--------------------------------------------+|         |
|         |  | (danger bg) Error: <message>              ||         |
|         |  +--------------------------------------------+|         |
|         |  (shown only if ?error= in URL)               |         |
|         |                                                |         |
|         |  Pura Naam                                     |         |
|         |  +--------------------------------------------+|         |
|         |  | Ali Khan                                   ||         |
|         |  +--------------------------------------------+|         |
|         |                                                |         |
|         |  Email                                         |         |
|         |  +--------------------------------------------+|         |
|         |  | aap@example.com                            ||         |
|         |  +--------------------------------------------+|         |
|         |                                                |         |
|         |  Password                                      |         |
|         |  +--------------------------------------------+|         |
|         |  | Kam az kam 6 characters                   ||         |
|         |  +--------------------------------------------+|         |
|         |                                                |         |
|         |  +--------------------------------------------+|         |
|         |  |             Account Banao                  ||         |
|         |  +--------------------------------------------+|         |
|         |                                                |         |
|         |  Pehle se account hai? Login karein           |         |
|         |                                                |         |
|         +------------------------------------------------+         |
|                                                                    |
+--------------------------------------------------------------------+
```

Components:
- Centered card on green gradient background
- Logo link back to /
- Error alert (conditional)
- Full name input
- Email input
- Password input (min 6 chars enforced)
- Signup button (primary green)
- Login link

Navigation:
- "Account Banao" submits to signup() server action
- On success redirects to /dashboard (or /login if email confirmation on)
- "Login karein" goes to /login


---

## 4. Dashboard, Organizer View (IMPLEMENTED)

Route: `/dashboard`
Source: `src/app/(dashboard)/dashboard/page.tsx`

```
+--------------------------------------------------------------------+
|  CommitteeKart                          user@email.com  [ Logout ]  |
+--------------------------------------------------------------------+
|                                                                    |
|  Salam, Ali Khan!                                  +-----------+   |
|  Yahan aap apni committees                          | New      |   |
|  dekhenge aur manage karenge.                       | Committee|   |
|                                                     +-----------+   |
|                                                                    |
|  +------------------+  +------------------+  +------------------+  |
|  | Total Committees |  | Total Collected  |  | Pending Payments |  |
|  |                  |  |                  |  |                  |  |
|  |       3          |  |  Rs. 150,000     |  |       7          |  |
|  +------------------+  +------------------+  +------------------+  |
|                                                                    |
|  Meri Committees                                                   |
|                                                                    |
|  +----------------------------+  +----------------------------+    |
|  | Office Committee   [active]|  | Family Committee  [active]|    |
|  | Monthly committee          |  | Ghar ki committee          |    |
|  |                            |  |                            |    |
|  | Monthly  Members  Draw     |  | Monthly  Members  Draw     |    |
|  | Rs.5000  10       lottery  |  | Rs.10000  5       fixed    |    |
|  +----------------------------+  +----------------------------+    |
|                                                                    |
|  +----------------------------+                                    |
|  | Shop Committee    [active] |                                    |
|  | Dukan walon ki committee   |                                    |
|  |                            |                                    |
|  | Monthly  Members  Draw     |                                    |
|  | Rs.3000  8        auction  |                                    |
|  +----------------------------+                                    |
|                                                                    |
+--------------------------------------------------------------------+
```

Empty state (no committees yet):

```
+--------------------------------------------------------------------+
|  CommitteeKart                          user@email.com  [ Logout ]  |
+--------------------------------------------------------------------+
|                                                                    |
|  Salam, Ali Khan!                                  +-----------+   |
|  Yahan aap apni committees                          | New      |   |
|  dekhenge aur manage karenge.                       | Committee|   |
|                                                     +-----------+   |
|                                                                    |
|  +------------------+  +------------------+  +------------------+  |
|  | Total Committees |  | Total Collected  |  | Pending Payments |  |
|  |       0          |  |   Rs. 0          |  |       0          |  |
|  +------------------+  +------------------+  +------------------+  |
|                                                                    |
|  Meri Committees                                                   |
|                                                                    |
|  +----------------------------------------------------------+     |
|  |  (dashed border)                                         |     |
|  |                                                          |     |
|  |                       (clipboard icon)                   |     |
|  |                                                          |     |
|  |             Abhi koi committee nahi hai                  |     |
|  |                                                          |     |
|  |    Apni pehli committee banayein aur members add         |     |
|  |    karna shuru karein.                                   |     |
|  |                                                          |     |
|  |             [ Pehli Committee Banao ]                    |     |
|  |                                                          |     |
|  +----------------------------------------------------------+     |
|                                                                    |
+--------------------------------------------------------------------+
```

Components:
- Top nav bar: logo, user email, Logout button
- Welcome header with user's display name
- "New Committee" button (primary green)
- Stats grid: 3 cards showing totals
- Committees list: clickable cards with status badge, monthly amount,
  member count, draw type
- Empty state with call to action

Navigation:
- Clicking a committee card goes to /committees/<id>
- "New Committee" button goes to /committees/new
- "Logout" submits to logout() action, redirects to /login


---

## 5. Create Committee Form (IMPLEMENTED)

Route: `/committees/new`
Source: `src/app/(dashboard)/committees/new/page.tsx`

```
+--------------------------------------------------------------------+
|  <- Dashboard                                   New Committee       |
+--------------------------------------------------------------------+
|                                                                    |
|         +------------------------------------------------------+   |
|         | (danger bg) Error: <message>                          |   |
|         +------------------------------------------------------+   |
|         (shown only if ?error= in URL)                              |
|                                                                    |
|         +------------------------------------------------------+   |
|         | Committee ki Details                                  |   |
|         |                                                       |   |
|         |  Committee ka Naam *                                  |   |
|         |  +--------------------------------------------------+ |   |
|         |  | e.g. Office Committee                             | |   |
|         |  +--------------------------------------------------+ |   |
|         |                                                       |   |
|         |  Description (optional)                               |   |
|         |  +--------------------------------------------------+ |   |
|         |  | Committee ke baare mein kuch info...             | |   |
|         |  +--------------------------------------------------+ |   |
|         |                                                       |   |
|         |  Monthly Amount (Rs.) *     Duration (Months) *       |   |
|         |  +--------------------+     +--------------------+   |   |
|         |  | 5000               |     | 10                 |   |   |
|         |  +--------------------+     +--------------------+   |   |
|         |                              Duration aur total       |   |
|         |                              members barabar hone     |   |
|         |                              chahiye. Har member      |   |
|         |                              ko ek baar pot milta hai|   |
|         |                                                       |   |
|         |  Draw Type *                                          |   |
|         |  +--------------------------------------------------+ |   |
|         |  | Lottery (Random)                          [v]     | |   |
|         |  +--------------------------------------------------+ |   |
|         |  Lottery = random. Fixed = aap decide. Auction = bid.|   |
|         |                                                       |   |
|         |  Start Date *                                         |   |
|         |  +--------------------------------------------------+ |   |
|         |  | [ date picker ]                                   | |   |
|         |  +--------------------------------------------------+ |   |
|         +------------------------------------------------------+   |
|                                                                    |
|         +------------------------------------------------------+   |
|         | Members                                               |   |
|         | Aap khud automatically pehle member ho. Dusre        |   |
|         | members yahan add karein.                             |   |
|         |                                                       |   |
|         |  +--------------------------+  +------------------+  |   |
|         |  | Member 2 ka naam         |  | Phone (optional) |  |   |
|         |  +--------------------------+  +------------------+  |   |
|         |                                                       |   |
|         |  +--------------------------+  +------------------+  |   |
|         |  | Member 3 ka naam         |  | Phone (optional) |  |   |
|         |  +--------------------------+  +------------------+  |   |
|         |                                                       |   |
|         |  [ + Add Member ]   [ - Remove ]                      |   |
|         +------------------------------------------------------+   |
|                                                                    |
|         +------------------------------------------------------+   |
|         |                  Create Committee                    |   |
|         +------------------------------------------------------+   |
|                                                                    |
+--------------------------------------------------------------------+
```

Draw type dropdown options:

```
+--------------------------------------------------+
| Lottery (Random)                          [v]    |
+--------------------------------------------------+
When open:
  o Lottery (Random)        <- random shuffle
  o Fixed Order             <- organizer decides order
  o Auction (Bidding)       <- monthly bidding (placeholder)
+--------------------------------------------------+
```

Components:
- Top nav with back link and page title
- Error alert (conditional)
- Section 1: Committee Details card
  - Name (required)
  - Description (optional)
  - Monthly Amount (required, min 100)
  - Duration in Months (required, 1 to 60)
  - Draw Type dropdown (required)
  - Start Date (required)
- Section 2: Members card
  - Dynamic member rows (add or remove)
  - Each row: name input + optional phone input
  - Note: organizer is automatically member 1
- Submit button (full width, primary green)

Behavior:
- "Add Member" adds a new empty row
- "Remove" removes the last row (keeps at least 1)
- Member count label starts at index 2 (because organizer is member 1)
- Form submits to createCommittee() server action

Navigation:
- Back arrow goes to /dashboard
- On success redirects to /committees/<new-committee-id>
- On validation error redirects to /committees/new?error=<message>


---

## 6. Committee Detail Page (IMPLEMENTED)

Route: `/committees/[id]`
Source: `src/app/(dashboard)/committees/[id]/page.tsx`

This page has four main sections shown in a vertical scroll.

### 6a. Full Page Overview

```
+--------------------------------------------------------------------+
|  <- Dashboard                              Office Committee        |
+--------------------------------------------------------------------+
|                                                                    |
|  +--------------------------------------------------------------+ |
|  | Office Committee                                  [active]   | |
|  | Monthly office committee                                     | |
|  |                                                              | |
|  |  Monthly Amount    Total Pot      Members     Duration       | |
|  |  Rs. 5,000         Rs. 50,000     10          10 months      | |
|  +--------------------------------------------------------------+ |
|                                                                    |
|  +--------------------------------------------------------------+ |
|  | Is Mahine ki Payments         (success) 7 Paid               | |
|  | Total Collected: Rs. 150,000  (warning) 3 Pending            | |
|  |                                                              | |
|  |  +--------------------------------------------------------+ | |
|  |  | (AK) Ali Khan            Rs. 5,000     [  Paid  ]      | | |
|  |  +--------------------------------------------------------+ | |
|  |  | (SK) Sara Khan            Rs. 5,000     [ Pending ]     | | |
|  |  +--------------------------------------------------------+ | |
|  |  | (BK) Bilal Khan           Rs. 5,000     [  Paid  ]      | | |
|  |  +--------------------------------------------------------+ | |
|  |  | (FK) Fatima Khan          Rs. 5,000     [ Pending ]     | | |
|  |  +--------------------------------------------------------+ | |
|  |                    ... more rows ...                        | |
|  +--------------------------------------------------------------+ |
|                                                                    |
|  +--------------------------------------------------------------+ |
|  | Draw Schedule                                                | |
|  | Kaunse member ko kab pot milega (lottery draw)               | |
|  |                                                              | |
|  |  (M1) Ali Khan           [scheduled]          Rs. 50,000     | |
|  |       15 Jul 2026                                            | |
|  |  (M2) Sara Khan          [scheduled]          Rs. 50,000     | |
|  |       15 Aug 2026                                            | |
|  |  (M3) Bilal Khan         [scheduled]          Rs. 50,000     | |
|  |       15 Sep 2026                                            | |
|  |                    ... more months ...                       | |
|  +--------------------------------------------------------------+ |
|                                                                    |
|  +--------------------------------------------------------------+ |
|  | Saare Members (10)                                           | |
|  |                                                              | |
|  |  (AK) Ali Khan [Organizer]              Pot: Month 1         | |
|  |  (SK) Sara Khan                         Pot: Month 2         | |
|  |  (BK) Bilal Khan                        Pot: Month 3         | |
|  |  (FK) Fatima Khan                       Pot: Month 4         | |
|  |                    ... more members ...                      | |
|  +--------------------------------------------------------------+ |
|                                                                    |
+--------------------------------------------------------------------+
```

### 6b. Contribution Row Detail (interactive)

Each contribution row is a client component with a toggle button.

```
+--------------------------------------------------------+
| (primary bg)                                      |     |
|  (AK)  Ali Khan        Rs. 5,000              [Paid] | <- green badge
|                                                       |    click to unmark
+--------------------------------------------------------+

+--------------------------------------------------------+
| (primary bg)                                      |     |
|  (SK)  Sara Khan       Rs. 5,000          [Pending]  | <- amber badge
|                                                       |    click to mark paid
+--------------------------------------------------------+

During update (button disabled, shows "..."):
+--------------------------------------------------------+
| (AK)  Ali Khan        Rs. 5,000               [ ... ] |
+--------------------------------------------------------+

On error:
+--------------------------------------------------------+
| (SK)  Sara Khan       Rs. 5,000          [Pending]    |
| (danger text) Database update failed                  |
+--------------------------------------------------------+
```

### 6c. Section: Committee Header Card

```
+--------------------------------------------------------------+
| Office Committee                                  [active]   |
| Monthly office committee                                     |
|                                                              |
|  Monthly Amount    Total Pot      Members     Duration       |
|  Rs. 5,000         Rs. 50,000     10          10 months      |
+--------------------------------------------------------------+
```

Shows: name, description, status badge (success colored), and a 4 column
stats grid. Total Pot = monthlyAmount * memberCount.

### 6d. Section: Current Month Contributions

```
+--------------------------------------------------------------+
| Is Mahine ki Payments         (success) 7 Paid               |
| Total Collected: Rs. 150,000  (warning) 3 Pending            |
|                                                              |
|  (list of contribution rows for the current month)           |
+--------------------------------------------------------------+
```

Shows contributions only for the current month index. Each row has an
avatar with member initials, member name, amount, and a toggle button.

### 6e. Section: Draw Schedule

```
+--------------------------------------------------------------+
| Draw Schedule                                                |
| Kaunse member ko kab pot milega (lottery draw)               |
|                                                              |
|  (M1) Ali Khan                              Rs. 50,000       |
|       15 Jul 2026                                            |
|  (M2) Sara Khan                             Rs. 50,000       |
|       15 Aug 2026                                            |
+--------------------------------------------------------------+
```

Each entry shows: month badge (amber), winner name, date (computed from
start date plus month offset), and the pot amount.

### 6f. Section: All Members

```
+--------------------------------------------------------------+
| Saare Members (10)                                           |
|                                                              |
|  (AK) Ali Khan [Organizer]              Pot: Month 1         |
|  (SK) Sara Khan                         Pot: Month 2         |
|  (BK) Bilal Khan +92 300 1234567        Pot: Month 3         |
+--------------------------------------------------------------+
```

Each member shows: initials avatar (primary green), name, organizer tag
for index 0, optional phone, and their assigned draw month.

Navigation:
- Back arrow goes to /dashboard
- Contribution toggle calls markContributionPaid or markContributionPending


---

## 7. Settings / Profile Page (PLANNED)

Route: `/settings` (not yet implemented)
Status: PLANNED

This screen is designed for a future release. It will let users
manage their profile and subscription plan.

```
+--------------------------------------------------------------------+
|  <- Dashboard                                   Settings            |
+--------------------------------------------------------------------+
|                                                                    |
|  +--------------------------------------------------------------+ |
|  | Profile                                                       | |
|  |                                                               | |
|  |  Pura Naam                                                    | |
|  |  +----------------------------------------------------------+ | |
|  |  | Ali Khan                                                 | | |
|  |  +----------------------------------------------------------+ | |
|  |                                                               | |
|  |  Email                                                        | |
|  |  +----------------------------------------------------------+ | |
|  |  | ali@example.com                                  (locked)| | |
|  |  +----------------------------------------------------------+ | |
|  |                                                               | |
|  |  Phone                                                        | |
|  |  +----------------------------------------------------------+ | |
|  |  | +92 300 1234567                                          | | |
|  |  +----------------------------------------------------------+ | |
|  |                                                               | |
|  |  [ Save Changes ]                                             | |
|  +--------------------------------------------------------------+ |
|                                                                    |
|  +--------------------------------------------------------------+ |
|  | Subscription Plan                                             | |
|  |                                                               | |
|  |  +--------------------+  +--------------------+               | |
|  |  | (current)          |  |                    |               | |
|  |  | FREE               |  | PRO                 |               | |
|  |  |                    |  |                     |               | |
|  |  | - 3 committees     |  | - Unlimited         |               | |
|  |  | - Basic tracking   |  |   committees        |               | |
|  |  | - Lottery draws    |  | - All draw types    |               | |
|  |  |                    |  | - Priority support  |               | |
|  |  | [ Current Plan ]   |  | [ Upgrade to Pro ]  |               | |
|  |  +--------------------+  +--------------------+               | |
|  |                                                               | |
|  |  +--------------------+                                       | |
|  |  | PREMIUM            |                                       | |
|  |  |                    |                                       | |
|  |  | - Everything in Pro|                                       | |
|  |  | - White label      |                                       | |
|  |  | - API access       |                                       | |
|  |  | - Dedicated support|                                       | |
|  |  |                    |                                       | |
|  |  | [ Upgrade ]        |                                       | |
|  |  +--------------------+                                       | |
|  +--------------------------------------------------------------+ |
|                                                                    |
|  +--------------------------------------------------------------+ |
|  | Danger Zone                                                   | |
|  |                                                               | |
|  |  [ Delete Account ]                                           | |
|  |  This will permanently delete your account and all data.      | |
|  +--------------------------------------------------------------+ |
|                                                                    |
+--------------------------------------------------------------------+
```

Planned components:
- Profile card: edit full name, phone (email locked)
- Subscription card: Free (current), Pro, Premium tiers
- Danger zone: account deletion (cascade)

Planned queries:
- select from profiles where id = user.id
- update profiles set full_name, phone where id = user.id
- update profiles set plan = <tier> where id = user.id

Note: the profile table already has the plan column and the plan_tier
enum. The backend schema is ready. Only the UI is missing.


---

## 8. Navigation Map

Shows how all screens connect to each other.

```
                     +------------------+
                     |  Landing Page    |
                     |  /               |
                     +------------------+
                        |             |
               [Login]   |             |  [Get Started]
                        v             v
              +-------------+   +-------------+
              | Login Page  |   | Signup Page |
              | /login      |   | /signup     |
              +-------------+   +-------------+
                   |   ^              |   |
        [success]  |   | [link]       |   | [link]
                   v   |              v   |
              +---------------------------+
              |       Dashboard           |
              |       /dashboard          |
              +---------------------------+
                   |            ^
       [New Comm.] |            | [back]
                   v            |
         +-----------------+    |
         | Create Committee|    |
         | /committees/new |----+ [on success: redirect to detail]
         +-----------------+
                   |
                   v
         +---------------------------+
         | Committee Detail Page     |
         | /committees/[id]          |
         +---------------------------+
              |          |          |
       [back] |          |          |
              v          v          v
         (Dashboard)  (toggle    (Dashboard)
                      payments)


PLANNED navigation (not yet built):

              +---------------------------+
   Dashboard -|> Settings / Profile       |
              |  /settings (PLANNED)      |
              +---------------------------+
```


---

## Component Inventory

| Component              | Type     | Status       | Source File                                    |
|------------------------|----------|--------------|------------------------------------------------|
| Landing page           | Server   | IMPLEMENTED  | src/app/page.tsx                               |
| Login page             | Server   | IMPLEMENTED  | src/app/(auth)/login/page.tsx                  |
| Signup page            | Server   | IMPLEMENTED  | src/app/(auth)/signup/page.tsx                 |
| Dashboard              | Server   | IMPLEMENTED  | src/app/(dashboard)/dashboard/page.tsx         |
| Create Committee       | Client   | IMPLEMENTED  | src/app/(dashboard)/committees/new/page.tsx    |
| Committee Detail       | Server   | IMPLEMENTED  | src/app/(dashboard)/committees/[id]/page.tsx   |
| ContributionRow        | Client   | IMPLEMENTED  | src/components/committees/ContributionRow.tsx  |
| Settings / Profile     | Server   | PLANNED      | not yet created                                |
| Member invite flow     | -        | PLANNED      | not yet created                                |
| Mobile responsive nav  | -        | PLANNED      | not yet created                                |
