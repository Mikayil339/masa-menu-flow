import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, QrCode, BookOpen, FileText, ChefHat, Users, BellRing, ArrowUpRight, CheckCircle2, ShoppingBag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { fetchMenu, fetchOrders, fetchOwnerContext, money, minsAgoIso, shortOrder, type BranchRow, type MenuItemRow, type OrderBundle, type Profile, type RestaurantRow, type TableRow } from "@/lib/masaqr";

export const Route = createFileRoute("/app/")({
  head: () => ({ meta: [{ title: "Dashboard — MasaQR" }] }),
  component: Dashboard,
});

function Stat({ icon: Icon, label, value, hint, tone = "default" }: any) {
  const tones: any = { default: "bg-card", accent: "bg-ember/5 border-ember/30", warn: "bg-warning/10 border-warning/40" };
  return (
    <Card className={`p-5 border ${tones[tone]}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
          <div className="font-display text-3xl mt-1">{value}</div>
          {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
        </div>
        <Icon className="h-5 w-5 text-ember" />
      </div>
    </Card>
  );
}

function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [restaurant, setRestaurant] = useState<RestaurantRow | null>(null);
  const [branches, setBranches] = useState<BranchRow[]>([]);
  const [orders, setOrders] = useState<OrderBundle[]>([]);
  const [items, setItems] = useState<MenuItemRow[]>([]);
  const [tables, setTables] = useState<TableRow[]>([]);
  const [staffCount, setStaffCount] = useState(0);
  const [scans, setScans] = useState(0);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const ctx = await fetchOwnerContext();
      setProfile(ctx.profile);
      setRestaurant(ctx.restaurant);
      setBranches(ctx.branches);
      if (!ctx.profile?.restaurant_id) return;
      const restaurantId = ctx.profile.restaurant_id;
      const [orderRows, menuRows, tableRows, staffRows, scanRows] = await Promise.all([
        fetchOrders(restaurantId),
        fetchMenu(restaurantId),
        supabase.from("masaqr_tables").select("*").eq("restaurant_id", restaurantId),
        supabase.from("masaqr_users").select("id", { count: "exact", head: true }).eq("restaurant_id", restaurantId).neq("role", "owner"),
        supabase.from("masaqr_activity_logs").select("id", { count: "exact", head: true }).eq("restaurant_id", restaurantId).in("event_type", ["menu_scan", "menu_view"]),
      ]);
      setOrders(orderRows);
      setItems(menuRows.items);
      if (tableRows.error) throw tableRows.error;
      setTables((tableRows.data ?? []) as TableRow[]);
      if (staffRows.error) throw staffRows.error;
      setStaffCount(staffRows.count ?? 0);
      if (scanRows.error) throw scanRows.error;
      setScans(scanRows.count ?? 0);
    } catch (err: any) {
      toast.error(err.message ?? "Could not load dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const channel = supabase.channel("dashboard-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "masaqr_orders" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "masaqr_waiter_requests" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const todayOrders = orders.filter(o => o.created_at.slice(0, 10) === today);
  const todayRevenue = todayOrders.filter(o => o.status !== "cancelled").reduce((s, o) => s + Number(o.total ?? 0), 0);
  const active = orders.filter(o => ["pending", "confirmed", "preparing", "ready", "picked_up"].includes(o.status));
  const ready = orders.filter(o => o.status === "ready");
  const served = orders.filter(o => o.status === "served");

  if (loading) return <div className="p-6 md:p-10 text-sm text-muted-foreground">Loading dashboard…</div>;

  return (
    <div className="p-6 md:p-10">
      <PageHeader
        title={`Good evening, ${restaurant?.name ?? profile?.full_name ?? "MasaQR"}`}
        subtitle={restaurant ? `Live data from ${restaurant.name}` : "Create your restaurant setup to start using MasaQR"}
        actions={<><Button asChild variant="outline"><Link to="/kitchen">Open kitchen</Link></Button>{restaurant && <Button asChild className="bg-ember hover:bg-ember/90 text-ember-foreground"><Link to="/m/$slug/$table" params={{ slug: restaurant.slug, table: "1" }}>View guest menu</Link></Button>}</>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Stat icon={ShoppingBag} label="Today's orders" value={todayOrders.length} hint="Real Supabase orders" tone="accent" />
        <Stat icon={Activity} label="Today's revenue" value={money(todayRevenue, restaurant?.currency ?? "AZN")} hint="Cancelled excluded" />
        <Stat icon={CheckCircle2} label="Active orders" value={active.length} hint={`${ready.length} ready to serve`} />
        <Stat icon={ChefHat} label="Served orders" value={served.length} hint="Completed workflow" />
        <Stat icon={QrCode} label="QR scans" value={scans} hint="From activity logs" />
        <Stat icon={Users} label="Tables" value={tables.length} hint={`${branches.length} branch(es)`} />
        <Stat icon={BookOpen} label="Menu items" value={items.length} hint="From menu builder" />
        <Stat icon={Users} label="Staff" value={staffCount} hint="Non-owner profiles" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl">Live order feed</h2>
            <Link to="/app/orders" className="text-xs text-ember hover:underline flex items-center gap-1">All orders <ArrowUpRight className="h-3 w-3" /></Link>
          </div>
          <div className="space-y-2">
            {active.slice(0, 6).map(o => (
              <div key={o.id} className="flex items-center gap-4 p-3 rounded-r-lg border-l-4 bg-ember/5 border-l-ember">
                <div className="font-mono text-sm font-bold w-16">{shortOrder(o.id)}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{o.items.reduce((s, i) => s + i.quantity, 0)} item(s) · {money(o.total, restaurant?.currency ?? "AZN")}</div>
                  <div className="text-xs text-muted-foreground">{o.table?.table_name ?? `Table ${o.table?.table_number ?? "?"}`} · {minsAgoIso(o.created_at)}m ago</div>
                </div>
                <span className="text-xs uppercase tracking-wider px-2 py-1 rounded bg-background border">{o.status}</span>
              </div>
            ))}
            {active.length === 0 && <div className="text-sm text-muted-foreground text-center py-8">No open orders.</div>}
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="font-display text-xl mb-4">Quick access</h2>
          <div className="grid grid-cols-2 gap-2">
            {[{ to: "/app/menu", icon: BookOpen, label: "Edit menu" }, { to: "/app/pdf", icon: FileText, label: "PDF menu" }, { to: "/app/tables", icon: QrCode, label: "QR & tables" }, { to: "/kitchen", icon: ChefHat, label: "Kitchen" }, { to: "/waiter", icon: BellRing, label: "Waiter" }, { to: "/app/staff", icon: Users, label: "Staff" }].map(({ to, icon: Icon, label }) => (
              <Link key={to} to={to} className="rounded-lg border bg-card p-3 hover:border-ember/40 hover:bg-ember/5 transition group">
                <Icon className="h-5 w-5 text-ember mb-2" /><div className="text-sm font-medium">{label}</div>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
