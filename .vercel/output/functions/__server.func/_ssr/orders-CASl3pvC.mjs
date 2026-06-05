import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { P as PageHeader } from "./AppShell-DE5YGknu.mjs";
import { C as Card } from "./card-BdXDhg5r.mjs";
import { B as Button } from "./button-DjOZMqFS.mjs";
import { I as Input } from "./input-D_U8fI25.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { s as supabase } from "./supabase-C_P_XQd2.mjs";
import { s as shortOrder, m as minsAgoIso, a as money, f as fetchOwnerContext, b as fetchOrders, e as fetchMenu, l as localName, u as updateOrderStatus, c as closeSession } from "./masaqr-BQ3x-CAL.mjs";
import { E as LayoutList, R as Receipt, G as Search, I as Funnel, X } from "../_libs/lucide-react.mjs";
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
const STATUSES = ["pending", "confirmed", "preparing", "ready", "picked_up", "served", "cancelled"];
function Orders() {
  const [profile, setProfile] = reactExports.useState(null);
  const [restaurant, setRestaurant] = reactExports.useState(null);
  const [orders, setOrders] = reactExports.useState([]);
  const [items, setItems] = reactExports.useState([]);
  const [sessions, setSessions] = reactExports.useState([]);
  const [tables, setTables] = reactExports.useState([]);
  const [q, setQ] = reactExports.useState("");
  const [filter, setFilter] = reactExports.useState("all");
  const [selected, setSelected] = reactExports.useState(null);
  const [selectedSession, setSelectedSession] = reactExports.useState(null);
  const [view, setView] = reactExports.useState("orders");
  const [loading, setLoading] = reactExports.useState(true);
  async function load() {
    try {
      const ctx = await fetchOwnerContext();
      setProfile(ctx.profile);
      setRestaurant(ctx.restaurant);
      if (!ctx.profile?.restaurant_id) return;
      const rid = ctx.profile.restaurant_id;
      const [orderRows, menuRows, sessRes, tableRes] = await Promise.all([fetchOrders(rid), fetchMenu(rid), supabase.from("masaqr_table_sessions").select("*").eq("restaurant_id", rid).eq("status", "open").order("opened_at", {
        ascending: false
      }), supabase.from("masaqr_tables").select("*").eq("restaurant_id", rid)]);
      setOrders(orderRows);
      setItems(menuRows.items);
      setSessions(sessRes.data ?? []);
      setTables(tableRes.data ?? []);
      setSelected((c) => c ?? orderRows[0]?.id ?? null);
    } catch (err) {
      toast.error(err.message ?? "Yüklənmədi");
    } finally {
      setLoading(false);
    }
  }
  reactExports.useEffect(() => {
    load();
    const channel = supabase.channel("orders-page-live").on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "masaqr_orders"
    }, () => load()).on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "masaqr_order_items"
    }, () => load()).on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "masaqr_table_sessions"
    }, () => load()).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  const filtered = reactExports.useMemo(() => orders.filter((o) => {
    const code = shortOrder(o.id).toLowerCase();
    if (filter !== "all" && o.status !== filter) return false;
    if (q && !code.includes(q.toLowerCase())) return false;
    return true;
  }), [orders, filter, q]);
  const order = orders.find((o) => o.id === selected) ?? filtered[0];
  async function setStatus(o, status) {
    try {
      await updateOrderStatus(o, status, profile?.id);
      toast.success(`Status: ${status}`);
      await load();
    } catch (err) {
      toast.error(err.message ?? "Status yenilənmədi");
    }
  }
  function itemName(id) {
    const it = items.find((x) => x.id === id);
    return localName(it?.name, it?.name_i18n, restaurant?.default_language ?? "az") || "Məhsul";
  }
  function tableLabel(tableId) {
    const t = tables.find((x) => x.id === tableId);
    return t ? t.table_name ?? `Masa ${t.table_number}` : "—";
  }
  async function handleClose(sessionId) {
    try {
      await closeSession(sessionId, profile?.id ?? null);
      toast.success("Sessiya bağlandı");
      setSelectedSession(null);
      load();
    } catch (e) {
      toast.error(e.message ?? "Bağlamaq alınmadı");
    }
  }
  const activeSession = sessions.find((s) => s.id === selectedSession) ?? sessions[0];
  const sessionOrders = activeSession ? orders.filter((o) => o.session_id === activeSession.id) : [];
  const sessionTotal = sessionOrders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + Number(o.total ?? 0), 0);
  if (loading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 md:p-10 text-sm text-muted-foreground", children: "Yüklənir…" });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 md:p-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Sifarişlər və Sessiyalar", subtitle: "Bütün sifarişlər və açıq masa sessiyaları.", actions: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: view === "orders" ? "default" : "outline", onClick: () => setView("orders"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LayoutList, { className: "mr-2 h-4 w-4" }),
        "Sifarişlər"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: view === "sessions" ? "default" : "outline", onClick: () => setView("sessions"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "mr-2 h-4 w-4" }),
        "Sessiyalar (",
        sessions.length,
        ")"
      ] })
    ] }) }),
    view === "orders" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 min-w-[200px] max-w-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: q, onChange: (e) => setQ(e.target.value), placeholder: "Sifariş kodu axtar…", className: "pl-9" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 ml-auto overflow-x-auto", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Funnel, { className: "h-4 w-4 text-muted-foreground" }),
          ["all", ...STATUSES].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setFilter(s), className: `text-xs px-2.5 py-1 rounded-md border ${filter === s ? "bg-foreground text-background border-foreground" : "bg-card hover:bg-muted"}`, children: s }, s))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-[1fr_400px] gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-0 overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[90px_1fr_100px_120px_90px] gap-3 px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground border-b bg-muted/40", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Kod" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Məhsullar" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Masa" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Vaxt" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            filtered.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setSelected(o.id), className: `w-full grid grid-cols-[90px_1fr_100px_120px_90px] gap-3 px-4 py-3 text-left border-b last:border-0 hover:bg-muted/40 ${selected === o.id ? "bg-ember/5" : ""}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-sm font-bold", children: shortOrder(o.id) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-w-0 text-sm truncate", children: o.items.map((i) => `${i.quantity}× ${itemName(i.menu_item_id)}`).join(", ") || "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm", children: o.table?.table_name ?? `M${o.table?.table_number ?? "?"}` }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] uppercase tracking-wider px-2 py-1 rounded bg-background border", children: o.status }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground", children: [
                minsAgoIso(o.created_at),
                "d"
              ] })
            ] }, o.id)),
            filtered.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground text-center py-12", children: "Sifariş yoxdur." })
          ] })
        ] }),
        order && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5 h-fit sticky top-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Sifariş" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl", children: shortOrder(order.id) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: [
                order.table?.table_name ?? `Masa ${order.table?.table_number ?? "?"}`,
                " · ",
                minsAgoIso(order.created_at),
                "d əvvəl"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-wider px-2 py-1 rounded bg-muted border", children: order.status })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 space-y-3", children: order.items.map((it) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-3 border-b pb-3 last:border-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-medium", children: [
                it.quantity,
                "× ",
                itemName(it.menu_item_id)
              ] }),
              it.note && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground italic", children: it.note })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: money(it.total_price, restaurant?.currency ?? "AZN") })
          ] }, it.id)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 pt-4 border-t flex items-center justify-between font-display text-xl", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Cəmi" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: money(order.total, restaurant?.currency ?? "AZN") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 grid grid-cols-2 gap-2", children: [
            order.status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setStatus(order, "confirmed"), className: "col-span-2 bg-ember text-ember-foreground hover:bg-ember/90", children: "Təsdiqlə" }),
            order.status === "confirmed" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setStatus(order, "served"), className: "col-span-2 bg-sage text-white hover:bg-sage/90", children: "Verildi" }),
            !["served", "cancelled"].includes(order.status) && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setStatus(order, "cancelled"), className: "col-span-2", children: "Ləğv et" })
          ] })
        ] })
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-[1fr_420px] gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-0 overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground border-b bg-muted/40", children: "Açıq sessiyalar" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          sessions.map((s) => {
            const sOrders = orders.filter((o) => o.session_id === s.id);
            const total = sOrders.filter((o) => o.status !== "cancelled").reduce((sum, o) => sum + Number(o.total ?? 0), 0);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setSelectedSession(s.id), className: `w-full flex items-center justify-between px-4 py-3 border-b last:border-0 hover:bg-muted/40 text-left ${selectedSession === s.id ? "bg-ember/5" : ""}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-sm", children: tableLabel(s.table_id) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
                  sOrders.length,
                  " sifariş · ",
                  s.customer_type === "foreign" ? "Əcnəbi" : "Yerli",
                  " · açıldı ",
                  minsAgoIso(s.opened_at),
                  "d əvvəl"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: money(total, restaurant?.currency ?? "AZN") })
            ] }, s.id);
          }),
          sessions.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground text-center py-12", children: "Açıq sessiya yoxdur." })
        ] })
      ] }),
      activeSession && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5 h-fit sticky top-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Hesab" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl", children: tableLabel(activeSession.table_id) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mt-1", children: activeSession.customer_type === "foreign" ? "Əcnəbi müştəri" : "Yerli müştəri" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-wider px-2 py-1 rounded bg-emerald-100 text-emerald-700 border border-emerald-200", children: "açıq" })
        ] }),
        sessionOrders.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b last:border-0 py-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-mono text-muted-foreground", children: [
              shortOrder(o.id),
              " · ",
              minsAgoIso(o.created_at),
              "d"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] uppercase px-1.5 py-0.5 rounded bg-muted border", children: o.status })
          ] }),
          o.items.map((it) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              it.quantity,
              "× ",
              itemName(it.menu_item_id)
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: money(it.total_price, restaurant?.currency ?? "AZN") })
          ] }, it.id))
        ] }, o.id)),
        sessionOrders.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground py-6 text-center", children: "Sifariş yoxdur." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 pt-4 border-t-2 border-dashed flex items-center justify-between font-display text-2xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Cəmi" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: money(sessionTotal, restaurant?.currency ?? "AZN") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => handleClose(activeSession.id), className: "mt-5 w-full bg-ember hover:bg-ember/90 text-ember-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "mr-2 h-4 w-4" }),
          "Hesabı bağla və masanı boşalt"
        ] })
      ] })
    ] })
  ] });
}
export {
  Orders as component
};
