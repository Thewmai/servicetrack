-- Run this once in Supabase → SQL Editor.
create table if not exists public.jobs (
  id text primary key,
  data jsonb not null default '{}',
  updated_at timestamptz not null default now()
);
alter table public.jobs enable row level security;

-- Everyone (customers) can read jobs; only signed-in shop staff can change them.
create policy "customers read jobs" on public.jobs for select to anon, authenticated using (true);
create policy "staff insert jobs" on public.jobs for insert to authenticated with check (true);
create policy "staff update jobs" on public.jobs for update to authenticated using (true) with check (true);
create policy "staff delete jobs" on public.jobs for delete to authenticated using (true);

-- Realtime: push changes to open customer pages.
alter publication supabase_realtime add table public.jobs;

-- Photo storage.
insert into storage.buckets (id, name, public) values ('photos', 'photos', true) on conflict (id) do nothing;
create policy "public read photos" on storage.objects for select using (bucket_id = 'photos');
create policy "staff upload photos" on storage.objects for insert to authenticated with check (bucket_id = 'photos');
create policy "staff delete photos" on storage.objects for delete to authenticated using (bucket_id = 'photos');
