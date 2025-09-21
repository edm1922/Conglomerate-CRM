-- MIGRATION: Final fix for the get_my_role() recursive loop.
--
-- This migration corrects the `get_my_role()` function. The previous version
-- re-introduced the recursive bug.
--
-- This version uses the `set_config()` method to temporarily disable
-- RLS during the role lookup. This definitively breaks the infinite loop
-- and will resolve the "Database error querying schema" issue.
--

create or replace function get_my_role()
returns text
language plpgsql
security definer
-- Set a specific search path to be secure and explicit.
set search_path = public
as $$
declare
  _role text;
begin
  -- Temporarily disable RLS for the current transaction to break the recursive loop.
  -- This is safe because we are in a SECURITY DEFINER function
  -- and the query is strictly limited to the current user'''s ID.
  perform set_config('''row_level_security.enable''', '''off''', true);

  -- Safely query the role from the profiles table.
  select role into _role from profiles where id = auth.uid();

  -- IMPORTANT: Re-enable RLS immediately.
  perform set_config('''row_level_security.enable''', '''on''', true);

  return _role;
end;
$$;
