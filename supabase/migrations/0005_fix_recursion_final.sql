-- ============================================
-- CommitteeKart: Final RLS Recursion Fix
-- ============================================
--
-- PROBLEM:
-- Migration 0004 added "Members can view committees they joined"
-- which checks: exists(select 1 from members where ... user_id = auth.uid())
-- But the members table policy checks: committees.organizer_id = auth.uid()
-- This creates mutual recursion: committees -> members -> committees
--
-- FIX:
-- Use a SECURITY DEFINER function that checks membership without
-- triggering RLS recursion. Functions bypass RLS by default, so
-- this breaks the cycle cleanly.
--
-- Run this in Supabase SQL Editor.
-- ============================================


-- Step 1: Drop the recursive policy from migration 0004.
drop policy if exists "Members can view committees they joined" on committees;


-- Step 2: Create a SECURITY DEFINER function that checks if the
-- current user is a member of a given committee.
-- SECURITY DEFINER means it runs with the privileges of the function
-- owner (postgres), bypassing RLS. This breaks the recursion.
create or replace function public.is_committee_member(committee_uuid uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists(
    select 1 from members
    where members.committee_id = committee_uuid
    and members.user_id = auth.uid()
  );
$$;


-- Step 3: Add the policy using the function instead of a subquery.
-- This avoids recursion because the function does not go through RLS.
create policy "Members can view committees they joined"
  on committees for select
  to authenticated
  using (public.is_committee_member(committees.id));
