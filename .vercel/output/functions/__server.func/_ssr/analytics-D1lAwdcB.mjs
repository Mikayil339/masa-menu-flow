import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { P as PageHeader } from "./AppShell-DE5YGknu.mjs";
import { C as Card } from "./card-BdXDhg5r.mjs";
import { B as Button } from "./button-DjOZMqFS.mjs";
import { I as Input } from "./input-D_U8fI25.mjs";
import { L as Label } from "./label-C8WJLhmR.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { s as supabase } from "./supabase-C_P_XQd2.mjs";
import { a as money, f as fetchOwnerContext } from "./masaqr-BQ3x-CAL.mjs";
import { R as ResponsiveContainer, B as BarChart, X as XAxis, Y as YAxis, T as Tooltip, a as Bar } from "../_libs/recharts.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "./Logo-g-ujtk54.mjs";
import "./store-MU1TcehK.mjs";
import "../_libs/zustand.mjs";
import "./i18n-BZSpJObU.mjs";
import "../_libs/lucide-react.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/lodash.mjs";
import "../_libs/tiny-invariant.mjs";
import "../_libs/react-is.mjs";
import "../_libs/d3-shape.mjs";
import "../_libs/d3-path.mjs";
import "../_libs/react-smooth.mjs";
import "../_libs/prop-types.mjs";
import "../_libs/fast-equals.mjs";
import "../_libs/victory-vendor.mjs";
import "../_libs/d3-scale.mjs";
import "../_libs/internmap.mjs";
import "../_libs/d3-array.mjs";
import "../_libs/d3-time-format.mjs";
import "../_libs/d3-time.mjs";
import "../_libs/d3-interpolate.mjs";
import "../_libs/d3-color.mjs";
import "../_libs/d3-format.mjs";
import "../_libs/recharts-scale.mjs";
import "../_libs/decimal.js-light.mjs";
import "../_libs/eventemitter3.mjs";
const emptyAnalytics = {
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
  dailyRevenue: []
};
function toDateInput(date) {
  return date.toISOString().slice(0, 10);
}
function startOfToday() {
  const date = /* @__PURE__ */ new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}
function endOfDate(date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}
function startOfMonth() {
  const date = /* @__PURE__ */ new Date();
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date;
}
function AnalyticsPage() {
  const [restaurant, setRestaurant] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [rangeMode, setRangeMode] = reactExports.useState("today");
  const [fromDate, setFromDate] = reactExports.useState(toDateInput(startOfToday()));
  const [toDate, setToDate] = reactExports.useState(toDateInput(/* @__PURE__ */ new Date()));
  const [analytics, setAnalytics] = reactExports.useState(emptyAnalytics);
  const range = reactExports.useMemo(() => {
    if (rangeMode === "today") {
      return {
        from: startOfToday(),
        to: endOfDate(/* @__PURE__ */ new Date())
      };
    }
    if (rangeMode === "month") {
      return {
        from: startOfMonth(),
        to: endOfDate(/* @__PURE__ */ new Date())
      };
    }
    return {
      from: /* @__PURE__ */ new Date(`${fromDate}T00:00:00`),
      to: endOfDate(/* @__PURE__ */ new Date(`${toDate}T00:00:00`))
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
      const ordersResult = await supabase.from("masaqr_orders").select("id,total,status,created_at").eq("restaurant_id", restaurantId).gte("created_at", fromIso).lte("created_at", toIso).order("created_at", {
        ascending: true
      });
      if (ordersResult.error) throw ordersResult.error;
      const orders = ordersResult.data ?? [];
      const orderIds = orders.map((order) => order.id);
      const [itemsResult, categoryItemsResult, viewsResult, waiterRequestsResult] = await Promise.all([orderIds.length ? supabase.from("masaqr_order_items").select("quantity,total_price,menu_item:masaqr_menu_items(name)").in("order_id", orderIds) : Promise.resolve({
        data: [],
        error: null
      }), supabase.from("masaqr_menu_items").select("category_id,category:masaqr_categories(name)").eq("restaurant_id", restaurantId), supabase.from("masaqr_activity_logs").select("id", {
        count: "exact",
        head: true
      }).eq("restaurant_id", restaurantId).in("event_type", ["menu_scan", "menu_view"]).gte("created_at", fromIso).lte("created_at", toIso), supabase.from("masaqr_waiter_requests").select("type,status,created_at").eq("restaurant_id", restaurantId).gte("created_at", fromIso).lte("created_at", toIso)]);
      if (itemsResult.error) throw itemsResult.error;
      if (categoryItemsResult.error) throw categoryItemsResult.error;
      if (viewsResult.error) throw viewsResult.error;
      if (waiterRequestsResult.error) throw waiterRequestsResult.error;
      const orderItems = itemsResult.data ?? [];
      const categoryItems = categoryItemsResult.data ?? [];
      const waiterRequests = waiterRequestsResult.data ?? [];
      const nonCancelledOrders = orders.filter((order) => order.status !== "cancelled");
      const revenue = nonCancelledOrders.reduce((sum, order) => sum + Number(order.total ?? 0), 0);
      const itemMap = /* @__PURE__ */ new Map();
      for (const item of orderItems) {
        const menuItem = Array.isArray(item.menu_item) ? item.menu_item[0] : item.menu_item;
        const name = menuItem?.name ?? "Naməlum məhsul";
        const current = itemMap.get(name) ?? {
          name,
          sold: 0,
          revenue: 0
        };
        current.sold += Number(item.quantity ?? 0);
        current.revenue += Number(item.total_price ?? 0);
        itemMap.set(name, current);
      }
      const categoryMap = /* @__PURE__ */ new Map();
      for (const item of categoryItems) {
        const category = Array.isArray(item.category) ? item.category[0] : item.category;
        const name = category?.name ?? "Kateqoriyasız";
        categoryMap.set(name, (categoryMap.get(name) ?? 0) + 1);
      }
      const statusMap = /* @__PURE__ */ new Map();
      for (const order of orders) statusMap.set(order.status, (statusMap.get(order.status) ?? 0) + 1);
      const waiterMap = /* @__PURE__ */ new Map();
      for (const request of waiterRequests) waiterMap.set(request.type, (waiterMap.get(request.type) ?? 0) + 1);
      const dayMap = /* @__PURE__ */ new Map();
      for (const order of nonCancelledOrders) {
        const key = new Date(order.created_at).toLocaleDateString("az-AZ", {
          month: "short",
          day: "2-digit"
        });
        const current = dayMap.get(key) ?? {
          date: key,
          revenue: 0,
          orders: 0
        };
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
        categoryPerformance: Array.from(categoryMap.entries()).map(([name, items]) => ({
          name,
          items
        })),
        ordersByStatus: Array.from(statusMap.entries()).map(([name, count]) => ({
          name: name.replace("_", " "),
          count
        })),
        waiterRequests: Array.from(waiterMap.entries()).map(([name, count]) => ({
          name: name.replace("_", " "),
          count
        })),
        dailyRevenue: Array.from(dayMap.values())
      });
    } catch (error) {
      toast.error(error.message ?? "Analitika yüklənmədi");
    } finally {
      setLoading(false);
    }
  }
  reactExports.useEffect(() => {
    loadAnalytics();
    const channel = supabase.channel("analytics-live").on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "masaqr_orders"
    }, () => loadAnalytics()).on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "masaqr_order_items"
    }, () => loadAnalytics()).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [range.from.getTime(), range.to.getTime()]);
  const subtitle = `${range.from.toLocaleDateString()} – ${range.to.toLocaleDateString()} aralığı üzrə real Supabase hesabatı`;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Analitika", subtitle, actions: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: loadAnalytics, children: "Yenilə" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-end gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Dövr" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 flex rounded-lg border bg-card p-1", children: [{
            id: "today",
            label: "Bu gün"
          }, {
            id: "month",
            label: "Bu ay"
          }, {
            id: "custom",
            label: "Tarix aralığı"
          }].map((option) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setRangeMode(option.id), className: `rounded-md px-3 py-2 text-sm ${rangeMode === option.id ? "bg-foreground text-background" : "text-muted-foreground"}`, children: option.label }, option.id)) })
        ] }),
        rangeMode === "custom" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Başlanğıc" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: fromDate, onChange: (event) => setFromDate(event.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Son" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: toDate, onChange: (event) => setToDate(event.target.value) })
          ] })
        ] }) : null
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Metric, { title: "Sifarişlər", value: analytics.totalOrders, hint: "Seçilən dövr" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Metric, { title: "Gəlir", value: money(analytics.revenue, restaurant?.currency ?? "AZN"), hint: "Ləğv edilənlər xaric" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Metric, { title: "Orta çek", value: money(analytics.averageOrder, restaurant?.currency ?? "AZN"), hint: "Ləğv edilməyən sifarişlər" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Metric, { title: "Menyu baxışı", value: analytics.menuViews, hint: "QR scan / menu view" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 xl:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChartCard, { title: "Günlük gəlir", empty: !analytics.dailyRevenue.length, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 260, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: analytics.dailyRevenue, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "revenue" })
        ] }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChartCard, { title: "Ən çox satılan məhsullar", empty: !analytics.topItems.length, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 260, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: analytics.topItems, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "name", hide: true }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "sold" })
        ] }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChartCard, { title: "Sifariş statusları", empty: !analytics.ordersByStatus.length, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 260, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: analytics.ordersByStatus, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { allowDecimals: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "count" })
        ] }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChartCard, { title: "Kateqoriya məhsul sayı", empty: !analytics.categoryPerformance.length, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 260, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: analytics.categoryPerformance, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "name", hide: true }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { allowDecimals: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "items" })
        ] }) }) })
      ] }),
      loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Yüklənir…" }) : null
    ] })
  ] });
}
function Metric({
  title,
  value,
  hint
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-3xl font-semibold", children: value }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-muted-foreground", children: hint })
  ] });
}
function ChartCard({
  title,
  empty,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-4 text-lg font-semibold", children: title }),
    empty ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-[260px] place-items-center text-sm text-muted-foreground", children: "Bu dövr üçün data yoxdur." }) : children
  ] });
}
export {
  AnalyticsPage as component
};
