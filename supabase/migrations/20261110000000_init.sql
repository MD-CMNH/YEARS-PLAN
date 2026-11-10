-- YEARS-PLAN dashboard schema (แผนงานปี 2570 — CMNH)
-- Access model: only signed-in users whose email is in public.allowed_users can read or write.

create table public.allowed_users (
  email text primary key check (email = lower(email)),
  role  text not null default 'editor' check (role in ('viewer', 'editor')),
  created_at timestamptz not null default now()
);

-- true when the caller's JWT email is on the allowlist (optionally with editor role)
create or replace function public.is_allowed(require_editor boolean default false)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.allowed_users u
    where u.email = lower(auth.jwt() ->> 'email')
      and (not require_editor or u.role = 'editor')
  );
$$;
revoke all on function public.is_allowed(boolean) from public, anon;
grant execute on function public.is_allowed(boolean) to authenticated;

create type public.task_status as enum ('ยังไม่เริ่ม', 'กำลังทำ', 'เสร็จแล้ว', 'ล่าช้า', 'ยกเลิก');

create table public.tasks (
  id          bigint generated always as identity primary key,
  quarter     text not null,                 -- 'ก่อนเริ่มปี' | 'Q1'..'Q4' | 'Q3–Q4' | 'ทั้งปี'
  title       text not null,
  owner       text not null,
  outcome     text,
  due_text    text,                          -- free text from the plan ("ตามสัญญา", "ทุกเดือน")
  due_date    date,
  status      public.task_status not null default 'ยังไม่เริ่ม',
  is_extra    boolean not null default false, -- งานเพิ่มตามข้อเสนอแนะ
  sort_order  int not null default 0,
  note        text,
  updated_at  timestamptz not null default now()
);

create table public.projects (
  id           bigint generated always as identity primary key,
  sort_order   int not null default 0,
  name         text not null,
  description  text,
  started      text,
  owner        text,
  kpi_2570     text,          -- เป้าปี 2570 (ผู้รับผิดชอบกรอก)
  decision     text,          -- เรื่องที่ต้องตัดสิน
  status       public.task_status not null default 'กำลังทำ',
  updated_at   timestamptz not null default now()
);

create table public.kpis (
  id          bigint generated always as identity primary key,
  sort_order  int not null default 0,
  department  text not null,
  name        text not null,
  target      text not null,       -- เป้าร่าง (ข้อความตามแผน)
  frequency   text not null,       -- รายเดือน / รายไตรมาส
  unit        text,
  updated_at  timestamptz not null default now()
);

-- ผลจริงรายเดือน (กรอกทุกวันที่ 5)
create table public.kpi_actuals (
  kpi_id      bigint not null references public.kpis(id) on delete cascade,
  month       smallint not null check (month between 1 and 12), -- เดือนของปี 2570
  actual      text,
  target      text,
  note        text,
  updated_at  timestamptz not null default now(),
  primary key (kpi_id, month)
);

create table public.decisions (
  id          bigint generated always as identity primary key,
  sort_order  int not null default 0,
  topic       text not null,
  detail      text,
  deadline    text,
  status      text not null default 'รอตัดสินใจ' check (status in ('รอตัดสินใจ', 'อนุมัติแล้ว', 'ไม่อนุมัติ', 'เลื่อน')),
  note        text,
  updated_at  timestamptz not null default now()
);

create table public.metrics (
  key         text primary key,
  label       text not null,
  value       text not null,
  detail      text,
  sort_order  int not null default 0,
  updated_at  timestamptz not null default now()
);

create index kpi_actuals_kpi_id_idx on public.kpi_actuals (kpi_id);

-- updated_at trigger
create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at := now(); return new; end; $$;

do $$
declare t text;
begin
  foreach t in array array['tasks','projects','kpis','kpi_actuals','decisions','metrics'] loop
    execute format('create trigger touch before update on public.%I for each row execute function public.touch_updated_at()', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "read: allowed users" on public.%I for select to authenticated using ((select public.is_allowed(false)))', t);
    execute format('create policy "insert: editors" on public.%I for insert to authenticated with check ((select public.is_allowed(true)))', t);
    execute format('create policy "update: editors" on public.%I for update to authenticated using ((select public.is_allowed(true))) with check ((select public.is_allowed(true)))', t);
    execute format('create policy "delete: editors" on public.%I for delete to authenticated using ((select public.is_allowed(true)))', t);
  end loop;
end $$;

alter table public.allowed_users enable row level security;
create policy "read own row" on public.allowed_users for select to authenticated
  using (email = lower((select auth.jwt()) ->> 'email'));
