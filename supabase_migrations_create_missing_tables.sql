-- Migration: Create missing Supabase tables for Ameen School Hub
-- Tables: public.results, public.hifz_logs, public.hvs_logs

-- NOTE: This migration assumes the following existing tables:
--   - public.students (id uuid)
--   - public.houses (id text)
--
-- If the students table is missing the photoUrl column (used by the UI), this
-- migration adds it so inserts/updates do not error.

alter table public.students add column if not exists photoUrl text;


-- ===== Create results table =====
create table if not exists public.results (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.students(id) on delete set null,
  exam text not null,
  subject text,
  grade text,
  total_marks int,
  obtained_marks int,
  percentage int,
  date date,
  created_at timestamptz not null default now()
);

alter table public.results enable row level security;

create policy "Allow authenticated users to read results" on public.results
  for select using (auth.role() = 'authenticated');
create policy "Allow authenticated users to insert results" on public.results
  for insert with check (auth.role() = 'authenticated');
create policy "Allow authenticated users to update results" on public.results
  for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Allow authenticated users to delete results" on public.results
  for delete using (auth.role() = 'authenticated');

-- ===== Create hifz_logs table =====
create table if not exists public.hifz_logs (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.students(id) on delete set null,
  surah text not null,
  ayahs text,
  date date,
  rating int,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.hifz_logs enable row level security;

create policy "Allow authenticated users to read hifz logs" on public.hifz_logs
  for select using (auth.role() = 'authenticated');
create policy "Allow authenticated users to insert hifz logs" on public.hifz_logs
  for insert with check (auth.role() = 'authenticated');
create policy "Allow authenticated users to update hifz logs" on public.hifz_logs
  for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Allow authenticated users to delete hifz logs" on public.hifz_logs
  for delete using (auth.role() = 'authenticated');

-- ===== Create hvs_logs table =====
create table if not exists public.hvs_logs (
  id uuid primary key default gen_random_uuid(),
  house_id text references public.houses(id) on delete set null,
  week text not null,
  scores jsonb,
  total_score int,
  house_name text,
  created_at timestamptz not null default now()
);

alter table public.hvs_logs enable row level security;

create policy "Allow authenticated users to read hvs logs" on public.hvs_logs
  for select using (auth.role() = 'authenticated');
create policy "Allow authenticated users to insert hvs logs" on public.hvs_logs
  for insert with check (auth.role() = 'authenticated');
create policy "Allow authenticated users to update hvs logs" on public.hvs_logs
  for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Allow authenticated users to delete hvs logs" on public.hvs_logs
  for delete using (auth.role() = 'authenticated');
