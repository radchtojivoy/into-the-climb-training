-- Бібліотека тренера: вправи й шаблони розминок. Учні цих таблиць не бачать —
-- вони отримують лише копії у warmup_items/exercises конкретного тренування.

create table public.library_exercises (
  id uuid primary key default gen_random_uuid(),
  type_id text not null references public.training_types (id),
  title text not null,
  description text,
  video_url text,
  created_by uuid not null references public.profiles (id)
);

create table public.warmup_templates (
  id uuid primary key default gen_random_uuid(),
  type_id text not null references public.training_types (id),
  title text not null,
  items text[] not null default '{}'
);

alter table public.library_exercises enable row level security;
alter table public.warmup_templates enable row level security;

create policy library_exercises_all_coach on public.library_exercises
  for all
  using (public.is_coach())
  with check (public.is_coach());

create policy warmup_templates_all_coach on public.warmup_templates
  for all
  using (public.is_coach())
  with check (public.is_coach());
