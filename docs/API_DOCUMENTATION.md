# CommitteeKart API Documentation

CommitteeKart does not use a custom REST or GraphQL API. All data
access goes through Supabase directly: the Supabase JS client for
database queries and Supabase Auth for authentication. Server actions
wrap these operations and add validation.

This document covers:
1. Supabase Auth endpoints (signup, login, logout)
2. Server Actions (the app's server side API)
3. Supabase database queries organized by feature
4. Data access patterns and RLS effects


---

## Table of Contents

1. Architecture Overview
2. Supabase Client Setup
3. Authentication
   - signUp
   - signInWithPassword
   - signOut
   - getUser
4. Server Actions
   - signup
   - login
   - logout
   - createCommittee
   - markContributionPaid
   - markContributionPending
5. Database Queries by Feature
   - Authentication and profiles
   - Dashboard
   - Committee creation
   - Committee detail
   - Contribution management
6. Data Access Patterns
7. Error Handling Reference


---

## 1. Architecture Overview

```
+-------------------+        +-------------------+       +-------------------+
|   Browser (UI)    |        |  Next.js Server   |       |     Supabase      |
|                   |  HTTP  |                   |  SQL  |                   |
|  Client Components|<------>|  Server Components|<----->|  PostgreSQL       |
|  Server Components|        |  Server Actions   |       |  Auth             |
|                   |        |                   |       |  RLS Policies     |
+-------------------+        +-------------------+       +-------------------+
```

Data flow:
- Browser sends form data to a Next.js Server Action.
- The Server Action creates a Supabase server client.
- The Supabase client runs queries with the user's auth context.
- RLS policies filter the data based on auth.uid().
- Results flow back to the Server Component for rendering.

Key point: there is no custom API layer. The Server Actions are the
API. Supabase is the database and auth provider.


---

## 2. Supabase Client Setup

The app uses two Supabase client factories. Both read environment
variables for the project URL and publishable key.

Environment variables (from .env.local):

```
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<anon-key>
```

### 2.1 Server Client

File: `src/lib/supabase/server.ts`

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  // ... reads URL and key from env ...
  return createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Ignored: called from Server Component context.
          // Middleware handles session refresh.
        }
      },
    },
  });
}
```

Used in: Server Components, Server Actions, Route Handlers.
Reads and writes auth cookies from the Next.js request.

### 2.2 Browser Client

File: `src/lib/supabase/client.ts`

Used in: Client Components (for direct Supabase calls if needed).
Most data access happens on the server, so this client is rarely used
directly in the current codebase.


---

## 3. Authentication

Authentication is handled by Supabase Auth. The app uses email and
password authentication exclusively in the current version.

### 3.1 signUp

Creates a new user account.

Supabase call:
```typescript
const { data, error } = await supabase.auth.signUp({
  email: string,
  password: string,
  options: {
    data: {
      full_name: string,
    },
  },
});
```

Parameters:
| Name     | Type   | Required | Description                        |
|----------|--------|----------|------------------------------------|
| email    | string | YES      | User email address                 |
| password | string | YES      | Min 6 characters                   |
| full_name| string | YES      | Stored in user metadata            |

Returns:
| Field             | Type    | Description                              |
|-------------------|---------|------------------------------------------|
| data.user         | object  | The new user object, or null             |
| data.session      | object  | Session if auto confirmed, else null     |
| error             | object  | Error details, or null                   |

Side effects:
- Inserts a row into auth.users.
- Fires the on_auth_user_created trigger.
- Trigger inserts a matching row into profiles.

Error codes:
| Code                | Message (Roman Urdu)                              |
|---------------------|---------------------------------------------------|
| invalid_credentials | Email ya password ghalat hai.                     |
| email_taken         | Yeh email pehle se registered hai. Login karein.  |
| weak_password       | Password kam az kam 6 characters ka hona chahiye. |
| (other)             | Kuch masla ho gaya. Dobara koshish karein.       |

### 3.2 signInWithPassword

Authenticates an existing user.

Supabase call:
```typescript
const { error } = await supabase.auth.signInWithPassword({
  email: string,
  password: string,
});
```

Parameters:
| Name     | Type   | Required | Description        |
|----------|--------|----------|--------------------|
| email    | string | YES      | User email         |
| password | string | YES      | User password      |

Returns:
| Field  | Type   | Description                          |
|--------|--------|--------------------------------------|
| data   | object | Contains session and user on success |
| error  | object | Error details, or null               |

Side effects:
- Sets auth cookies in the response.
- Subsequent requests carry these cookies for authentication.

Error codes: same mapping as signUp.

### 3.3 signOut

Signs out the current user.

Supabase call:
```typescript
await supabase.auth.signOut();
```

Parameters: none.

Returns: void (error is not checked in the current logout action).

Side effects:
- Clears auth cookies.
- User session is invalidated server side.

### 3.4 getUser

Gets the currently authenticated user. Used in every protected page
and server action to verify the session.

Supabase call:
```typescript
const { data: { user } } = await supabase.auth.getUser();
```

Returns:
| Field | Type   | Description                              |
|-------|--------|------------------------------------------|
| user  | object | The user object, or null if not signed in|

Usage pattern:
```typescript
if (!user) {
  redirect("/login");
}
```


---

## 4. Server Actions

Server Actions are the app's server side API. They are TypeScript
functions marked with "use server" that run on the Next.js server.
They are called from forms or directly from client components.

### 4.1 signup

File: `src/app/(auth)/actions.ts`

Creates a new user account.

```typescript
export async function signup(formData: FormData): Promise<void>
```

Input (FormData fields):
| Field    | Type   | Required | Validation      |
|----------|--------|----------|-----------------|
| email    | string | YES      | Valid email     |
| password | string | YES      | Min 6 chars     |
| fullName | string | YES      | Non empty       |

Return type: void (always redirects).

Behavior:
1. Extracts email, password, fullName from FormData.
2. Calls supabase.auth.signUp with full_name in metadata.
3. On error: redirects to /signup?error=<message>.
4. If session not created (email confirmation): redirects to
   /login?message="Account bana! Ab login karein."
5. On success: revalidates layout and redirects to /dashboard.

RLS effect: the profile row is created by the SECURITY DEFINER trigger,
bypassing RLS. No app level insert is needed.

Error handling:
- Errors are mapped to Roman Urdu messages via getErrorMessage().
- The error code determines which message is shown.
- Unknown errors fall back to a generic message.

### 4.2 login

File: `src/app/(auth)/actions.ts`

Authenticates an existing user.

```typescript
export async function login(formData: FormData): Promise<void>
```

Input (FormData fields):
| Field    | Type   | Required |
|----------|--------|----------|
| email    | string | YES      |
| password | string | YES      |

Return type: void (always redirects).

Behavior:
1. Extracts email, password from FormData.
2. Calls supabase.auth.signInWithPassword.
3. On error: redirects to /login?error=<message>.
4. On success: revalidates layout and redirects to /dashboard.

RLS effect: sets auth cookies that determine auth.uid() for all
subsequent queries.

Error handling: same Roman Urdu message mapping as signup.

### 4.3 logout

File: `src/app/(auth)/actions.ts`

Signs out the current user.

```typescript
export async function logout(): Promise<void>
```

Input: none.

Return type: void (always redirects).

Behavior:
1. Calls supabase.auth.signOut().
2. Revalidates layout.
3. Redirects to /login.

RLS effect: clears auth context. Subsequent queries run as anonymous.

Error handling: no error checking. Logout proceeds regardless.

### 4.4 createCommittee

File: `src/app/(dashboard)/committees/actions.ts`

Creates a new committee with members, draw schedule, and all
contribution rows. This is the most complex action in the app.

```typescript
export async function createCommittee(formData: FormData): Promise<void>
```

Input (FormData fields):
| Field            | Type   | Required | Validation                    |
|------------------|--------|----------|-------------------------------|
| name             | string | YES      | 1 to 100 chars                |
| description      | string | NO       | Optional                      |
| monthlyAmount    | string | YES      | Number >= 100                 |
| durationMonths   | string | YES      | Integer 1 to 60               |
| drawType         | string | YES      | lottery, fixed, or auction    |
| startDate        | string | YES      | Valid date                    |
| member_0         | string | YES      | Name of 2nd member            |
| member_phone_0   | string | NO       | Phone of 2nd member           |
| member_1         | string | NO       | Name of 3rd member            |
| member_phone_1   | string | NO       | Phone of 3rd member           |
| ...              | ...    | ...      | Dynamic, indexed              |

Return type: void (always redirects).

Behavior (step by step):
1. Gets current user via auth.getUser(). Redirects to /login if absent.
2. Extracts and validates all fields.
3. Parses dynamic members (member_0, member_1, ...).
4. Computes totalMemberCount = entered members + 1 (organizer).
5. Validates: name length, amount, duration, draw type, date,
   member count >= 2, and durationMonths == totalMemberCount (ROSCA rule).
6. Inserts into committees. Returns the new row.
7. Fetches organizer's full_name from profiles.
8. Builds members array (organizer + entered members).
9. Inserts all members at once. Returns rows with generated IDs.
10. Generates draw schedule via generateDrawSchedule().
11. Inserts all draw rows.
12. Updates each member's draw_month_index.
13. Builds and inserts all contribution rows (one per member per month).
14. Revalidates /dashboard and redirects to the new committee page.

Cleanup on failure:
- If any step after the committee insert fails, the committee is deleted.
- ON DELETE CASCADE removes partial members, draws, and contributions.

RLS effect:
- committees insert: allowed because organizer_id = auth.uid().
- members insert: allowed because the organizer owns the parent committee.
- draws insert: same, organizer owns the parent committee.
- contributions insert: same, organizer owns the parent committee.
- All inserts pass the "Organizers manage..." RLS policies.

Validation error messages (Roman Urdu):
| Condition                          | Message                                            |
|------------------------------------|----------------------------------------------------|
| Name empty or > 100 chars          | Committee ka naam 1 se 100 characters ke beech...   |
| Amount < 100                       | Monthly amount kam az kam Rs. 100 hona chahiye.    |
| Duration out of range              | Duration 1 se 60 months ke beech hona chahiye.     |
| Invalid draw type                  | Draw type sahi nahi hai. Lottery, Fixed, ya...     |
| Invalid start date                 | Start date sahi nahi hai.                          |
| Fewer than 2 members               | Kam az kam 2 members chahiye (aap + 1 aur).        |
| Duration != member count           | Duration aur members barabar hone chahiye...       |
| Member name > 100 chars            | Member ka naam 100 characters se lamba nahi...     |
| Committee insert fails             | Committee banane mein masla ho gaya...             |
| Members insert fails               | Members add karne mein masla ho gaya.              |
| Draws insert fails                 | Draw schedule banane mein masla ho gaya.           |
| Contributions insert fails         | Contributions setup mein masla ho gaya.            |

### 4.5 markContributionPaid

File: `src/app/(dashboard)/committees/[id]/actions.ts`

Marks a contribution as paid with timestamp and payment method.

```typescript
export async function markContributionPaid(
  contributionId: string,
  committeeId: string,
  paymentMethod: PaymentMethod = "cash"
): Promise<ActionResult>
```

Parameters:
| Name            | Type           | Required | Default | Description                     |
|-----------------|----------------|----------|---------|---------------------------------|
| contributionId  | string         | YES      | -       | UUID of the contribution row    |
| committeeId     | string         | YES      | -       | UUID of the parent committee    |
| paymentMethod   | PaymentMethod  | NO       | "cash"  | How the member paid             |

Return type:
```typescript
interface ActionResult {
  success: boolean;
  error?: string;
}
```

Behavior:
1. Gets current user via auth.getUser().
2. Returns { success: false, error: "Not authenticated" } if no user.
3. Calls verifyCommitteeOwnership to confirm the user owns the committee.
4. Returns { success: false, error: "Not authorized" } if not owner.
5. Updates the contribution: status = "paid", paid_at = now (ISO),
   payment_method = provided value.
6. Returns { success: false, error: "Database update failed" } on error.
7. Revalidates the committee page and dashboard.
8. Returns { success: true } on success.

RLS effect:
- The update passes the "Organizers manage contributions" policy because
  the user owns the parent committee.
- verifyCommitteeOwnership adds a second app level check for defense
  in depth.

Error handling:
- Authentication failure returns a typed error, no redirect.
- Authorization failure returns a typed error, no redirect.
- Database errors are logged to console and returned as typed errors.
- The client component (ContributionRow) shows the error inline without
  flipping the UI state.

### 4.6 markContributionPending

File: `src/app/(dashboard)/committees/[id]/actions.ts`

Reverts a contribution back to pending. Clears paid_at and payment_method.

```typescript
export async function markContributionPending(
  contributionId: string,
  committeeId: string
): Promise<ActionResult>
```

Parameters:
| Name            | Type   | Required | Description                  |
|-----------------|--------|----------|------------------------------|
| contributionId  | string | YES      | UUID of the contribution row |
| committeeId     | string | YES      | UUID of the parent committee |

Return type: same ActionResult as markContributionPaid.

Behavior:
1. Gets current user via auth.getUser().
2. Returns error if not authenticated.
3. Verifies committee ownership.
4. Returns error if not authorized.
5. Updates the contribution: status = "pending", paid_at = null,
   payment_method = null.
6. Revalidates committee page and dashboard.
7. Returns { success: true }.

RLS effect: same as markContributionPaid.

Error handling: same pattern, returns typed ActionResult.

### 4.7 verifyCommitteeOwnership (internal helper)

File: `src/app/(dashboard)/committees/[id]/actions.ts`

Internal function used by both contribution actions.

```typescript
async function verifyCommitteeOwnership(
  supabase: SupabaseClient,
  userId: string,
  committeeId: string
): Promise<boolean>
```

Query:
```sql
select id from committees
where id = <committeeId> and organizer_id = <userId>
limit 1;
```

Returns true if the user owns the committee, false otherwise.

Note: this is a redundant check on top of RLS. It ensures the action
fails gracefully with a typed error rather than relying solely on the
database refusing the operation.


---

## 5. Database Queries by Feature

All queries use the Supabase JS client. The table below lists every
query in the app, organized by feature. Each query shows the equivalent
SQL, the source file, and the RLS effect.

### 5.1 Authentication and Profiles

#### Get current user
```typescript
const { data: { user } } = await supabase.auth.getUser();
```
Source: every protected page and action.
RLS: sets the auth context for all subsequent queries.

#### Get user profile
```typescript
const { data: profile } = await supabase
  .from("profiles")
  .select("full_name, plan")
  .eq("id", user.id)
  .single();
```
Source: dashboard/page.tsx
SQL: `select full_name, plan from profiles where id = auth.uid();`
RLS: "Users can view own profile" ensures only the owner's row is returned.

#### Get organizer full name (for member insert)
```typescript
const { data: profile } = await supabase
  .from("profiles")
  .select("full_name")
  .eq("id", user.id)
  .single();
```
Source: committees/actions.ts (createCommittee)
RLS: same own profile policy.

### 5.2 Dashboard

#### Get all committees for the user
```typescript
const { data: committees } = await supabase
  .from("committees")
  .select("*")
  .eq("organizer_id", user.id)
  .order("created_at", { ascending: false });
```
Source: dashboard/page.tsx
SQL:
```sql
select * from committees
where organizer_id = auth.uid()
order by created_at desc;
```
RLS: "Organizers manage their committees" returns only owned rows.
(The .eq filter is redundant with RLS but explicit.)

#### Get all contributions for the user's committees
```typescript
const { data: contributions } = await supabase
  .from("contributions")
  .select("*")
  .in("committee_id", committeeIds);
```
Source: dashboard/page.tsx
SQL:
```sql
select * from contributions
where committee_id in (<list>);
```
RLS: "Organizers manage contributions" returns only rows where the
user owns the parent committee.

#### Dashboard stats calculation (client side)
```typescript
const totalCollected = contributions
  .filter((c) => c.status === "paid")
  .reduce((sum, c) => sum + Number(c.amount), 0);

const pendingCount = contributions
  .filter((c) => c.status === "pending").length;
```
Source: dashboard/page.tsx
Note: calculated in JS after fetching all contributions. This could
be optimized with a database aggregate query in the future.

### 5.3 Committee Creation

#### Insert committee
```typescript
const { data: committee, error } = await supabase
  .from("committees")
  .insert({
    organizer_id: user.id,
    name,
    description,
    monthly_amount: monthlyAmount,
    member_count: totalMemberCount,
    duration_months: durationMonths,
    draw_type: drawType,
    start_date: startDate,
    status: "active",
  })
  .select()
  .single();
```
Source: committees/actions.ts
SQL:
```sql
insert into committees (organizer_id, name, description, monthly_amount,
  member_count, duration_months, draw_type, start_date, status)
values (...)
returning *;
```
RLS: "Organizers manage their committees" checks organizer_id = auth.uid().

#### Insert members (batch)
```typescript
const { data: insertedMembers, error } = await supabase
  .from("members")
  .insert(membersToInsert)
  .select();
```
Source: committees/actions.ts
SQL:
```sql
insert into members (committee_id, user_id, name, phone)
values (...), (...), (...)
returning *;
```
RLS: "Organizers manage members" verifies the organizer owns each
member's parent committee.

#### Insert draws (batch)
```typescript
const { error } = await supabase
  .from("draws")
  .insert(drawsToInsert);
```
Source: committees/actions.ts
SQL:
```sql
insert into draws (committee_id, month_index, member_id, amount, status)
values (...), (...), ...;
```
RLS: "Organizers manage draws" verifies ownership.

#### Update member draw_month_index (loop)
```typescript
for (const entry of schedule) {
  await supabase
    .from("members")
    .update({ draw_month_index: entry.monthIndex })
    .eq("id", entry.memberId);
}
```
Source: committees/actions.ts
SQL (per member):
```sql
update members set draw_month_index = <n> where id = <member-id>;
```
RLS: "Organizers manage members" verifies ownership.
Note: this runs N separate queries. Could be optimized to a batch
in the future.

#### Insert contributions (batch)
```typescript
const { error } = await supabase
  .from("contributions")
  .insert(contributionsToInsert);
```
Source: committees/actions.ts
SQL:
```sql
insert into contributions (committee_id, member_id, month_index,
  due_date, amount, status)
values (...), (...), ...;
```
RLS: "Organizers manage contributions" verifies ownership.

#### Cascade cleanup on failure
```typescript
await supabase.from("committees").delete().eq("id", committee.id);
```
Source: committees/actions.ts
SQL:
```sql
delete from committees where id = <committee-id>;
```
RLS: allowed because organizer_id = auth.uid().
Effect: ON DELETE CASCADE removes all members, draws, contributions.

### 5.4 Committee Detail

#### Get committee by ID
```typescript
const { data: committee } = await supabase
  .from("committees")
  .select("*")
  .eq("id", id)
  .single();
```
Source: committees/[id]/page.tsx
SQL:
```sql
select * from committees where id = <id>;
```
RLS: returns the row only if the user is the organizer or a member.
Otherwise returns null, triggering notFound().

#### Get all members
```typescript
const { data: members } = await supabase
  .from("members")
  .select("*")
  .eq("committee_id", id)
  .order("created_at", { ascending: true });
```
Source: committees/[id]/page.tsx
SQL:
```sql
select * from members
where committee_id = <id>
order by created_at asc;
```
RLS: returns rows only if the user is the organizer or a member of
the parent committee.

#### Get all contributions
```typescript
const { data: contributions } = await supabase
  .from("contributions")
  .select("*")
  .eq("committee_id", id)
  .order("month_index", { ascending: true })
  .order("created_at", { ascending: true });
```
Source: committees/[id]/page.tsx
SQL:
```sql
select * from contributions
where committee_id = <id>
order by month_index asc, created_at asc;
```
RLS: organizer sees all; member sees only their own contributions.

#### Get draw schedule
```typescript
const { data: draws } = await supabase
  .from("draws")
  .select("*")
  .eq("committee_id", id)
  .order("month_index", { ascending: true });
```
Source: committees/[id]/page.tsx
SQL:
```sql
select * from draws
where committee_id = <id>
order by month_index asc;
```
RLS: organizer manages; members view draws for their committees.

#### Current month calculation (client side)
```typescript
const currentMonthIndex = Math.max(
  0,
  (now.getFullYear() - startDateObj.getFullYear()) * 12 +
    (now.getMonth() - startDateObj.getMonth())
);
```
Source: committees/[id]/page.tsx
Note: this is pure date math, not a query. Determines which month's
contributions to display.

### 5.5 Contribution Management

#### Verify committee ownership
```typescript
const { data } = await supabase
  .from("committees")
  .select("id")
  .eq("id", committeeId)
  .eq("organizer_id", userId)
  .maybeSingle();
```
Source: committees/[id]/actions.ts (verifyCommitteeOwnership)
SQL:
```sql
select id from committees
where id = <committeeId> and organizer_id = <userId>;
```
RLS: redundant with the explicit filter, but adds app level safety.

#### Mark contribution paid
```typescript
const { error } = await supabase
  .from("contributions")
  .update({
    status: "paid",
    paid_at: new Date().toISOString(),
    payment_method: paymentMethod,
  })
  .eq("id", contributionId);
```
Source: committees/[id]/actions.ts
SQL:
```sql
update contributions
set status = 'paid', paid_at = now(), payment_method = 'cash'
where id = <contribution-id>;
```
RLS: "Organizers manage contributions" allows the update only if the
user owns the parent committee.

#### Mark contribution pending
```typescript
const { error } = await supabase
  .from("contributions")
  .update({
    status: "pending",
    paid_at: null,
    payment_method: null,
  })
  .eq("id", contributionId);
```
Source: committees/[id]/actions.ts
SQL:
```sql
update contributions
set status = 'pending', paid_at = null, payment_method = null
where id = <contribution-id>;
```
RLS: same as markContributionPaid.


---

## 6. Data Access Patterns

### 6.1 Read Patterns

The app uses server side rendering with direct Supabase queries. There
is no client side data fetching or caching layer. Data is fresh on
every page load.

Typical read flow:
1. Server Component calls createSupabaseServerClient().
2. Calls auth.getUser() to verify the session.
3. Runs one or more select queries.
4. Passes data directly to JSX rendering.

The dashboard page runs 3 queries:
- profiles (for display name and plan)
- committees (list of user's committees)
- contributions (for stats calculation)

The committee detail page runs 4 queries:
- committees (single committee)
- members (all members)
- contributions (all contributions)
- draws (full schedule)

### 6.2 Write Patterns

All writes go through Server Actions. The client never writes directly
to the database. This ensures:
- Validation always runs on the server.
- Auth is always checked before mutation.
- RLS provides a final safety net.

Write flows:
- signup: auth.signUp -> trigger creates profile
- login: auth.signInWithPassword -> sets cookies
- logout: auth.signOut -> clears cookies
- createCommittee: insert committee -> insert members -> insert draws ->
  update members -> insert contributions
- markContributionPaid / Pending: update single contribution row

### 6.3 Revalidation Pattern

After mutations, the app calls revalidatePath to refresh cached data:

```typescript
revalidatePath(`/committees/${committeeId}`);
revalidatePath("/dashboard");
revalidatePath("/", "layout");
```

This ensures the next page load shows updated data. The layout
revalidation (with "layout" scope) is used after auth changes to
refresh the session across all pages.

### 6.4 Redirect Pattern

Auth and creation actions use redirect() which throws internally
(never returns normally):

```typescript
redirect("/dashboard");           // on login/signup success
redirect("/login");               // on logout
redirect(`/committees/${id}`);    // on committee creation
redirect(`/login?error=...`);    // on auth failure
```

Contribution actions do NOT redirect. They return ActionResult objects
so the client can handle success or failure inline.

### 6.5 Auth Context Propagation

The Supabase server client reads auth cookies from the Next.js
request. This means:
- Every query in a Server Component runs with the user's auth context.
- RLS policies use auth.uid() to filter data.
- No manual token passing is needed.

The setAll callback on the server client writes refreshed auth cookies
back to the response, keeping sessions alive.


---

## 7. Error Handling Reference

### 7.1 Auth Error Mapping

File: `src/app/(auth)/actions.ts`

```typescript
const ERROR_MESSAGES = {
  invalid_credentials: "Email ya password ghalat hai.",
  email_taken: "Yeh email pehle se registered hai. Login karein.",
  weak_password: "Password kam az kam 6 characters ka hona chahiye.",
  default: "Kuch masla ho gaya. Dobara koshish karein.",
};
```

The getErrorMessage function maps Supabase error codes to these
Roman Urdu messages. Unknown codes fall back to the default.

### 7.2 Validation Error Pattern

createCommittee uses a redirectToError helper:

```typescript
function redirectToError(message: string): never {
  redirect(`/committees/new?error=${encodeURIComponent(message)}`);
}
```

All validation failures call this, encoding the message in the URL.
The form page reads ?error= from searchParams and displays it in a
danger styled alert.

### 7.3 Mutation Error Pattern

Contribution actions return typed ActionResult objects:

```typescript
interface ActionResult {
  success: boolean;
  error?: string;
}
```

The client ContributionRow component checks result.success:
- On failure: shows the error inline, does NOT flip the UI state.
- On success: the revalidated page shows the new status.

Error values returned:
| Error                  | When                              |
|------------------------|-----------------------------------|
| "Not authenticated"    | No user session                   |
| "Not authorized"       | User does not own the committee   |
| "Database update failed"| Supabase returned an error       |

### 7.4 Committee Detail Not Found

If a committee does not exist or the user lacks access (RLS returns
null), the page calls notFound():

```typescript
if (!committee) {
  notFound();
}
```

This triggers Next.js's 404 page.

### 7.5 Environment Variable Errors

The Supabase server client throws if env vars are missing:

```typescript
throw new Error(
  "Missing Supabase environment variables. Check .env.local for " +
    "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY."
);
```

This is a hard failure on startup, ensuring misconfiguration is caught
early.


---

## Cross Reference

| Action / Query              | Source File                                          |
|-----------------------------|------------------------------------------------------|
| signup                      | src/app/(auth)/actions.ts                            |
| login                       | src/app/(auth)/actions.ts                            |
| logout                      | src/app/(auth)/actions.ts                            |
| createCommittee             | src/app/(dashboard)/committees/actions.ts            |
| markContributionPaid        | src/app/(dashboard)/committees/[id]/actions.ts       |
| markContributionPending     | src/app/(dashboard)/committees/[id]/actions.ts       |
| verifyCommitteeOwnership    | src/app/(dashboard)/committees/[id]/actions.ts       |
| createSupabaseServerClient  | src/lib/supabase/server.ts                           |
| Landing page query          | none (static)                                        |
| Dashboard queries           | src/app/(dashboard)/dashboard/page.tsx               |
| Committee detail queries    | src/app/(dashboard)/committees/[id]/page.tsx         |
| ContributionRow (client)    | src/components/committees/ContributionRow.tsx        |
| generateDrawSchedule        | src/lib/draw-schedule.ts                             |
