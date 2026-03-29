-- Flowstate IR Intelligence Platform — Initial Schema
-- Run in Supabase SQL Editor

-- ─────────────────────────────────────────
-- Extensions
-- ─────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────
-- Users (extends Supabase auth.users)
-- ─────────────────────────────────────────
create table if not exists public.users (
  id             uuid primary key references auth.users(id) on delete cascade,
  email          text not null,
  name           text,
  company_name   text,
  company_stage  text,            -- 'pre-seed' | 'seed' | 'series-a'
  raise_target   numeric,
  raise_committed numeric,
  calendly_url   text,
  avatar_url     text,
  dark_mode      boolean default false,
  created_at     timestamptz default now()
);

-- ─────────────────────────────────────────
-- Funds
-- ─────────────────────────────────────────
create table if not exists public.funds (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  hq          text,
  check_min   numeric,
  check_max   numeric,
  aum         text,
  category    text,              -- 'supply-chain' | 'warehousing' | 'ecommerce'
  stages      text[],            -- ['seed', 'pre-seed', 'series-a', ...]
  about       text,
  color       text,              -- hex fg
  color_bg    text,              -- hex bg
  portfolio   text[],
  website     text,
  activity_status text,          -- 'hot' | 'warm' | null
  activity_note   text,
  created_at  timestamptz default now()
);

-- ─────────────────────────────────────────
-- Decision Makers
-- ─────────────────────────────────────────
create table if not exists public.decision_makers (
  id          uuid primary key default uuid_generate_v4(),
  fund_id     uuid references public.funds(id) on delete cascade,
  name        text not null,
  role        text,
  email       text,
  linkedin    text,
  bio         text,
  initials    text,
  avatar_color text
);

-- ─────────────────────────────────────────
-- User Contacts (tracked DMs per user)
-- ─────────────────────────────────────────
create table if not exists public.contacts (
  id                 uuid primary key default uuid_generate_v4(),
  user_id            uuid references public.users(id) on delete cascade,
  dm_id              uuid references public.decision_makers(id) on delete cascade,
  status             text default 'tracked',  -- 'tracked' | 'outreached' | 'replied' | 'meeting'
  relationship_score integer default 0,       -- 0–100
  notes              text,
  last_contacted_at  timestamptz,
  created_at         timestamptz default now(),
  unique(user_id, dm_id)
);

-- ─────────────────────────────────────────
-- Tasks
-- ─────────────────────────────────────────
create table if not exists public.tasks (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references public.users(id) on delete cascade,
  channel       text not null,  -- 'email' | 'linkedin' | 'whatsapp'
  type          text not null,  -- 'inbound' | 'followup'
  priority      text default 'normal',  -- 'urgent' | 'high' | 'normal'
  title         text not null,
  preview       text,
  ai_draft      text,
  contact_name  text,
  contact_fund  text,
  due_date      date,
  done          boolean default false,
  is_new        boolean default true,
  created_at    timestamptz default now()
);

-- ─────────────────────────────────────────
-- Outreach History
-- ─────────────────────────────────────────
create table if not exists public.outreach_history (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references public.users(id) on delete cascade,
  dm_id       uuid references public.decision_makers(id) on delete set null,
  channel     text,              -- 'email' | 'linkedin' | 'whatsapp'
  direction   text,              -- 'in' | 'out'
  subject     text,
  body        text,
  sent_at     timestamptz default now()
);

-- ─────────────────────────────────────────
-- Notifications
-- ─────────────────────────────────────────
create table if not exists public.notifications (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references public.users(id) on delete cascade,
  type        text not null,    -- 'fundraise' | 'reply' | 'followup' | 'signal'
  title       text,
  data        jsonb default '{}',
  read        boolean default false,
  created_at  timestamptz default now()
);

-- ─────────────────────────────────────────
-- Uploaded Contacts
-- ─────────────────────────────────────────
create table if not exists public.uploaded_contacts (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references public.users(id) on delete cascade,
  name        text,
  fund        text,
  email       text,
  linkedin    text,
  phone       text,
  status      text default 'new',  -- 'matched' | 'enriched' | 'new' | 'unverified'
  raw_data    jsonb default '{}',
  created_at  timestamptz default now()
);

-- ─────────────────────────────────────────
-- Gmail Tokens (encrypted)
-- ─────────────────────────────────────────
create table if not exists public.gmail_tokens (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid references public.users(id) on delete cascade unique,
  access_token   text,
  refresh_token  text,
  expires_at     timestamptz,
  updated_at     timestamptz default now()
);

-- ─────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────
alter table public.users               enable row level security;
alter table public.funds               enable row level security;
alter table public.decision_makers     enable row level security;
alter table public.contacts            enable row level security;
alter table public.tasks               enable row level security;
alter table public.outreach_history    enable row level security;
alter table public.notifications       enable row level security;
alter table public.uploaded_contacts   enable row level security;
alter table public.gmail_tokens        enable row level security;

-- users: own row only
create policy "users_own" on public.users
  for all using (auth.uid() = id);

-- funds: readable by all authenticated users
create policy "funds_read" on public.funds
  for select using (auth.role() = 'authenticated');

-- decision_makers: readable by all authenticated users
create policy "dm_read" on public.decision_makers
  for select using (auth.role() = 'authenticated');

-- contacts: own rows only
create policy "contacts_own" on public.contacts
  for all using (auth.uid() = user_id);

-- tasks: own rows only
create policy "tasks_own" on public.tasks
  for all using (auth.uid() = user_id);

-- outreach_history: own rows only
create policy "outreach_own" on public.outreach_history
  for all using (auth.uid() = user_id);

-- notifications: own rows only
create policy "notifications_own" on public.notifications
  for all using (auth.uid() = user_id);

-- uploaded_contacts: own rows only
create policy "uploaded_contacts_own" on public.uploaded_contacts
  for all using (auth.uid() = user_id);

-- gmail_tokens: own row only
create policy "gmail_tokens_own" on public.gmail_tokens
  for all using (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- Auto-create user profile on sign-up
-- ─────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
