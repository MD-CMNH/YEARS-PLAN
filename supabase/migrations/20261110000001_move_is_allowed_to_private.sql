-- Keep the permission helper out of the exposed API schema (Supabase advisor 0029).
create schema if not exists private;
grant usage on schema private to authenticated;
alter function public.is_allowed(boolean) set schema private;
