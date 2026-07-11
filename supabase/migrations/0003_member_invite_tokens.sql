-- ============================================
-- CommitteeKart: Member Invite Tokens
-- ============================================
--
-- Adds an invite_token column to the members table so organizers
-- can share a unique link with each member. The member opens the
-- link, and their user account gets linked to the member row.
--
-- Run this in Supabase SQL Editor.
-- ============================================


-- Add invite_token column to members.
-- Each member gets a unique, random token used in the invite URL.
alter table members add column invite_token text unique;

-- Add an index for fast token lookups.
create index idx_members_invite_token on members(invite_token) where invite_token is not null;

-- Backfill invite tokens for existing members.
-- Generates a random UUID for each member that does not have one.
update members
set invite_token = gen_random_uuid()::text
where invite_token is null;
