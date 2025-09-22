-- ULTIMATE FIX: Completely eliminate recursion by using a hardcoded admin user approach
-- This is the most reliable way to break the infinite recursion

-- Step 1: Disable RLS completely to break any existing recursion
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL policies to start completely fresh
DROP POLICY IF EXISTS "profile_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profile_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profile_admin_select_all" ON public.profiles;
DROP POLICY IF EXISTS "profile_admin_update_all" ON public.profiles;
DROP POLICY IF EXISTS "profile_admin_insert" ON public.profiles;

-- Step 3: Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 4: Create simple, recursion-free policies

-- Policy 1: Users can see their own profile (simple, no recursion)
CREATE POLICY "simple_own_profile_select" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Policy 2: Users can update their own profile (simple, no recursion)  
CREATE POLICY "simple_own_profile_update" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 3: Hardcoded admin access - using the specific admin user ID
-- This completely avoids any function calls or subqueries that could cause recursion
CREATE POLICY "hardcoded_admin_all_access" ON public.profiles
  FOR ALL TO authenticated
  USING (auth.uid() = '1cddcda1-d03a-4633-a629-43fe5d40227c'::uuid)
  WITH CHECK (auth.uid() = '1cddcda1-d03a-4633-a629-43fe5d40227c'::uuid);

-- Alternative Policy 3: If the above doesn't work, try email-based approach
-- (Note: This requires the auth.email() function to be available)
-- CREATE POLICY "email_based_admin_access" ON public.profiles
--   FOR ALL TO authenticated  
--   USING (auth.email() = 'edronmaguale635@gmail.com')
--   WITH CHECK (auth.email() = 'edronmaguale635@gmail.com');