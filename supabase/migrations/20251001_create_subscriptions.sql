-- Enable required extensions
create extension if not exists "pgcrypto";

-- Subscriptions table
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null check (plan in ('free','pro','premium')) default 'free',
  status text not null check (status in ('active','canceled','expired')) default 'active',
  amount numeric(10,2) not null default 0,
  currency text not null default 'usd',
  payment_provider text not null default 'stripe',
  payment_id text unique,
  start_date timestamptz not null default now(),
  end_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_subscriptions_updated_at on public.subscriptions;
create trigger set_subscriptions_updated_at
before update on public.subscriptions
for each row execute procedure public.set_updated_at();

-- Indexes
create index if not exists idx_subscriptions_user_id on public.subscriptions(user_id);
create index if not exists idx_subscriptions_status on public.subscriptions(status);
create index if not exists idx_subscriptions_start_date on public.subscriptions(start_date);

-- Ensure only one active subscription per user
create unique index if not exists one_active_subscription_per_user
  on public.subscriptions(user_id)
  where status = 'active';

-- RLS
alter table public.subscriptions enable row level security;

-- Allow users to read their own subscriptions
create policy if not exists "Subscriptions are viewable by owner"
  on public.subscriptions
  for select
  using (auth.uid() = user_id);

-- Disallow insert/update/delete for non-service roles (service role bypasses RLS)
create policy if not exists "No inserts by clients"
  on public.subscriptions
  for insert
  with check (false);

create policy if not exists "No updates by clients"
  on public.subscriptions
  for update
  using (false)
  with check (false);

create policy if not exists "No deletes by clients"
  on public.subscriptions
  for delete
  using (false);
