import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { B as Button } from "./button-DjOZMqFS.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { s as supabase } from "./supabase-C_P_XQd2.mjs";
import { s as shortOrder, m as minsAgoIso, a as money, f as fetchOwnerContext, b as fetchOrders, u as updateOrderStatus, c as closeSession } from "./masaqr-BQ3x-CAL.mjs";
import { A as ArrowLeft, B as Bell, C as ChefHat, a as Check, U as Users, D as Droplet, H as Hand, R as Receipt, X } from "../_libs/lucide-react.mjs";
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
const ICONS = {
  ready_order: ChefHat,
  bill: Receipt,
  waiter: Hand,
  water: Droplet,
  other: Bell
};
const COLORS = {
  ready_order: "bg-sage/10 border-sage text-sage",
  bill: "bg-warning/10 border-warning text-warning",
  waiter: "bg-ember/10 border-ember text-ember",
  water: "bg-sky-100 border-sky-300 text-sky-900",
  other: "bg-destructive/10 border-destructive text-destructive"
};
const LABELS = {
  ready_order: "Yemək hazırdır",
  bill: "Hesab tələbi",
  waiter: "Köməklik",
  water: "Su / salfet",
  other: "Sorğu"
};
const TABS = [{
  id: "new",
  label: "Yeni sifarişlər"
}, {
  id: "mine",
  label: "Mənim masalarım"
}, {
  id: "sessions",
  label: "Açıq sessiyalar"
}, {
  id: "free",
  label: "Boş masalar"
}, {
  id: "alerts",
  label: "Bildirişlər"
}];
function Waiter() {
  const [profile, setProfile] = reactExports.useState(null);
  const [restaurant, setRestaurant] = reactExports.useState(null);
  const [alerts, setAlerts] = reactExports.useState([]);
  const [tables, setTables] = reactExports.useState([]);
  const [orders, setOrders] = reactExports.useState([]);
  const [sessions, setSessions] = reactExports.useState([]);
  const [tab, setTab] = reactExports.useState("new");
  const [soundOn, setSoundOn] = reactExports.useState(true);
  const lastNewOrderIds = reactExports.useRef(/* @__PURE__ */ new Set());
  const audioCtxRef = reactExports.useRef(null);
  function beep() {
    if (!soundOn) return;
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audioCtxRef.current;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = 880;
      g.gain.value = 0.08;
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      setTimeout(() => {
        o.stop();
      }, 220);
    } catch {
    }
  }
  async function load() {
    try {
      const ctx = await fetchOwnerContext();
      setProfile(ctx.profile);
      setRestaurant(ctx.restaurant);
      if (!ctx.profile?.restaurant_id) return;
      const [{
        data: requestRows
      }, {
        data: tableRows
      }, {
        data: sessionRows
      }, orderRows] = await Promise.all([supabase.from("masaqr_waiter_requests").select("*").eq("restaurant_id", ctx.profile.restaurant_id).order("created_at", {
        ascending: true
      }), supabase.from("masaqr_tables").select("*").eq("restaurant_id", ctx.profile.restaurant_id), supabase.from("masaqr_table_sessions").select("*").eq("restaurant_id", ctx.profile.restaurant_id).eq("status", "open").order("opened_at", {
        ascending: false
      }), fetchOrders(ctx.profile.restaurant_id)]);
      setAlerts(requestRows ?? []);
      setTables(tableRows ?? []);
      setSessions(sessionRows ?? []);
      setOrders(orderRows);
      const myMode = ctx.restaurant?.waiter_assignment_mode ?? "first_confirming_waiter";
      const myId2 = ctx.profile.id;
      const relevant = orderRows.filter((o) => o.status === "pending" && (myMode === "disabled" || o.assigned_waiter_id === myId2 || myMode === "first_confirming_waiter" && !o.assigned_waiter_id));
      const known = lastNewOrderIds.current;
      const fresh = relevant.filter((o) => !known.has(o.id));
      if (known.size > 0 && fresh.length > 0) beep();
      lastNewOrderIds.current = new Set(relevant.map((o) => o.id));
    } catch (err) {
      toast.error(err.message ?? "Yüklənmə xətası");
    }
  }
  reactExports.useEffect(() => {
    load();
    const channel = supabase.channel("waiter-live").on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "masaqr_waiter_requests"
    }, () => load()).on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "masaqr_orders"
    }, () => load()).on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "masaqr_table_sessions"
    }, () => load()).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [soundOn]);
  async function doneAlert(alert) {
    const {
      error
    } = await supabase.from("masaqr_waiter_requests").update({
      status: "done",
      assigned_to: profile?.id ?? null
    }).eq("id", alert.id);
    if (error) return toast.error(error.message);
    toast.success("Qeyd edildi");
    await load();
  }
  async function setStatus(order, status) {
    try {
      await updateOrderStatus(order, status, profile?.id);
      if (status === "confirmed" && restaurant?.waiter_assignment_mode === "first_confirming_waiter") {
        const sid = order.session_id;
        if (sid && profile?.id) {
          await supabase.from("masaqr_table_sessions").update({
            assigned_waiter_id: profile.id
          }).eq("id", sid).is("assigned_waiter_id", null);
          await supabase.from("masaqr_orders").update({
            assigned_waiter_id: profile.id
          }).eq("session_id", sid).is("assigned_waiter_id", null);
        }
      }
      toast.success(`Status: ${status}`);
      await load();
    } catch (err) {
      toast.error(err.message ?? "Status dəyişmədi");
    }
  }
  async function doCloseSession(session) {
    if (!confirm("Sessiyanı bağla və masanı boşalt?")) return;
    try {
      await closeSession(session.id, profile?.id ?? null);
      toast.success("Sessiya bağlandı");
      await load();
    } catch (err) {
      toast.error(err.message ?? "Bağlama xətası");
    }
  }
  const myId = profile?.id ?? "";
  const mode = restaurant?.waiter_assignment_mode ?? "first_confirming_waiter";
  const isMine = (o) => mode === "disabled" || o.assigned_waiter_id === myId || mode === "first_confirming_waiter" && !o.assigned_waiter_id;
  const sessionIsMine = (s) => mode === "disabled" || s.assigned_waiter_id === myId || mode === "first_confirming_waiter" && !s.assigned_waiter_id;
  const newOrders = reactExports.useMemo(() => orders.filter((o) => o.status === "pending" && isMine(o)), [orders, myId, mode]);
  const mySessions = reactExports.useMemo(() => sessions.filter(sessionIsMine), [sessions, myId, mode]);
  const occupiedTableIds = reactExports.useMemo(() => new Set(sessions.map((s) => s.table_id)), [sessions]);
  const freeTables = reactExports.useMemo(() => tables.filter((t) => !occupiedTableIds.has(t.id) && t.status !== "disabled"), [tables, occupiedTableIds]);
  const openAlerts = alerts.filter((a) => a.status === "open");
  const counts = {
    new: newOrders.length,
    mine: mySessions.length,
    sessions: sessions.length,
    free: freeTables.length,
    alerts: openAlerts.length
  };
  function tableLabel(tid) {
    const t = tables.find((x) => x.id === tid);
    return t?.table_name ?? `Masa ${t?.table_number ?? "?"}`;
  }
  function sessionOrders(sid) {
    return orders.filter((o) => o.session_id === sid);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "sticky top-0 z-20 bg-foreground text-background flex items-center gap-3 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/app", className: "text-xs opacity-70", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-5 w-5 text-ember" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-xl", children: "Ofisiant" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setSoundOn((s) => !s), className: `ml-auto text-[11px] px-2 py-1 rounded-full ${soundOn ? "bg-ember text-ember-foreground" : "bg-background/20"}`, children: [
        "🔔 ",
        soundOn ? "Açıq" : "Səssiz"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-b bg-card sticky top-[60px] z-10 overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex", children: TABS.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setTab(t.id), className: `flex-shrink-0 px-4 py-3 text-sm border-b-2 ${tab === t.id ? "border-ember text-ember font-medium" : "border-transparent text-muted-foreground"}`, children: [
      t.label,
      counts[t.id] > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1.5 text-[10px] bg-ember/10 text-ember rounded-full px-1.5", children: counts[t.id] })
    ] }, t.id)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl mx-auto p-4 space-y-3", children: [
      tab === "new" && (newOrders.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Empty, { msg: "Yeni sifariş yoxdur." }) : newOrders.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border-2 p-5 bg-ember/5 border-ember", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChefHat, { className: "h-7 w-7 text-ember" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-wider opacity-70", children: "Yeni sifariş" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-xl", children: o.table?.table_name ?? `Masa ${o.table?.table_number ?? "?"}` }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs opacity-70", children: [
              "#",
              shortOrder(o.id),
              " · ",
              minsAgoIso(o.created_at),
              "d əvvəl · ",
              money(o.total, restaurant?.currency ?? "AZN")
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => setStatus(o, "confirmed"), className: "bg-ember text-ember-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4 mr-1" }),
            "Təsdiqlə"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-foreground/80 space-y-0.5", children: o.items.map((it) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          it.quantity,
          "× ",
          it.menu_item_id.slice(0, 6),
          " ",
          it.note ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "italic opacity-70", children: [
            "— ",
            it.note
          ] }) : null
        ] }, it.id)) })
      ] }, o.id))),
      tab === "mine" && (mySessions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Empty, { msg: "Sənə təyin olunan masa yoxdur." }) : mySessions.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SessionCard, { session: s, tableLabel, orders: sessionOrders(s.id), currency: restaurant?.currency ?? "AZN", onClose: () => doCloseSession(s) }, s.id))),
      tab === "sessions" && (sessions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Empty, { msg: "Açıq sessiya yoxdur." }) : sessions.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SessionCard, { session: s, tableLabel, orders: sessionOrders(s.id), currency: restaurant?.currency ?? "AZN", onClose: () => doCloseSession(s) }, s.id))),
      tab === "free" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-2", children: freeTables.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Empty, { msg: "Boş masa yoxdur." }) : freeTables.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card p-4 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-5 w-5 mx-auto text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium mt-1", children: t.table_name ?? `Masa ${t.table_number}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-sage uppercase tracking-wider mt-0.5", children: "Boş" })
      ] }, t.id)) }),
      tab === "alerts" && (openAlerts.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Empty, { msg: "Bildiriş yoxdur." }) : openAlerts.map((a) => {
        const Icon = ICONS[a.type] ?? Bell;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-2xl border-2 p-5 flex items-center gap-4 ${COLORS[a.type] ?? COLORS.other}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-8 w-8 flex-shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-wider opacity-80", children: LABELS[a.type] ?? "Sorğu" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-xl", children: tableLabel(a.table_id) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs opacity-70 mt-0.5", children: [
              minsAgoIso(a.created_at),
              "d əvvəl"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "lg", className: "bg-foreground text-background", onClick: () => doneAlert(a), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-5 w-5 mr-1" }),
            " Tamam"
          ] })
        ] }, a.id);
      }))
    ] })
  ] });
}
function Empty({
  msg
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 text-muted-foreground text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-10 w-10 mx-auto text-sage opacity-60" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2", children: msg })
  ] });
}
function SessionCard({
  session,
  tableLabel,
  orders,
  currency,
  onClose
}) {
  const total = orders.reduce((s, o) => s + Number(o.total ?? 0), 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-b flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-lg", children: tableLabel(session.table_id) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
          orders.length,
          " sifariş · ",
          minsAgoIso(session.opened_at),
          "d açıqdır · ",
          session.customer_type === "foreign" ? "🌍 Xarici" : "🇦🇿 Yerli"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: onClose, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4 mr-1" }),
        "Bağla"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 space-y-2 text-sm", children: [
      orders.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b pb-2 last:border-0 last:pb-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-mono text-xs", children: [
            "#",
            shortOrder(o.id)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
            o.items.length,
            " maddə · ",
            o.status
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: money(o.total, currency) })
      ] }, o.id)),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pt-2 font-display text-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Cəmi" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: money(total, currency) })
      ] })
    ] })
  ] });
}
export {
  Waiter as component
};
