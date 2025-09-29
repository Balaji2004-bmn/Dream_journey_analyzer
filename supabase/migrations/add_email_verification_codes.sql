create table if not exists public.email_verification_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  email text not null,
  code text not null,
  used boolean not null default false,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_email_codes_user on public.email_verification_codes(user_id);

alter table public.email_verification_codes
  enable row level security;

do $$ begin
  create policy "Users manage own verification codes" on public.email_verification_codes
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
exception when others then null; end $$;


