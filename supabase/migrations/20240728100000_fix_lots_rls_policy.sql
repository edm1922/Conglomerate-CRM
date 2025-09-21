-- MIGRATION: Fix Lots RLS Policy
--
-- This migration updates the Row-Level Security (RLS) policies for the `lots`
-- table to grant agents the same management permissions as admins.
--
-- Key changes:
--   1. Drops the old, restrictive policies for the `lots` table.
--   2. Creates a new, consolidated policy that allows both agents and admins
--      to perform all actions (SELECT, INSERT, UPDATE, DELETE) on lots.

-- 1. Drop the old policies for the `lots` table.
drop policy if exists "Agents and admins can view lots" on public.lots;
drop policy if exists "Admins can manage lots" on public.lots;

-- 2. Create the new, more permissive policy for the `lots` table.
create policy "Agents and admins can manage lots" on public.lots
  for all to authenticated
  using (get_my_role() in ('''admin''', '''agent'''))
  with check (get_my_role() in ('''admin''', '''agent'''));
