-- ============================================
-- CommitteeKart: Fix Member Management Functions
-- ============================================
--
-- Fix: "column reference id is ambiguous" error in
-- add_committee_member and remove_committee_member.
--
-- The return type column "id" conflicted with table column "id"
-- in the RETURN QUERY. Renamed return columns to avoid ambiguity.
--
-- Run this in Supabase SQL Editor.
-- ============================================


-- Drop old functions first.
drop function if exists public.add_committee_member(uuid, text, text);
drop function if exists public.remove_committee_member(uuid, uuid);


-- Recreate add_committee_member with non-ambiguous return column names.
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
  new_id uuid;
  new_token text;
begin
  -- Verify the caller is the organizer.
  select c.organizer_id into v_organizer_id
  from committees c
  where c.id = p_committee_id;

  if not found then
    return query select null::uuid, null::text, 'Committee nahi mili.'::text;
    return;
  end if;

  if v_organizer_id <> auth.uid() then
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

  -- Insert the new member.
  insert into members (id, committee_id, name, phone, invite_token)
  values (new_id, p_committee_id, p_name, p_phone, new_token);

  -- Update committee member count.
  update committees set member_count = member_count + 1 where id = p_committee_id;

  return query select new_id, new_token, null::text;
end;
$$;


-- Recreate remove_committee_member.
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
  v_member_user_id uuid;
begin
  -- Verify the caller is the organizer.
  select c.organizer_id into v_organizer_id
  from committees c
  where c.id = p_committee_id;

  if not found then
    return query select false, 'Committee nahi mili.'::text;
    return;
  end if;

  if v_organizer_id <> auth.uid() then
    return query select false, 'Sirf organizer member remove kar sakta hai.'::text;
    return;
  end if;

  -- Get the target member's user_id.
  select m.user_id into v_member_user_id
  from members m
  where m.id = p_member_id and m.committee_id = p_committee_id;

  if not found then
    return query select false, 'Member nahi mila.'::text;
    return;
  end if;

  -- Cannot remove the organizer.
  if v_member_user_id = v_organizer_id then
    return query select false, 'Organizer ko remove nahi kiya ja sakta.'::text;
    return;
  end if;

  -- Delete the member (cascades to contributions and draws).
  delete from members where id = p_member_id;

  -- Update committee member count.
  update committees set member_count = member_count - 1 where id = p_committee_id;

  return query select true, null::text;
end;
$$;
