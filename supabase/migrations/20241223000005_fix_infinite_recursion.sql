-- Fix infinite recursion in profiles RLS policies
-- The issue: get_my_role() function queries profiles table, but profiles RLS policies call get_my_role()
-- Solution: Create profiles policies that don't use get_my_role() function

-- Step 1: Completely disable RLS on profiles temporarily to break the recursion
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies on profiles table
DROP POLICY IF EXISTS "users_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "admin_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "select_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "admin_select_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "admin_update_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "users_view_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "admin_view_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view/update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

-- Step 3: Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 4: Create NEW policies that DON'T use get_my_role() to avoid recursion
-- Policy 1: Users can always see their own profile (no function calls)
CREATE POLICY "profile_select_own" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Policy 2: Users can update their own profile (no function calls)
CREATE POLICY "profile_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 3: Direct admin check without function - admins can see ALL profiles
-- This uses a direct subquery instead of the get_my_role() function
CREATE POLICY "profile_admin_select_all" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    -- Direct check: if current user has admin role, allow access to all profiles
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Policy 4: Direct admin check for updates - admins can update ALL profiles
CREATE POLICY "profile_admin_update_all" ON public.profiles
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Policy 5: Allow admins to insert new profiles
CREATE POLICY "profile_admin_insert" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );