-- Licence applicant profile (licprof) holds ID numbers and investment figures: executives only.
create or replace function private.can_see_key(k text)
returns boolean language sql stable security definer set search_path to ''
as $$
  select k not in ('act2569','licprof') or exists (
    select 1 from public.allowed_users u
    where u.email = lower(auth.jwt() ->> 'email') and u.finance
  );
$$;
