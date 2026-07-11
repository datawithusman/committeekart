# CommitteeKart Flowcharts

Activity diagrams and process flows for the CommitteeKart application.
All diagrams are text based (ASCII) and describe the exact behavior
implemented in the source code.

> Core principle: **Track, Don't Hold**. The app records contributions
> and schedules draws. It never touches or holds any money.

Legend for all diagrams:

```
[ ... ]        = step or action
( ... )        = start or end point
< condition? > = decision diamond, branches YES / NO
-->            = flow arrow
==>            = redirect or navigation
[DB: ...]      = database operation
[AUTH: ...]    = Supabase Auth operation


---

## Table of Contents

1. User Registration Flow
2. Login and Authentication Flow
3. Committee Creation Flow
4. Monthly Contribution Tracking Flow
5. Draw Schedule Generation Flow
lottery, fixed, auction
6. Payment Status Update Flow
7. Logout Flow
8. Page Access and Authorization Flow


---

## 1. User Registration Flow

Describes what happens when a new user signs up via the signup page.
The signup server action lives in `src/app/(auth)/actions.ts`.

```
( START: visitor on /signup )
        |
        v
[ User fills signup form ]
  - fullName
  - email
  - password (min 6 chars)
        |
        v
[ Form submits to signup() server action ]
        |
        v
[ Action reads email, password, fullName from FormData ]
        |
        v
[ AUTH: supabase.auth.signUp({ email, password, options: { data: { full_name } } }) ]
        |
        v
< Signup successful? >
        |
        +-- NO --> [ Read error code ]
        |               |
        |               v
        |          < Which error? >
        |               |
        |               +-- invalid_credentials --> "Email ya password ghalat hai."
        |               +-- email_taken --> "Yeh email pehle se registered hai."
        |               +-- weak_password --> "Password kam az kam 6 characters ka hona chahiye."
        |               +-- other --> "Kuch masla ho gaya. Dobara koshish karein."
        |               |
        |               v
        |          ==> /signup?error=<message>
        |
        +-- YES --> [ New row created in auth.users ]
                        |
                        v
                [ DB TRIGGER: on_auth_user_created fires ]
                        |
                        v
                [ DB: handle_new_user() inserts row into profiles ]
                  - id = new.id
                  - email = new.email
                  - full_name = coalesce(raw_user_meta_data->>'full_name', '')
                        |
                        v
                < Session created? (email confirmation setting) >
                        |
                        +-- NO (confirmation required)
                        |       |
                        |       v
                        |   ==> /login?message="Account bana! Ab login karein."
                        |
                        +-- YES (confirmation disabled, common in dev)
                                |
                                v
                        [ revalidatePath("/") ]
                                |
                                v
                        ==> /dashboard
                                |
                                v
                        ( END: user logged in )

Notes:
- The profile row is created automatically by a PostgreSQL trigger,
  not by application code. The app never manually inserts into profiles.
- The plan defaults to "free" as defined in the table schema.
- Email confirmation behavior depends on the Supabase project settings.


---

## 2. Login and Authentication Flow

Describes the login process for returning users.
The login server action lives in `src/app/(auth)/actions.ts`.

```
( START: user on /login )
        |
        v
[ User fills login form ]
  - email
  - password
        |
        v
[ Form submits to login() server action ]
        |
        v
[ Action reads email, password from FormData ]
        |
        v
[ AUTH: supabase.auth.signInWithPassword({ email, password }) ]
        |
        v
< Login successful? >
        |
        +-- NO --> [ Read error code ]
        |               |
        |               v
        |          [ Map to Roman Urdu message ]
        |               |
        |               v
        |          ==> /login?error=<message>
        |
        +-- YES --> [ Supabase sets auth cookies on response ]
                        |
                        v
                [ revalidatePath("/", "layout") ]
                        |
                        v
                ==> /dashboard
                        |
                        v
                ( END: user authenticated )

Notes:
- Auth state is stored in cookies managed by @supabase/ssr.
- The server client reads cookies from the request and writes
  refreshed cookies back via the setAll callback.
- Subsequent server requests use these cookies to identify the user
  through supabase.auth.getUser().


---

## 3. Committee Creation Flow

Describes the full process of creating a committee with members.
This is the most complex flow in the app.
The createCommittee server action lives in
`src/app/(dashboard)/committees/actions.ts`.

```
( START: organizer on /committees/new )
        |
        v
[ User fills create committee form ]
  - name, description
  - monthlyAmount, durationMonths
  - drawType (lottery, fixed, auction)
  - startDate
  - members (member_0, member_1, ... with optional phones)
        |
        v
[ Form submits to createCommittee() server action ]
        |
        v
[ AUTH: supabase.auth.getUser() ]
        |
        v
< User logged in? >
        |
        +-- NO --> ==> /login
        |
        +-- YES
                |
                v
        [ Extract and trim all fields from FormData ]
                |
                v
        [ Parse members: iterate member_0, member_1, ... ]
          - organizer is automatically member 1
          - totalMemberCount = entered members + 1
                |
                v
        +---------+---------+---------+---------+
        | VALIDATION GATEWAY (all must pass)    |
        +---------------------------------------+
        | 1. name: 1 to 100 chars?              |
        | 2. monthlyAmount >= 100?              |
        | 3. durationMonths: 1 to 60?           |
        | 4. drawType valid enum?               |
        | 5. startDate valid date?              |
        | 6. totalMemberCount >= 2?             |
        | 7. durationMonths == totalMemberCount |
        |    (ROSCA fairness guarantee)         |
        | 8. each member name <= 100 chars?     |
        +---------------------------------------+
                |
        < All validations pass? >
                |
                +-- NO --> ==> /committees/new?error=<message>
                |
                +-- YES
                        |
                        v
                [ DB: insert into committees ]
                  - organizer_id = user.id
                  - status = "active"
                        |
                        v
                < Committee inserted? >
                        |
                        +-- NO --> ==> /committees/new?error=...
                        |
                        +-- YES
                                |
                                v
                        [ DB: select full_name from profiles where id = user.id ]
                                |
                                v
                        [ Build members array ]
                          - member 1 = organizer (user_id = user.id)
                          - other members (user_id = null, name + phone only)
                                |
                                v
                        [ DB: insert into members (all rows at once) ]
                          - returns inserted rows with generated IDs
                                |
                                v
                        < Members inserted? >
                                |
                                +-- NO --> [ DB: delete committee (cascade cleanup) ]
                                |               |
                                |               v
                                |          ==> /committees/new?error=...
                                |
                                +-- YES
                                        |
                                        v
                                [ Generate draw schedule ]
                                  (see section 5 for detail)
                                        |
                                        v
                                [ DB: insert into draws ]
                                  - one row per month
                                  - amount = monthlyAmount * totalMemberCount
                                  - status = "scheduled"
                                        |
                                        v
                                < Draws inserted? >
                                        |
                                        +-- NO --> [ cascade cleanup ] ==> error
                                        |
                                        +-- YES
                                                |
                                                v
                                        [ DB: update members ]
                                          set draw_month_index for each member
                                          (loop, one update per member)
                                                |
                                                v
                                        [ Build contributions for ALL months ]
                                          for month 0..durationMonths-1:
                                            for each member:
                                              one contribution row
                                              due_date = startDate + month offset
                                              amount = monthlyAmount
                                              status = "pending"
                                                |
                                                v
                                        [ DB: insert into contributions ]
                                                |
                                                v
                                        < Contributions inserted? >
                                                |
                                                +-- NO --> [ cascade cleanup ] ==> error
                                                |
                                                +-- YES
                                                        |
                                                        v
                                                [ revalidatePath("/dashboard") ]
                                                        |
                                                        v
                                                ==> /committees/<committee.id>
                                                        |
                                                        v
                                                ( END: committee ready )

Cleanup behavior:
- If any step after the committee insert fails, the committee row is
  deleted. The ON DELETE CASCADE constraint then removes all related
  members, draws, and contributions automatically.
- This prevents orphaned or partial data because Supabase JS client
  does not support multi statement transactions.


---

## 4. Monthly Contribution Tracking Flow

Describes how the app tracks which members have paid for the current
month. Contributions are pre-created when the committee is made. The
organizer only updates their status.

```
( START: organizer opens committee detail page )
        |
        v
[ DB: select * from committees where id = <id> ]
        |
        v
[ DB: select * from members where committee_id = <id> ]
        |
        v
[ DB: select * from contributions where committee_id = <id> ]
        |
        v
[ DB: select * from draws where committee_id = <id> ]
        |
        v
[ Calculate currentMonthIndex ]
  formula:
    (currentYear - startYear) * 12 + (currentMonth - startMonth)
  clamped to minimum 0
        |
        v
[ Filter contributions for current month ]
  currentMonthContributions = contributions where
    month_index == min(currentMonthIndex, durationMonths - 1)
        |
        v
[ Calculate stats ]
  - paidThisMonth = count where status = "paid"
  - pendingThisMonth = count where status = "pending"
  - totalCollected = sum of amount where status = "paid"
        |
        v
[ Render "Is Mahine ki Payments" section ]
  - each row shows member name, amount, and a toggle button
  - green badge = Paid, amber badge = Pending
        |
        v
( END: organizer sees current month status )

Toggle action (per contribution row):
See section 6, Payment Status Update Flow.


---

## 5. Draw Schedule Generation Flow

Describes how the draw schedule is computed when a committee is created.
The logic lives in `src/lib/draw-schedule.ts`.

The ROSCA fairness guarantee: every member receives the pot exactly once
across the full duration. This is why durationMonths must equal memberCount.

```
( START: generateDrawSchedule called )
  input: { memberIds, durationMonths, drawType, fixedOrder? }
        |
        v
< memberIds empty OR durationMonths zero? >
        |
        +-- YES --> return [] (empty schedule)
        |                |
        |                v
        |           ( END: no schedule )
        |
        +-- NO
                |
                v
        [ effectiveCount = min(memberIds.length, durationMonths) ]
          defensive guard to avoid duplicates or gaps
                |
                v
        < drawType = ? >
                |
                +-- "lottery"
                |       |
                |       v
                |   [ Fisher-Yates shuffle of memberIds ]
                |     - result is a new randomized array
                |     - input array is not mutated
                |       |
                |       v
                |   orderedMemberIds = shuffled array
                |
                +-- "fixed"
                |       |
                |       v
                |   < fixedOrder provided and non-empty? >
                |       |
                |       +-- YES --> orderedMemberIds = [...fixedOrder]
                |       +-- NO  --> orderedMemberIds = [...memberIds]
                |                                 (original order fallback)
                |
                +-- "auction"
                |       |
                |       v
                |   [ Use original member order as placeholder ]
                |     auction winners are decided month by month later
                |     orderedMemberIds = [...memberIds]
                |
                +-- default
                        |
                        v
                    orderedMemberIds = [...memberIds]
                |
                v
        [ Build schedule: one DrawEntry per month ]
          for month 0 to effectiveCount - 1:
            schedule.push({
              monthIndex: month,
              memberId: orderedMemberIds[month]
            })
                |
                v
        return schedule
                |
                v
        ( END: schedule has exactly one winner per month )

After the schedule is returned, the createCommittee action:
1. Inserts one row into draws per schedule entry
   amount = monthlyAmount * memberCount
   status = "scheduled"
2. Updates each member's draw_month_index field

Result: a complete, transparent schedule where every member knows
exactly which month they receive the pot.


---

### 5a. Lottery Draw (visual summary)

```
Members: [A, B, C, D, D]              (5 members, 5 months)
                |
                v
        [ Fisher-Yates shuffle ]
                |
                v
Result: [C, A, D, E, B]               (random order)
                |
                v
Month 0 -> C gets the pot
Month 1 -> A gets the pot
Month 2 -> D gets the pot
Month 3 -> E gets the pot
Month 4 -> B gets the pot

Every member appears exactly once. Fair by construction.


---

### 5b. Fixed Draw (visual summary)

```
Members: [A, B, C, D, E]
Organizer provides fixedOrder: [B, D, A, E, C]
                |
                v
Result: [B, D, A, E, C]               (used as-is)
                |
                v
Month 0 -> B gets the pot
Month 1 -> D gets the pot
Month 2 -> A gets the pot
Month 3 -> E gets the pot
Month 4 -> C gets the pot

Organizer decides the order. Good for seniority or agreed rotations.


---

### 5c. Auction Draw (visual summary)

```
Members: [A, B, C, D, E]
                |
                v
Placeholder: [A, B, C, D, E]          (original order for now)
                |
                v
Month 0 -> placeholder winner A
Month 1 -> placeholder winner B
  ...actual winners decided later via monthly bidding...

Note: the auction type is a placeholder in the current version.
Full bidding logic (where members bid a discount for early pot
access) is planned for a future release.


---

## 6. Payment Status Update Flow

Describes what happens when the organizer clicks the Paid/Pending
toggle button on a contribution row. The actions live in
`src/app/(dashboard)/committees/[id]/actions.ts`.

```
( START: organizer clicks toggle on a contribution row )
        |
        v
[ ContributionRow client component reads current status ]
        |
        v
< Currently paid? >
        |
        +-- YES --> will call markContributionPending()
        |
        +-- NO  --> will call markContributionPaid()
                |
                v
        [ startTransition begins, button shows "..." ]
                |
                v
        [ Server action called with contributionId, committeeId ]
                |
                +-----------------------------+
                |                             |
                v                             v
        markContributionPaid          markContributionPending
                |                             |
                v                             v
        [ AUTH: getUser() ]           [ AUTH: getUser() ]
                |                             |
                v                             v
        < User logged in? >           < User logged in? >
        |        |                    |        |
       NO       YES                   NO      YES
        |        |                    |        |
        v        v                    v        v
     return   verifyCommittee      return   verifyCommittee
     error    Ownership                      Ownership
                |                             |
                v                             v
        < Is owner? >                 < Is owner? >
        |        |                    |        |
       NO      YES                   NO      YES
        |        |                    |        |
        v        v                    v        v
     return   [ DB: update         return   [ DB: update
     error      contributions ]      error      contributions ]
                |                             |
                v                             v
        set: status = "paid"          set: status = "pending"
             paid_at = now()               paid_at = null
             payment_method = "cash"       payment_method = null
                |                             |
                v                             v
        < Update ok? >               < Update ok? >
        |        |                    |        |
       YES       NO                  YES       NO
        |        |                    |        |
        v        v                    v        v
     [ revalidate            [ revalidate
        Path ]                  Path ]
        |        |                    |        |
        v        v                    v        v
     return   return               return   return
     success  error                success  error
        |        |                    |        |
        +--------+--------------------+--------+
                |
                v
        [ Client receives ActionResult ]
                |
                v
        < result.success? >
                |
                +-- NO --> [ Show error message in the row ]
                |               (UI state does NOT flip)
                |
                +-- YES --> [ UI updates to reflect new status ]
                                (page revalidated, fresh data)
                                |
                                v
                        ( END: contribution updated )

Security notes:
- Each action verifies the user is the organizer of the committee,
  in addition to the RLS policies enforced by the database.
- Double layer of protection: app level check plus database RLS.
- The action returns an ActionResult object so the client can
  handle failures without a full page reload or broken UI state.


---

## 7. Logout Flow

Describes the logout process.

```
( START: user clicks Logout button on dashboard )
        |
        v
[ Form submits to logout() server action ]
        |
        v
[ AUTH: supabase.auth.signOut() ]
        |
        v
[ Auth cookies cleared ]
        |
        v
[ revalidatePath("/", "layout") ]
        |
        v
==> /login
        |
        v
( END: user signed out, redirected to login )


---

## 8. Page Access and Authorization Flow

Describes how access control works across all protected pages.

```
( User requests any page )
        |
        v
[ Next.js route group routing ]
        |
        v
< Which route group? >
        |
        +-- "/" (landing page)
        |       |
        |       v
        |   [ Public, no auth check ]
        |       |
        |       v
        |   ( Render landing page )
        |
        +-- "/login" or "/signup" (auth group)
        |       |
        |       v
        |   [ Public, no auth check ]
        |       |
        |       v
        |   [ Supabase Auth handles credentials ]
        |       |
        |       v
        |   ( Render auth form )
        |
        +-- "/dashboard", "/committees/*" (dashboard group)
                |
                v
        [ Server component calls supabase.auth.getUser() ]
                |
                v
        < User has valid session? >
                |
                +-- NO --> [ RLS returns empty data ]
                |               |
                |               v
                |          [ App level: redirect or show nothing ]
                |
                +-- YES --> [ Supabase client uses auth cookies ]
                                |
                                v
                        [ DB queries run with user context ]
                                |
                                v
                        [ RLS policies filter data ]
                          - profiles: user sees own row only
                          - committees: organizer sees own; members see joined
                          - members: organizer manages; members see own row
                          - contributions: organizer manages; members see own
                          - draws: organizer manages; members see joined
                                |
                                v
                        ( Render page with authorized data only )

Key point: authorization is enforced at two levels.
1. Application level: server actions check auth.getUser() and
   verify ownership before mutating data.
2. Database level: RLS policies ensure a user can never read or
   write another user's data, even if the app has a bug.


---

## Cross Reference

| Flow                         | Source file                                              |
|------------------------------|----------------------------------------------------------|
| signup                       | src/app/(auth)/actions.ts                                |
| login                        | src/app/(auth)/actions.ts                                |
| logout                       | src/app/(auth)/actions.ts                                |
| createCommittee              | src/app/(dashboard)/committees/actions.ts                |
| generateDrawSchedule         | src/lib/draw-schedule.ts                                 |
| markContributionPaid         | src/app/(dashboard)/committees/[id]/actions.ts           |
| markContributionPending      | src/app/(dashboard)/committees/[id]/actions.ts           |
| dashboard data loading       | src/app/(dashboard)/dashboard/page.tsx                   |
| committee detail loading     | src/app/(dashboard)/committees/[id]/page.tsx             |
| ContributionRow toggle       | src/components/committees/ContributionRow.tsx            |
| handle_new_user trigger      | supabase/migrations/0001_initial_schema.sql              |
