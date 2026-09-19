-- Профілі користувачів (учні й тренери), пов'язані з auth.users.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'student' check (role in ('coach', 'student')),
  status text not null default 'pending' check (status in ('pending', 'active', 'archived')),
  coach_id uuid references public.profiles (id) on delete set null,
  full_name text not null,
  birth_date date,
  gym text,
  telegram text,
  weight_kg integer check (weight_kg between 30 and 140),
  height_cm integer check (height_cm between 130 and 210),
  grade_rp text,
  grade_os text,
  avatar_url text,
  coach_note text,
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'Профіль учня або тренера, 1:1 з auth.users.';
comment on column public.profiles.coach_id is 'Тренер, за яким закріплений учень. NULL, поки заявку не прийняли.';

create index profiles_coach_id_idx on public.profiles (coach_id);
create index profiles_status_idx on public.profiles (status);

alter table public.profiles enable row level security;

-- Допоміжна функція: чи є поточний користувач тренером.
-- security definer навмисно: інакше запит до profiles всередині політики profiles
-- викликав би нескінченну рекурсію RLS.
create or replace function public.is_coach()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'coach'
  );
$$;

-- Автоматичне створення профілю при реєстрації через Supabase Auth.
-- Дані форми реєстрації передаються як user_metadata в auth.signUp().
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id, full_name, birth_date, gym, telegram, weight_kg, height_cm, grade_rp, grade_os
  ) values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'birth_date', '')::date,
    new.raw_user_meta_data ->> 'gym',
    new.raw_user_meta_data ->> 'telegram',
    nullif(new.raw_user_meta_data ->> 'weight_kg', '')::int,
    nullif(new.raw_user_meta_data ->> 'height_cm', '')::int,
    new.raw_user_meta_data ->> 'grade_rp',
    new.raw_user_meta_data ->> 'grade_os'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Захист полів, які учень не має права міняти сам:
-- роль, статус, тренер і нотатка тренера.
create or replace function public.protect_profile_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_coach() then
    if new.role is distinct from old.role
      or new.status is distinct from old.status
      or new.coach_id is distinct from old.coach_id
      or new.coach_note is distinct from old.coach_note then
      raise exception 'Ці поля профілю може змінювати лише тренер';
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_protect_profile_fields
  before update on public.profiles
  for each row execute function public.protect_profile_fields();

-- SELECT: сам користувач бачить свій профіль.
create policy profiles_select_self on public.profiles
  for select
  using (id = auth.uid());

-- SELECT: тренер бачить своїх учнів і ще не прийняті заявки (coach_id is null).
create policy profiles_select_coach on public.profiles
  for select
  using (public.is_coach() and (coach_id is null or coach_id = auth.uid()));

-- UPDATE: сам користувач редагує свій профіль (обмеження полів — тригером вище).
create policy profiles_update_self on public.profiles
  for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- UPDATE: тренер редагує профілі своїх учнів або приймає нову заявку.
create policy profiles_update_coach on public.profiles
  for update
  using (public.is_coach() and (coach_id is null or coach_id = auth.uid()))
  with check (public.is_coach());
