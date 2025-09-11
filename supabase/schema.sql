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
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
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

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.leads enable row level security;
alter table public.clients enable row level security;
alter table public.lots enable row level security;
alter table public.payments enable row level security;
alter table public.appointments enable row level security;
alter table public.tasks enable row level security;
alter table public.documents enable row level security;

-- Basic policies (adjust to your needs)
create policy "view_own_profile" on public.profiles for select using (auth.uid() = id);
create policy "update_own_profile" on public.profiles for update using (auth.uid() = id);

create policy "leads_read_all" on public.leads for select using (auth.role() = 'authenticated');
create policy "leads_write" on public.leads for insert with check (auth.role() = 'authenticated');
create policy "leads_update" on public.leads for update using (auth.role() = 'authenticated');

-- Storage bucket setup (run via SQL or the dashboard)
-- insert into storage.buckets (id, name, public) values ('documents', 'documents', false) on conflict do nothing;


