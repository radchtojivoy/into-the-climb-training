-- Час відпочинку після вправи (у секундах). Задає тренер, учень лише бачить.

alter table public.exercises
  add column rest_seconds integer check (rest_seconds is null or rest_seconds >= 0);

create or replace function public.protect_exercise_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_coach() then
    if new.title is distinct from old.title
      or new.description is distinct from old.description
      or new.video_url is distinct from old.video_url
      or new.position is distinct from old.position
      or new.training_id is distinct from old.training_id
      or new.library_exercise_id is distinct from old.library_exercise_id
      or new.rest_seconds is distinct from old.rest_seconds then
      raise exception 'Учень може змінювати лише результат і коментар до вправи';
    end if;
  end if;
  return new;
end;
$$;
