-- Complete RLS reset for profiles table to fix admin access
-- This migration completely resets the profiles table policies

-- Step 1: Drop ALL existing policies on profiles table
DROP POLICY IF EXISTS "view_own__profile" ON public.profiles;
DROP POLICY IF EXISTS "update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "admin_read_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "users_view_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "admin_view_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "admin_update_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view/update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

-- Step 2: Temporarily disable RLS to ensure we can see the data
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Step 3: Re-enable RLS 
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 4: Create simple, working policies
-- Policy 1: Allow users to see their own profile
CREATE POLICY "select_own_profile" ON public.profiles
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = id);

-- Policy 2: Allow users to update their own profile  
CREATE POLICY "update_own_profile" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 3: Allow admin users to see ALL profiles
CREATE POLICY "admin_select_all_profiles" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    -- Direct check: if current user has admin role, allow access to all profiles
    EXISTS (
      SELECT 1 
      FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Policy 4: Allow admin users to update ALL profiles
CREATE POLICY "admin_update_all_profiles" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );