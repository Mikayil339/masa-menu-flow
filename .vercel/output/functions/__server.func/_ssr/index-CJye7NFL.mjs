import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { P as PageHeader } from "./AppShell-DE5YGknu.mjs";
import { C as Card } from "./card-BdXDhg5r.mjs";
import { B as Button } from "./button-DjOZMqFS.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { s as supabase } from "./supabase-C_P_XQd2.mjs";
import { a as money, s as shortOrder, m as minsAgoIso, f as fetchOwnerContext, b as fetchOrders } from "./masaqr-BQ3x-CAL.mjs";
import { j as ShoppingBag, k as Activity, c as BellRing, l as CircleCheck, m as BookOpen, Q as QrCode, U as Users, n as ArrowUpRight, F as FileText } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
function Stat({
  icon: Icon,
  label,
  value,
  hint,
  tone = "default"
}) {
  const tones = {
    default: "bg-card",
    accent: "bg-ember/5 border-ember/30",
    warn: "bg-warning/10 border-warning/40"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: `p-5 ${tones[tone]}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-3xl font-semibold", children: value }),
      hint ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: hint }) : null
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl bg-muted p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-5 w-5" }) })
  ] }) });
}
function Dashboard() {
  const [profile, setProfile] = reactExports.useState(null);
  const [restaurant, setRestaurant] = reactExports.useState(null);
  const [orders, setOrders] = reactExports.useState([]);
  const [stats, setStats] = reactExports.useState({
    todayOrders: 0,
    todayRevenue: 0,
    activeOrders: 0,
    readyOrders: 0,
    servedOrders: 0,
    menuItems: 0,
    tables: 0,
    staff: 0,
    scans: 0
  });
  const [loading, setLoading] = reactExports.useState(true);
  const today = reactExports.useMemo(() => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), []);
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
          scans: 0
        });
        return;
      }
      const restaurantId = ctx.profile.restaurant_id;
      const [orderRows, menuCount, tableCount, staffCount, scanCount] = await Promise.all([fetchOrders(restaurantId), supabase.from("masaqr_menu_items").select("id", {
        count: "exact",
        head: true
      }).eq("restaurant_id", restaurantId), supabase.from("masaqr_tables").select("id", {
        count: "exact",
        head: true
      }).eq("restaurant_id", restaurantId), supabase.from("masaqr_users").select("id", {
        count: "exact",
        head: true
      }).eq("restaurant_id", restaurantId).neq("role", "owner"), supabase.from("masaqr_activity_logs").select("id", {
        count: "exact",
        head: true
      }).eq("restaurant_id", restaurantId).in("event_type", ["menu_scan", "menu_view"])]);
      if (menuCount.error) throw menuCount.error;
      if (tableCount.error) throw tableCount.error;
      if (staffCount.error) throw staffCount.error;
      if (scanCount.error) throw scanCount.error;
      const todayOrders = orderRows.filter((order) => order.created_at.startsWith(today));
      const todayRevenue = todayOrders.filter((order) => order.status !== "cancelled").reduce((sum, order) => sum + Number(order.total ?? 0), 0);
      const activeOrders2 = orderRows.filter((order) => ["pending", "confirmed", "preparing", "ready", "picked_up"].includes(order.status));
      const readyOrders = orderRows.filter((order) => order.status === "ready");
      const servedOrders = orderRows.filter((order) => order.status === "served");
      setOrders(orderRows);
      setStats({
        todayOrders: todayOrders.length,
        todayRevenue,
        activeOrders: activeOrders2.length,
        readyOrders: readyOrders.length,
        servedOrders: servedOrders.length,
        menuItems: menuCount.count ?? 0,
        tables: tableCount.count ?? 0,
        staff: staffCount.count ?? 0,
        scans: scanCount.count ?? 0
      });
    } catch (error) {
      toast.error(error.message ?? "Could not load dashboard");
    } finally {
      setLoading(false);
    }
  }
  reactExports.useEffect(() => {
    loadDashboard();
    const channel = supabase.channel("dashboard-live").on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "masaqr_orders"
    }, () => loadDashboard()).on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "masaqr_order_items"
    }, () => loadDashboard()).on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "masaqr_activity_logs"
    }, () => loadDashboard()).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  const activeOrders = orders.filter((order) => ["pending", "confirmed", "preparing", "ready", "picked_up"].includes(order.status));
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-sm text-muted-foreground", children: "Loading dashboard…" });
  }
  if (!profile?.restaurant_id) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Dashboard", subtitle: "Complete restaurant setup to start using live statistics." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Restaurant setup required" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "This account is logged in, but it is not connected to a restaurant yet." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/setup", children: "Open setup" }) })
      ] }) })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Dashboard", subtitle: restaurant ? `${restaurant.name} live overview` : "Live overview", actions: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", children: restaurant ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/m/$slug/$table", params: {
      slug: restaurant.slug,
      table: "1"
    }, children: "Müştəri menyusuna bax" }) }) : null }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: ShoppingBag, label: "Today orders", value: stats.todayOrders, hint: "From Supabase orders", tone: "accent" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: Activity, label: "Today revenue", value: money(stats.todayRevenue, restaurant?.currency ?? "AZN"), hint: "Excludes cancelled orders" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: BellRing, label: "Active orders", value: stats.activeOrders, hint: `${stats.readyOrders} ready for waiter`, tone: stats.readyOrders > 0 ? "warn" : "default" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: CircleCheck, label: "Served orders", value: stats.servedOrders, hint: "All-time served orders" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: BookOpen, label: "Menu items", value: stats.menuItems, hint: "Real menu items" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: QrCode, label: "Tables", value: stats.tables, hint: "QR tables" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: Users, label: "Staff", value: stats.staff, hint: "Non-owner users" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: Activity, label: "Menu views", value: stats.scans, hint: "From activity logs" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 px-6 pb-6 xl:grid-cols-[1.4fr_0.8fr]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Live order feed" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Real active orders from Supabase" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "outline", size: "sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/app/orders", children: [
            "All orders ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "ml-1 h-4 w-4" })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          activeOrders.slice(0, 6).map((order) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-2xl border bg-background p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: shortOrder(order.id) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
                order.items.reduce((sum, item) => sum + item.quantity, 0),
                " item(s) ·",
                " ",
                money(order.total, restaurant?.currency ?? "AZN")
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                order.table?.table_name ?? `Table ${order.table?.table_number ?? "?"}`,
                " ·",
                " ",
                minsAgoIso(order.created_at),
                "m ago"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full border px-3 py-1 text-xs capitalize", children: order.status.replace("_", " ") })
          ] }, order.id)),
          activeOrders.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground", children: "No open orders." }) : null
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Quick access" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-4 text-sm text-muted-foreground", children: "Operational screens" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2", children: [{
          to: "/app/menu",
          icon: BookOpen,
          label: "Menyu"
        }, {
          to: "/app/pdf",
          icon: FileText,
          label: "PDF menyu"
        }, {
          to: "/app/tables",
          icon: QrCode,
          label: "Masalar və QR"
        }, {
          to: "/waiter",
          icon: BellRing,
          label: "Ofisiant ekranı"
        }, {
          to: "/app/staff",
          icon: Users,
          label: "Ofisiantlar"
        }].map(({
          to,
          icon: Icon,
          label
        }) => /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "outline", className: "justify-start", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "mr-2 h-4 w-4" }),
          label
        ] }) }, to)) })
      ] })
    ] })
  ] });
}
export {
  Dashboard as component
};
