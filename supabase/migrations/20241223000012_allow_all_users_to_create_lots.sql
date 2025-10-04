-- Allow all authenticated users to create lots
-- Drop the restrictive admin-only policy
DROP POLICY IF EXISTS "admin_insert_lots" ON public.lots;

-- Create a new policy that allows all authenticated users to insert lots
CREATE POLICY "authenticated_insert_lots" ON public.lots
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Also allow all authenticated users to update and delete lots (maintaining consistency)
DROP POLICY IF EXISTS "admin_update_lots" ON public.lots;
DROP POLICY IF EXISTS "admin_delete_lots" ON public.lots;

CREATE POLICY "authenticated_update_lots" ON public.lots
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "authenticated_delete_lots" ON public.lots
  FOR DELETE TO authenticated
  USING (true);