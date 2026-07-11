-- ============================================
-- CommitteeKart: Initial Database Schema
-- ============================================
-- Run this in Supabase SQL Editor or via supabase CLI.
--
-- Core idea: "Track, Don't Hold".
-- The app NEVER holds money. It only records contributions
-- and calculates draw schedules for transparency.
--
-- Tables: profiles, committees, members, contributions, draws


-- ============================================
-- 1. ENUMS
-- ============================================

create type draw_type as enum ('lottery', 'fixed', 'auction');
create type committee_status as enum ('draft', 'active', 'completed', 'cancelled');
create type contribution_status as enum ('pending', 'paid', 'late', 'skipped');
create type payment_method as enum ('cash', 'bank_transfer', 'jazzcash', 'easypaisa', 'other');
create type plan_tier as enum ('free', 'pro', 'premium');


-- ============================================
-- 2. PROFILES (extends Supabase auth.users)
-- ============================================
-- Created automatically when a new auth user signs up.
-- Trigger at the bottom of this file handles this.

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  phone text,
  plan plan_tier not null default 'free',
  created_at timestamptz not null default now()
);


-- ============================================
-- 3. COMMITTEES
-- ============================================
-- A savings circle created by an organizer.

create table committees (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid not null references profiles(id) on delete cascade,

  name text not null check (char_length(name) between 1 and 100),
  description text,

  -- Financial configuration
  monthly_amount numeric(12, 2) not null check (monthly_amount > 0),
  member_count integer not null check (member_count between 2 and 50),
  duration_months integer not null check (duration_months between 1 and 60),

  -- How the draw winner is decided
  draw_type draw_type not null default 'lottery',

  -- Scheduling
  start_date date not null,
  status committee_status not null default 'draft',

  created_at timestamptz not null default now()
);

create index idx_committees_organizer on committees(organizer_id);
create index idx_committees_status on committees(status);


-- ============================================
-- 4. MEMBERS
-- ============================================
-- A participant in a committee.
-- user_id can be null because the organizer may add people
-- who have not signed up yet (just name + phone).

create table members (
  id uuid primary key default gen_random_uuid(),
  committee_id uuid not null references committees(id) on delete cascade,
  user_id uuid references profiles(id) on delete set null,

  name text not null check (char_length(name) between 1 and 100),
  phone text,

  -- Which month (0 based index) this member receives the pot.
  -- Null until the draw schedule is generated or assigned.
  draw_month_index integer check (
    draw_month_index is null or
    (draw_month_index >= 0 and draw_month_index < 60)
  ),

  created_at timestamptz not null default now(),

  -- A user can only be added once per committee
  unique (committee_id, user_id)
);

create index idx_members_committee on members(committee_id);
create index idx_members_user on members(user_id);


-- ============================================
-- 5. CONTRIBUTIONS
-- ============================================
-- A single monthly payment from a member.
-- One row per member per month.

create table contributions (
  id uuid primary key default gen_random_uuid(),
  committee_id uuid not null references committees(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,

  -- Month index within the committee (0 = first month)
  month_index integer not null check (month_index >= 0),
  due_date date not null,
  amount numeric(12, 2) not null check (amount >= 0),

  status contribution_status not null default 'pending',
  paid_at timestamptz,
  payment_method payment_method,
  note text,

  created_at timestamptz not null default now(),

  -- A member can only have one contribution per month per committee
  unique (committee_id, member_id, month_index)
);

create index idx_contributions_committee on contributions(committee_id);
create index idx_contributions_member on contributions(member_id);
create index idx_contributions_status on contributions(status);


-- ============================================
-- 6. DRAWS
-- ============================================
-- A scheduled pot payout for a specific month.
-- One draw per month per committee.

create table draws (
  id uuid primary key default gen_random_uuid(),
  committee_id uuid not null references committees(id) on delete cascade,
  month_index integer not null check (month_index >= 0),
  member_id uuid not null references members(id) on delete cascade,

  -- Total pot: monthly_amount * member_count
  amount numeric(12, 2) not null check (amount >= 0),
  status text not null default 'scheduled' check (status in ('scheduled', 'completed')),

  created_at timestamptz not null default now(),

  -- Only one draw winner per month per committee
  unique (committee_id, month_index)
);

create index idx_draws_committee on draws(committee_id);


-- ============================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ============================================
-- Enable RLS so users can only access their own data.
-- Policies enforce: organizers manage their committees,
-- members can view committees they belong to.

alter table profiles enable row level security;
alter table committees enable row level security;
alter table members enable row level security;
alter table contributions enable row level security;
alter table draws enable row level security;

-- Profiles: each user can only see and edit their own profile.
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Committees: organizer can do everything with their own committees.
-- Members of a committee can view it.
create policy "Organizers manage their committees"
  on committees for all
  using (auth.uid() = organizer_id)
  with check (auth.uid() = organizer_id);

create policy "Members can view their committees"
  on committees for select
  using (
    exists (
      select 1 from members
      where members.committee_id = committees.id
      and members.user_id = auth.uid()
    )
  );

-- Members: organizer can manage, members can view.
create policy "Organizers manage members"
  on members for all
  using (
    exists (
      select 1 from committees
      where committees.id = members.committee_id
      and committees.organizer_id = auth.uid()
    )
  );

create policy "Members view their own row"
  on members for select
  using (
    user_id = auth.uid()
    or exists (
      select 1 from committees
      where committees.id = members.committee_id
      and committees.organizer_id = auth.uid()
    )
  );

-- Contributions: organizer can manage, members can view.
create policy "Organizers manage contributions"
  on contributions for all
  using (
    exists (
      select 1 from committees
      where committees.id = contributions.committee_id
      and committees.organizer_id = auth.uid()
    )
  );

create policy "Members view their contributions"
  on contributions for select
  using (
    exists (
      select 1 from members
      where members.id = contributions.member_id
      and members.user_id = auth.uid()
    )
  );

-- Draws: organizer can manage, members can view.
create policy "Organizers manage draws"
  on draws for all
  using (
    exists (
      select 1 from committees
      where committees.id = draws.committee_id
      and committees.organizer_id = auth.uid()
    )
  );

create policy "Members view draws"
  on draws for select
  using (
    exists (
      select 1 from members
      where members.committee_id = draws.committee_id
      and members.user_id = auth.uid()
    )
  );


-- ============================================
-- 8. TRIGGER: Auto create profile on signup
-- ============================================
-- When a new user signs up via Supabase Auth,
-- automatically create a matching profile row.

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
