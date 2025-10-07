-- Create outsourced_employees table to store real outsourced employee posts per user
create table if not exists public.outsourced_employees (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  company text not null,
  work_position text not null,
  role text not null,
  workload text not null,
  monthly_salary numeric not null default 0,
  workplace text,
  school_id uuid,
  status text not null default 'Ativo',
  observations text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Optional reference to schools table for normalized linkage
alter table public.outsourced_employees
  add constraint outsourced_employees_school_id_fkey
  foreign key (school_id) references public.schools(id) on delete set null;

-- Trigger to auto-update updated_at
create trigger trg_outsourced_employees_updated_at
before update on public.outsourced_employees
for each row execute function public.update_updated_at_column();

-- Enable RLS
alter table public.outsourced_employees enable row level security;

-- RLS policies
create policy "Users can view their own outsourced employees"
  on public.outsourced_employees for select
  using (auth.uid() = user_id);

create policy "Users can create their own outsourced employees"
  on public.outsourced_employees for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own outsourced employees"
  on public.outsourced_employees for update
  using (auth.uid() = user_id);

create policy "Users can delete their own outsourced employees"
  on public.outsourced_employees for delete
  using (auth.uid() = user_id);

-- Index for faster user filtering
create index if not exists idx_outsourced_employees_user_id on public.outsourced_employees(user_id);
