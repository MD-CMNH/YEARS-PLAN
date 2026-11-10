-- Remove tables from the first dashboard version; the CEO Dashboard page uses shared_state only.
drop table if exists public.kpi_actuals, public.kpis, public.tasks, public.projects, public.decisions, public.metrics;
drop type if exists public.task_status;
