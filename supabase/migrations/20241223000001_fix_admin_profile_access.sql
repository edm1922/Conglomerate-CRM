-- Fix admin policy for viewing all profiles
-- This ensures admins can see the complete user list in the admin interface

-- First, drop any conflicting policies
DROP POLICY IF EXISTS "view_own__profile" ON public.profiles;
DROP POLICY IF EXISTS "admin_read_all_profiles" ON public.profiles;

-- Create comprehensive policies for profiles
-- 1. Allow users to view their own profile
CREATE POLICY "users_view_own_profile" ON public.profiles
FOR SELECT TO authenticated
USING (auth.uid() = id);

-- 2. Allow admins to view ALL profiles (this is the key fix)
CREATE POLICY "admin_view_all_profiles" ON public.profiles
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

-- 3. Allow users to update their own profile
CREATE POLICY "users_update_own_profile" ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 4. Allow admins to update any profile
CREATE POLICY "admin_update_all_profiles" ON public.profiles
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