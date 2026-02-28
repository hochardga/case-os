-- Phase 1 T4 manual verification checklist SQL
-- Run these after applying migrations in your Supabase project.

-- 1) Schema exists and constraints are active.
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'profiles'
order by ordinal_position;

select conname, pg_get_constraintdef(c.oid) as definition
from pg_constraint c
join pg_class t on c.conrelid = t.oid
join pg_namespace n on t.relnamespace = n.oid
where n.nspname = 'public'
  and t.relname = 'profiles';

-- 2) Trigger exists on auth.users.
select trigger_name, event_manipulation, action_statement
from information_schema.triggers
where event_object_schema = 'auth'
  and event_object_table = 'users'
  and trigger_name = 'on_auth_user_created_create_profile';

-- 3) RLS policies exist.
select pol.polname as policy_name,
       pol.polcmd as command,
       pg_get_expr(pol.polqual, pol.polrelid) as using_expression,
       pg_get_expr(pol.polwithcheck, pol.polrelid) as with_check_expression
from pg_policy pol
join pg_class cls on pol.polrelid = cls.oid
join pg_namespace ns on cls.relnamespace = ns.oid
where ns.nspname = 'public'
  and cls.relname = 'profiles'
order by pol.polname;

-- 4) Cross-user read/write denial (run as authenticated user A then B).
-- As user A:
--   select * from public.profiles where id != auth.uid(); -- should return 0 rows
-- As user B:
--   select * from public.profiles where id = '<user_a_uuid>'; -- should return 0 rows
--   update public.profiles set callsign = 'HACKED' where id = '<user_a_uuid>'; -- should affect 0 rows

