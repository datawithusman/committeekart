# CommitteeKart Database Design

Complete database documentation for CommitteeKart. The schema is defined
in `supabase/migrations/0001_initial_schema.sql` and runs on PostgreSQL
via Supabase.

> Core principle: **Track, Don't Hold**. The database stores contribution
> records and draw schedules for transparency. No financial transaction
> data or balances are held.


---

## Table of Contents

1. Overview
2. Entity Relationship Diagram
3. Enums
4. Tables
   - profiles
   - committees
   - members
   - contributions
   - draws
5. Relationships
6. Indexes
7. Row Level Security
8. Triggers
9. Sample Data
10. Design Decisions


---

## 1. Overview

The database has 5 application tables plus the built in Supabase
auth.users table. Data flows from the organizer downward:

```
auth.users (Supabase built in)
    |
    v
profiles (1:1 with auth.users)
    |
    | 1
    |
    | N
    v
committees --------+------------------+------------------+
    | 1             | 1                | 1                |
    |               |                  |                  |
    | N             | N                | N                |
    v               v                  v                  v
  members       contributions        draws
```

The organizer (a profile) creates committees. Each committee has
members, monthly contributions, and a draw schedule. Every table uses
UUID primary keys and soft references where appropriate.


---

## 2. Entity Relationship Diagram

```
+-------------------+         +--------------------------------------+
| auth.users        |         | profiles                             |
| (Supabase)        | 1     1 |                                      |
|-------------------|---------|--------------------------------------|
| id (uuid) PK      | 1:1     | id (uuid) PK, FK -> auth.users.id    |
| email             |         | email (text)                         |
| encrypted_pass    |         | full_name (text)                     |
| raw_user_meta_data|         | phone (text, nullable)               |
+-------------------+         | plan (plan_tier, default 'free')     |
                              | created_at (timestamptz)             |
                              +--------------------------------------+
                                          |
                                          | 1
                                          |
                                          | N
                                          v
+--------------------------------------+         +--------------------------------------+
| committees                           |         | members                              |
|--------------------------------------| 1     N |--------------------------------------|
| id (uuid) PK                         |---------| id (uuid) PK                         |
| organizer_id (uuid) FK -> profiles   |    1:N  | committee_id (uuid) FK -> committees |
| name (text)                          |         | user_id (uuid) FK -> profiles (null) |
| description (text, nullable)         |         | name (text)                          |
| monthly_amount (numeric)             |    +----| phone (text, nullable)               |
| member_count (integer)               |    |    | draw_month_index (integer, nullable) |
| duration_months (integer)            |    |    | created_at (timestamptz)             |
| draw_type (draw_type)                |    |    |                                      |
| start_date (date)                    |    |    | UNIQUE(committee_id, user_id)        |
| status (committee_status)            |    |    +--------------------------------------+
| created_at (timestamptz)             |    |
+--------------------------------------+    |    +--------------------------------------+
          |                       |        |    | contributions                        |
          | 1                     | 1      +--->|--------------------------------------|
          |                       |        |    | id (uuid) PK                         |
          | N                     | N      |    | committee_id (uuid) FK -> committees |
          v                       v        +--->| member_id (uuid) FK -> members       |
+--------------------------------------+   |    | month_index (integer)                |
| draws                                |   |    | due_date (date)                      |
|--------------------------------------|   |    | amount (numeric)                     |
| id (uuid) PK                         |   |    | status (contribution_status)         |
| committee_id (uuid) FK -> committees |<--+    | paid_at (timestamptz, nullable)      |
| month_index (integer)                |        | payment_method (payment_method, null)|
| member_id (uuid) FK -> members       |<-------+| note (text, nullable)                |
| amount (numeric)                     |        | created_at (timestamptz)             |
| status (text)                        |        |                                      |
| created_at (timestamptz)             |        | UNIQUE(committee_id, member_id,      |
|                                      |        |        month_index)                  |
| UNIQUE(committee_id, month_index)    |        +--------------------------------------+
+--------------------------------------+
```

Compact relationship summary:

```
profiles 1 ----- N committees       (organizer_id)
profiles 1 ----- N members          (user_id, nullable)
committees 1 ---- N members         (committee_id)
committees 1 ---- N contributions   (committee_id)
committees 1 ---- N draws           (committee_id)
members 1 ------- N contributions   (member_id)
members 1 ------- N draws           (member_id)
auth.users 1 ---- 1 profiles        (id, via trigger)
```


---

## 3. Enums

Five custom enum types define the controlled vocabularies used across
the schema.

### 3.1 draw_type

Determines how the pot winner is decided each month.

```sql
create type draw_type as enum ('lottery', 'fixed', 'auction');
```

| Value     | Description                                                |
|-----------|------------------------------------------------------------|
| lottery   | Random shuffle. Each member gets the pot once, randomly.   |
| fixed     | Organizer provides the explicit order of winners.          |
| auction   | Monthly bidding (placeholder, decided month by month).     |

### 3.2 committee_status

Lifecycle status of a committee.

```sql
create type committee_status as enum ('draft', 'active', 'completed', 'cancelled');
```

| Value      | Description                                              |
|------------|----------------------------------------------------------|
| draft      | Created but not yet started.                             |
| active     | Currently running. Committees are created as "active".   |
| completed  | All months finished, all draws completed.                |
| cancelled  | Terminated early by the organizer.                       |

### 3.3 contribution_status

Payment status for a single monthly contribution.

```sql
create type contribution_status as enum ('pending', 'paid', 'late', 'skipped');
```

| Value    | Description                                                    |
|----------|----------------------------------------------------------------|
| pending  | Not yet paid. Default on creation.                             |
| paid     | Organizer confirmed payment received.                          |
| late     | Past due date, still unpaid (planned for future automation).   |
| skipped  | Member excused for this month (planned).                       |

### 3.4 payment_method

How the member paid. Record only, the app does not process payments.

```sql
create type payment_method as enum ('cash', 'bank_transfer', 'jazzcash', 'easypaisa', 'other');
```

| Value         | Description                                          |
|---------------|------------------------------------------------------|
| cash          | Hand to hand cash payment.                           |
| bank_transfer | Bank deposit or transfer.                            |
| jazzcash      | JazzCash mobile wallet (Pakistan).                   |
| easypaisa     | Easypaisa mobile wallet (Pakistan).                  |
| other         | Any other method.                                    |

### 3.5 plan_tier

Subscription tier for monetization.

```sql
create type plan_tier as enum ('free', 'pro', 'premium');
```

| Value   | Description                                              |
|---------|----------------------------------------------------------|
| free    | Default tier. Limited committees.                        |
| pro     | Unlimited committees, all draw types.                    |
| premium | White label, API access, dedicated support.              |


---

## 4. Tables

### 4.1 profiles

Extends Supabase auth.users with application specific data. Created
automatically by the handle_new_user trigger when a user signs up.

```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  phone text,
  plan plan_tier not null default 'free',
  created_at timestamptz not null default now()
);
```

| Column      | Type         | Nullable | Default   | Constraints                          |
|-------------|--------------|----------|-----------|--------------------------------------|
| id          | uuid         | NO       | -         | PK, FK -> auth.users(id) CASCADE     |
| email       | text         | NO       | -         | -                                    |
| full_name   | text         | NO       | ''        | -                                    |
| phone       | text         | YES      | NULL      | -                                    |
| plan        | plan_tier    | NO       | 'free'    | -                                    |
| created_at  | timestamptz  | NO       | now()     | -                                    |

Notes:
- The id is the same as auth.users.id, creating a strict 1:1 link.
- ON DELETE CASCADE means deleting an auth user removes their profile.
- No unique index on email because auth.users already enforces that.


### 4.2 committees

A savings circle created by an organizer. The central entity of the app.

```sql
create table committees (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid not null references profiles(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  description text,
  monthly_amount numeric(12, 2) not null check (monthly_amount > 0),
  member_count integer not null check (member_count between 2 and 50),
  duration_months integer not null check (duration_months between 1 and 60),
  draw_type draw_type not null default 'lottery',
  start_date date not null,
  status committee_status not null default 'draft',
  created_at timestamptz not null default now()
);
```

| Column          | Type              | Nullable | Default            | Constraints                            |
|-----------------|-------------------|----------|--------------------|----------------------------------------|
| id              | uuid              | NO       | gen_random_uuid()  | PK                                     |
| organizer_id    | uuid              | NO       | -                  | FK -> profiles(id) CASCADE             |
| name            | text              | NO       | -                  | length 1 to 100                        |
| description     | text              | YES      | NULL               | -                                      |
| monthly_amount  | numeric(12,2)     | NO       | -                  | > 0                                    |
| member_count    | integer           | NO       | -                  | between 2 and 50                       |
| duration_months | integer           | NO       | -                  | between 1 and 60                       |
| draw_type       | draw_type         | NO       | 'lottery'          | -                                      |
| start_date      | date              | NO       | -                  | -                                      |
| status          | committee_status  | NO       | 'draft'            | -                                      |
| created_at      | timestamptz       | NO       | now()              | -                                      |

Check constraints:
- name: char_length between 1 and 100
- monthly_amount: greater than 0
- member_count: between 2 and 50
- duration_months: between 1 and 60

Application note: the createCommittee action sets status to "active"
directly, and enforces duration_months == member_count (ROSCA fairness).


### 4.3 members

A participant in a committee. A member can exist without a user account
because the organizer adds people by name and phone only.

```sql
create table members (
  id uuid primary key default gen_random_uuid(),
  committee_id uuid not null references committees(id) on delete cascade,
  user_id uuid references profiles(id) on delete set null,
  name text not null check (char_length(name) between 1 and 100),
  phone text,
  draw_month_index integer check (
    draw_month_index is null or
    (draw_month_index >= 0 and draw_month_index < 60)
  ),
  created_at timestamptz not null default now(),
  unique (committee_id, user_id)
);
```

| Column            | Type         | Nullable | Default           | Constraints                              |
|-------------------|--------------|----------|-------------------|------------------------------------------|
| id                | uuid         | NO       | gen_random_uuid() | PK                                       |
| committee_id      | uuid         | NO       | -                 | FK -> committees(id) CASCADE             |
| user_id           | uuid         | YES      | NULL              | FK -> profiles(id) SET NULL              |
| name              | text         | NO       | -                 | length 1 to 100                          |
| phone             | text         | YES      | NULL              | -                                        |
| draw_month_index  | integer      | YES      | NULL              | null, or between 0 and 59                |
| created_at        | timestamptz  | NO       | now()             | -                                        |

Unique constraint:
- (committee_id, user_id): a user can only be added once per committee

Notes:
- user_id is nullable. Members added by the organizer (name + phone) do
  not have accounts yet. If they sign up later, the row can be linked.
- ON DELETE SET NULL on user_id: deleting a user keeps the member row
  but detaches it from the account.
- draw_month_index is null until the draw schedule is generated. After
  creation, it is set to the month (0 based) when this member gets the pot.


### 4.4 contributions

A single monthly payment from a member. One row per member per month
per committee.

```sql
create table contributions (
  id uuid primary key default gen_random_uuid(),
  committee_id uuid not null references committees(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  month_index integer not null check (month_index >= 0),
  due_date date not null,
  amount numeric(12, 2) not null check (amount >= 0),
  status contribution_status not null default 'pending',
  paid_at timestamptz,
  payment_method payment_method,
  note text,
  created_at timestamptz not null default now(),
  unique (committee_id, member_id, month_index)
);
```

| Column          | Type                 | Nullable | Default           | Constraints                              |
|-----------------|----------------------|----------|-------------------|------------------------------------------|
| id              | uuid                 | NO       | gen_random_uuid() | PK                                       |
| committee_id    | uuid                 | NO       | -                 | FK -> committees(id) CASCADE             |
| member_id       | uuid                 | NO       | -                 | FK -> members(id) CASCADE                |
| month_index     | integer              | NO       | -                 | >= 0                                     |
| due_date        | date                 | NO       | -                 | -                                        |
| amount          | numeric(12,2)        | NO       | -                 | >= 0                                     |
| status          | contribution_status  | NO       | 'pending'         | -                                        |
| paid_at         | timestamptz          | YES      | NULL              | -                                        |
| payment_method  | payment_method       | YES      | NULL              | -                                        |
| note            | text                 | YES      | NULL              | -                                        |
| created_at      | timestamptz          | NO       | now()             | -                                        |

Unique constraint:
- (committee_id, member_id, month_index): one contribution per member
  per month per committee

Notes:
- All contribution rows are pre-created at committee creation time.
  For a 10 member, 10 month committee, that is 100 rows inserted at once.
- The organizer only updates status, paid_at, and payment_method.
- due_date is computed as start_date + month_index months.


### 4.5 draws

A scheduled pot payout for a specific month. One draw per month per
committee.

```sql
create table draws (
  id uuid primary key default gen_random_uuid(),
  committee_id uuid not null references committees(id) on delete cascade,
  month_index integer not null check (month_index >= 0),
  member_id uuid not null references members(id) on delete cascade,
  amount numeric(12, 2) not null check (amount >= 0),
  status text not null default 'scheduled' check (status in ('scheduled', 'completed')),
  created_at timestamptz not null default now(),
  unique (committee_id, month_index)
);
```

| Column        | Type         | Nullable | Default           | Constraints                              |
|---------------|--------------|----------|-------------------|------------------------------------------|
| id            | uuid         | NO       | gen_random_uuid() | PK                                       |
| committee_id  | uuid         | NO       | -                 | FK -> committees(id) CASCADE             |
| month_index   | integer      | NO       | -                 | >= 0                                     |
| member_id     | uuid         | NO       | -                 | FK -> members(id) CASCADE                |
| amount        | numeric(12,2)| NO       | -                 | >= 0                                     |
| status        | text         | NO       | 'scheduled'       | in ('scheduled', 'completed')            |
| created_at    | timestamptz  | NO       | now()             | -                                        |

Unique constraint:
- (committee_id, month_index): only one winner per month per committee

Notes:
- amount is the total pot: monthly_amount * member_count. Denormalized
  for quick display without a join.
- status uses a plain text with a CHECK constraint instead of an enum
  type. This is a minor schema choice for simplicity. Values are
  'scheduled' and 'completed'.
- The draw schedule is generated at committee creation by the
  generateDrawSchedule function and inserted as a batch.


---

## 5. Relationships

### 5.1 Relationship Summary

| Parent        | Child          | Type  | FK Column       | On Delete    |
|---------------|----------------|-------|-----------------|--------------|
| auth.users    | profiles       | 1:1   | id              | CASCADE      |
| profiles      | committees     | 1:N   | organizer_id    | CASCADE      |
| profiles      | members        | 1:N   | user_id         | SET NULL     |
| committees    | members        | 1:N   | committee_id    | CASCADE      |
| committees    | contributions  | 1:N   | committee_id    | CASCADE      |
| committees    | draws          | 1:N   | committee_id    | CASCADE      |
| members       | contributions  | 1:N   | member_id       | CASCADE      |
| members       | draws          | 1:N   | member_id       | CASCADE      |

### 5.2 Cascade Behavior

Deleting a committee cascades to members, contributions, and draws.
This is used by the createCommittee action for cleanup: if any step
fails after the committee insert, deleting the committee row removes
all partial data.

Deleting a user (auth.users) cascades to profiles. Committees owned
by that user are also removed (profiles -> committees CASCADE). Member
rows with that user_id are set to null (kept but detached).

### 5.3 Key Design Points

- profiles.id is both PK and FK to auth.users. This guarantees the
  1:1 relationship at the database level.
- members.user_id is nullable. This is intentional: the organizer adds
  people by name and phone. Not everyone has or needs an account.
- The unique (committee_id, user_id) constraint prevents adding the
  same user twice to one committee.
- The unique (committee_id, member_id, month_index) constraint on
  contributions prevents duplicate payment records for the same month.
- The unique (committee_id, month_index) constraint on draws enforces
  that only one member wins the pot per month.


---

## 6. Indexes

Indexes created in the migration to speed up common queries.

```sql
-- Committees: filter by organizer, filter by status
create index idx_committees_organizer on committees(organizer_id);
create index idx_committees_status on committees(status);

-- Members: lookup by committee, lookup by user
create index idx_members_committee on members(committee_id);
create index idx_members_user on members(user_id);

-- Contributions: filter by committee, filter by member, filter by status
create index idx_contributions_committee on contributions(committee_id);
create index idx_contributions_member on contributions(member_id);
create index idx_contributions_status on contributions(status);

-- Draws: lookup by committee
create index idx_draws_committee on draws(committee_id);
```

Index summary:

| Index                          | Table         | Column(s)      | Speeds up                            |
|--------------------------------|---------------|----------------|--------------------------------------|
| idx_committees_organizer       | committees    | organizer_id   | Dashboard: my committees             |
| idx_committees_status          | committees    | status         | Filter active vs completed           |
| idx_members_committee          | members       | committee_id   | Committee detail: member list        |
| idx_members_user               | members       | user_id        | Find committees a user belongs to    |
| idx_contributions_committee    | contributions | committee_id   | Committee detail: all payments       |
| idx_contributions_member       | contributions | member_id      | Member payment history               |
| idx_contributions_status       | contributions | status         | Dashboard: pending count             |
| idx_draws_committee            | draws         | committee_id   | Committee detail: draw schedule      |

All primary keys have implicit indexes (PostgreSQL default).


---

## 7. Row Level Security

RLS is enabled on all 5 application tables. This ensures users can
only access data they own or participate in, even if the application
has a bug.

```sql
alter table profiles enable row level security;
alter table committees enable row level security;
alter table members enable row level security;
alter table contributions enable row level security;
alter table draws enable row level security;
```

### 7.1 profiles Policies

| Policy                       | Operation | Rule                      |
|------------------------------|-----------|---------------------------|
| Users can view own profile   | SELECT    | auth.uid() = id           |
| Users can update own profile | UPDATE    | auth.uid() = id           |

A user can only see and edit their own profile row. No INSERT policy
exists because profiles are created by the trigger (security definer).

### 7.2 committees Policies

| Policy                          | Operation | Rule                                           |
|---------------------------------|-----------|------------------------------------------------|
| Organizers manage their committees | ALL    | auth.uid() = organizer_id                      |
| Members can view their committees | SELECT  | exists member where user_id = auth.uid()       |

Organizers have full access (insert, select, update, delete) to their
own committees. Members can view committees they belong to.

### 7.3 members Policies

| Policy                       | Operation | Rule                                                     |
|------------------------------|-----------|----------------------------------------------------------|
| Organizers manage members    | ALL       | exists committee where organizer_id = auth.uid()         |
| Members view their own row   | SELECT    | user_id = auth.uid() OR organizer of parent committee    |

Organizers manage all members in their committees. A member can view
their own member row, and the organizer can view all.

### 7.4 contributions Policies

| Policy                          | Operation | Rule                                                  |
|---------------------------------|-----------|-------------------------------------------------------|
| Organizers manage contributions | ALL       | exists committee where organizer_id = auth.uid()      |
| Members view their contributions| SELECT    | exists member where user_id = auth.uid()              |

Organizers have full control. A member can view contributions linked
to their own member row.

### 7.5 draws Policies

| Policy                   | Operation | Rule                                                  |
|--------------------------|-----------|-------------------------------------------------------|
| Organizers manage draws  | ALL       | exists committee where organizer_id = auth.uid()      |
| Members view draws       | SELECT    | exists member where user_id = auth.uid()              |

Same pattern as contributions. Organizers manage, members view.

### 7.6 RLS Pattern Summary

All child tables (members, contributions, draws) use the same pattern:

- Organizer full access: check if the parent committee's organizer_id
  matches auth.uid().
- Member read access: check if a member row exists with user_id =
  auth.uid() in the same committee.

This creates a consistent, predictable security model.


---

## 8. Triggers

### 8.1 handle_new_user

Automatically creates a profile row when a new auth user signs up.

```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

How it works:
1. User signs up via Supabase Auth (supabase.auth.signUp).
2. Supabase inserts a row into auth.users.
3. The AFTER INSERT trigger fires.
4. handle_new_user() inserts a matching row into profiles.
5. It reads full_name from raw_user_meta_data (set by the signup action
   via options.data.full_name).
6. The function is SECURITY DEFINER so it can insert into profiles
   even though no INSERT RLS policy exists for regular users.

Key points:
- SECURITY DEFINER means the function runs with the privileges of its
  owner (typically the postgres role), bypassing RLS.
- set search_path = public prevents search path injection attacks.
- coalesce handles the case where full_name metadata is missing.
- The trigger name is on_auth_user_created.


---

## 9. Sample Data

Example data showing a complete 3 member, 3 month committee.

### 9.1 profiles

| id                                   | email            | full_name  | plan  |
|--------------------------------------|------------------|------------|-------|
| a1b2c3d4-...-000000000001            | ali@example.com  | Ali Khan   | free  |

### 9.2 auth.users (Supabase managed, simplified)

| id                                   | email            |
|--------------------------------------|------------------|
| a1b2c3d4-...-000000000001            | ali@example.com  |

### 9.3 committees

| id                                   | organizer_id          | name              | monthly_amount | member_count | duration_months | draw_type | start_date | status |
|--------------------------------------|-----------------------|-------------------|----------------|--------------|-----------------|-----------|------------|--------|
| c0ffee00-...-000000000001            | a1b2c3d4-...-0001     | Test Committee    | 5000.00        | 3            | 3               | lottery   | 2026-07-15 | active |

### 9.4 members

| id                                   | committee_id       | user_id            | name       | phone          | draw_month_index |
|--------------------------------------|--------------------|--------------------|------------|----------------|------------------|
| m0000001-...                         | c0ffee00-...-01    | a1b2c3d4-...-01    | Ali Khan   | NULL           | 2                |
| m0000002-...                         | c0ffee00-...-01    | NULL               | Sara Khan  | +92 300 111    | 0                |
| m0000003-...                         | c0ffee00-...-01    | NULL               | Bilal Khan | +92 300 222    | 1                |

Note: Ali (the organizer) is member 0 with a user_id. Sara and Bilal
were added by name and phone, so their user_id is NULL.

### 9.5 contributions (partial, showing month 0)

| id           | committee_id    | member_id    | month_index | due_date   | amount  | status   | paid_at | payment_method |
|--------------|-----------------|--------------|-------------|------------|---------|----------|---------|----------------|
| con-001      | c0ffee00-...-01 | m0000001-... | 0           | 2026-07-15 | 5000.00 | paid     | 2026-07-14T... | cash   |
| con-002      | c0ffee00-...-01 | m0000002-... | 0           | 2026-07-15 | 5000.00 | pending  | NULL    | NULL           |
| con-003      | c0ffee00-...-01 | m0000003-... | 0           | 2026-07-15 | 5000.00 | pending  | NULL    | NULL           |
| con-004      | c0ffee00-...-01 | m0000001-... | 1           | 2026-08-15 | 5000.00 | pending  | NULL    | NULL           |
| ...          | ...             | ...          | ...         | ...        | ...     | ...      | ...     | ...            |

A 3 member, 3 month committee has 9 contribution rows total (3 x 3).

### 9.6 draws

| id           | committee_id    | month_index | member_id    | amount   | status    |
|--------------|-----------------|-------------|--------------|----------|-----------|
| draw-001     | c0ffee00-...-01 | 0           | m0000002-... | 15000.00 | scheduled |
| draw-002     | c0ffee00-...-01 | 1           | m0000003-... | 15000.00 | scheduled |
| draw-003     | c0ffee00-...-01 | 2           | m0000001-... | 15000.00 | scheduled |

The pot amount is monthly_amount * member_count = 5000 * 3 = 15000.
The schedule was shuffled (lottery), so the order is Sara, Bilal, Ali.

### 9.7 Sample Queries

Get all committees for the current user:

```sql
select * from committees
where organizer_id = auth.uid()
order by created_at desc;
```

Get current month contributions for a committee:

```sql
select c.*, m.name as member_name
from contributions c
join members m on c.member_id = m.id
where c.committee_id = '<committee-id>'
  and c.month_index = 0
order by m.created_at;
```

Get the full draw schedule with member names:

```sql
select d.month_index, m.name as winner, d.amount, d.status
from draws d
join members m on d.member_id = m.id
where d.committee_id = '<committee-id>'
order by d.month_index;
```

Calculate total collected for a user's committees:

```sql
select coalesce(sum(amount), 0) as total
from contributions
where committee_id in (
  select id from committees where organizer_id = auth.uid()
)
and status = 'paid';
```


---

## 10. Design Decisions

### 10.1 Why UUIDs for all primary keys?

UUIDs prevent enumeration attacks (you cannot guess other committee
IDs) and allow client side ID generation if needed in the future.
gen_random_uuid() is used as the default.

### 10.2 Why numeric(12,2) for money?

numeric(12,2) stores exact decimal values with 2 decimal places,
avoiding floating point errors. It supports amounts up to
99,999,999,999.99 which is more than enough for committee amounts.

### 10.3 Why nullable user_id on members?

The organizer adds members by name and phone. Not everyone has or
wants an account. This makes onboarding frictionless. If a member
later signs up, their member row can be linked to the new profile.

### 10.4 Why pre-create all contribution rows?

When a committee is created, all contribution rows for all months are
inserted at once. This means:
- The dashboard can count pending payments with a simple query.
- No need to generate rows month by month.
- The organizer just updates status as payments come in.

Tradeoff: a 50 member, 60 month committee creates 3000 rows. This is
fine for PostgreSQL.

### 10.5 Why store the pot amount on each draw?

The draw.amount field denormalizes monthly_amount * member_count. This
avoids a join when displaying the draw schedule. If the monthly amount
changes (not currently supported), draws would need recalculation.

### 10.6 Why no transaction in createCommittee?

The Supabase JS client does not support multi statement transactions.
Instead, the action uses cascade delete for cleanup: if any step fails,
the committee row is deleted, which removes all partial child rows.
This is a pragmatic workaround.

### 10.7 Why RLS on every table?

RLS is the last line of defense. Even if the application code has a
bug that sends the wrong query, the database will refuse to return or
modify data the user does not own. This is critical for a financial
transparency app.

### 10.8 Why a trigger instead of app code for profiles?

The handle_new_user trigger ensures a profile row is always created,
regardless of how the signup happens (web app, mobile client, API).
It is a single source of truth and cannot be bypassed by the client.
