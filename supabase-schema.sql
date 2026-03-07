-- Run this in Supabase SQL editor

create table if not exists public.chat_messages (
  id bigint generated always as identity primary key,
  nickname text not null default '冒险者',
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.posts (
  id bigint generated always as identity primary key,
  title text not null,
  content text not null,
  category text not null check (category in ('bounty', 'rumor', 'trade')),
  created_at timestamptz not null default now()
);

alter table public.chat_messages enable row level security;
alter table public.posts enable row level security;

-- MVP open policies (public read/write)
drop policy if exists "public rw chat" on public.chat_messages;
create policy "public rw chat" on public.chat_messages
for all
using (true)
with check (true);

drop policy if exists "public rw posts" on public.posts;
create policy "public rw posts" on public.posts
for all
using (true)
with check (true);
