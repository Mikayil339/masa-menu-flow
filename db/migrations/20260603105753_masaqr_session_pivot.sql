-- MasaQR session-pivot migration
-- Run this in your Supabase SQL Editor.
-- Adds: sessions, suggestions, waiter assignments, local/foreign pricing,
-- restaurant settings columns. Backward compatible (additive only).

-- ---------- masaqr_restaurants additions ----------
ALTER TABLE public.masaqr_restaurants
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS wifi_name text,
  ADD COLUMN IF NOT EXISTS wifi_password text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS description_i18n jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS waiter_assignment_mode text DEFAULT 'first_confirming_waiter',
  ADD COLUMN IF NOT EXISTS show_wifi_on_menu boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_phone_on_menu boolean DEFAULT true;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'masaqr_restaurants_waiter_assignment_mode_check'
  ) THEN
    ALTER TABLE public.masaqr_restaurants
      ADD CONSTRAINT masaqr_restaurants_waiter_assignment_mode_check
      CHECK (waiter_assignment_mode IN ('manual_table_ranges','first_confirming_waiter','disabled'));
  END IF;
END $$;

-- ---------- masaqr_menu_items pricing ----------
ALTER TABLE public.masaqr_menu_items
  ADD COLUMN IF NOT EXISTS price_local numeric,
  ADD COLUMN IF NOT EXISTS price_foreign numeric;

-- ---------- masaqr_table_sessions ----------
CREATE TABLE IF NOT EXISTS public.masaqr_table_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL,
  table_id uuid NOT NULL,
  assigned_waiter_id uuid REFERENCES public.masaqr_users(id),
  customer_session_id text,
  customer_type text DEFAULT 'local' CHECK (customer_type IN ('local','foreign')),
  status text DEFAULT 'open' CHECK (status IN ('open','closed','cancelled')),
  total numeric DEFAULT 0,
  opened_at timestamptz DEFAULT now(),
  closed_at timestamptz,
  closed_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.masaqr_table_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.masaqr_table_sessions TO anon;
GRANT ALL ON public.masaqr_table_sessions TO service_role;

ALTER TABLE public.masaqr_table_sessions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'sessions_anon_insert') THEN
    CREATE POLICY sessions_anon_insert ON public.masaqr_table_sessions
      FOR INSERT TO anon WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'sessions_anon_select') THEN
    CREATE POLICY sessions_anon_select ON public.masaqr_table_sessions
      FOR SELECT TO anon USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'sessions_anon_update_open') THEN
    CREATE POLICY sessions_anon_update_open ON public.masaqr_table_sessions
      FOR UPDATE TO anon USING (status = 'open');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'sessions_auth_all') THEN
    CREATE POLICY sessions_auth_all ON public.masaqr_table_sessions
      FOR ALL TO authenticated
      USING (restaurant_id IN (SELECT restaurant_id FROM public.masaqr_users WHERE id = auth.uid()))
      WITH CHECK (restaurant_id IN (SELECT restaurant_id FROM public.masaqr_users WHERE id = auth.uid()));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_sessions_table_open ON public.masaqr_table_sessions(table_id) WHERE status = 'open';
CREATE INDEX IF NOT EXISTS idx_sessions_restaurant ON public.masaqr_table_sessions(restaurant_id);

-- ---------- masaqr_orders additions ----------
ALTER TABLE public.masaqr_orders
  ADD COLUMN IF NOT EXISTS session_id uuid REFERENCES public.masaqr_table_sessions(id),
  ADD COLUMN IF NOT EXISTS assigned_waiter_id uuid REFERENCES public.masaqr_users(id),
  ADD COLUMN IF NOT EXISTS customer_type text DEFAULT 'local';

CREATE INDEX IF NOT EXISTS idx_orders_session ON public.masaqr_orders(session_id);

-- ---------- masaqr_waiter_table_assignments ----------
CREATE TABLE IF NOT EXISTS public.masaqr_waiter_table_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL,
  waiter_id uuid NOT NULL REFERENCES public.masaqr_users(id) ON DELETE CASCADE,
  table_id uuid NOT NULL REFERENCES public.masaqr_tables(id) ON DELETE CASCADE,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_active_waiter_table
  ON public.masaqr_waiter_table_assignments(table_id) WHERE is_active;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.masaqr_waiter_table_assignments TO authenticated;
GRANT ALL ON public.masaqr_waiter_table_assignments TO service_role;

ALTER TABLE public.masaqr_waiter_table_assignments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'wta_auth_all') THEN
    CREATE POLICY wta_auth_all ON public.masaqr_waiter_table_assignments
      FOR ALL TO authenticated
      USING (restaurant_id IN (SELECT restaurant_id FROM public.masaqr_users WHERE id = auth.uid()))
      WITH CHECK (restaurant_id IN (SELECT restaurant_id FROM public.masaqr_users WHERE id = auth.uid()));
  END IF;
END $$;

-- ---------- masaqr_menu_item_suggestions ----------
CREATE TABLE IF NOT EXISTS public.masaqr_menu_item_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL,
  source_item_id uuid NOT NULL REFERENCES public.masaqr_menu_items(id) ON DELETE CASCADE,
  suggested_item_id uuid NOT NULL REFERENCES public.masaqr_menu_items(id) ON DELETE CASCADE,
  sort_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE (source_item_id, suggested_item_id)
);

GRANT SELECT ON public.masaqr_menu_item_suggestions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.masaqr_menu_item_suggestions TO authenticated;
GRANT ALL ON public.masaqr_menu_item_suggestions TO service_role;

ALTER TABLE public.masaqr_menu_item_suggestions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'suggestions_anon_read') THEN
    CREATE POLICY suggestions_anon_read ON public.masaqr_menu_item_suggestions
      FOR SELECT TO anon USING (is_active = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'suggestions_auth_all') THEN
    CREATE POLICY suggestions_auth_all ON public.masaqr_menu_item_suggestions
      FOR ALL TO authenticated
      USING (restaurant_id IN (SELECT restaurant_id FROM public.masaqr_users WHERE id = auth.uid()))
      WITH CHECK (restaurant_id IN (SELECT restaurant_id FROM public.masaqr_users WHERE id = auth.uid()));
  END IF;
END $$;
