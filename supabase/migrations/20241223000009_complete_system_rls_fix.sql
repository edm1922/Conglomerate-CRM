-- COMPLETE SYSTEM RLS FIX: Remove all dependencies on get_my_role() function
-- This migration fixes the infinite recursion by removing ALL policies that depend on get_my_role()

-- Step 1: Disable RLS on ALL tables to prevent any queries during the fix
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.communications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lots DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL policies that depend on get_my_role() function (from the error message)
-- Profiles policies
DROP POLICY IF EXISTS "simple_own_select" ON public.profiles;
DROP POLICY IF EXISTS "simple_own_update" ON public.profiles;
DROP POLICY IF EXISTS "hardcoded_admin_all" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view/update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

-- Leads policies
DROP POLICY IF EXISTS "Agents can manage leads" ON public.leads;
DROP POLICY IF EXISTS "Admins have full access to leads" ON public.leads;

-- Clients policies
DROP POLICY IF EXISTS "Agents can manage clients" ON public.clients;
DROP POLICY IF EXISTS "Admins have full access to clients" ON public.clients;

-- Communications policies
DROP POLICY IF EXISTS "Agents can manage communications" ON public.communications;
DROP POLICY IF EXISTS "Admins have full access to communications" ON public.communications;

-- Lots policies
DROP POLICY IF EXISTS "Agents and admins can manage lots" ON public.lots;
DROP POLICY IF EXISTS "Admins can manage lots" ON public.lots;
DROP POLICY IF EXISTS "Agents and admins can view lots" ON public.lots;

-- Payments policies
DROP POLICY IF EXISTS "Agents can manage payments" ON public.payments;
DROP POLICY IF EXISTS "Admins have full access to payments" ON public.payments;

-- Appointments policies
DROP POLICY IF EXISTS "Agents can manage appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admins have full access to appointments" ON public.appointments;

-- Tasks policies
DROP POLICY IF EXISTS "Agents can manage tasks" ON public.tasks;
DROP POLICY IF EXISTS "Admins have full access to tasks" ON public.tasks;

-- Documents policies
DROP POLICY IF EXISTS "Agents can manage documents" ON public.documents;
DROP POLICY IF EXISTS "Admins have full access to documents" ON public.documents;

-- Reminders policies
DROP POLICY IF EXISTS "Agents can manage reminders" ON public.reminders;
DROP POLICY IF EXISTS "Admins have full access to reminders" ON public.reminders;

-- Step 3: Now we can safely drop the problematic function
DROP FUNCTION IF EXISTS get_my_role();

-- Step 4: Create a new, simple function that only checks admin status using hardcoded ID
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT auth.uid() = '1cddcda1-d03a-4633-a629-43fe5d40227c'::uuid;
$$;

-- Step 5: Re-enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- Step 6: Create new, simple policies that cannot cause recursion

-- PROFILES TABLE - Critical for user management
CREATE POLICY "users_own_profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "users_update_own_profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "admin_all_profiles" ON public.profiles
  FOR ALL TO authenticated
  USING (auth.uid() = '1cddcda1-d03a-4633-a629-43fe5d40227c'::uuid)
  WITH CHECK (auth.uid() = '1cddcda1-d03a-4633-a629-43fe5d40227c'::uuid);

-- LEADS TABLE
CREATE POLICY "authenticated_manage_leads" ON public.leads
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- CLIENTS TABLE
CREATE POLICY "authenticated_manage_clients" ON public.clients
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- COMMUNICATIONS TABLE
CREATE POLICY "authenticated_manage_communications" ON public.communications
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- LOTS TABLE
CREATE POLICY "authenticated_view_lots" ON public.lots
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "admin_insert_lots" ON public.lots
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = '1cddcda1-d03a-4633-a629-43fe5d40227c'::uuid);

CREATE POLICY "admin_update_lots" ON public.lots
  FOR UPDATE TO authenticated
  USING (auth.uid() = '1cddcda1-d03a-4633-a629-43fe5d40227c'::uuid)
  WITH CHECK (auth.uid() = '1cddcda1-d03a-4633-a629-43fe5d40227c'::uuid);

CREATE POLICY "admin_delete_lots" ON public.lots
  FOR DELETE TO authenticated
  USING (auth.uid() = '1cddcda1-d03a-4633-a629-43fe5d40227c'::uuid);

-- PAYMENTS TABLE
CREATE POLICY "authenticated_manage_payments" ON public.payments
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- APPOINTMENTS TABLE
CREATE POLICY "authenticated_manage_appointments" ON public.appointments
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- TASKS TABLE
CREATE POLICY "authenticated_manage_tasks" ON public.tasks
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- DOCUMENTS TABLE
CREATE POLICY "authenticated_manage_documents" ON public.documents
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- REMINDERS TABLE
CREATE POLICY "authenticated_manage_reminders" ON public.reminders
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);