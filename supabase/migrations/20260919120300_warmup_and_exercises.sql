-- Пункти розминки та вправи конкретного тренування.

create or replace function public.can_access_training(tid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.trainings t
    where t.id = tid
      and (t.student_id = auth.uid() or (public.is_coach() and public.is_my_student(t.student_id)))
  );
$$;

-- ---------- warmup_items ----------

create table public.warmup_items (
  id uuid primary key default gen_random_uuid(),
  training_id uuid not null references public.trainings (id) on delete cascade,
  position integer not null default 0,
  text text not null,
  is_done boolean not null default false
);

create index warmup_items_training_idx on public.warmup_items (training_id);

alter table public.warmup_items enable row level security;

create or replace function public.protect_warmup_item_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_coach() then
    if new.text is distinct from old.text
      or new.position is distinct from old.position
      or new.training_id is distinct from old.training_id then
      raise exception 'Учень може відмічати лише виконання пункту розминки';
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_protect_warmup_item_fields
  before update on public.warmup_items
  for each row execute function public.protect_warmup_item_fields();

create policy warmup_items_select on public.warmup_items
  for select
  using (public.can_access_training(training_id));

create policy warmup_items_insert on public.warmup_items
  for insert
  with check (public.is_coach() and public.can_access_training(training_id));

create policy warmup_items_update on public.warmup_items
  for update
  using (public.can_access_training(training_id));

create policy warmup_items_delete on public.warmup_items
  for delete
  using (public.is_coach() and public.can_access_training(training_id));

-- ---------- exercises ----------

create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  training_id uuid not null references public.trainings (id) on delete cascade,
  position integer not null default 0,
  title text not null,
  description text,
  video_url text,
  library_exercise_id uuid,
  result text check (result in ('ok', 'partial', 'fail')),
  result_comment text
);

create index exercises_training_idx on public.exercises (training_id);

alter table public.exercises enable row level security;

create or replace function public.protect_exercise_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_coach() then
    if new.title is distinct from old.title
      or new.description is distinct from old.description
      or new.video_url is distinct from old.video_url
      or new.position is distinct from old.position
      or new.training_id is distinct from old.training_id
      or new.library_exercise_id is distinct from old.library_exercise_id then
      raise exception 'Учень може змінювати лише результат і коментар до вправи';
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_protect_exercise_fields
  before update on public.exercises
  for each row execute function public.protect_exercise_fields();

create policy exercises_select on public.exercises
  for select
  using (public.can_access_training(training_id));

create policy exercises_insert on public.exercises
  for insert
  with check (public.is_coach() and public.can_access_training(training_id));

create policy exercises_update on public.exercises
  for update
  using (public.can_access_training(training_id));

create policy exercises_delete on public.exercises
  for delete
  using (public.is_coach() and public.can_access_training(training_id));
