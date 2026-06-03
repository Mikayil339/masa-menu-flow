import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Activity,
  QrCode,
  BookOpen,
  FileText,
  ChefHat,
  Users,
  BellRing,
  ArrowUpRight,
  CheckCircle2,
  ShoppingBag,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import {
  fetchOrders,
  fetchOwnerContext,
  money,
  minsAgoIso,
  shortOrder,
  type OrderBundle,
  type Profile,
  type RestaurantRow,
} from "@/lib/masaqr";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [{ title: "Dashboard — MasaQR" }],
  }),
  component: Dashboard,
});

type DashboardStats = {
  todayOrders: number;
  todayRevenue: number;
  activeOrders: number;
  readyOrders: number;
  servedOrders: number;
  menuItems: number;
  tables: number;
  staff: number;
  scans: number;
};

function Stat({
  icon: Icon,
  label,
  value,
  hint,
  tone = "default",
}: {
  icon: any;
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "accent" | "warn";
}) {
  const tones = {
    default: "bg-card",
    accent: "bg-ember/5 border-ember/30",
    warn: "bg-warning/10 border-warning/40",
  };

  return (
    <Card className={`p-5 ${tones[tone]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <div className="mt-2 text-3xl font-semibold">{value}</div>
          {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        <div className="rounded-2xl bg-muted p-3">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}

function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [restaurant, setRestaurant] = useState<RestaurantRow | null>(null);
  const [orders, setOrders] = useState<OrderBundle[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    todayOrders: 0,
    todayRevenue: 0,
    activeOrders: 0,
    readyOrders: 0,
    servedOrders: 0,
    menuItems: 0,
    tables: 0,
    staff: 0,
    scans: 0,
  });
  const [loading, setLoading] = useState(true);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  async function loadDashboard() {
    try {
      const ctx = await fetchOwnerContext();

      setProfile(ctx.profile);
      setRestaurant(ctx.restaurant);

      if (!ctx.profile?.restaurant_id) {
        setOrders([]);
        setStats({
          todayOrders: 0,
          todayRevenue: 0,
          activeOrders: 0,
          readyOrders: 0,
          servedOrders: 0,
          menuItems: 0,
          tables: 0,
          staff: 0,
          scans: 0,
        });
        return;
      }

      const restaurantId = ctx.profile.restaurant_id;

      const [
        orderRows,
        menuCount,
        tableCount,
        staffCount,
        scanCount,
      ] = await Promise.all([
        fetchOrders(restaurantId),

        supabase
          .from("masaqr_menu_items")
          .select("id", { count: "exact", head: true })
          .eq("restaurant_id", restaurantId),

        supabase
          .from("masaqr_tables")
          .select("id", { count: "exact", head: true })
          .eq("restaurant_id", restaurantId),

        supabase
          .from("masaqr_users")
          .select("id", { count: "exact", head: true })
          .eq("restaurant_id", restaurantId)
          .neq("role", "owner"),

        supabase
          .from("masaqr_activity_logs")
          .select("id", { count: "exact", head: true })
          .eq("restaurant_id", restaurantId)
          .in("event_type", ["menu_scan", "menu_view"]),
      ]);

      if (menuCount.error) throw menuCount.error;
      if (tableCount.error) throw tableCount.error;
      if (staffCount.error) throw staffCount.error;
      if (scanCount.error) throw scanCount.error;

      const todayOrders = orderRows.filter((order) =>
        order.created_at.startsWith(today)
      );

      const todayRevenue = todayOrders
        .filter((order) => order.status !== "cancelled")
        .reduce((sum, order) => sum + Number(order.total ?? 0), 0);

      const activeOrders = orderRows.filter((order) =>
        ["pending", "confirmed", "preparing", "ready", "picked_up"].includes(order.status)
      );

      const readyOrders = orderRows.filter((order) => order.status === "ready");
      const servedOrders = orderRows.filter((order) => order.status === "served");

      setOrders(orderRows);

      setStats({
        todayOrders: todayOrders.length,
        todayRevenue,
        activeOrders: activeOrders.length,
        readyOrders: readyOrders.length,
        servedOrders: servedOrders.length,
        menuItems: menuCount.count ?? 0,
        tables: tableCount.count ?? 0,
        staff: staffCount.count ?? 0,
        scans: scanCount.count ?? 0,
      });
    } catch (error: any) {
      toast.error(error.message ?? "Could not load dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();

    const channel = supabase
      .channel("dashboard-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "masaqr_orders" },
        () => loadDashboard()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "masaqr_order_items" },
        () => loadDashboard()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "masaqr_activity_logs" },
        () => loadDashboard()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const activeOrders = orders.filter((order) =>
    ["pending", "confirmed", "preparing", "ready", "picked_up"].includes(order.status)
  );

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading dashboard…</div>;
  }

  if (!profile?.restaurant_id) {
    return (
      <div>
        <PageHeader
  title="Dashboard"
  subtitle="Complete restaurant setup to start using live statistics."
/>
        <div className="p-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold">Restaurant setup required</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              This account is logged in, but it is not connected to a restaurant yet.
            </p>
            <Button asChild className="mt-4">
              <Link to="/setup">Open setup</Link>
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
  title="Dashboard"
  subtitle={restaurant ? `${restaurant.name} live overview` : "Live overview"}
  actions={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to="/kitchen">Open kitchen</Link>
            </Button>
            {restaurant ? (
              <Button asChild>
                <Link to="/m/$slug/$table" params={{ slug: restaurant.slug, table: "1" }}>
                  View guest menu
                </Link>
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-4">
        <Stat
          icon={ShoppingBag}
          label="Today orders"
          value={stats.todayOrders}
          hint="From Supabase orders"
          tone="accent"
        />
        <Stat
          icon={Activity}
          label="Today revenue"
          value={money(stats.todayRevenue, restaurant?.currency ?? "AZN")}
          hint="Excludes cancelled orders"
        />
        <Stat
          icon={BellRing}
          label="Active orders"
          value={stats.activeOrders}
          hint={`${stats.readyOrders} ready for waiter`}
          tone={stats.readyOrders > 0 ? "warn" : "default"}
        />
        <Stat
          icon={CheckCircle2}
          label="Served orders"
          value={stats.servedOrders}
          hint="All-time served orders"
        />
        <Stat
          icon={BookOpen}
          label="Menu items"
          value={stats.menuItems}
          hint="Real menu items"
        />
        <Stat
          icon={QrCode}
          label="Tables"
          value={stats.tables}
          hint="QR tables"
        />
        <Stat
          icon={Users}
          label="Staff"
          value={stats.staff}
          hint="Non-owner users"
        />
        <Stat
          icon={Activity}
          label="Menu views"
          value={stats.scans}
          hint="From activity logs"
        />
      </div>

      <div className="grid gap-6 px-6 pb-6 xl:grid-cols-[1.4fr_0.8fr]">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Live order feed</h2>
              <p className="text-sm text-muted-foreground">Real active orders from Supabase</p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/app/orders">
                All orders <ArrowUpRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="space-y-3">
            {activeOrders.slice(0, 6).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between rounded-2xl border bg-background p-4"
              >
                <div>
                  <p className="font-medium">{shortOrder(order.id)}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)} item(s) ·{" "}
                    {money(order.total, restaurant?.currency ?? "AZN")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {order.table?.table_name ?? `Table ${order.table?.table_number ?? "?"}`} ·{" "}
                    {minsAgoIso(order.created_at)}m ago
                  </p>
                </div>
                <span className="rounded-full border px-3 py-1 text-xs capitalize">
                  {order.status.replace("_", " ")}
                </span>
              </div>
            ))}

            {activeOrders.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                No open orders.
              </div>
            ) : null}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-lg font-semibold">Quick access</h2>
          <p className="mb-4 text-sm text-muted-foreground">Operational screens</p>

          <div className="grid gap-2">
            {[
              { to: "/app/menu", icon: BookOpen, label: "Menyu" },
              { to: "/app/pdf", icon: FileText, label: "PDF menyu" },
              { to: "/app/tables", icon: QrCode, label: "Masalar və QR" },
              { to: "/waiter", icon: BellRing, label: "Ofisiant ekranı" },
              { to: "/app/staff", icon: Users, label: "Ofisiantlar" },
            ].map(({ to, icon: Icon, label }) => (
              <Button key={to} asChild variant="outline" className="justify-start">
                <Link to={to as any}>
                  <Icon className="mr-2 h-4 w-4" />
                  {label}
                </Link>
              </Button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}