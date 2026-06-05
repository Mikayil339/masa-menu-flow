-- MasaQR Branch Cleanup Verification / Safety Migration
-- Run only if you still see branch_id columns after manual cleanup.

alter table if exists public.masaqr_activity_logs drop column if exists branch_id;
alter table if exists public.masaqr_menu_items drop column if exists branch_id;
alter table if exists public.masaqr_orders drop column if exists branch_id;
alter table if exists public.masaqr_pdf_exports drop column if exists branch_id;
alter table if exists public.masaqr_staff_invites drop column if exists branch_id;
alter table if exists public.masaqr_tables drop column if exists branch_id;
alter table if exists public.masaqr_users drop column if exists branch_id;
alter table if exists public.masaqr_waiter_requests drop column if exists branch_id;

-- The branches table was manually removed in Supabase. This statement is safe if it still exists.
drop table if exists public.masaqr_branches cascade;

-- Keep local/foreign prices for menu items.
alter table if exists public.masaqr_menu_items
  add column if not exists price_local numeric,
  add column if not exists price_foreign numeric;
