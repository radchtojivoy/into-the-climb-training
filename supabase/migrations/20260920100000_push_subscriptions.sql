-- Підписки на push-сповіщення (веб-браузер/встановлений PWA).
-- Один користувач може мати кілька підписок (кілька пристроїв).

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

create index push_subscriptions_user_idx on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

-- Кожен керує лише власними підписками.
create policy push_subscriptions_select_own on public.push_subscriptions
  for select
  using (user_id = auth.uid());

create policy push_subscriptions_insert_own on public.push_subscriptions
  for insert
  with check (user_id = auth.uid());

create policy push_subscriptions_delete_own on public.push_subscriptions
  for delete
  using (user_id = auth.uid());
