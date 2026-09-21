-- Нотатка тренера до розминки конкретного тренування: рекомендації чи
-- додаткові пояснення, які бачить учень, але редагувати може лише тренер.

alter table public.trainings add column warmup_note text;

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

  if auth.uid() is not null and not (public.is_coach() and public.is_my_student(old.student_id)) then
    if new.type_id is distinct from old.type_id
      or new.is_fun is distinct from old.is_fun
      or new.date is distinct from old.date
      or new.warmup_note is distinct from old.warmup_note then
      raise exception 'Учень може змінювати лише час і відмітку виконання тренування';
    end if;
  end if;

  return new;
end;
$$;
