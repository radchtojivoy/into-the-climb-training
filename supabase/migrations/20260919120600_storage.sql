-- Сховища файлів: фото профілів і фото в статтях.
-- Обидва публічні на читання (застосунок сам вирішує, кому показувати посилання).

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('materials', 'materials', true)
on conflict (id) do nothing;

create policy avatars_public_read on storage.objects
  for select
  using (bucket_id = 'avatars');

-- Файл кладеться у папку з id користувача: avatars/<user_id>/....
create policy avatars_owner_write on storage.objects
  for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy avatars_owner_update on storage.objects
  for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy avatars_owner_delete on storage.objects
  for delete
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy materials_public_read on storage.objects
  for select
  using (bucket_id = 'materials');

create policy materials_coach_write on storage.objects
  for insert
  with check (bucket_id = 'materials' and public.is_coach());

create policy materials_coach_update on storage.objects
  for update
  using (bucket_id = 'materials' and public.is_coach());

create policy materials_coach_delete on storage.objects
  for delete
  using (bucket_id = 'materials' and public.is_coach());
