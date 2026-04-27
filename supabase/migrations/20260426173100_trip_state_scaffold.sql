-- Supabase shared state scaffold for koreatrip.vercel.app
-- Run this in the Supabase SQL editor, then set Vercel env vars:
-- VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_TRIP_ID=korea-2026

create table if not exists public.trip_states (
  trip_id text primary key,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.trip_states enable row level security;

drop policy if exists "trip_states_public_read" on public.trip_states;
create policy "trip_states_public_read"
  on public.trip_states
  for select
  using (true);

drop policy if exists "trip_states_public_insert" on public.trip_states;
create policy "trip_states_public_insert"
  on public.trip_states
  for insert
  with check (true);

drop policy if exists "trip_states_public_update" on public.trip_states;
create policy "trip_states_public_update"
  on public.trip_states
  for update
  using (true)
  with check (true);

create or replace function public.set_trip_states_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_trip_states_updated_at on public.trip_states;
create trigger set_trip_states_updated_at
  before update on public.trip_states
  for each row
  execute function public.set_trip_states_updated_at();
