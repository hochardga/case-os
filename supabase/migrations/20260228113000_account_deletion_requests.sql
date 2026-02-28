-- Phase 2 T9: account deletion request persistence + RLS

create table if not exists public.account_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending',
  requested_at timestamptz not null default timezone('utc', now()),
  confirmed_at timestamptz not null default timezone('utc', now()),
  reason text null,
  constraint account_deletion_requests_status_check check (
    status in ('pending', 'processed', 'rejected')
  )
);

create unique index if not exists account_deletion_requests_pending_user_unique
  on public.account_deletion_requests (user_id)
  where status = 'pending';

create index if not exists account_deletion_requests_user_requested_idx
  on public.account_deletion_requests (user_id, requested_at desc);

alter table public.account_deletion_requests enable row level security;

drop policy if exists "account_deletion_requests_select_own" on public.account_deletion_requests;
create policy "account_deletion_requests_select_own"
on public.account_deletion_requests
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "account_deletion_requests_insert_own" on public.account_deletion_requests;
create policy "account_deletion_requests_insert_own"
on public.account_deletion_requests
for insert
to authenticated
with check (auth.uid() = user_id);
