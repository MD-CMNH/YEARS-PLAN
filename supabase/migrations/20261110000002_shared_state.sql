-- Key/value store used by the CEO dashboard page (task status, checklists, go/no-go, KPI values)
create table public.shared_state (
  key        text primary key,
  v          jsonb,
  at         bigint,
  updated_at timestamptz not null default now()
);
create trigger touch before update on public.shared_state for each row execute function public.touch_updated_at();
alter table public.shared_state enable row level security;
create policy "read: allowed users" on public.shared_state for select to authenticated using ((select private.is_allowed(false)));
create policy "insert: editors" on public.shared_state for insert to authenticated with check ((select private.is_allowed(true)));
create policy "update: editors" on public.shared_state for update to authenticated using ((select private.is_allowed(true))) with check ((select private.is_allowed(true)));
alter publication supabase_realtime add table public.shared_state;
