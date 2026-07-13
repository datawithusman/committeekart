-- ============================================
-- CommitteeKart: Repair Existing Committee Data
-- ============================================
--
-- Fixes committees that have inconsistent data from the old
-- buggy add/remove member functions (before migration 0011).
--
-- This migration:
-- 1. Sets duration_months = member_count for ALL committees
-- 2. Creates missing draw rows for months without a draw
-- 3. Creates missing contribution rows for all member/month combos
--
-- Run this in Supabase SQL Editor.
-- ============================================


-- ============================================
-- 1. Fix duration_months = member_count
-- ============================================
update committees
set duration_months = member_count
where duration_months <> member_count;


-- ============================================
-- 2. Create missing draw rows
-- ============================================
-- For each committee, for each month 0 to duration-1,
-- if no draw exists, assign it to a member who doesn't have a draw yet.

do $$
declare
  c record;
  m_record record;
  max_month integer;
  assigned_count integer;
  unassigned_member record;
begin
  -- Loop through each active committee.
  for c in select id, member_count, monthly_amount, duration_months from committees where status = 'active' loop
    max_month := c.duration_months - 1;

    -- For each month that should have a draw.
    for m_record in
      select generate_series(0, max_month) as month_idx
      where not exists (
        select 1 from draws where committee_id = c.id and month_index = month_idx
      )
    loop
      -- Find a member who doesn't have a draw yet.
      select id into unassigned_member
      from members
      where committee_id = c.id
        and id not in (select member_id from draws where committee_id = c.id)
      order by created_at
      limit 1;

      if found then
        insert into draws (committee_id, month_index, member_id, amount, status)
        values (c.id, m_record.month_idx, unassigned_member.id, c.monthly_amount * c.member_count, 'scheduled')
        on conflict (committee_id, month_index) do nothing;

        -- Update the member's draw_month_index.
        update members set draw_month_index = m_record.month_idx
        where id = unassigned_member.id;
      end if;
    end loop;
  end loop;
end;
$$;


-- ============================================
-- 3. Create missing contribution rows
-- ============================================
-- For each committee, for each member, for each month 0 to duration-1,
-- if no contribution exists, create a pending one.

do $$
declare
  c record;
  m_record record;
  mem record;
  due_date_val date;
begin
  for c in select id, duration_months, monthly_amount, start_date from committees loop
    -- Loop through each month.
    for m_record in select generate_series(0, c.duration_months - 1) as month_idx loop
      due_date_val := (c.start_date::date + (m_record.month_idx || ' month')::interval)::date;

      -- Loop through each member in this committee.
      for mem in select id from members where committee_id = c.id loop
        -- Insert if missing.
        insert into contributions (committee_id, member_id, month_index, due_date, amount, status)
        values (c.id, mem.id, m_record.month_idx, due_date_val, c.monthly_amount, 'pending')
        on conflict (committee_id, member_id, month_index) do nothing;
      end loop;
    end loop;
  end loop;
end;
$$;
