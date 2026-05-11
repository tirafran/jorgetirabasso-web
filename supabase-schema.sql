-- Run this in the Supabase SQL Editor to set up the database.

-- ============================================================
-- Tables
-- ============================================================

create table if not exists site_config (
  id          integer primary key default 1,
  hero_image_url  text,
  bio_short_es    text,
  bio_short_en    text,
  bio_full_es     text,
  bio_full_en     text,
  instagram_url   text,
  updated_at      timestamptz not null default now(),
  constraint single_row check (id = 1)
);

create table if not exists galleries (
  id              uuid primary key default gen_random_uuid(),
  name_es         text not null,
  name_en         text not null,
  description_es  text,
  description_en  text,
  cover_image_url text,
  display_order   integer not null default 0,
  created_at      timestamptz not null default now()
);

create table if not exists photos (
  id              uuid primary key default gen_random_uuid(),
  gallery_id      uuid not null references galleries(id) on delete cascade,
  title_es        text not null,
  title_en        text not null,
  description_es  text,
  description_en  text,
  awards          text,
  storage_path    text not null,
  display_order   integer not null default 0,
  created_at      timestamptz not null default now()
);

create index if not exists photos_gallery_id_idx on photos(gallery_id);

-- Insert the single config row (runs only if the table is empty)
insert into site_config (id) values (1) on conflict (id) do nothing;

-- ============================================================
-- Row-Level Security
-- ============================================================

alter table site_config enable row level security;
alter table galleries    enable row level security;
alter table photos       enable row level security;

-- Public read-only (uses publishable key)
create policy "Public can read site_config"
  on site_config for select using (true);

create policy "Public can read galleries"
  on galleries for select using (true);

create policy "Public can read photos"
  on photos for select using (true);

-- Authenticated users (admin) can do everything
create policy "Admin full access site_config"
  on site_config for all using (auth.role() = 'authenticated');

create policy "Admin full access galleries"
  on galleries for all using (auth.role() = 'authenticated');

create policy "Admin full access photos"
  on photos for all using (auth.role() = 'authenticated');

-- ============================================================
-- Storage bucket
-- ============================================================
-- Run this separately in Supabase > Storage > New bucket:
--   Name: photos
--   Public: yes
--
-- Then add a Storage policy:
--   Authenticated users can INSERT/UPDATE/DELETE in bucket "photos"
--
-- Or via SQL:

insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

create policy "Public read storage"
  on storage.objects for select
  using (bucket_id = 'photos');

create policy "Auth upload storage"
  on storage.objects for insert
  with check (bucket_id = 'photos' and auth.role() = 'authenticated');

create policy "Auth update storage"
  on storage.objects for update
  using (bucket_id = 'photos' and auth.role() = 'authenticated');

create policy "Auth delete storage"
  on storage.objects for delete
  using (bucket_id = 'photos' and auth.role() = 'authenticated');
