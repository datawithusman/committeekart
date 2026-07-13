-- ============================================
-- CommitteeKart: Repair Existing Committee Data
-- ============================================
--
-- Fixes committees that have inconsistent data from the old
-- buggy add/remove member functions.
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
-- For each committee, for each month, if no draw exists,
-- assign it to a member who doesn't have a draw yet.

do $$
declare
  c record;
  mi integer;
  max_month integer;
  unassigned_member_id uuid;
begin
  -- Loop through each active committee.
  for c in select id, member_count, monthly_amount, duration_months
           from committees where status = 'active' loop

    max_month := c.duration_months - 1;

    -- For each month from 0 to max_month.
    for mi in 0..max_month loop
      -- Skip if a draw already exists for this month.
      if not exists (select 1 from draws where committee_id = c.id and month_index = mi) then

        -- Find a member who doesn't have a draw yet.
        select m.id into unassigned_member_id
        from members m
        where m.committee_id = c.id
          and m.id not in (select member_id from draws where committee_id = c.id)
        order by m.created_at
        limit 1;

        if unassigned_member_id is not null then
          -- Create the draw row.
          insert into draws (committee_id, month_index, member_id, amount, status)
          values (c.id, mi, unassigned_member_id, c.monthly_amount * c.member_count, 'scheduled')
          on conflict (committee_id, month_index) do nothing;

          -- Update the member's draw_month_index.
          update members set draw_month_index = mi
          where id = unassigned_member_id;

          unassigned_member_id := null;
        end if;
      end if;
    end loop;
  end loop;
end;
$$;


-- ============================================
-- 3. Create missing contribution rows
-- ============================================
-- For each committee, for each member, for each month,
-- if no contribution exists, create a pending one.

do $$
declare
  c record;
  mi integer;
  mem record;
  due_date_val date;
begin
  for c in select id, duration_months, monthly_amount, start_date from committees loop

    -- Loop through each month.
    for mi in 0..(c.duration_months - 1) loop
      due_date_val := (c.start_date::date + (mi || ' month')::interval)::date;

      -- Loop through each member in this committee.
      for mem in select id from members where committee_id = c.id loop
        -- Insert if missing.
        insert into contributions (committee_id, member_id, month_index, due_date, amount, status)
        values (c.id, mem.id, mi, due_date_val, c.monthly_amount, 'pending')
        on conflict (committee_id, member_id, month_index) do nothing;
      end loop;
    end loop;
  end loop;
end;
$$;
