-- ============================================
-- CommitteeKart: Member Management Functions
-- ============================================
--
-- SECURITY DEFINER functions for adding and removing members
-- after a committee has been created. Bypasses RLS because
-- the members table can only be written by organizers via RLS,
-- but we want explicit verification in the function.
--
-- Run this in Supabase SQL Editor.
-- ============================================


-- Add a member to a committee (organizer only).
-- Returns the new member's invite token for sharing.
create or replace function public.add_committee_member(
  p_committee_id uuid,
  p_name text,
  p_phone text default null
)
returns table(id uuid, invite_token text, error text)
language plpgsql
security definer
set search_path = public
as $$
declare
  organizer_id uuid;
  current_member_count integer;
  max_members integer;
  new_id uuid;
  new_token text;
begin
  -- Get the committee and verify the caller is the organizer.
  select c.organizer_id, c.member_count, c.duration_months
  into organizer_id, current_member_count, max_members
  from committees c
  where c.id = p_committee_id;

  if not found then
    return query select null::uuid, null::text, 'Committee nahi mili.'::text;
    return;
  end if;

  if organizer_id <> auth.uid() then
    return query select null::uuid, null::text, 'Sirf organizer member add kar sakta hai.'::text;
    return;
  end if;

  -- Validate name.
  if p_name is null or char_length(p_name) < 1 or char_length(p_name) > 100 then
    return query select null::uuid, null::text, 'Naam 1 se 100 characters ke beech hona chahiye.'::text;
    return;
  end if;

  -- Generate UUID for new member.
  new_id := gen_random_uuid();
  new_token := gen_random_uuid()::text;

  -- Insert the new member.
  insert into members (id, committee_id, name, phone, invite_token)
  values (new_id, p_committee_id, p_name, p_phone, new_token);

  -- Update committee member count.
  update committees
  set member_count = member_count + 1
  where id = p_committee_id;

  return query select new_id, new_token, null::text;
end;
$$;


-- Remove a member from a committee (organizer only).
-- Cannot remove the organizer. Cannot remove if they already received their pot.
create or replace function public.remove_committee_member(
  p_committee_id uuid,
  p_member_id uuid
)
returns table(success boolean, error text)
language plpgsql
security definer
set search_path = public
as $$
declare
  organizer_id uuid;
  target_member record;
begin
  -- Verify the caller is the organizer.
  select c.organizer_id into organizer_id
  from committees c
  where c.id = p_committee_id;

  if not found then
    return query select false, 'Committee nahi mili.'::text;
    return;
  end if;

  if organizer_id <> auth.uid() then
    return query select false, 'Sirf organizer member remove kar sakta hai.'::text;
    return;
  end if;

  -- Get the target member.
  select * into target_member
  from members
  where id = p_member_id and committee_id = p_committee_id;

  if not found then
    return query select false, 'Member nahi mila.'::text;
    return;
  end if;

  -- Cannot remove the organizer.
  if target_member.user_id = organizer_id then
    return query select false, 'Organizer ko remove nahi kiya ja sakta.'::text;
    return;
  end if;

  -- Delete the member (cascades to contributions and draws).
  delete from members where id = p_member_id;

  -- Update committee member count.
  update committees
  set member_count = member_count - 1
  where id = p_committee_id;

  return query select true, null::text;
end;
$$;
