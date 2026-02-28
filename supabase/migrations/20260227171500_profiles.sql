-- Phase 1 T4: profiles table + auth trigger + RLS policies

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  callsign text not null unique,
  created_at timestamptz not null default timezone('utc', now()),
  constraint profiles_callsign_format check (callsign ~ '^[A-Za-z0-9_-]{3,24}$')
);

alter table public.profiles enable row level security;

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  resolved_callsign text;
begin
  resolved_callsign := nullif(trim(coalesce(new.raw_user_meta_data ->> 'callsign', '')), '');

  if resolved_callsign is null then
    resolved_callsign := 'candidate_' || substr(replace(new.id::text, '-', ''), 1, 14);
  end if;

  insert into public.profiles (id, callsign)
  values (new.id, resolved_callsign);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_create_profile on auth.users;
create trigger on_auth_user_created_create_profile
after insert on auth.users
for each row execute function public.handle_new_user_profile();

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);
