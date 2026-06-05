-- MasaQR Package 1 schema patch
-- Fixes:
-- 1) masaqr_menu_items.price_local / price_foreign missing columns
-- 2) masaqr_menu_item_suggestions missing table for customer upsell suggestions
-- 3) masaqr_waiter_table_assignments missing table for waiter/table assignment
-- 4) menu image storage bucket and policies

create extension if not exists pgcrypto;

-- Menu price-type support
alter table public.masaqr_menu_items
  add column if not exists price_local numeric(12, 2),
  add column if not exists price_foreign numeric(12, 2);

update public.masaqr_menu_items
set
  price_local = coalesce(price_local, price),
  price_foreign = coalesce(price_foreign, price)
where price is not null;

-- Item-to-item suggestions shown in customer menu
create table if not exists public.masaqr_menu_item_suggestions (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.masaqr_restaurants(id) on delete cascade,
  source_item_id uuid not null references public.masaqr_menu_items(id) on delete cascade,
  suggested_item_id uuid not null references public.masaqr_menu_items(id) on delete cascade,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint masaqr_menu_item_suggestions_no_self_check check (source_item_id <> suggested_item_id)
);

create unique index if not exists masaqr_menu_item_suggestions_unique
  on public.masaqr_menu_item_suggestions (source_item_id, suggested_item_id);

create index if not exists masaqr_menu_item_suggestions_restaurant_idx
  on public.masaqr_menu_item_suggestions (restaurant_id);

alter table public.masaqr_menu_item_suggestions enable row level security;

drop policy if exists "MasaQR suggestions select own restaurant" on public.masaqr_menu_item_suggestions;
drop policy if exists "MasaQR suggestions insert own restaurant" on public.masaqr_menu_item_suggestions;
drop policy if exists "MasaQR suggestions update own restaurant" on public.masaqr_menu_item_suggestions;
drop policy if exists "MasaQR suggestions delete own restaurant" on public.masaqr_menu_item_suggestions;

create policy "MasaQR suggestions select own restaurant"
on public.masaqr_menu_item_suggestions
for select
to authenticated
using (
  exists (
    select 1 from public.masaqr_users u
    where u.id = auth.uid()
      and u.restaurant_id = masaqr_menu_item_suggestions.restaurant_id
  )
);

create policy "MasaQR suggestions insert own restaurant"
on public.masaqr_menu_item_suggestions
for insert
to authenticated
with check (
  exists (
    select 1 from public.masaqr_users u
    where u.id = auth.uid()
      and u.restaurant_id = masaqr_menu_item_suggestions.restaurant_id
      and u.role in ('owner', 'manager')
  )
);

create policy "MasaQR suggestions update own restaurant"
on public.masaqr_menu_item_suggestions
for update
to authenticated
using (
  exists (
    select 1 from public.masaqr_users u
    where u.id = auth.uid()
      and u.restaurant_id = masaqr_menu_item_suggestions.restaurant_id
      and u.role in ('owner', 'manager')
  )
)
with check (
  exists (
    select 1 from public.masaqr_users u
    where u.id = auth.uid()
      and u.restaurant_id = masaqr_menu_item_suggestions.restaurant_id
      and u.role in ('owner', 'manager')
  )
);

create policy "MasaQR suggestions delete own restaurant"
on public.masaqr_menu_item_suggestions
for delete
to authenticated
using (
  exists (
    select 1 from public.masaqr_users u
    where u.id = auth.uid()
      and u.restaurant_id = masaqr_menu_item_suggestions.restaurant_id
      and u.role in ('owner', 'manager')
  )
);

-- Waiter table assignment support
create table if not exists public.masaqr_waiter_table_assignments (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.masaqr_restaurants(id) on delete cascade,
  waiter_id uuid not null references public.masaqr_users(id) on delete cascade,
  table_id uuid not null references public.masaqr_tables(id) on delete cascade,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists masaqr_waiter_table_assignments_restaurant_idx
  on public.masaqr_waiter_table_assignments (restaurant_id);

create index if not exists masaqr_waiter_table_assignments_waiter_idx
  on public.masaqr_waiter_table_assignments (waiter_id);

create index if not exists masaqr_waiter_table_assignments_table_idx
  on public.masaqr_waiter_table_assignments (table_id);

create unique index if not exists masaqr_waiter_table_assignments_active_table_unique
  on public.masaqr_waiter_table_assignments (restaurant_id, table_id)
  where is_active = true;

alter table public.masaqr_waiter_table_assignments enable row level security;

drop policy if exists "MasaQR waiter assignments select own restaurant" on public.masaqr_waiter_table_assignments;
drop policy if exists "MasaQR waiter assignments insert own restaurant" on public.masaqr_waiter_table_assignments;
drop policy if exists "MasaQR waiter assignments update own restaurant" on public.masaqr_waiter_table_assignments;
drop policy if exists "MasaQR waiter assignments delete own restaurant" on public.masaqr_waiter_table_assignments;

create policy "MasaQR waiter assignments select own restaurant"
on public.masaqr_waiter_table_assignments
for select
to authenticated
using (
  exists (
    select 1 from public.masaqr_users u
    where u.id = auth.uid()
      and u.restaurant_id = masaqr_waiter_table_assignments.restaurant_id
  )
);

create policy "MasaQR waiter assignments insert own restaurant"
on public.masaqr_waiter_table_assignments
for insert
to authenticated
with check (
  exists (
    select 1 from public.masaqr_users u
    where u.id = auth.uid()
      and u.restaurant_id = masaqr_waiter_table_assignments.restaurant_id
      and u.role in ('owner', 'manager')
  )
);

create policy "MasaQR waiter assignments update own restaurant"
on public.masaqr_waiter_table_assignments
for update
to authenticated
using (
  exists (
    select 1 from public.masaqr_users u
    where u.id = auth.uid()
      and u.restaurant_id = masaqr_waiter_table_assignments.restaurant_id
      and u.role in ('owner', 'manager')
  )
)
with check (
  exists (
    select 1 from public.masaqr_users u
    where u.id = auth.uid()
      and u.restaurant_id = masaqr_waiter_table_assignments.restaurant_id
      and u.role in ('owner', 'manager')
  )
);

create policy "MasaQR waiter assignments delete own restaurant"
on public.masaqr_waiter_table_assignments
for delete
to authenticated
using (
  exists (
    select 1 from public.masaqr_users u
    where u.id = auth.uid()
      and u.restaurant_id = masaqr_waiter_table_assignments.restaurant_id
      and u.role in ('owner', 'manager')
  )
);

-- Public bucket for menu item images uploaded from Menu Builder
insert into storage.buckets (id, name, public)
values ('masaqr-menu-images', 'masaqr-menu-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "MasaQR menu images public read" on storage.objects;
drop policy if exists "MasaQR menu images authenticated upload" on storage.objects;
drop policy if exists "MasaQR menu images authenticated update" on storage.objects;
drop policy if exists "MasaQR menu images authenticated delete" on storage.objects;

create policy "MasaQR menu images public read"
on storage.objects
for select
using (bucket_id = 'masaqr-menu-images');

create policy "MasaQR menu images authenticated upload"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'masaqr-menu-images');

create policy "MasaQR menu images authenticated update"
on storage.objects
for update
to authenticated
using (bucket_id = 'masaqr-menu-images')
with check (bucket_id = 'masaqr-menu-images');

create policy "MasaQR menu images authenticated delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'masaqr-menu-images');
