import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import {
  fetchOwnerContext,
  money,
  type RestaurantRow,
} from "@/lib/masaqr";

export const Route = createFileRoute("/app/analytics")({
  head: () => ({
    meta: [{ title: "Analytics — MasaQR" }],
  }),
  component: AnalyticsPage,
});

type OrderRow = {
  id: string;
  total: number;
  status: string;
  created_at: string;
};

type OrderItemRow = {
  quantity: number;
  total_price: number;
  menu_item?: { name?: string } | { name?: string }[] | null;
};

type CategoryItemRow = {
  category_id: string;
  category?: { name?: string } | { name?: string }[] | null;
};

type WaiterRequestRow = {
  type: string;
  status: string;
};

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
};

function AnalyticsPage() {
  const [restaurant, setRestaurant] = useState<RestaurantRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsState>({
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
  });

  async function loadAnalytics() {
    try {
      const ctx = await fetchOwnerContext();
      setRestaurant(ctx.restaurant);

      if (!ctx.profile?.restaurant_id) {
        setAnalytics({
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
        });
        return;
      }

      const restaurantId = ctx.profile.restaurant_id;

      const [
        ordersResult,
        itemsResult,
        categoryItemsResult,
        viewsResult,
        waiterRequestsResult,
      ] = await Promise.all([
        supabase
          .from("masaqr_orders")
          .select("id,total,status,created_at")
          .eq("restaurant_id", restaurantId),

        supabase
          .from("masaqr_order_items")
          .select("quantity,total_price,menu_item:masaqr_menu_items(name)")
          .in(
            "order_id",
            (
              await supabase
                .from("masaqr_orders")
                .select("id")
                .eq("restaurant_id", restaurantId)
            ).data?.map((order) => order.id) ?? []
          ),

        supabase
          .from("masaqr_menu_items")
          .select("category_id,category:masaqr_categories(name)")
          .eq("restaurant_id", restaurantId),

        supabase
          .from("masaqr_activity_logs")
          .select("id", { count: "exact", head: true })
          .eq("restaurant_id", restaurantId)
          .in("event_type", ["menu_scan", "menu_view"]),

        supabase
          .from("masaqr_waiter_requests")
          .select("type,status")
          .eq("restaurant_id", restaurantId),
      ]);

      if (ordersResult.error) throw ordersResult.error;
      if (itemsResult.error) throw itemsResult.error;
      if (categoryItemsResult.error) throw categoryItemsResult.error;
      if (viewsResult.error) throw viewsResult.error;
      if (waiterRequestsResult.error) throw waiterRequestsResult.error;

      const orders = (ordersResult.data ?? []) as OrderRow[];
      const orderItems = (itemsResult.data ?? []) as OrderItemRow[];
      const categoryItems = (categoryItemsResult.data ?? []) as CategoryItemRow[];
      const waiterRequests = (waiterRequestsResult.data ?? []) as WaiterRequestRow[];

      const nonCancelledOrders = orders.filter((order) => order.status !== "cancelled");
      const revenue = nonCancelledOrders.reduce(
        (sum, order) => sum + Number(order.total ?? 0),
        0
      );

      const itemMap = new Map<string, { name: string; sold: number; revenue: number }>();

      for (const item of orderItems) {
        const menuItem = Array.isArray(item.menu_item) ? item.menu_item[0] : item.menu_item;
const name = menuItem?.name ?? "Unknown item";
        const current = itemMap.get(name) ?? { name, sold: 0, revenue: 0 };

        current.sold += Number(item.quantity ?? 0);
        current.revenue += Number(item.total_price ?? 0);

        itemMap.set(name, current);
      }

      const categoryMap = new Map<string, number>();

      for (const item of categoryItems) {
        const category = Array.isArray(item.category) ? item.category[0] : item.category;
const name = category?.name ?? "Uncategorized";
        categoryMap.set(name, (categoryMap.get(name) ?? 0) + 1);
      }

      const statusMap = new Map<string, number>();

      for (const order of orders) {
        statusMap.set(order.status, (statusMap.get(order.status) ?? 0) + 1);
      }

      const waiterMap = new Map<string, number>();

      for (const request of waiterRequests) {
        waiterMap.set(request.type, (waiterMap.get(request.type) ?? 0) + 1);
      }

      setAnalytics({
        totalOrders: orders.length,
        revenue,
        averageOrder:
          nonCancelledOrders.length > 0 ? revenue / nonCancelledOrders.length : 0,
        menuViews: viewsResult.count ?? 0,
        cancelledOrders: orders.filter((order) => order.status === "cancelled").length,
        activeWaiterRequests: waiterRequests.filter(
          (request) => request.status === "open" || request.status === "accepted"
        ).length,
        topItems: Array.from(itemMap.values())
          .sort((a, b) => b.sold - a.sold)
          .slice(0, 6),
        categoryPerformance: Array.from(categoryMap.entries()).map(([name, items]) => ({
          name,
          items,
        })),
        ordersByStatus: Array.from(statusMap.entries()).map(([name, count]) => ({
          name: name.replace("_", " "),
          count,
        })),
        waiterRequests: Array.from(waiterMap.entries()).map(([name, count]) => ({
          name: name.replace("_", " "),
          count,
        })),
      });
    } catch (error: any) {
      toast.error(error.message ?? "Could not load analytics");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics();

    const channel = supabase
      .channel("analytics-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "masaqr_orders" },
        () => loadAnalytics()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "masaqr_order_items" },
        () => loadAnalytics()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "masaqr_waiter_requests" },
        () => loadAnalytics()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "masaqr_activity_logs" },
        () => loadAnalytics()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const currency = restaurant?.currency ?? "AZN";

  const statusChart = useMemo(
    () =>
      analytics.ordersByStatus.length > 0
        ? analytics.ordersByStatus
        : [{ name: "No orders", count: 0 }],
    [analytics.ordersByStatus]
  );

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading analytics…</div>;
  }

  return (
    <div>
      <PageHeader
        title="Analytics"
        subtitle="Real analytics from Supabase orders, activity logs, and waiter requests."
      />

      <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Total orders"
          value={analytics.totalOrders.toString()}
          hint="All-time orders"
        />
        <Metric
          label="Revenue"
          value={money(analytics.revenue, currency)}
          hint="Excludes cancelled orders"
        />
        <Metric
          label="Average order"
          value={money(analytics.averageOrder, currency)}
          hint="Revenue / completed orders"
        />
        <Metric
          label="Menu views"
          value={analytics.menuViews.toString()}
          hint="From activity logs"
        />
      </div>

      <div className="grid gap-6 px-6 pb-6 xl:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Orders by status</h2>
            <p className="text-sm text-muted-foreground">
              Real order status distribution.
            </p>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusChart}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Top menu items</h2>
            <p className="text-sm text-muted-foreground">
              Based on real order items.
            </p>
          </div>

          <div className="space-y-3">
            {analytics.topItems.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between rounded-2xl border p-4"
              >
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.sold} sold
                  </p>
                </div>
                <span className="font-medium">{money(item.revenue, currency)}</span>
              </div>
            ))}

            {analytics.topItems.length === 0 ? (
              <Empty text="No item sales yet." />
            ) : null}
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Category coverage</h2>
            <p className="text-sm text-muted-foreground">
              Real menu items by category.
            </p>
          </div>

          <div className="space-y-3">
            {analytics.categoryPerformance.map((category) => (
              <div
                key={category.name}
                className="flex items-center justify-between border-b pb-3 last:border-b-0"
              >
                <span>{category.name}</span>
                <span className="text-sm text-muted-foreground">
                  {category.items} item(s)
                </span>
              </div>
            ))}

            {analytics.categoryPerformance.length === 0 ? (
              <Empty text="No categories or menu items yet." />
            ) : null}
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Waiter requests</h2>
            <p className="text-sm text-muted-foreground">
              Real floor alerts from Supabase.
            </p>
          </div>

          <div className="space-y-3">
            <Metric
              label="Active requests"
              value={analytics.activeWaiterRequests.toString()}
              hint="Open or accepted"
            />
            <Metric
              label="Cancelled orders"
              value={analytics.cancelledOrders.toString()}
              hint="Real cancelled order count"
            />

            {analytics.waiterRequests.map((request) => (
              <div
                key={request.name}
                className="flex items-center justify-between border-b pb-3 last:border-b-0"
              >
                <span className="capitalize">{request.name}</span>
                <span className="text-sm text-muted-foreground">
                  {request.count}
                </span>
              </div>
            ))}

            {analytics.waiterRequests.length === 0 ? (
              <Empty text="No waiter requests yet." />
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Card className="p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="mt-2 text-3xl font-semibold">{value}</div>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </Card>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}