-- Загальні налаштування застосунку (одне значення на ключ), напр. фото фону
-- дашборду учня. Читають усі, змінює лише тренер.

create table public.app_settings (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);

comment on table public.app_settings is 'Спільні налаштування застосунку (ключ-значення), напр. hero_photo_url.';

alter table public.app_settings enable row level security;

create policy app_settings_public_read on public.app_settings
  for select
  using (true);

create policy app_settings_coach_write on public.app_settings
  for insert
  with check (public.is_coach());

create policy app_settings_coach_update on public.app_settings
  for update
  using (public.is_coach())
  with check (public.is_coach());

-- Сховище для фото фону дашборду учня. Публічне на читання, писати може
-- лише тренер (як і сховище "materials").
insert into storage.buckets (id, name, public)
values ('brand', 'brand', true)
on conflict (id) do nothing;

create policy brand_public_read on storage.objects
  for select
  using (bucket_id = 'brand');

create policy brand_coach_write on storage.objects
  for insert
  with check (bucket_id = 'brand' and public.is_coach());

create policy brand_coach_update on storage.objects
  for update
  using (bucket_id = 'brand' and public.is_coach());

create policy brand_coach_delete on storage.objects
  for delete
  using (bucket_id = 'brand' and public.is_coach());
