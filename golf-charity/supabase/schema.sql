-- PRD: Golf Charity Subscription Platform
-- This SQL is intended for a NEW Supabase project.

begin;

-- Extensions
create extension if not exists pgcrypto;

-- Enums
do $$ begin
  create type public.user_role as enum ('subscriber', 'admin');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.subscription_status as enum ('inactive', 'active', 'canceled', 'lapsed');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.draw_status as enum ('draft', 'simulated', 'published');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.proof_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.payout_status as enum ('pending', 'paid');
exception when duplicate_object then null;
end $$;

-- Core profile (auth.users is the source of truth for identity)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role public.user_role not null default 'subscriber',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles(role);

-- Automatically create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = excluded.full_name,
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Charities directory
create table if not exists public.charities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  short_description text,
  description text,
  country_code text default 'IN',
  tags text[] not null default '{}',
  cover_image_url text,
  gallery_image_urls text[] not null default '{}',
  upcoming_events jsonb not null default '[]'::jsonb,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists charities_active_idx on public.charities(is_active);
create index if not exists charities_featured_idx on public.charities(is_featured);

-- User charity selection + contribution %
create table if not exists public.user_charity_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  charity_id uuid references public.charities(id) on delete set null,
  contribution_percent numeric(5,2) not null default 10.00,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contribution_percent_range check (contribution_percent >= 10 and contribution_percent <= 100)
);

-- Subscription state (synced from Stripe webhooks)
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  plan_interval text not null check (plan_interval in ('month','year')),
  status public.subscription_status not null default 'inactive',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  price_cents integer not null default 0,
  currency text not null default 'usd',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$ begin
  alter table public.subscriptions
    add constraint subscriptions_one_per_user unique (user_id);
exception when duplicate_object then null;
end $$;

create index if not exists subscriptions_user_idx on public.subscriptions(user_id);
create index if not exists subscriptions_status_idx on public.subscriptions(status);

-- Score storage: retain ONLY latest 5 per user
create table if not exists public.scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  played_on date not null,
  stableford_score integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint stableford_score_range check (stableford_score >= 1 and stableford_score <= 45)
);

create index if not exists scores_user_date_idx on public.scores(user_id, played_on desc);

-- Helper function: when inserting a score, keep only latest 5
create or replace function public.enforce_latest_five_scores()
returns trigger
language plpgsql
as $$
begin
  -- Delete anything beyond the newest 5 (reverse-chron via played_on, then created_at)
  delete from public.scores s
  where s.user_id = new.user_id
    and s.id in (
      select id
      from public.scores
      where user_id = new.user_id
      order by played_on desc, created_at desc
      offset 5
    );
  return new;
end;
$$;

drop trigger if exists trg_enforce_latest_five_scores on public.scores;
create trigger trg_enforce_latest_five_scores
after insert on public.scores
for each row execute function public.enforce_latest_five_scores();

-- Monthly draws
create table if not exists public.draws (
  id uuid primary key default gen_random_uuid(),
  draw_month date not null, -- store as first day of month (e.g. 2026-04-01)
  logic_mode text not null check (logic_mode in ('random','algorithmic')),
  numbers integer[] not null,
  status public.draw_status not null default 'draft',
  prize_pool_cents integer not null default 0,
  jackpot_rollover_cents integer not null default 0,
  published_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint draws_unique_month unique (draw_month),
  constraint draw_numbers_len check (array_length(numbers, 1) = 5)
);

-- Snapshot of an entry at publish time (so results don't change if user edits scores later)
create table if not exists public.draw_entries (
  id uuid primary key default gen_random_uuid(),
  draw_id uuid not null references public.draws(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  user_scores integer[] not null,
  match_count integer not null default 0,
  tier text check (tier in ('5','4','3')) null,
  created_at timestamptz not null default now(),
  constraint entries_unique_user_draw unique (draw_id, user_id),
  constraint entry_scores_len check (array_length(user_scores, 1) = 5)
);

create index if not exists draw_entries_draw_idx on public.draw_entries(draw_id);

-- Winners + payout tracking
create table if not exists public.winners (
  id uuid primary key default gen_random_uuid(),
  draw_id uuid not null references public.draws(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  tier text not null check (tier in ('5','4','3')),
  prize_cents integer not null default 0,
  payout_status public.payout_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint winners_unique_user_draw_tier unique (draw_id, user_id, tier)
);

create index if not exists winners_user_idx on public.winners(user_id);
create index if not exists winners_draw_idx on public.winners(draw_id);

-- Winner proof uploads
create table if not exists public.winner_proofs (
  id uuid primary key default gen_random_uuid(),
  winner_id uuid not null references public.winners(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  file_url text not null,
  status public.proof_status not null default 'pending',
  admin_notes text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists winner_proofs_winner_idx on public.winner_proofs(winner_id);

-- Independent donations (not tied to gameplay)
create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  charity_id uuid not null references public.charities(id) on delete restrict,
  amount_cents integer not null,
  currency text not null default 'usd',
  stripe_payment_intent_id text unique,
  created_at timestamptz not null default now(),
  constraint donations_amount_positive check (amount_cents > 0)
);

-- Simple analytics views
create or replace view public.v_metrics as
select
  (select count(*) from public.profiles) as total_users,
  (select count(*) from public.subscriptions where status = 'active') as active_subscribers,
  (select coalesce(sum(prize_pool_cents), 0) from public.draws where status = 'published') as total_prize_pool_cents,
  (select coalesce(sum(amount_cents), 0) from public.donations) as total_donations_cents;

-- Timestamps: keep updated_at fresh
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$ begin
  create trigger trg_touch_profiles before update on public.profiles
  for each row execute function public.touch_updated_at();
exception when duplicate_object then null;
end $$;

do $$ begin
  create trigger trg_touch_charities before update on public.charities
  for each row execute function public.touch_updated_at();
exception when duplicate_object then null;
end $$;

do $$ begin
  create trigger trg_touch_prefs before update on public.user_charity_preferences
  for each row execute function public.touch_updated_at();
exception when duplicate_object then null;
end $$;

do $$ begin
  create trigger trg_touch_subs before update on public.subscriptions
  for each row execute function public.touch_updated_at();
exception when duplicate_object then null;
end $$;

do $$ begin
  create trigger trg_touch_scores before update on public.scores
  for each row execute function public.touch_updated_at();
exception when duplicate_object then null;
end $$;

do $$ begin
  create trigger trg_touch_draws before update on public.draws
  for each row execute function public.touch_updated_at();
exception when duplicate_object then null;
end $$;

do $$ begin
  create trigger trg_touch_entries before update on public.draw_entries
  for each row execute function public.touch_updated_at();
exception when undefined_table then null;
end $$;

do $$ begin
  create trigger trg_touch_winners before update on public.winners
  for each row execute function public.touch_updated_at();
exception when duplicate_object then null;
end $$;

do $$ begin
  create trigger trg_touch_proofs before update on public.winner_proofs
  for each row execute function public.touch_updated_at();
exception when duplicate_object then null;
end $$;

-- RLS
alter table public.profiles enable row level security;
alter table public.charities enable row level security;
alter table public.user_charity_preferences enable row level security;
alter table public.subscriptions enable row level security;
alter table public.scores enable row level security;
alter table public.draws enable row level security;
alter table public.draw_entries enable row level security;
alter table public.winners enable row level security;
alter table public.winner_proofs enable row level security;
alter table public.donations enable row level security;

-- Helpers: admin check
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

-- Profiles policies
drop policy if exists "profiles: self read" on public.profiles;
create policy "profiles: self read" on public.profiles
for select to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles: self update" on public.profiles;
create policy "profiles: self update" on public.profiles
for update to authenticated
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

-- Charities: public read active, admin full control
drop policy if exists "charities: public read" on public.charities;
create policy "charities: public read" on public.charities
for select to anon, authenticated
using (is_active = true or public.is_admin());

drop policy if exists "charities: admin write" on public.charities;
create policy "charities: admin write" on public.charities
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Charity preferences: self read/write, admin read
drop policy if exists "prefs: self read" on public.user_charity_preferences;
create policy "prefs: self read" on public.user_charity_preferences
for select to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "prefs: self write" on public.user_charity_preferences;
create policy "prefs: self write" on public.user_charity_preferences
for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists "prefs: self update" on public.user_charity_preferences;
create policy "prefs: self update" on public.user_charity_preferences
for update to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

-- Subscriptions: self read, admin read/write
drop policy if exists "subs: self read" on public.subscriptions;
create policy "subs: self read" on public.subscriptions
for select to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "subs: admin write" on public.subscriptions;
create policy "subs: admin write" on public.subscriptions
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Scores: self read/write, admin full
drop policy if exists "scores: self read" on public.scores;
create policy "scores: self read" on public.scores
for select to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "scores: self write" on public.scores;
create policy "scores: self write" on public.scores
for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists "scores: self update" on public.scores;
create policy "scores: self update" on public.scores
for update to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "scores: self delete" on public.scores;
create policy "scores: self delete" on public.scores
for delete to authenticated
using (user_id = auth.uid() or public.is_admin());

-- Draws & results: users can read published; admin full
drop policy if exists "draws: read published" on public.draws;
create policy "draws: read published" on public.draws
for select to anon, authenticated
using (status = 'published' or public.is_admin());

drop policy if exists "draws: admin write" on public.draws;
create policy "draws: admin write" on public.draws
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "entries: self read" on public.draw_entries;
create policy "entries: self read" on public.draw_entries
for select to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "entries: admin write" on public.draw_entries;
create policy "entries: admin write" on public.draw_entries
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "winners: self read" on public.winners;
create policy "winners: self read" on public.winners
for select to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "winners: admin write" on public.winners;
create policy "winners: admin write" on public.winners
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "proofs: self read" on public.winner_proofs;
create policy "proofs: self read" on public.winner_proofs
for select to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "proofs: self insert" on public.winner_proofs;
create policy "proofs: self insert" on public.winner_proofs
for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists "proofs: admin update" on public.winner_proofs;
create policy "proofs: admin update" on public.winner_proofs
for update to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Donations: user can insert/read own, admin read
drop policy if exists "donations: self read" on public.donations;
create policy "donations: self read" on public.donations
for select to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "donations: user insert" on public.donations;
create policy "donations: user insert" on public.donations
for insert to authenticated
with check (user_id = auth.uid() or user_id is null);

commit;

