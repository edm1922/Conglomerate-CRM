-- Conglomerate CRM - Supabase Schema

-- Enable extensions
create extension if not exists pgcrypto;

-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  role text default 'agent',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Function to create a new profile for a new user
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function after a new user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Leads
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  source text not null,
  status text default 'new',
  notes text,
  assigned_to uuid references public.profiles(id),
  score integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Clients
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  address text,
  status text default 'active',
  total_investment numeric default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Communications
create table if not exists public.communications (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  type text not null, -- email, phone, meeting
  notes text,
  created_at timestamptz default now()
);

-- Lots / Inventory
create table if not exists public.lots (
  id uuid primary key default gen_random_uuid(),
  block_number text not null,
  lot_number text not null,
  size numeric not null,
  price numeric not null,
  status text default 'available',
  location text,
  description text,
  reserved_by uuid references public.clients(id),
  sold_to uuid references public.clients(id),
  date_reserved timestamptz,
  date_sold timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Payments
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  receipt_no text unique not null,
  client_id uuid not null references public.clients(id),
  lot_id uuid references public.lots(id),
  amount numeric not null,
  payment_method text not null,
  payment_type text not null,
  reference text,
  status text default 'pending',
  parent_payment_id uuid references public.payments(id) on delete set null,
  installment_number integer,
  total_installments integer,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  reconciled boolean default false,
  constraint installment_check check (installment_number is null or total_installments is null or installment_number <= total_installments)
);

-- Appointments
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  client_id uuid references public.clients(id),
  type text not null,
  scheduled_date date not null,
  scheduled_time time not null,
  duration integer default 60,
  location text,
  status text default 'scheduled',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tasks
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  priority text default 'medium',
  due_date date,
  status text default 'pending',
  assigned_to uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Documents
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id),
  file_name text not null,
  file_path text not null,
  file_type text not null,
  file_size integer,
  status text default 'pending',
  uploaded_at timestamptz default now()
);

-- Reminders
create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  payment_id uuid references public.payments(id) on delete cascade,
  reminder_date timestamptz not null,
  notes text,
  status text default 'pending', -- pending, completed
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.leads enable row level security;
alter table public.clients enable row level security;
alter table public.communications enable row level security;
alter table public.lots enable row level security;
alter table public.payments enable row level security;
alter table public.appointments enable row level security;
alter table public.tasks enable row level security;
alter table public.documents enable row level security;
alter table public.reminders enable row level security;

-- Basic policies (adjust to your needs)
create policy "view_own__profile" on public.profiles for select using (auth.uid() = id);
create policy "update_own_profile" on public.profiles for update using (auth.uid() = id);

create policy "leads_read_all" on public.leads for select using (auth.role() = 'authenticated');
create policy "leads_write" on public.leads for insert with check (auth.role() = 'authenticated');
create policy "leads_update" on public.leads for update using (auth.role() = 'authenticated');
create policy "leads_delete" on public.leads for delete using (auth.role() = 'authenticated');

create policy "communications_read_all" on public.communications for select using (auth.role() = 'authenticated');
create policy "communications_write" on public.communications for insert with check (auth.role() = 'authenticated');

create policy "reminders_read_all" on public.reminders for select using (auth.role() = 'authenticated');
create policy "reminders_write" on public.reminders for insert with check (auth.role() = 'authenticated');
create policy "reminders_update" on public.reminders for update using (auth.role() = 'authenticated');
create policy "reminders_delete" on public.reminders for delete using (auth.role() = 'authenticated');

-- Storage bucket setup (run via SQL or the dashboard)
-- insert into storage.buckets (id, name, public) values ('documents', 'documents', false) on conflict do nothing;

-- Task Templates
create table if not exists public.task_templates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  priority text default 'medium',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Task Workflows
create table if not exists public.task_workflows (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Task Workflow Steps
create table if not exists public.task_workflow_steps (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid not null references public.task_workflows(id) on delete cascade,
  template_id uuid not null references public.task_templates(id) on delete cascade,
  step_order integer not null,
  delay_after_step interval, -- e.g., '1 day', '3 hours'
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS for the new tables
alter table public.task_templates enable row level security;
alter table public.task_workflows enable row level security;
alter table public.task_workflow_steps enable row level security;

-- Policies for the new tables (adjust as needed)
create policy "task_templates_read_all" on public.task_templates for select using (auth.role() = 'authenticated');
create policy "task_templates_write" on public.task_templates for insert with check (auth.role() = 'authenticated');
create policy "task_templates_update" on public.task_templates for update using (auth.role() = 'authenticated');
create policy "task_templates_delete" on public.task_templates for delete using (auth.role() = 'authenticated');

create policy "task_workflows_read_all" on public.task_workflows for select using (auth.role() = 'authenticated');
create policy "task_workflows_write" on public.task_workflows for insert with check (auth.role() = 'authenticated');
create policy "task_workflows_update" on public.task_workflows for update using (auth.role() = 'authenticated');
create policy "task_workflows_delete" on public.task_workflows for delete using (auth.role() = 'authenticated');

create policy "task_workflow_steps_read_all" on public.task_workflow_steps for select using (auth.role() = 'authenticated');
create policy "task_workflow_steps_write" on public.task_workflow_steps for insert with check (auth.role() = 'authenticated');
create policy "task_workflow_steps_update" on public.task_workflow_steps for update using (auth.role() = 'authenticated');
create policy "task_workflow_steps_delete" on public.task_workflow_steps for delete using (auth.role() = 'authenticated');

create policy "lots_read_all" on public.lots for select using (auth.role() = 'authenticated');
create policy "lots_write" on public.lots for insert with check (auth.role() = 'authenticated');
create policy "lots_update" on public.lots for update using (auth.role() = 'authenticated');
create policy "lots_delete" on public.lots for delete using (auth.role() = 'authenticated');

create policy "clients_read_all" on public.clients for select using (auth.role() = 'authenticated');
create policy "clients_write" on public.clients for insert with check (auth.role() = 'authenticated');
create policy "clients_update" on public.clients for update using (auth.role() = 'authenticated');
create policy "clients_delete" on public.clients for delete using (auth.role() = 'authenticated');

create policy "payments_read_all" on public.payments for select using (auth.role() = 'authenticated');
create policy "payments_write" on public.payments for insert with check (auth.role() = 'authenticated');
create policy "payments_update" on public.payments for update using (auth.role() = 'authenticated');
create policy "payments_delete" on public.payments for delete using (auth.role() = 'authenticated');

create policy "appointments_read_all" on public.appointments for select using (auth.role() = 'authenticated');
create policy "appointments_write" on public.appointments for insert with check (auth.role() = 'authenticated');
create policy "appointments_update" on public.appointments for update using (auth.role() = 'authenticated');
create policy "appointments_delete" on public.appointments for delete using (auth.role() = 'authenticated');

create policy "tasks_read_all" on public.tasks for select using (auth.role() = 'authenticated');
create policy "tasks_write" on public.tasks for insert with check (auth.role() = 'authenticated');
create policy "tasks_update" on public.tasks for update using (auth.role() = 'authenticated');
create policy "tasks_delete" on public.tasks for delete using (auth.role() = 'authenticated');

create policy "documents_read_all" on public.documents for select using (auth.role() = 'authenticated');
create policy "documents_write" on public.documents for insert with check (auth.role() = 'authenticated');
create policy "documents_update" on public.documents for update using (auth.role() = 'authenticated');
create policy "documents_delete" on public.documents for delete using (auth.role() = 'authenticated');
