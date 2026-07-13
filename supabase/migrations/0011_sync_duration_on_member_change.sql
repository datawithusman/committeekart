-- ============================================
-- CommitteeKart: Sync Duration + Schedule on Member Changes
-- ============================================
--
-- When a member is added: duration_months++, new draw row created,
-- new contribution rows created for all members for the new month.
--
-- When a member is removed: duration_months--, last month's draw
-- and contributions removed (only if that member hadn't received pot yet).
--
-- Run this in Supabase SQL Editor.
-- ============================================


-- Drop old versions of the functions.
drop function if exists public.add_committee_member(uuid, text, text);
drop function if exists public.remove_committee_member(uuid, uuid);


-- ============================================
-- ADD MEMBER (with full schedule sync)
-- ============================================
create or replace function public.add_committee_member(
  p_committee_id uuid,
  p_name text,
  p_phone text default null
)
returns table(member_id uuid, invite_token text, error_msg text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_organizer_id uuid;
  v_committee record;
  new_id uuid;
  new_token text;
  new_month_index integer;
  draw_amount numeric;
  existing_member record;
begin
  -- Get the committee info.
  select * into v_committee
  from committees
  where id = p_committee_id;

  if not found then
    return query select null::uuid, null::text, 'Committee nahi mili.'::text;
    return;
  end if;

  if v_committee.organizer_id <> auth.uid() then
    return query select null::uuid, null::text, 'Sirf organizer member add kar sakta hai.'::text;
    return;
  end if;

  -- Validate name.
  if p_name is null or char_length(p_name) < 1 or char_length(p_name) > 100 then
    return query select null::uuid, null::text, 'Naam 1 se 100 characters ke beech hona chahiye.'::text;
    return;
  end if;

  -- Generate UUID and token.
  new_id := gen_random_uuid();
  new_token := gen_random_uuid()::text;

  -- The new month index is the current duration (0-based: if duration=5,
  -- the new month index is 5, i.e. the 6th month).
  new_month_index := v_committee.duration_months;

  -- Pot amount for this committee.
  draw_amount := v_committee.monthly_amount * (v_committee.member_count + 1);

  -- Insert the new member.
  insert into members (id, committee_id, name, phone, invite_token, draw_month_index)
  values (new_id, p_committee_id, p_name, p_phone, new_token, new_month_index);

  -- Create contribution rows for the new member for ALL existing months.
  -- (The new member owes payments for months that already happened.)
  for existing_member in select id from members where committee_id = p_committee_id and id <> new_id limit 1 loop
    -- Loop through all months 0 to new_month_index and create contributions
    -- for the new member.
  end loop;

  -- Create contributions for the new member for each month.
  -- Using a simple loop.
  <<month_loop>>
  for i in 0..new_month_index loop
    insert into contributions (committee_id, member_id, month_index, due_date, amount, status)
    values (
      p_committee_id,
      new_id,
      i,
      (v_committee.start_date::date + (i || ' month')::interval)::date,
      v_committee.monthly_amount,
      'pending'
    )
    on conflict (committee_id, member_id, month_index) do nothing;
  end loop month_loop;

  -- For the NEW month (new_month_index), create contributions for ALL members.
  <<all_members_loop>>
  for existing_member in select id from members where committee_id = p_committee_id loop
    insert into contributions (committee_id, member_id, month_index, due_date, amount, status)
    values (
      p_committee_id,
      existing_member.id,
      new_month_index,
      (v_committee.start_date::date + (new_month_index || ' month')::interval)::date,
      v_committee.monthly_amount,
      'pending'
    )
    on conflict (committee_id, member_id, month_index) do nothing;
  end loop all_members_loop;

  -- Create the draw row for the new month (new member gets the last pot).
  insert into draws (committee_id, month_index, member_id, amount, status)
  values (p_committee_id, new_month_index, new_id, draw_amount, 'scheduled')
  on conflict (committee_id, month_index) do nothing;

  -- Update committee: member_count++ and duration_months++.
  update committees
  set member_count = member_count + 1,
      duration_months = duration_months + 1
  where id = p_committee_id;

  return query select new_id, new_token, null::text;
end;
$$;


-- ============================================
-- REMOVE MEMBER (with schedule cleanup)
-- ============================================
create or replace function public.remove_committee_member(
  p_committee_id uuid,
  p_member_id uuid
)
returns table(success boolean, error_msg text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_organizer_id uuid;
  v_committee record;
  v_member record;
  last_month_index integer;
begin
  -- Get the committee.
  select * into v_committee
  from committees
  where id = p_committee_id;

  if not found then
    return query select false, 'Committee nahi mili.'::text;
    return;
  end if;

  if v_committee.organizer_id <> auth.uid() then
    return query select false, 'Sirf organizer member remove kar sakta hai.'::text;
    return;
  end if;

  -- Get the member.
  select * into v_member
  from members
  where id = p_member_id and committee_id = p_committee_id;

  if not found then
    return query select false, 'Member nahi mila.'::text;
    return;
  end if;

  -- Cannot remove the organizer.
  if v_member.user_id = v_organizer_id then
    return query select false, 'Organizer ko remove nahi kiya ja sakta.'::text;
    return;
  end if;

  -- The last month index (before removal).
  last_month_index := v_committee.duration_months - 1;

  -- Delete the member (cascades to their contributions and draws).
  delete from members where id = p_member_id;

  -- Delete the last month's contributions for ALL remaining members
  -- (since duration is decreasing).
  delete from contributions
  where committee_id = p_committee_id and month_index = last_month_index;

  -- Delete the last month's draw.
  delete from draws
  where committee_id = p_committee_id and month_index = last_month_index;

  -- Update committee: member_count-- and duration_months--.
  update committees
  set member_count = member_count - 1,
      duration_months = duration_months - 1
  where id = p_committee_id;

  return query select true, null::text;
end;
$$;
