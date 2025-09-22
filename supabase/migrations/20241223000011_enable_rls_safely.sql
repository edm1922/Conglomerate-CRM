-- Enable RLS safely with comprehensive policies
-- This migration enables RLS on all tables and creates policies that maintain current functionality
-- Admin user: edronmaguale635@gmail.com (UUID: 1cddcda1-d03a-4633-a629-43fe5d40227c)

-- Step 0: First disable RLS and drop all existing policies to start clean
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

-- Drop all existing policies on core tables to prevent conflicts
DO $$ 
DECLARE 
    policy_record RECORD;
BEGIN
    -- Drop all policies on profiles table
    FOR policy_record IN 
        SELECT policyname FROM pg_policies 
        WHERE tablename = 'profiles' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', policy_record.policyname);
    END LOOP;
    
    -- Drop all policies on leads table
    FOR policy_record IN 
        SELECT policyname FROM pg_policies 
        WHERE tablename = 'leads' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.leads', policy_record.policyname);
    END LOOP;
    
    -- Drop all policies on clients table
    FOR policy_record IN 
        SELECT policyname FROM pg_policies 
        WHERE tablename = 'clients' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.clients', policy_record.policyname);
    END LOOP;
    
    -- Drop all policies on communications table
    FOR policy_record IN 
        SELECT policyname FROM pg_policies 
        WHERE tablename = 'communications' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.communications', policy_record.policyname);
    END LOOP;
    
    -- Drop all policies on lots table
    FOR policy_record IN 
        SELECT policyname FROM pg_policies 
        WHERE tablename = 'lots' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.lots', policy_record.policyname);
    END LOOP;
    
    -- Drop all policies on payments table
    FOR policy_record IN 
        SELECT policyname FROM pg_policies 
        WHERE tablename = 'payments' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.payments', policy_record.policyname);
    END LOOP;
    
    -- Drop all policies on appointments table
    FOR policy_record IN 
        SELECT policyname FROM pg_policies 
        WHERE tablename = 'appointments' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.appointments', policy_record.policyname);
    END LOOP;
    
    -- Drop all policies on tasks table
    FOR policy_record IN 
        SELECT policyname FROM pg_policies 
        WHERE tablename = 'tasks' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.tasks', policy_record.policyname);
    END LOOP;
    
    -- Drop all policies on documents table
    FOR policy_record IN 
        SELECT policyname FROM pg_policies 
        WHERE tablename = 'documents' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.documents', policy_record.policyname);
    END LOOP;
    
    -- Drop all policies on reminders table
    FOR policy_record IN 
        SELECT policyname FROM pg_policies 
        WHERE tablename = 'reminders' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.reminders', policy_record.policyname);
    END LOOP;
END $$;

-- Drop any problematic functions that might cause recursion
DROP FUNCTION IF EXISTS get_my_role() CASCADE;
DROP FUNCTION IF EXISTS check_admin_role() CASCADE;

-- Step 1: Re-enable RLS on core existing tables (confirmed to exist)
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

-- Enable RLS on tables that may or may not exist
DO $$ 
DECLARE 
    policy_record RECORD;
BEGIN
    -- Clean up and enable RLS on task_templates if it exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'task_templates') THEN
        EXECUTE 'ALTER TABLE public.task_templates DISABLE ROW LEVEL SECURITY';
        FOR policy_record IN 
            SELECT policyname FROM pg_policies 
            WHERE tablename = 'task_templates' AND schemaname = 'public'
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.task_templates', policy_record.policyname);
        END LOOP;
        EXECUTE 'ALTER TABLE public.task_templates ENABLE ROW LEVEL SECURITY';
    END IF;
    
    -- Clean up and enable RLS on task_workflows if it exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'task_workflows') THEN
        EXECUTE 'ALTER TABLE public.task_workflows DISABLE ROW LEVEL SECURITY';
        FOR policy_record IN 
            SELECT policyname FROM pg_policies 
            WHERE tablename = 'task_workflows' AND schemaname = 'public'
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.task_workflows', policy_record.policyname);
        END LOOP;
        EXECUTE 'ALTER TABLE public.task_workflows ENABLE ROW LEVEL SECURITY';
    END IF;
    
    -- Clean up and enable RLS on task_workflow_steps if it exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'task_workflow_steps') THEN
        EXECUTE 'ALTER TABLE public.task_workflow_steps DISABLE ROW LEVEL SECURITY';
        FOR policy_record IN 
            SELECT policyname FROM pg_policies 
            WHERE tablename = 'task_workflow_steps' AND schemaname = 'public'
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.task_workflow_steps', policy_record.policyname);
        END LOOP;
        EXECUTE 'ALTER TABLE public.task_workflow_steps ENABLE ROW LEVEL SECURITY';
    END IF;
    
    -- Clean up and enable RLS on appointment_templates if it exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'appointment_templates') THEN
        EXECUTE 'ALTER TABLE public.appointment_templates DISABLE ROW LEVEL SECURITY';
        FOR policy_record IN 
            SELECT policyname FROM pg_policies 
            WHERE tablename = 'appointment_templates' AND schemaname = 'public'
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.appointment_templates', policy_record.policyname);
        END LOOP;
        EXECUTE 'ALTER TABLE public.appointment_templates ENABLE ROW LEVEL SECURITY';
    END IF;
    
    -- Clean up and enable RLS on payment_methods if it exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payment_methods') THEN
        EXECUTE 'ALTER TABLE public.payment_methods DISABLE ROW LEVEL SECURITY';
        FOR policy_record IN 
            SELECT policyname FROM pg_policies 
            WHERE tablename = 'payment_methods' AND schemaname = 'public'
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.payment_methods', policy_record.policyname);
        END LOOP;
        EXECUTE 'ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY';
    END IF;
    
    -- Clean up and enable RLS on notifications if it exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications') THEN
        EXECUTE 'ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY';
        FOR policy_record IN 
            SELECT policyname FROM pg_policies 
            WHERE tablename = 'notifications' AND schemaname = 'public'
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.notifications', policy_record.policyname);
        END LOOP;
        EXECUTE 'ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY';
    END IF;
END $$;

-- Step 2: Create payment_methods table if it doesn't exist (optional table used by app)
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id text PRIMARY KEY,
  name text NOT NULL,
  icon text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Step 3: Create notifications table if it doesn't exist (optional table used by app)
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Clean up and enable RLS on newly created optional tables
DO $$ 
DECLARE 
    policy_record RECORD;
BEGIN
    -- Clean up and enable RLS on payment_methods
    FOR policy_record IN 
        SELECT policyname FROM pg_policies 
        WHERE tablename = 'payment_methods' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.payment_methods', policy_record.policyname);
    END LOOP;
    EXECUTE 'ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY';
    
    -- Clean up and enable RLS on notifications
    FOR policy_record IN 
        SELECT policyname FROM pg_policies 
        WHERE tablename = 'notifications' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.notifications', policy_record.policyname);
    END LOOP;
    EXECUTE 'ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY';
END $$;

-- Step 4: Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT auth.uid() = '1cddcda1-d03a-4633-a629-43fe5d40227c'::uuid;
$$;

-- Step 5: PROFILES TABLE POLICIES
-- Users can view and update their own profile
CREATE POLICY "users_select_own_profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "users_update_own_profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admin can manage all profiles
CREATE POLICY "admin_all_profiles" ON public.profiles
  FOR ALL TO authenticated
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

-- Step 6: LEADS TABLE POLICIES
-- All authenticated users can manage leads (current behavior)
CREATE POLICY "authenticated_select_leads" ON public.leads
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "authenticated_insert_leads" ON public.leads
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "authenticated_update_leads" ON public.leads
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "authenticated_delete_leads" ON public.leads
  FOR DELETE TO authenticated
  USING (true);

-- Step 7: CLIENTS TABLE POLICIES
-- All authenticated users can manage clients (current behavior)
CREATE POLICY "authenticated_select_clients" ON public.clients
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "authenticated_insert_clients" ON public.clients
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "authenticated_update_clients" ON public.clients
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "authenticated_delete_clients" ON public.clients
  FOR DELETE TO authenticated
  USING (true);

-- Step 8: COMMUNICATIONS TABLE POLICIES
-- All authenticated users can manage communications (current behavior)
CREATE POLICY "authenticated_select_communications" ON public.communications
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "authenticated_insert_communications" ON public.communications
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "authenticated_update_communications" ON public.communications
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "authenticated_delete_communications" ON public.communications
  FOR DELETE TO authenticated
  USING (true);

-- Step 9: LOTS TABLE POLICIES
-- All authenticated users can view lots
CREATE POLICY "authenticated_select_lots" ON public.lots
  FOR SELECT TO authenticated
  USING (true);

-- Admin can manage lots (insert/update/delete)
CREATE POLICY "admin_insert_lots" ON public.lots
  FOR INSERT TO authenticated
  WITH CHECK (is_admin_user());

CREATE POLICY "admin_update_lots" ON public.lots
  FOR UPDATE TO authenticated
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

CREATE POLICY "admin_delete_lots" ON public.lots
  FOR DELETE TO authenticated
  USING (is_admin_user());

-- Step 10: PAYMENTS TABLE POLICIES
-- All authenticated users can manage payments (current behavior)
CREATE POLICY "authenticated_select_payments" ON public.payments
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "authenticated_insert_payments" ON public.payments
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "authenticated_update_payments" ON public.payments
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "authenticated_delete_payments" ON public.payments
  FOR DELETE TO authenticated
  USING (true);

-- Step 11: APPOINTMENTS TABLE POLICIES
-- All authenticated users can manage appointments (current behavior)
CREATE POLICY "authenticated_select_appointments" ON public.appointments
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "authenticated_insert_appointments" ON public.appointments
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "authenticated_update_appointments" ON public.appointments
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "authenticated_delete_appointments" ON public.appointments
  FOR DELETE TO authenticated
  USING (true);

-- Step 12: TASKS TABLE POLICIES
-- All authenticated users can manage tasks (current behavior)
CREATE POLICY "authenticated_select_tasks" ON public.tasks
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "authenticated_insert_tasks" ON public.tasks
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "authenticated_update_tasks" ON public.tasks
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "authenticated_delete_tasks" ON public.tasks
  FOR DELETE TO authenticated
  USING (true);

-- Step 13: DOCUMENTS TABLE POLICIES
-- All authenticated users can manage documents (current behavior)
CREATE POLICY "authenticated_select_documents" ON public.documents
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "authenticated_insert_documents" ON public.documents
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "authenticated_update_documents" ON public.documents
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "authenticated_delete_documents" ON public.documents
  FOR DELETE TO authenticated
  USING (true);

-- Step 14: REMINDERS TABLE POLICIES
-- All authenticated users can manage reminders (current behavior)
CREATE POLICY "authenticated_select_reminders" ON public.reminders
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "authenticated_insert_reminders" ON public.reminders
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "authenticated_update_reminders" ON public.reminders
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "authenticated_delete_reminders" ON public.reminders
  FOR DELETE TO authenticated
  USING (true);

-- Step 15: TASK_TEMPLATES TABLE POLICIES (if table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'task_templates') THEN
        -- All authenticated users can manage task templates (current behavior)
        EXECUTE 'CREATE POLICY "authenticated_select_task_templates" ON public.task_templates
          FOR SELECT TO authenticated
          USING (true)';
        
        EXECUTE 'CREATE POLICY "authenticated_insert_task_templates" ON public.task_templates
          FOR INSERT TO authenticated
          WITH CHECK (true)';
        
        EXECUTE 'CREATE POLICY "authenticated_update_task_templates" ON public.task_templates
          FOR UPDATE TO authenticated
          USING (true)
          WITH CHECK (true)';
        
        EXECUTE 'CREATE POLICY "authenticated_delete_task_templates" ON public.task_templates
          FOR DELETE TO authenticated
          USING (true)';
    END IF;
END $$;

-- Step 16: TASK_WORKFLOWS TABLE POLICIES (if table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'task_workflows') THEN
        -- All authenticated users can manage task workflows (current behavior)
        EXECUTE 'CREATE POLICY "authenticated_select_task_workflows" ON public.task_workflows
          FOR SELECT TO authenticated
          USING (true)';
        
        EXECUTE 'CREATE POLICY "authenticated_insert_task_workflows" ON public.task_workflows
          FOR INSERT TO authenticated
          WITH CHECK (true)';
        
        EXECUTE 'CREATE POLICY "authenticated_update_task_workflows" ON public.task_workflows
          FOR UPDATE TO authenticated
          USING (true)
          WITH CHECK (true)';
        
        EXECUTE 'CREATE POLICY "authenticated_delete_task_workflows" ON public.task_workflows
          FOR DELETE TO authenticated
          USING (true)';
    END IF;
END $$;

-- Step 17: TASK_WORKFLOW_STEPS TABLE POLICIES (if table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'task_workflow_steps') THEN
        -- All authenticated users can manage task workflow steps (current behavior)
        EXECUTE 'CREATE POLICY "authenticated_select_task_workflow_steps" ON public.task_workflow_steps
          FOR SELECT TO authenticated
          USING (true)';
        
        EXECUTE 'CREATE POLICY "authenticated_insert_task_workflow_steps" ON public.task_workflow_steps
          FOR INSERT TO authenticated
          WITH CHECK (true)';
        
        EXECUTE 'CREATE POLICY "authenticated_update_task_workflow_steps" ON public.task_workflow_steps
          FOR UPDATE TO authenticated
          USING (true)
          WITH CHECK (true)';
        
        EXECUTE 'CREATE POLICY "authenticated_delete_task_workflow_steps" ON public.task_workflow_steps
          FOR DELETE TO authenticated
          USING (true)';
    END IF;
END $$;

-- Step 18: APPOINTMENT_TEMPLATES TABLE POLICIES (if table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'appointment_templates') THEN
        -- All authenticated users can manage appointment templates (current behavior)
        EXECUTE 'CREATE POLICY "authenticated_select_appointment_templates" ON public.appointment_templates
          FOR SELECT TO authenticated
          USING (true)';
        
        EXECUTE 'CREATE POLICY "authenticated_insert_appointment_templates" ON public.appointment_templates
          FOR INSERT TO authenticated
          WITH CHECK (true)';
        
        EXECUTE 'CREATE POLICY "authenticated_update_appointment_templates" ON public.appointment_templates
          FOR UPDATE TO authenticated
          USING (true)
          WITH CHECK (true)';
        
        EXECUTE 'CREATE POLICY "authenticated_delete_appointment_templates" ON public.appointment_templates
          FOR DELETE TO authenticated
          USING (true)';
    END IF;
END $$;

-- Step 19: PAYMENT_METHODS TABLE POLICIES (if table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payment_methods') THEN
        -- All authenticated users can manage payment methods (current behavior)
        EXECUTE 'CREATE POLICY "authenticated_select_payment_methods" ON public.payment_methods
          FOR SELECT TO authenticated
          USING (true)';
        
        EXECUTE 'CREATE POLICY "authenticated_insert_payment_methods" ON public.payment_methods
          FOR INSERT TO authenticated
          WITH CHECK (true)';
        
        EXECUTE 'CREATE POLICY "authenticated_update_payment_methods" ON public.payment_methods
          FOR UPDATE TO authenticated
          USING (true)
          WITH CHECK (true)';
        
        EXECUTE 'CREATE POLICY "authenticated_delete_payment_methods" ON public.payment_methods
          FOR DELETE TO authenticated
          USING (true)';
    END IF;
END $$;

-- Step 20: NOTIFICATIONS TABLE POLICIES (if table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications') THEN
        -- Users can only see their own notifications
        EXECUTE 'CREATE POLICY "users_select_own_notifications" ON public.notifications
          FOR SELECT TO authenticated
          USING (auth.uid() = user_id)';
        
        EXECUTE 'CREATE POLICY "users_update_own_notifications" ON public.notifications
          FOR UPDATE TO authenticated
          USING (auth.uid() = user_id)
          WITH CHECK (auth.uid() = user_id)';
        
        -- System can insert notifications for any user
        EXECUTE 'CREATE POLICY "system_insert_notifications" ON public.notifications
          FOR INSERT TO authenticated
          WITH CHECK (true)';
        
        -- Admin can manage all notifications
        EXECUTE 'CREATE POLICY "admin_all_notifications" ON public.notifications
          FOR ALL TO authenticated
          USING (is_admin_user())
          WITH CHECK (is_admin_user())';
    END IF;
END $$;

-- Final verification comment
-- RLS is now enabled on all tables with policies that:
-- 1. Maintain current app functionality (most tables allow all authenticated users)
-- 2. Secure profiles table (users only see their own)
-- 3. Give admin (edronmaguale635@gmail.com) full access to everything
-- 4. Secure notifications (users only see their own)
-- 5. Allow only admin to modify lots (while everyone can view)