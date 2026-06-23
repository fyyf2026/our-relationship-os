-- Relationship OS V3 Supabase schema
-- Prototype note:
-- This uses anon-readable/writable policies because the current app uses a
-- lightweight client-side identity picker instead of Supabase Auth.
-- Real production permissions should be enforced by Supabase Auth and RLS.

create extension if not exists pgcrypto;

create table if not exists relationship_profile (
  id text primary key default 'main',
  person_a_name text not null,
  person_b_name text not null,
  relationship_start_date date,
  last_date text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists important_dates (
  id text primary key,
  title text not null default '',
  date date,
  description text not null default '',
  status text not null default 'Upcoming',
  visibility text not null default 'shared',
  created_by text not null default '',
  last_edited_by text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists shared_notes (
  id text primary key,
  owner_id text not null,
  author_name text not null,
  content text not null default '',
  visibility text not null default 'visible_to_partner',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists conflict_entries (
  id text primary key,
  date text not null default '',
  topic text not null default '',
  duration text not null default '',
  status text not null default 'Resolved',
  resolution text not null default '',
  reward_penalty text not null default '',
  visibility text not null default 'shared',
  last_edited_by text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists future_vision_items (
  id text primary key,
  category text not null,
  title text not null default '',
  description text not null default '',
  status text not null default 'Planned',
  visibility text not null default 'shared',
  last_edited_by text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists gratitude_items (
  id text primary key,
  owner_id text not null,
  author_name text not null,
  message text not null default '',
  visibility text not null default 'shared',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists wishes (
  id text primary key,
  wish_type text not null check (wish_type in ('gift_hint', 'secret_wish', 'shared_dream')),
  owner_id text,
  owner_name text,
  title text not null default '',
  description text not null default '',
  category text,
  priority text,
  unlock_date date,
  status text,
  visibility text not null default 'shared',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists memory_photos (
  id text primary key,
  owner_id text not null,
  uploaded_by text not null,
  image_url text not null default '',
  caption text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  visibility text not null default 'shared'
);

create table if not exists footprints (
  id text primary key,
  city text not null default '',
  state text not null default '',
  label text not null default '',
  note text not null default '',
  date_visited date,
  owner_id text not null,
  added_by text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  visibility text not null default 'shared'
);

create table if not exists ai_coach_metrics (
  id text primary key,
  metric_name text not null unique,
  metric_value integer not null default 0,
  weekly_insight text,
  updated_at timestamptz not null default now()
);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_relationship_profile_updated_at on relationship_profile;
create trigger set_relationship_profile_updated_at
before update on relationship_profile
for each row execute function set_updated_at();

drop trigger if exists set_important_dates_updated_at on important_dates;
create trigger set_important_dates_updated_at
before update on important_dates
for each row execute function set_updated_at();

drop trigger if exists set_shared_notes_updated_at on shared_notes;
create trigger set_shared_notes_updated_at
before update on shared_notes
for each row execute function set_updated_at();

drop trigger if exists set_conflict_entries_updated_at on conflict_entries;
create trigger set_conflict_entries_updated_at
before update on conflict_entries
for each row execute function set_updated_at();

drop trigger if exists set_future_vision_items_updated_at on future_vision_items;
create trigger set_future_vision_items_updated_at
before update on future_vision_items
for each row execute function set_updated_at();

drop trigger if exists set_gratitude_items_updated_at on gratitude_items;
create trigger set_gratitude_items_updated_at
before update on gratitude_items
for each row execute function set_updated_at();

drop trigger if exists set_wishes_updated_at on wishes;
create trigger set_wishes_updated_at
before update on wishes
for each row execute function set_updated_at();

drop trigger if exists set_memory_photos_updated_at on memory_photos;
create trigger set_memory_photos_updated_at
before update on memory_photos
for each row execute function set_updated_at();

drop trigger if exists set_footprints_updated_at on footprints;
create trigger set_footprints_updated_at
before update on footprints
for each row execute function set_updated_at();

drop trigger if exists set_ai_coach_metrics_updated_at on ai_coach_metrics;
create trigger set_ai_coach_metrics_updated_at
before update on ai_coach_metrics
for each row execute function set_updated_at();

alter table relationship_profile enable row level security;
alter table important_dates enable row level security;
alter table shared_notes enable row level security;
alter table conflict_entries enable row level security;
alter table future_vision_items enable row level security;
alter table gratitude_items enable row level security;
alter table wishes enable row level security;
alter table memory_photos enable row level security;
alter table footprints enable row level security;
alter table ai_coach_metrics enable row level security;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'relationship_profile',
    'important_dates',
    'shared_notes',
    'conflict_entries',
    'future_vision_items',
    'gratitude_items',
    'wishes',
    'memory_photos',
    'footprints',
    'ai_coach_metrics'
  ]
  loop
    execute format('drop policy if exists "prototype anon access" on %I', table_name);
    execute format(
      'create policy "prototype anon access" on %I for all to anon using (true) with check (true)',
      table_name
    );
  end loop;
end $$;

insert into storage.buckets (id, name, public)
values ('memory-photos', 'memory-photos', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "prototype memory photo read" on storage.objects;
create policy "prototype memory photo read"
on storage.objects for select to anon
using (bucket_id = 'memory-photos');

drop policy if exists "prototype memory photo write" on storage.objects;
create policy "prototype memory photo write"
on storage.objects for insert to anon
with check (bucket_id = 'memory-photos');

drop policy if exists "prototype memory photo update" on storage.objects;
create policy "prototype memory photo update"
on storage.objects for update to anon
using (bucket_id = 'memory-photos')
with check (bucket_id = 'memory-photos');
