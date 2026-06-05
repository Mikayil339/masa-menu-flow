import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { fetchOwnerContext, money, type RestaurantRow } from "@/lib/masaqr";

export const Route = createFileRoute("/app/analytics")({
  head: () => ({ meta: [{ title: "Analitika — MasaQR" }] }),
  component: AnalyticsPage,
});

type RangeMode = "today" | "month" | "custom";

type OrderRow = { id: string; total: number | string; status: string; created_at: string };
type OrderItemRow = { quantity: number; total_price: number | string; menu_item?: { name?: string } | { name?: string }[] | null };
type CategoryItemRow = { category_id: string; category?: { name?: string } | { name?: string }[] | null };
type WaiterRequestRow = { type: string; status: string; created_at: string };

type AnalyticsState = {
  totalOrders: number;
  revenue: number;
  averageOrder: number;
  menuViews: number;
  cancelledOrders: number;
  activeWaiterRequests: number;
  topItems: { name: string; sold: number; revenue: number }[];
  categoryPerformance: { name: string; items: number }[];
  ordersByStatus: { name: string; count: number }[];
  waiterRequests: { name: string; count: number }[];
  dailyRevenue: { date: string; revenue: number; orders: number }[];
};

const emptyAnalytics: AnalyticsState = {
  totalOrders: 0,
  revenue: 0,
  averageOrder: 0,
  menuViews: 0,
  cancelledOrders: 0,
  activeWaiterRequests: 0,
  topItems: [],
  categoryPerformance: [],
  ordersByStatus: [],
  waiterRequests: [],
  dailyRevenue: [],
};

function toDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function endOfDate(date: Date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function startOfMonth() {
  const date = new Date();
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date;
}

function AnalyticsPage() {
  const [restaurant, setRestaurant] = useState<RestaurantRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [rangeMode, setRangeMode] = useState<RangeMode>("today");
  const [fromDate, setFromDate] = useState(toDateInput(startOfToday()));
  const [toDate, setToDate] = useState(toDateInput(new Date()));
  const [analytics, setAnalytics] = useState<AnalyticsState>(emptyAnalytics);

  const range = useMemo(() => {
    if (rangeMode === "today") {
      return { from: startOfToday(), to: endOfDate(new Date()) };
    }
    if (rangeMode === "month") {
      return { from: startOfMonth(), to: endOfDate(new Date()) };
    }
    return {
      from: new Date(`${fromDate}T00:00:00`),
      to: endOfDate(new Date(`${toDate}T00:00:00`)),
    };
  }, [rangeMode, fromDate, toDate]);

  async function loadAnalytics() {
    setLoading(true);
    try {
      const ctx = await fetchOwnerContext();
      setRestaurant(ctx.restaurant);

      if (!ctx.profile?.restaurant_id) {
        setAnalytics(emptyAnalytics);
        return;
      }

      const restaurantId = ctx.profile.restaurant_id;
      const fromIso = range.from.toISOString();
      const toIso = range.to.toISOString();

      const ordersResult = await supabase
        .from("masaqr_orders")
        .select("id,total,status,created_at")
        .eq("restaurant_id", restaurantId)
        .gte("created_at", fromIso)
        .lte("created_at", toIso)
        .order("created_at", { ascending: true });

      if (ordersResult.error) throw ordersResult.error;
      const orders = (ordersResult.data ?? []) as OrderRow[];
      const orderIds = orders.map((order) => order.id);

      const [itemsResult, categoryItemsResult, viewsResult, waiterRequestsResult] = await Promise.all([
        orderIds.length
          ? supabase
              .from("masaqr_order_items")
              .select("quantity,total_price,menu_item:masaqr_menu_items(name)")
              .in("order_id", orderIds)
          : Promise.resolve({ data: [] as OrderItemRow[], error: null } as any),

        supabase
          .from("masaqr_menu_items")
          .select("category_id,category:masaqr_categories(name)")
          .eq("restaurant_id", restaurantId),

        supabase
          .from("masaqr_activity_logs")
          .select("id", { count: "exact", head: true })
          .eq("restaurant_id", restaurantId)
          .in("event_type", ["menu_scan", "menu_view"])
          .gte("created_at", fromIso)
          .lte("created_at", toIso),

        supabase
          .from("masaqr_waiter_requests")
          .select("type,status,created_at")
          .eq("restaurant_id", restaurantId)
          .gte("created_at", fromIso)
          .lte("created_at", toIso),
      ]);

      if (itemsResult.error) throw itemsResult.error;
      if (categoryItemsResult.error) throw categoryItemsResult.error;
      if (viewsResult.error) throw viewsResult.error;
      if (waiterRequestsResult.error) throw waiterRequestsResult.error;

      const orderItems = (itemsResult.data ?? []) as OrderItemRow[];
      const categoryItems = (categoryItemsResult.data ?? []) as CategoryItemRow[];
      const waiterRequests = (waiterRequestsResult.data ?? []) as WaiterRequestRow[];

      const nonCancelledOrders = orders.filter((order) => order.status !== "cancelled");
      const revenue = nonCancelledOrders.reduce((sum, order) => sum + Number(order.total ?? 0), 0);

      const itemMap = new Map<string, { name: string; sold: number; revenue: number }>();
      for (const item of orderItems) {
        const menuItem = Array.isArray(item.menu_item) ? item.menu_item[0] : item.menu_item;
        const name = menuItem?.name ?? "Naməlum məhsul";
        const current = itemMap.get(name) ?? { name, sold: 0, revenue: 0 };
        current.sold += Number(item.quantity ?? 0);
        current.revenue += Number(item.total_price ?? 0);
        itemMap.set(name, current);
      }

      const categoryMap = new Map<string, number>();
      for (const item of categoryItems) {
        const category = Array.isArray(item.category) ? item.category[0] : item.category;
        const name = category?.name ?? "Kateqoriyasız";
        categoryMap.set(name, (categoryMap.get(name) ?? 0) + 1);
      }

      const statusMap = new Map<string, number>();
      for (const order of orders) statusMap.set(order.status, (statusMap.get(order.status) ?? 0) + 1);

      const waiterMap = new Map<string, number>();
      for (const request of waiterRequests) waiterMap.set(request.type, (waiterMap.get(request.type) ?? 0) + 1);

      const dayMap = new Map<string, { date: string; revenue: number; orders: number }>();
      for (const order of nonCancelledOrders) {
        const key = new Date(order.created_at).toLocaleDateString("az-AZ", { month: "short", day: "2-digit" });
        const current = dayMap.get(key) ?? { date: key, revenue: 0, orders: 0 };
        current.revenue += Number(order.total ?? 0);
        current.orders += 1;
        dayMap.set(key, current);
      }

      setAnalytics({
        totalOrders: orders.length,
        revenue,
        averageOrder: nonCancelledOrders.length > 0 ? revenue / nonCancelledOrders.length : 0,
        menuViews: viewsResult.count ?? 0,
        cancelledOrders: orders.filter((order) => order.status === "cancelled").length,
        activeWaiterRequests: waiterRequests.filter((request) => request.status === "open" || request.status === "accepted").length,
        topItems: Array.from(itemMap.values()).sort((a, b) => b.sold - a.sold).slice(0, 6),
        categoryPerformance: Array.from(categoryMap.entries()).map(([name, items]) => ({ name, items })),
        ordersByStatus: Array.from(statusMap.entries()).map(([name, count]) => ({ name: name.replace("_", " "), count })),
        waiterRequests: Array.from(waiterMap.entries()).map(([name, count]) => ({ name: name.replace("_", " "), count })),
        dailyRevenue: Array.from(dayMap.values()),
      });
    } catch (error: any) {
      toast.error(error.message ?? "Analitika yüklənmədi");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics();
    const channel = supabase
      .channel("analytics-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "masaqr_orders" }, () => loadAnalytics())
      .on("postgres_changes", { event: "*", schema: "public", table: "masaqr_order_items" }, () => loadAnalytics())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range.from.getTime(), range.to.getTime()]);

  const subtitle = `${range.from.toLocaleDateString()} – ${range.to.toLocaleDateString()} aralığı üzrə real Supabase hesabatı`;

  return (
    <div>
      <PageHeader title="Analitika" subtitle={subtitle} actions={<Button variant="outline" onClick={loadAnalytics}>Yenilə</Button>} />

      <div className="space-y-6 p-6">
        <Card className="p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <Label>Dövr</Label>
              <div className="mt-1 flex rounded-lg border bg-card p-1">
                {([{ id: "today", label: "Bu gün" }, { id: "month", label: "Bu ay" }, { id: "custom", label: "Tarix aralığı" }] as { id: RangeMode; label: string }[]).map((option) => (
                  <button key={option.id} onClick={() => setRangeMode(option.id)} className={`rounded-md px-3 py-2 text-sm ${rangeMode === option.id ? "bg-foreground text-background" : "text-muted-foreground"}`}>{option.label}</button>
                ))}
              </div>
            </div>
            {rangeMode === "custom" ? (
              <>
                <div><Label>Başlanğıc</Label><Input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} /></div>
                <div><Label>Son</Label><Input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} /></div>
              </>
            ) : null}
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Metric title="Sifarişlər" value={analytics.totalOrders} hint="Seçilən dövr" />
          <Metric title="Gəlir" value={money(analytics.revenue, restaurant?.currency ?? "AZN")} hint="Ləğv edilənlər xaric" />
          <Metric title="Orta çek" value={money(analytics.averageOrder, restaurant?.currency ?? "AZN")} hint="Ləğv edilməyən sifarişlər" />
          <Metric title="Menyu baxışı" value={analytics.menuViews} hint="QR scan / menu view" />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <ChartCard title="Günlük gəlir" empty={!analytics.dailyRevenue.length}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={analytics.dailyRevenue}><XAxis dataKey="date" /><YAxis /><Tooltip /><Bar dataKey="revenue" /></BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Ən çox satılan məhsullar" empty={!analytics.topItems.length}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={analytics.topItems}><XAxis dataKey="name" hide /><YAxis /><Tooltip /><Bar dataKey="sold" /></BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Sifariş statusları" empty={!analytics.ordersByStatus.length}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={analytics.ordersByStatus}><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="count" /></BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Kateqoriya məhsul sayı" empty={!analytics.categoryPerformance.length}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={analytics.categoryPerformance}><XAxis dataKey="name" hide /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="items" /></BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {loading ? <p className="text-sm text-muted-foreground">Yüklənir…</p> : null}
      </div>
    </div>
  );
}

function Metric({ title, value, hint }: { title: string; value: string | number; hint: string }) {
  return <Card className="p-5"><p className="text-sm text-muted-foreground">{title}</p><div className="mt-2 text-3xl font-semibold">{value}</div><p className="mt-2 text-xs text-muted-foreground">{hint}</p></Card>;
}

function ChartCard({ title, empty, children }: { title: string; empty: boolean; children: ReactNode }) {
  return <Card className="p-5"><h2 className="mb-4 text-lg font-semibold">{title}</h2>{empty ? <div className="grid h-[260px] place-items-center text-sm text-muted-foreground">Bu dövr üçün data yoxdur.</div> : children}</Card>;
}
