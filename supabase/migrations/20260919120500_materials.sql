-- Матеріали для учнів: категорії й статті.

create table public.material_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  position integer not null default 0
);

alter table public.material_categories enable row level security;

create policy material_categories_select_all on public.material_categories
  for select
  using (auth.uid() is not null);

create policy material_categories_write_coach on public.material_categories
  for insert
  with check (public.is_coach());

create policy material_categories_update_coach on public.material_categories
  for update
  using (public.is_coach());

create policy material_categories_delete_coach on public.material_categories
  for delete
  using (public.is_coach());

insert into public.material_categories (name, position) values
  ('Ігри', 1),
  ('Базова техніка', 2),
  ('Твій старт', 3),
  ('Рекомендації', 4),
  ('Стратегія', 5),
  ('Скелі', 6),
  ('Зачіпки', 7);

create table public.materials (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.material_categories (id),
  title text not null,
  summary text check (char_length(summary) <= 140),
  body jsonb not null default '{}'::jsonb,
  position integer not null default 0,
  is_published boolean not null default false,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index materials_category_idx on public.materials (category_id);

alter table public.materials enable row level security;

create trigger trg_materials_updated_at
  before update on public.materials
  for each row execute function public.set_updated_at();

-- Опубліковані статті бачать усі; чернетки — лише тренер.
create policy materials_select_published on public.materials
  for select
  using (is_published or public.is_coach());

create policy materials_write_coach on public.materials
  for insert
  with check (public.is_coach());

create policy materials_update_coach on public.materials
  for update
  using (public.is_coach());

create policy materials_delete_coach on public.materials
  for delete
  using (public.is_coach());
