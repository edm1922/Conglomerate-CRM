-- Fix the get_my_role() function with correct quote syntax
-- The previous version had triple quotes which cause SQL syntax errors

CREATE OR REPLACE FUNCTION get_my_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role text;
BEGIN
  -- Temporarily disable RLS for the current transaction to break any potential recursive loops.
  PERFORM set_config('row_level_security.enable', 'off', true);

  -- Safely query the role from the profiles table.
  SELECT role INTO _role FROM public.profiles WHERE id = auth.uid();

  -- IMPORTANT: Re-enable RLS immediately.
  PERFORM set_config('row_level_security.enable', 'on', true);

  -- If the user has no profile or their role is null, default them to 'agent'.
  IF _role IS NULL THEN
    RETURN 'agent';
  END IF;

  RETURN _role;

EXCEPTION
  -- In case of any other unexpected error during the lookup,
  -- still default to 'agent' to ensure the application does not crash.
  WHEN OTHERS THEN
    RETURN 'agent';
END;
$$;