-- NUCLEAR OPTION: Complete reset of profiles table RLS to eliminate infinite recursion
-- This migration completely removes all potential sources of recursion

-- Step 1: Completely disable RLS on profiles table
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop EVERY possible policy that could exist on profiles table
-- (Being very thorough to catch any policy name variations)
DO $$ 
BEGIN
    -- Drop all policies on profiles table regardless of name
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.profiles';
    END LOOP;
END $$;

-- Step 3: Also drop the problematic get_my_role function entirely (to prevent any chance of recursion)
DROP FUNCTION IF EXISTS get_my_role();

-- Step 4: Create a completely new, simple role-checking function that cannot cause recursion
-- This function uses only auth functions, no table queries
CREATE OR REPLACE FUNCTION check_admin_role()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  -- Use only auth.uid() and hardcoded admin ID - no table queries!
  SELECT auth.uid() = '1cddcda1-d03a-4633-a629-43fe5d40227c'::uuid;
$$;

-- Step 5: Re-enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 6: Create the simplest possible policies that cannot cause recursion

-- Policy 1: Users can see their own profile (uses only auth.uid(), no functions)
CREATE POLICY "simple_own_select" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Policy 2: Users can update their own profile (uses only auth.uid(), no functions)
CREATE POLICY "simple_own_update" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 3: Hardcoded admin can do everything (uses only auth.uid(), no table queries)
CREATE POLICY "hardcoded_admin_all" ON public.profiles
  FOR ALL TO authenticated
  USING (auth.uid() = '1cddcda1-d03a-4633-a629-43fe5d40227c'::uuid)
  WITH CHECK (auth.uid() = '1cddcda1-d03a-4633-a629-43fe5d40227c'::uuid);

-- Step 7: Verify the policies were created successfully
-- This query should show exactly 3 policies on the profiles table
-- SELECT policyname, cmd, roles, qual, with_check 
-- FROM pg_policies 
-- WHERE tablename = 'profiles' AND schemaname = 'public';