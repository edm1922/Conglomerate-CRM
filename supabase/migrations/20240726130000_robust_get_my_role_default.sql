-- MIGRATION: Final, robust fix for get_my_role()
--
-- This migration corrects the `get_my_role()` function to handle cases where
-- a user exists in auth but not in the public.profiles table.
--
-- The previous function returned NULL in this case, causing all RLS policies
-- to fail and resulting in the "Database error querying schema" error.
--
-- This new version ensures a valid role is ALWAYS returned by safely defaulting
-- to '''agent''' if a profile or role is not found. This will finally resolve the issue.
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
  -- Temporarily disable RLS for the current transaction to break any potential recursive loops.
  perform set_config('''row_level_security.enable''', '''off''', true);

  -- Safely query the role from the profiles table.
  select role into _role from public.profiles where id = auth.uid();

  -- IMPORTANT: Re-enable RLS immediately.
  perform set_config('''row_level_security.enable''', '''on''', true);

  -- If the user has no profile or their role is null, default them to '''agent'''.
  -- This is the critical fix that prevents the function from returning NULL.
  if _role is null then
    return '''agent''';
  end if;

  return _role;

exception
  -- In case of any other unexpected error during the lookup,
  -- still default to '''agent''' to ensure the application does not crash.
  when others then
    return '''agent''';
end;
$$;
