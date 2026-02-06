-- Fix signup trigger: ensure public schema is on the search_path.
-- Without this, GoTrue may execute the trigger with a search_path that doesn't include public,
-- causing `relation "user_settings" does not exist` even though public.user_settings exists.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

