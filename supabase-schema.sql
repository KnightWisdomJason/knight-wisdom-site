-- Run this in Supabase SQL editor

-- 1) Profile + role
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  nickname text,
  role text not null default 'member' check (role in ('member', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles self read" on public.profiles;
create policy "profiles self read" on public.profiles
for select to authenticated
using (auth.uid() = id);

drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update" on public.profiles
for update to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "profiles self insert" on public.profiles;
create policy "profiles self insert" on public.profiles
for insert to authenticated
with check (auth.uid() = id);

-- 2) Chat messages
create table if not exists public.chat_messages (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  nickname text not null default '冒险者',
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.chat_messages add column if not exists user_id uuid references auth.users(id) on delete set null;

alter table public.chat_messages enable row level security;

drop policy if exists "chat public read" on public.chat_messages;
create policy "chat public read" on public.chat_messages
for select
using (true);

drop policy if exists "chat auth insert" on public.chat_messages;
create policy "chat auth insert" on public.chat_messages
for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists "chat admin delete" on public.chat_messages;
create policy "chat admin delete" on public.chat_messages
for delete to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

-- 3) Forum posts
create table if not exists public.posts (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  title text not null,
  content text not null,
  category text not null check (category in ('lore', 'event', 'trade')),
  created_at timestamptz not null default now()
);

alter table public.posts add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.posts alter column category type text;

alter table public.posts enable row level security;

drop policy if exists "posts public read" on public.posts;
create policy "posts public read" on public.posts
for select
using (true);

drop policy if exists "posts auth insert" on public.posts;
create policy "posts auth insert" on public.posts
for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists "posts admin delete" on public.posts;
create policy "posts admin delete" on public.posts
for delete to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

-- 4) Optional: set your own account as admin (replace with your login email)
-- update public.profiles set role='admin' where email='your-email@example.com';
