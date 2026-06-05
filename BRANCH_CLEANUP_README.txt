MasaQR Branch Cleanup Package

Copy this package into your project root:
C:\Users\Mikayil\Desktop\Masa\masa-menu-flow

Replace existing files when Windows asks.

What this package does:
- Removes branch_id from Supabase selects/inserts/updates.
- Removes masaqr_branches queries.
- Keeps price_local and price_foreign.
- Keeps waiter table assignment logic.
- Keeps /app/branches as a harmless disabled placeholder so generated TanStack routes do not break.
- Removes old branch state from store.ts.

After replacing files:
1. Run: npm run build
2. Run: npm run dev
3. Test: /login, /app/menu, /app/staff, /app/tables, /app/pdf, /m/<slug>/<table>

SQL:
The included db/migrations/20260605100000_branch_cleanup.sql is optional if you already manually dropped branch_id columns and masaqr_branches. Run it only if Supabase still has branch leftovers.
