-- ============================================
-- CommitteeKart: Get Joined Committees Function
-- ============================================
--
-- Returns all committees a user is a member of (not organizer).
-- Uses SECURITY DEFINER to bypass RLS.
--
-- Run this in Supabase SQL Editor.
-- ============================================

create or replace function public.get_joined_committees()
returns table(
  id uuid,
  name text,
  description text,
  monthly_amount numeric,
  member_count integer,
  duration_months integer,
  draw_type draw_type,
  start_date date,
  status committee_status,
  draw_month_index integer
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
    c.status,
    m.draw_month_index
  from committees c
  inner join members m on m.committee_id = c.id
  where m.user_id = auth.uid()
    and c.organizer_id <> auth.uid()
  order by c.created_at desc;
$$;
