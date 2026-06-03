# MasaQR — Product Pivot Plan (Sessions, Waiter-First, AZ UI)

This is a major product change touching ~15 files, the database schema, and many flows. Doing it all in one shot will break the working parts (login, customer menu, orders). I'll ship in 4 phases. Each phase is a single message and leaves the app in a working state. You approve here; then I execute Phase 1 immediately and continue phase-by-phase.

## Assumptions

- Existing working pieces I will not touch unless required: `src/lib/supabase.ts`, `src/lib/masaqr.ts` (will be extended, not rewritten), login, register, join, current Vercel deploy config.
- I'll write SQL migrations under `supabase/migrations/` with timestamps. You apply them via Lovable Cloud (I cannot run `psql` here). The app must fail loudly if a migration hasn't been applied — no mock fallbacks.
- For QR codes I'll add `qrcode` (lightweight, ~20KB). For QR card PDF/PNG export I'll use `html-to-image` + `jspdf` (already common in such stacks; will add if missing).
- Audio notifications: Web Audio API beep, no external service.
- OTP: stay with email/password (Supabase email confirmation). No SMS — would require paid provider.
- Image uploads: Supabase Storage buckets `masaqr-logos`, `masaqr-covers`, `masaqr-menu-images`. I'll create them via the storage tool in Phase 1.

## Architecture decisions

- **Sessions are the new spine.** `masaqr_table_sessions` is the parent of all orders for a sitting. Bill = SUM of order_items where `order.session_id = session.id`.
- **Order statuses simplify to:** `pending_waiter`, `confirmed`, `served`, `cancelled`. UI maps legacy statuses (`preparing`/`ready`/`picked_up` → `confirmed`) so old rows still render.
- **Roles in UI:** `manager` and `waiter` only. `owner` is treated as `manager`. `kitchen`/`staff` users can still log in but land on a "rola yenilənmə tələb olunur" screen — no broken access.
- **Branches** stay in DB for compatibility but disappear from UI. New writes use the restaurant's single default branch silently.
- **Local/foreign pricing:** new columns `price_local`, `price_foreign` on `masaqr_menu_items`. URL param `?type=local|foreign` (default `local`). Customer never sees the label.
- **Waiter assignment modes:** `manual_table_ranges`, `first_confirming_waiter` (default), `disabled`. Stored on `masaqr_restaurants.waiter_assignment_mode`. Assignment table `masaqr_waiter_table_assignments`.
- **Realtime:** Supabase channel subscriptions on `masaqr_orders`, `masaqr_table_sessions`, `masaqr_waiter_requests` drive the waiter and manager session pages.

## SQL migration (Phase 1)

Single file `supabase/migrations/<ts>_masaqr_session_pivot.sql`:

```sql
-- masaqr_restaurants additions
ALTER TABLE public.masaqr_restaurants
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS wifi_name text,
  ADD COLUMN IF NOT EXISTS wifi_password text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS description_i18n jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS waiter_assignment_mode text DEFAULT 'first_confirming_waiter'
    CHECK (waiter_assignment_mode IN ('manual_table_ranges','first_confirming_waiter','disabled')),
  ADD COLUMN IF NOT EXISTS show_wifi_on_menu boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_phone_on_menu boolean DEFAULT true;

-- masaqr_menu_items pricing
ALTER TABLE public.masaqr_menu_items
  ADD COLUMN IF NOT EXISTS price_local numeric,
  ADD COLUMN IF NOT EXISTS price_foreign numeric;

-- sessions
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
GRANT SELECT, INSERT, UPDATE ON public.masaqr_table_sessions TO authenticated, anon;
GRANT ALL ON public.masaqr_table_sessions TO service_role;
ALTER TABLE public.masaqr_table_sessions ENABLE ROW LEVEL SECURITY;
-- policies: anon may insert/select/update only own session by customer_session_id; authenticated by restaurant_id

-- orders additions
ALTER TABLE public.masaqr_orders
  ADD COLUMN IF NOT EXISTS session_id uuid REFERENCES public.masaqr_table_sessions(id),
  ADD COLUMN IF NOT EXISTS assigned_waiter_id uuid REFERENCES public.masaqr_users(id),
  ADD COLUMN IF NOT EXISTS customer_type text DEFAULT 'local';

-- waiter table assignments
CREATE TABLE IF NOT EXISTS public.masaqr_waiter_table_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL,
  waiter_id uuid NOT NULL REFERENCES public.masaqr_users(id),
  table_id uuid NOT NULL REFERENCES public.masaqr_tables(id),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_active_waiter_table ON public.masaqr_waiter_table_assignments(table_id) WHERE is_active;
-- grants + RLS

-- suggestions
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
-- grants + RLS (anon read for active, authenticated full write scoped to restaurant)

-- masaqr_tables status enum loosening (DB likely text already)
-- ensure values: available, occupied, reserved, disabled
```

## Phases

### Phase 1 — Schema + foundation (this turn after approval)
- Write the migration above.
- Create Storage buckets (`masaqr-logos`, `masaqr-covers`, `masaqr-menu-images`) + RLS for owner uploads.
- Extend `src/lib/masaqr.ts` with: session helpers (`openOrGetSession`, `closeSession`, `addOrderToSession`), pricing resolver, waiter-assignment resolver, suggestions queries, upload helpers.
- Add `src/lib/i18n.ts` with AZ strings used across admin/waiter UI (single source for the AZ translation).
- Add `src/components/AudioNotifier.tsx` (Web Audio beep + "Səsli bildirişləri aktiv et" toggle).
- Update `src/components/AppShell.tsx` sidebar: AZ labels, remove Kitchen + Branches.
- Make `/kitchen` route render "Bu bölmə deaktiv edilib" with link to `/waiter`.
- AZ translation of `register.tsx`, `login.tsx`, `join.tsx`, landing page hero copy.

Deliverable end of phase: schema applied, navigation cleaned, AZ auth pages, no broken routes. Old order/menu pages still function unchanged.

### Phase 2 — Customer flow (sessions + suggestions + local/foreign + restaurant header)
- `src/routes/m.$slug.$table.tsx`: reads `?type=local|foreign`, picks price via `price_foreign ?? price ?? price_local` etc., shows restaurant header (cover, name, phone, WiFi if `show_*_on_menu`), AZ/EN/RU switcher.
- First "place order" creates a `masaqr_table_sessions` row, marks table `occupied`, attaches `order.session_id`. Subsequent orders from same `customer_session_id` (localStorage) attach to the open session.
- Suggestions: after item is in cart, fetch `masaqr_menu_item_suggestions` and render "Bu yeməklə yaxşı uyğunlaşır" cards.
- Realtime subscription on session orders to show live status.

Deliverable: customer can scan → order → re-order into same session.

### Phase 3 — Waiter dashboard (sessions, audio, assignment, upsell)
- Rewrite `/waiter`: sections Yeni sifarişlər, Mənim masalarım, Açıq sessiyalar, Boş masalar, Bildirişlər.
- Realtime subscription filtered by assignment mode.
- Audio beep on new relevant order (after user enables).
- "Confirm first order" sets `assigned_waiter_id` on session.
- Upsell drawer: search menu items, add quantity/note, create a new order in the session marked `confirmed` by waiter.
- "Close session" → status=closed, table=available.

Deliverable: full waiter workflow.

### Phase 4 — Manager pages (sessions view, tables+QR, menu builder upgrades, settings, PDF, analytics)
- `/app/orders` → session-based view (left list, right bill detail) with date filter for history.
- `/app/tables`: table status, assigned waiter, open session info, generate QR card (3 templates: Minimal, Branded, Premium with cover), local/foreign toggle, downloadable PNG/PDF (export only the card div, not the dashboard).
- `/app/menu`: AZ UI, AZ/EN/RU per item, local image upload to Storage, default/local/foreign price, suggestion linker.
- `/app/settings`: new page replacing ETA — restaurant fields above, image uploads, waiter assignment mode.
- `/app/pdf`: rewrite export to render an isolated print layout in a hidden iframe and `jsPDF` from that, 5 templates, real settings, log to `masaqr_pdf_exports`.
- `/app/analytics`: real queries, daily/monthly/calendar filter, top items, waiter performance, local vs foreign revenue.
- Remove `/app/branches` from nav; keep route file rendering a "Filiallar deaktiv edilib" notice (or delete the route entirely — your call).
- Final sweep: remove mock arrays, demo data, Math.random for analytics.

Deliverable: full pivot complete.

## What I need from you to start

Approve the plan. Two quick questions inline:

1. **`/app/branches`:** delete the route entirely, or keep it as a hidden "deaktiv" notice for users with bookmarks?
2. **Existing kitchen/staff role users:** redirect them to `/waiter` automatically, or block login with "Rolunuz yenilənməlidir, menecerlə əlaqə saxlayın"?

After approval I'll execute Phase 1 in the next message.
