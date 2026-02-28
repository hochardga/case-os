-- Phase 2 T8: auth rate limit ledger + atomic limiter function

create table if not exists public.auth_rate_limits (
  id bigserial primary key,
  action text not null,
  subject_hash text not null,
  attempt_count integer not null default 0,
  window_started_at timestamptz not null,
  blocked_until timestamptz null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint auth_rate_limits_action_check check (
    action in ('login', 'password_reset', 'verification_resend')
  ),
  constraint auth_rate_limits_attempt_count_nonnegative check (attempt_count >= 0)
);

create unique index if not exists auth_rate_limits_action_subject_hash_key
  on public.auth_rate_limits (action, subject_hash);

create index if not exists auth_rate_limits_blocked_until_idx
  on public.auth_rate_limits (blocked_until);

alter table public.auth_rate_limits enable row level security;

create or replace function public.check_auth_rate_limit(
  p_action text,
  p_subject_hash text,
  p_window_seconds integer,
  p_max_attempts integer,
  p_block_seconds integer,
  p_now timestamptz default timezone('utc', now())
)
returns table (allowed boolean, retry_after_seconds integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_row public.auth_rate_limits%rowtype;
  block_until timestamptz;
  window_expires_at timestamptz;
begin
  if p_action not in ('login', 'password_reset', 'verification_resend') then
    raise exception 'invalid auth rate-limit action: %', p_action;
  end if;

  if p_window_seconds <= 0 or p_max_attempts <= 0 or p_block_seconds <= 0 then
    raise exception 'invalid auth rate-limit configuration';
  end if;

  loop
    select *
    into current_row
    from public.auth_rate_limits
    where action = p_action
      and subject_hash = p_subject_hash
    for update;

    if not found then
      begin
        insert into public.auth_rate_limits (
          action,
          subject_hash,
          attempt_count,
          window_started_at,
          blocked_until,
          created_at,
          updated_at
        )
        values (
          p_action,
          p_subject_hash,
          1,
          p_now,
          null,
          p_now,
          p_now
        );

        return query select true, 0;
        return;
      exception
        when unique_violation then
          -- Another request inserted first. Retry with row lock.
      end;
    else
      if current_row.blocked_until is not null and current_row.blocked_until > p_now then
        return query
          select
            false,
            greatest(
              1,
              ceil(extract(epoch from (current_row.blocked_until - p_now)))::integer
            );
        return;
      end if;

      if current_row.blocked_until is not null and current_row.blocked_until <= p_now then
        update public.auth_rate_limits
        set attempt_count = 1,
            window_started_at = p_now,
            blocked_until = null,
            updated_at = p_now
        where id = current_row.id;

        return query select true, 0;
        return;
      end if;

      window_expires_at := current_row.window_started_at + make_interval(secs => p_window_seconds);
      if p_now >= window_expires_at then
        update public.auth_rate_limits
        set attempt_count = 1,
            window_started_at = p_now,
            blocked_until = null,
            updated_at = p_now
        where id = current_row.id;

        return query select true, 0;
        return;
      end if;

      if current_row.attempt_count + 1 > p_max_attempts then
        block_until := p_now + make_interval(secs => p_block_seconds);

        update public.auth_rate_limits
        set attempt_count = current_row.attempt_count + 1,
            blocked_until = block_until,
            updated_at = p_now
        where id = current_row.id;

        return query select false, p_block_seconds;
        return;
      end if;

      update public.auth_rate_limits
      set attempt_count = current_row.attempt_count + 1,
          updated_at = p_now
      where id = current_row.id;

      return query select true, 0;
      return;
    end if;
  end loop;
end;
$$;

revoke all on function public.check_auth_rate_limit(
  text,
  text,
  integer,
  integer,
  integer,
  timestamptz
) from public;

grant execute on function public.check_auth_rate_limit(
  text,
  text,
  integer,
  integer,
  integer,
  timestamptz
) to service_role;
