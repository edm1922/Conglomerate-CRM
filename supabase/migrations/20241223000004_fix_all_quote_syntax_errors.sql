-- Complete fix for all SQL quote syntax errors causing 500 Internal Server Errors
-- This migration fixes the triple quote issues in both functions and RLS policies

-- Step 1: Fix the get_my_role() function (remove triple quotes)
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

-- Step 2: Drop ALL existing problematic policies that use triple quotes
DROP POLICY IF EXISTS "Authenticated users can view/update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Agents can manage leads" ON public.leads;
DROP POLICY IF EXISTS "Admins have full access to leads" ON public.leads;
DROP POLICY IF EXISTS "Agents can manage clients" ON public.clients;
DROP POLICY IF EXISTS "Admins have full access to clients" ON public.clients;
DROP POLICY IF EXISTS "Agents can manage communications" ON public.communications;
DROP POLICY IF EXISTS "Admins have full access to communications" ON public.communications;
DROP POLICY IF EXISTS "Admins can manage lots" ON public.lots;
DROP POLICY IF EXISTS "Agents can manage payments" ON public.payments;
DROP POLICY IF EXISTS "Admins have full access to payments" ON public.payments;
DROP POLICY IF EXISTS "Agents can manage appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admins have full access to appointments" ON public.appointments;
DROP POLICY IF EXISTS "Agents can manage tasks" ON public.tasks;
DROP POLICY IF EXISTS "Admins have full access to tasks" ON public.tasks;
DROP POLICY IF EXISTS "Agents can manage documents" ON public.documents;
DROP POLICY IF EXISTS "Admins have full access to documents" ON public.documents;
DROP POLICY IF EXISTS "Agents can manage reminders" ON public.reminders;
DROP POLICY IF EXISTS "Admins have full access to reminders" ON public.reminders;

-- Step 3: Create new, correct policies for profiles (with proper single quotes)
-- Policy for users to view/update their own profile
CREATE POLICY "users_own_profile" ON public.profiles
  FOR ALL TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy for admins to manage all profiles (FIXED QUOTES)
CREATE POLICY "admin_all_profiles" ON public.profiles
  FOR ALL TO authenticated
  USING (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');

-- Step 4: Create simplified policies for other tables with correct syntax
-- Leads
CREATE POLICY "manage_leads" ON public.leads
  FOR ALL TO authenticated
  USING (get_my_role() IN ('admin', 'agent'))
  WITH CHECK (get_my_role() IN ('admin', 'agent'));

-- Clients  
CREATE POLICY "manage_clients" ON public.clients
  FOR ALL TO authenticated
  USING (get_my_role() IN ('admin', 'agent'))
  WITH CHECK (get_my_role() IN ('admin', 'agent'));

-- Communications
CREATE POLICY "manage_communications" ON public.communications
  FOR ALL TO authenticated
  USING (get_my_role() IN ('admin', 'agent'))
  WITH CHECK (get_my_role() IN ('admin', 'agent'));

-- Lots (everyone can view, only admins can modify)
CREATE POLICY "view_lots" ON public.lots
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "manage_lots" ON public.lots
  FOR INSERT, UPDATE, DELETE TO authenticated
  USING (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');

-- Payments
CREATE POLICY "manage_payments" ON public.payments
  FOR ALL TO authenticated
  USING (get_my_role() IN ('admin', 'agent'))
  WITH CHECK (get_my_role() IN ('admin', 'agent'));

-- Appointments
CREATE POLICY "manage_appointments" ON public.appointments
  FOR ALL TO authenticated
  USING (get_my_role() IN ('admin', 'agent'))
  WITH CHECK (get_my_role() IN ('admin', 'agent'));

-- Tasks
CREATE POLICY "manage_tasks" ON public.tasks
  FOR ALL TO authenticated
  USING (get_my_role() IN ('admin', 'agent'))
  WITH CHECK (get_my_role() IN ('admin', 'agent'));

-- Documents
CREATE POLICY "manage_documents" ON public.documents
  FOR ALL TO authenticated
  USING (get_my_role() IN ('admin', 'agent'))
  WITH CHECK (get_my_role() IN ('admin', 'agent'));

-- Reminders
CREATE POLICY "manage_reminders" ON public.reminders
  FOR ALL TO authenticated
  USING (get_my_role() IN ('admin', 'agent'))
  WITH CHECK (get_my_role() IN ('admin', 'agent'));