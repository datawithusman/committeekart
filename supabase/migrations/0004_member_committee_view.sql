-- ============================================
-- CommitteeKart: Allow Members to View Committees
-- ============================================
--
-- PROBLEM:
-- Migration 0002 dropped the "Members can view their committees" policy
-- to fix infinite recursion. But this means members who claimed their
-- profiles cannot view the committee detail page.
--
-- FIX:
-- Add a policy on committees that checks if the user is a member.
-- This does NOT cause recursion because the members table policy
-- checks committees.organizer_id (one direction only), and this
-- policy checks members.user_id (the other direction). Neither
-- creates a loop.
--
-- Run this in Supabase SQL Editor.
-- ============================================

-- Allow members to SELECT committees they belong to.
-- This is read-only: members cannot create, update, or delete committees.
create policy "Members can view committees they joined"
  on committees for select
  to authenticated
  using (
    exists (
      select 1 from members
      where members.committee_id = committees.id
      and members.user_id = auth.uid()
    )
  );
