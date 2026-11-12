-- Two access levels: every allowed user sees the plan; only users with finance=true
-- can read or write finance keys (real 2569 figures) in shared_state.
alter table public.allowed_users add column if not exists finance boolean not null default false;
update public.allowed_users set finance = true where email in ('team@years-plan.local','niasminhengpiya@gmail.com');
insert into public.allowed_users(email, role, finance) values ('staff@years-plan.local','editor',false)
  on conflict (email) do nothing;

create or replace function private.can_see_key(k text)
returns boolean language sql stable security definer set search_path to ''
as $$
  select k not in ('act2569') or exists (
    select 1 from public.allowed_users u
    where u.email = lower(auth.jwt() ->> 'email') and u.finance
  );
$$;
revoke all on function private.can_see_key(text) from public;
grant execute on function private.can_see_key(text) to authenticated;

drop policy if exists "read: allowed users" on public.shared_state;
drop policy if exists "insert: editors" on public.shared_state;
drop policy if exists "update: editors" on public.shared_state;
create policy "read: allowed users" on public.shared_state for select to authenticated
  using ((select private.is_allowed(false)) and private.can_see_key(key));
create policy "insert: editors" on public.shared_state for insert to authenticated
  with check ((select private.is_allowed(true)) and private.can_see_key(key));
create policy "update: editors" on public.shared_state for update to authenticated
  using ((select private.is_allowed(true)) and private.can_see_key(key))
  with check ((select private.is_allowed(true)) and private.can_see_key(key));
