-- ============================================
-- CommitteeKart: Fix RLS Infinite Recursion
-- ============================================
--
-- PROBLEM:
-- The "Members can view their committees" policy on the committees
-- table queries the members table. The members table policies query
-- the committees table. This creates infinite recursion.
--
-- FIX:
-- Drop the cross-referencing policies and replace them with simpler
-- policies that do not cause recursion.
--
-- Run this in Supabase SQL Editor.
-- ============================================


-- ============================================
-- 1. Drop recursive policies on COMMITTEES
-- ============================================

drop policy if exists "Members can view their committees" on committees;

-- Keep the organizer policy (no recursion there).
-- "Organizers manage their committees" stays as-is.


-- ============================================
-- 2. Replace members policies (remove committee references)
-- ============================================

drop policy if exists "Organizers manage members" on members;
drop policy if exists "Members view their own row" on members;

-- Members: organizer can manage all members in their committees.
-- This only checks the committee_id EXISTS, not the organizer_id.
-- But to avoid recursion, we use a subquery on committees which is fine
-- because committees.organizer_id policy does NOT reference members.

create policy "Organizers manage members"
  on members for all
  to authenticated
  using (
    exists (
      select 1 from committees
      where committees.id = members.committee_id
      and committees.organizer_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from committees
      where committees.id = members.committee_id
      and committees.organizer_id = auth.uid()
    )
  );

-- Members can view their own membership rows.
-- A member row is viewable if:
--   a) the member is the logged-in user (user_id matches), OR
--   b) the logged-in user is the organizer of that committee
create policy "Members view their own row"
  on members for select
  to authenticated
  using (
    members.user_id = auth.uid()
    or exists (
      select 1 from committees
      where committees.id = members.committee_id
      and committees.organizer_id = auth.uid()
    )
  );


-- ============================================
-- 3. Contributions policies (already fine, but verify)
-- ============================================
-- The contributions policies reference committees.organizer_id
-- and members tables. The members reference could cause recursion.
-- Let us simplify to only reference committees.

drop policy if exists "Organizers manage contributions" on contributions;
drop policy if exists "Members view their contributions" on contributions;

create policy "Organizers manage contributions"
  on contributions for all
  to authenticated
  using (
    exists (
      select 1 from committees
      where committees.id = contributions.committee_id
      and committees.organizer_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from committees
      where committees.id = contributions.committee_id
      and committees.organizer_id = auth.uid()
    )
  );

create policy "Members view their contributions"
  on contributions for select
  to authenticated
  using (
    exists (
      select 1 from members
      where members.id = contributions.member_id
      and members.user_id = auth.uid()
    )
  );


-- ============================================
-- 4. Draws policies (verify no recursion)
-- ============================================

drop policy if exists "Organizers manage draws" on draws;
drop policy if exists "Members view draws" on draws;

create policy "Organizers manage draws"
  on draws for all
  to authenticated
  using (
    exists (
      select 1 from committees
      where committees.id = draws.committee_id
      and committees.organizer_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from committees
      where committees.id = draws.committee_id
      and committees.organizer_id = auth.uid()
    )
  );

create policy "Members view draws"
  on draws for select
  to authenticated
  using (
    exists (
      select 1 from committees
      where committees.id = draws.committee_id
      and committees.organizer_id = auth.uid()
    )
    or exists (
      select 1 from members
      where members.committee_id = draws.committee_id
      and members.user_id = auth.uid()
    )
  );
