
-- MIGRATION: Consolidated RLS Rewrite
--
-- This migration fixes the "Database error querying schema" by completely
-- rewriting the Row-Level Security (RLS) policies for the entire application.
--
-- Key changes:
--   1. Corrects the `get_my_role()` function to prevent recursive errors.
--   2. Deletes all old, conflicting, and redundant policies from all tables.
--   3. Creates a new, simplified set of policies based on three clear roles:
--      - `authenticated`: Any logged-in user.
--      - `agent`: A standard user (managed via the `profiles` table).
--      - `admin`: An administrator (managed via the `profiles` table).
--
-- This new structure is clearer, more efficient, and resolves the underlying
-- cause of the database errors.
--

-- 1. Redefine the `get_my_role()` function to be safe and efficient.
create or replace function get_my_role()
returns text
language plpgsql
security definer
-- Set a specific search path to be secure and explicit.
set search_path = public
as $$
begin
  -- Best practice: Use a `try...catch` block to handle potential errors,
  -- such as when a user is not yet in the profiles table.
  --
  -- The `auth.jwt()` ->> 'role' is a fallback, but the primary source of
  -- truth is the `profiles` table.
  return (
    select role from public.profiles where id = auth.uid()
  );
exception
  when others then
    -- Fallback to the JWT role if the profiles query fails for any reason.
    return auth.jwt() ->> 'role';
end;
$$;


-- 2. Drop all old policies from all tables to start fresh.
-- This is crucial to remove the conflicts and redundancies.

-- Profiles
drop policy if exists "view_own_profile" on public.profiles;
drop policy if exists "update_own_profile" on public.profiles;
drop policy if exists "Users can view their own profile." on public.profiles;
drop policy if exists "Users can update their own profile." on public.profiles;
drop policy if exists "Admins have full access." on public.profiles;

-- Leads
drop policy if exists "leads_read_all" on public.leads;
drop policy if exists "leads_write" on public.leads;
drop policy if exists "leads_update" on public.leads;
drop policy if exists "leads_delete" on public.leads;
drop policy if exists "Admins can do everything." on public.leads;
drop policy if exists "Agents can do everything except delete." on public.leads;

-- Clients
drop policy if exists "clients_select_auth" on public.clients;
drop policy if exists "clients_insert_auth" on public.clients;
drop policy if exists "clients_update_auth" on public.clients;
drop policy if exists "clients_delete_auth" on public.clients;
drop policy if exists "clients_policy" on public.clients;
drop policy if exists "Allow authenticated users to create clients" on public.clients;
drop policy if exists "Allow authenticated users to view clients" on public.clients;
drop policy if exists "Admins can do everything." on public.clients;
drop policy if exists "Agents can do everything except delete." on public.clients;

-- Communications
drop policy if exists "communications_read_all" on public.communications;
drop policy if exists "communications_write" on public.communications;
drop policy if exists "Admins can do everything." on public.communications;
drop policy if exists "Agents can do everything except delete." on public.communications;

-- Lots
drop policy if exists "lots_select_auth" on public.lots;
drop policy if exists "lots_insert_auth" on public.lots;
drop policy if exists "lots_update_auth" on public.lots;
drop policy if exists "lots_delete_auth" on public.lots;
drop policy if exists "lots_policy" on public.lots;
drop policy if exists "Admins can do everything." on public.lots;
drop policy if exists "Agents can do everything except delete." on public.lots;

-- Payments
drop policy if exists "payments_select_auth" on public.payments;
drop policy if exists "payments_insert_auth" on public.payments;
drop policy if exists "payments_update_auth" on public.payments;
drop policy if exists "payments_delete_auth" on public.payments;
drop policy if exists "payments_policy" on public.payments;
drop policy if exists "Admins can do everything." on public.payments;
drop policy if exists "Agents can do everything except delete." on public.payments;

-- Appointments
drop policy if exists "appointments_select_auth" on public.appointments;
drop policy if exists "appointments_insert_auth" on public.appointments;
drop policy if exists "appointments_update_auth" on public.appointments;
drop policy if exists "appointments_delete_auth" on public.appointments;
drop policy if exists "appointments_policy" on public.appointments;
drop policy if exists "Admins can do everything." on public.appointments;
drop policy if exists "Agents can do everything except delete." on public.appointments;

-- Tasks
drop policy if exists "tasks_select_auth" on public.tasks;
drop policy if exists "tasks_insert_auth" on public.tasks;
drop policy if exists "tasks_update_auth" on public.tasks;
drop policy if exists "tasks_delete_auth" on public.tasks;
drop policy if exists "tasks_policy" on public.tasks;
drop policy if exists "Admins can do everything." on public.tasks;
drop policy if exists "Agents can do everything except delete." on public.tasks;

-- Documents
drop policy if exists "documents_select_auth" on public.documents;
drop policy if exists "documents_insert_auth" on public.documents;
drop policy if exists "documents_update_auth" on public.documents;
drop policy if exists "documents_delete_auth" on public.documents;
drop policy if exists "documents_policy" on public.documents;
drop policy if exists "Admins can do everything." on public.documents;
drop policy if exists "Agents can do everything except delete." on public.documents;

-- Reminders
drop policy if exists "reminders_read_all" on public.reminders;
drop policy if exists "reminders_write" on public.reminders;
drop policy if exists "reminders_update" on public.reminders;
drop policy if exists "reminders_delete" on public.reminders;
drop policy if exists "Admins can do everything." on public.reminders;
drop policy if exists "Agents can do everything except delete." on public.reminders;


-- 3. Create the new, simplified, and consolidated policies.
-- We use a PERMISSIVE model, where access is granted if any policy matches.

-- Profiles
alter table public.profiles enable row level security;
create policy "Authenticated users can view/update their own profile" on public.profiles
  for all to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);
create policy "Admins can manage all profiles" on public.profiles
  for all to authenticated
  using (get_my_role() = '''admin''')
  with check (get_my_role() = '''admin''');

-- Leads
alter table public.leads enable row level security;
create policy "Agents can manage leads" on public.leads
  for all to authenticated
  using (get_my_role() in ('''admin''', '''agent'''))
  with check (get_my_role() in ('''admin''', '''agent'''));
create policy "Admins have full access to leads" on public.leads
  for all to authenticated
  using (get_my_role() = '''admin''')
  with check (get_my_role() = '''admin''');

-- Clients
alter table public.clients enable row level security;
create policy "Agents can manage clients" on public.clients
  for all to authenticated
  using (get_my_role() in ('''admin''', '''agent'''))
  with check (get_my_role() in ('''admin''', '''agent'''));
create policy "Admins have full access to clients" on public.clients
  for all to authenticated
  using (get_my_role() = '''admin''')
  with check (get_my_role() = '''admin''');

-- Communications
alter table public.communications enable row level security;
create policy "Agents can manage communications" on public.communications
  for all to authenticated
  using (get_my_role() in ('''admin''', '''agent'''))
  with check (get_my_role() in ('''admin''', '''agent'''));
create policy "Admins have full access to communications" on public.communications
  for all to authenticated
  using (get_my_role() = '''admin''')
  with check (get_my_role() = '''admin''');

-- Lots
alter table public.lots enable row level security;
create policy "Agents and admins can view lots" on public.lots
  for select to authenticated
  using (true);
create policy "Admins can manage lots" on public.lots
  for all to authenticated
  using (get_my_role() = '''admin''')
  with check (get_my_role() = '''admin''');
  
-- Payments
alter table public.payments enable row level security;
create policy "Agents can manage payments" on public.payments
  for all to authenticated
  using (get_my_role() in ('''admin''', '''agent'''))
  with check (get_my_role() in ('''admin''', '''agent'''));
create policy "Admins have full access to payments" on public.payments
  for all to authenticated
  using (get_my_role() = '''admin''')
  with check (get_my_role() = '''admin''');

-- Appointments
alter table public.appointments enable row level security;
create policy "Agents can manage appointments" on public.appointments
  for all to authenticated
  using (get_my_role() in ('''admin''', '''agent'''))
  with check (get_my_role() in ('''admin''', '''agent'''));
create policy "Admins have full access to appointments" on public.appointments
  for all to authenticated
  using (get_my_role() = '''admin''')
  with check (get_my_role() = '''admin''');

-- Tasks
alter table public.tasks enable row level security;
create policy "Agents can manage tasks" on public.tasks
  for all to authenticated
  using (get_my_role() in ('''admin''', '''agent'''))
  with check (get_my_role() in ('''admin''', '''agent'''));
create policy "Admins have full access to tasks" on public.tasks
  for all to authenticated
  using (get_my_role() = '''admin''')
  with check (get_my_role() = '''admin''');

-- Documents
alter table public.documents enable row level security;
create policy "Agents can manage documents" on public.documents
  for all to authenticated
  using (get_my_role() in ('''admin''', '''agent'''))
  with check (get_my_role() in ('''admin''', '''agent'''));
create policy "Admins have full access to documents" on public.documents
  for all to authenticated
  using (get_my_role() = '''admin''')
  with check (get_my_role() = '''admin''');

-- Reminders
alter table public.reminders enable row level security;
create policy "Agents can manage reminders" on public.reminders
  for all to authenticated
  using (get_my_role() in ('''admin''', '''agent'''))
  with check (get_my_role() in ('''admin''', '''agent'''));
create policy "Admins have full access to reminders" on public.reminders
  for all to authenticated
  using (get_my_role() = '''admin''')
  with check (get_my_role() = '''admin''');
