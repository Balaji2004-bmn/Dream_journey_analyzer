create table if not exists public.user_profiles (
  user_id uuid primary key,
  role text not null default 'user',
  is_active boolean not null default true,
  banned_until timestamptz null,
  ban_reason text null,
  updated_at timestamptz not null default now()
);

alter table public.user_profiles
  enable row level security;

do $$ begin
  create policy "Users read own profile" on public.user_profiles
  for select using (auth.uid() = user_id);
exception when others then null; end $$;

do $$ begin
  create policy "Users update own profile" on public.user_profiles
  for update using (auth.uid() = user_id);
exception when others then null; end $$;


