-- NUCLEAR OPTION: Complete reset of profiles table RLS to eliminate infinite recursion
-- Fixed version with correct PostgreSQL syntax

-- Step 1: Completely disable RLS on profiles table
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL known policies that could exist on profiles table
-- (Using individual DROP statements instead of dynamic loop to avoid syntax issues)
DROP POLICY IF EXISTS "simple_own_select" ON public.profiles;
DROP POLICY IF EXISTS "simple_own_update" ON public.profiles;
DROP POLICY IF EXISTS "hardcoded_admin_all" ON public.profiles;
DROP POLICY IF EXISTS "own_profile_select" ON public.profiles;
DROP POLICY IF EXISTS "own_profile_update" ON public.profiles;
DROP POLICY IF EXISTS "admin_full_access" ON public.profiles;
DROP POLICY IF EXISTS "profile_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profile_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profile_admin_select_all" ON public.profiles;
DROP POLICY IF EXISTS "profile_admin_update_all" ON public.profiles;
DROP POLICY IF EXISTS "profile_admin_insert" ON public.profiles;
DROP POLICY IF EXISTS "users_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "admin_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "users_view_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "admin_view_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "admin_update_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view/update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "view_own__profile" ON public.profiles;
DROP POLICY IF EXISTS "update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "admin_read_all_profiles" ON public.profiles;

-- Step 3: Drop the problematic get_my_role function entirely
DROP FUNCTION IF EXISTS get_my_role();
DROP FUNCTION IF EXISTS check_admin_role();

-- Step 4: Create a simple role-checking function that cannot cause recursion
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