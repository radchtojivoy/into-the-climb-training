-- Тренування учнів.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_my_student(sid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = sid and coach_id = auth.uid()
  );
$$;

create table public.trainings (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  date date not null,
  type_id text not null references public.training_types (id),
  is_fun boolean not null default false,
  start_time time,
  end_time time,
  is_done boolean not null default false,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trainings_time_range check (
    start_time is null or end_time is null or (
      start_time >= time '09:00' and end_time <= time '21:00' and end_time > start_time
    )
  )
);

comment on table public.trainings is
  'Стан "пропущено" тут не зберігається — обчислюється на клієнті: не фан, не виконано, дата в минулому.';

create index trainings_student_date_idx on public.trainings (student_id, date);

alter table public.trainings enable row level security;

create trigger trg_trainings_updated_at
  before update on public.trainings
  for each row execute function public.set_updated_at();

-- Захист полів: student_id/created_by незмінні; тип, ознаку "фан" і дату
-- може міняти лише тренер. Учень редагує тільки час і відмітку виконання
-- (розминка й результати вправ живуть в окремих таблицях).
create or replace function public.protect_training_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.student_id is distinct from old.student_id
    or new.created_by is distinct from old.created_by then
    raise exception 'Тренування не можна перепризначити іншому учню';
  end if;

  if not (public.is_coach() and public.is_my_student(old.student_id)) then
    if new.type_id is distinct from old.type_id
      or new.is_fun is distinct from old.is_fun
      or new.date is distinct from old.date then
      raise exception 'Учень може змінювати лише час і відмітку виконання тренування';
    end if;
  end if;

  return new;
end;
$$;

create trigger trg_protect_training_fields
  before update on public.trainings
  for each row execute function public.protect_training_fields();

create policy trainings_select on public.trainings
  for select
  using (
    student_id = auth.uid()
    or (public.is_coach() and public.is_my_student(student_id))
  );

-- Тренер створює тренування своїм учням; учень — тільки власні фан-тренування.
create policy trainings_insert on public.trainings
  for insert
  with check (
    created_by = auth.uid()
    and (
      (public.is_coach() and public.is_my_student(student_id) and not is_fun)
      or (student_id = auth.uid() and is_fun)
    )
  );

create policy trainings_update on public.trainings
  for update
  using (
    student_id = auth.uid()
    or (public.is_coach() and public.is_my_student(student_id))
  );

-- Видаляти можна лише фан-тренування (своє учнем, або тренером — своєму учню).
create policy trainings_delete on public.trainings
  for delete
  using (
    is_fun and (
      student_id = auth.uid()
      or (public.is_coach() and public.is_my_student(student_id))
    )
  );
