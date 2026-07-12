-- ============================================
-- CommitteeKart: Claim Membership Function
-- ============================================
--
-- PROBLEM:
-- When a member clicks "Join Committee", the claimMembership action
-- tries to UPDATE the members table to set user_id.
-- But RLS policy only allows organizers to UPDATE members.
-- The member is not the organizer, so the update silently fails
-- (0 rows updated, no error returned).
--
-- FIX:
-- Create a SECURITY DEFINER function that links a user account
-- to a member row by invite token. This bypasses RLS safely.
-- Only works if: token matches AND user_id is null (not already claimed).
--
-- Run this in Supabase SQL Editor.
-- ============================================


create or replace function public.claim_member_profile(token text)
returns table(success boolean, committee_id uuid, error text)
language plpgsql
security definer
set search_path = public
as $$
declare
  target_member record;
begin
  -- Find the member by invite token.
  select * into target_member
  from members
  where invite_token = token
  limit 1;

  -- Token not found.
  if not found then
    return query select false, null::uuid, 'Invalid invite token.'::text;
    return;
  end if;

  -- Already claimed by this user (idempotent success).
  if target_member.user_id = auth.uid() then
    return query select true, target_member.committee_id, null::text;
    return;
  end if;

  -- Already claimed by someone else.
  if target_member.user_id is not null then
    return query select false, null::uuid, 'Yeh invite pehle se use ho chuka hai.'::text;
    return;
  end if;

  -- Claim it: set user_id for this member.
  update members
  set user_id = auth.uid()
  where id = target_member.id
    and user_id is null;

  return query select true, target_member.committee_id, null::text;
end;
$$;
