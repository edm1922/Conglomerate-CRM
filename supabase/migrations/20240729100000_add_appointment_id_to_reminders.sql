alter table public.reminders
add column if not exists appointment_id uuid references public.appointments(id) on delete cascade;
