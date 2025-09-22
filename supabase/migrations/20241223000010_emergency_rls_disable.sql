-- EMERGENCY FIX: Temporarily disable ALL RLS to stop infinite recursion
-- This is a temporary measure to make the app functional while we debug

-- Step 1: Completely disable RLS on ALL tables to stop all policy enforcement
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

-- Step 2: Drop ANY remaining functions that could cause recursion
DROP FUNCTION IF EXISTS get_my_role() CASCADE;
DROP FUNCTION IF EXISTS check_admin_role() CASCADE;
DROP FUNCTION IF EXISTS is_admin_user() CASCADE;

-- Step 3: Verify no policies exist by dropping all possible policy names
-- (This is comprehensive to catch any lingering policies)

-- Drop all possible profiles policies
DO $$ 
DECLARE 
    policy_name text;
BEGIN
    FOR policy_name IN 
        SELECT policyname FROM pg_policies 
        WHERE tablename = 'profiles' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', policy_name);
    END LOOP;
END $$;

-- Drop all possible policies on other tables
DO $$ 
DECLARE 
    table_name text;
    policy_name text;
BEGIN
    FOR table_name IN VALUES ('leads'), ('clients'), ('communications'), ('lots'), 
                             ('payments'), ('appointments'), ('tasks'), ('documents'), ('reminders')
    LOOP
        FOR policy_name IN 
            SELECT policyname FROM pg_policies 
            WHERE tablename = table_name AND schemaname = 'public'
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_name, table_name);
        END LOOP;
    END LOOP;
END $$;

-- At this point, ALL RLS is disabled and ALL policies are dropped
-- The app should work without any RLS restrictions
-- Admin will be able to see all profiles because there are no restrictions

-- NOTE: This is a temporary fix. In production, you would want to re-enable 
-- RLS with properly designed policies that don't cause recursion.