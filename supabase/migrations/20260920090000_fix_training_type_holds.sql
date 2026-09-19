-- Виправлення: форми зачіпок (hold_shape) для типів тренувань були переплутані
-- в першій міграції. Тут — правильна відповідність до дизайн-концепту.

update public.training_types set hold_shape = 'h0' where id = 'sila';
update public.training_types set hold_shape = 'h3' where id = 'zfp';
update public.training_types set hold_shape = 'h4' where id = 'tech';
update public.training_types set hold_shape = 'h2' where id = 'coord';
update public.training_types set hold_shape = 'h1' where id = 'end';
update public.training_types set hold_shape = 'h5' where id = 'fun';
