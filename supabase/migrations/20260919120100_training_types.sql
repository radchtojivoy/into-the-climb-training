-- Довідник типів тренувань — щоб додавати нові без зміни коду.

create table public.training_types (
  id text primary key,
  name text not null,
  color text not null,
  hold_shape text not null,
  is_fun boolean not null default false,
  position integer not null default 0
);

alter table public.training_types enable row level security;

create policy training_types_select_all on public.training_types
  for select
  using (auth.uid() is not null);

create policy training_types_write_coach on public.training_types
  for insert
  with check (public.is_coach());

create policy training_types_update_coach on public.training_types
  for update
  using (public.is_coach());

create policy training_types_delete_coach on public.training_types
  for delete
  using (public.is_coach());

insert into public.training_types (id, name, color, hold_shape, is_fun, position) values
  ('sila', 'Сила', '#b5532a', 'h0', false, 1),
  ('zfp', 'ЗФП', '#535328', 'h1', false, 2),
  ('tech', 'Техніка лазіння', '#1a1a1a', 'h2', false, 3),
  ('coord', 'Координація', '#c48a2c', 'h3', false, 4),
  ('end', 'Витривалість', '#7a3719', 'h4', false, 5),
  ('fun', 'Фан-тренування', '#8a8f55', 'h5', true, 6);
