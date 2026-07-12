-- ============================================
-- CommitteeKart: Public Invite Token Lookup
-- ============================================
--
-- PROBLEM:
-- The invite page (/invite/[token]) is public (no login required).
-- But RLS on the members table blocks unauthenticated reads.
-- So the invite token lookup always returns null.
--
-- FIX:
-- Create a SECURITY DEFINER function that looks up a member
-- by invite token, bypassing RLS. Only returns the data needed
-- for the invite page (no sensitive fields).
--
-- Run this in Supabase SQL Editor.
-- ============================================


-- Create a function to look up a member by invite token.
-- SECURITY DEFINER bypasses RLS so public users can find their invite.
-- Only returns non-sensitive fields needed for the invite page.
create or replace function public.get_member_by_invite_token(token text)
returns table(
  id uuid,
  committee_id uuid,
  user_id uuid,
  name text,
  phone text,
  draw_month_index integer,
  invite_token text
)
language sql
security definer
set search_path = public
as $$
  select
    m.id,
    m.committee_id,
    m.user_id,
    m.name,
    m.phone,
    m.draw_month_index,
    m.invite_token
  from members m
  where m.invite_token = token
  limit 1;
$$;


-- Also need public access to read committee info for the invite page.
-- Create a function to get basic committee info by ID (for invite display).
create or replace function public.get_committee_for_invite(committee_uuid uuid)
returns table(
  id uuid,
  name text,
  description text,
  monthly_amount numeric,
  member_count integer,
  duration_months integer,
  draw_type draw_type,
  start_date date,
  status committee_status
)
language sql
security definer
set search_path = public
as $$
  select
    c.id,
    c.name,
    c.description,
    c.monthly_amount,
    c.member_count,
    c.duration_months,
    c.draw_type,
    c.start_date,
    c.status
  from committees c
  where c.id = committee_uuid
    and c.status in ('active', 'completed')
  limit 1;
$$;
