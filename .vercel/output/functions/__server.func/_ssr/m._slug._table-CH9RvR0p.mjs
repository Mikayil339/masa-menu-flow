import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { f as useParams, g as useSearch } from "../_libs/tanstack__react-router.mjs";
import { B as Button, c as cn } from "./button-DjOZMqFS.mjs";
import { R as Root, b as Trigger, P as Portal, C as Content, a as Close, T as Title, O as Overlay, D as Description } from "../_libs/radix-ui__react-dialog.mjs";
import { c as cva } from "../_libs/class-variance-authority.mjs";
import { R as Root2, L as List, T as Trigger$1, C as Content$1 } from "../_libs/radix-ui__react-tabs.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { s as supabase } from "./supabase-C_P_XQd2.mjs";
import { g as customerSessionId, h as fetchSuggestionsFor, l as localName, p as priceFor, s as shortOrder, a as money, e as fetchMenu, m as minsAgoIso, o as openOrGetSession, r as resolveInitialWaiter } from "./masaqr-BQ3x-CAL.mjs";
import { y as Phone, W as Wifi, G as Search, B as Bell, H as Hand, D as Droplet, R as Receipt, j as ShoppingBag, a0 as CirclePlus, a1 as Minus, o as Plus, T as Trash2, S as Sparkles, X, a2 as Clock, a as Check } from "../_libs/lucide-react.mjs";
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
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/react-remove-scroll.mjs";
import "tslib";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "../_libs/supabase__functions-js.mjs";
const Sheet = Root;
const SheetTrigger = Trigger;
const SheetPortal = Portal;
const SheetOverlay = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Overlay,
  {
    className: cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props,
    ref
  }
));
SheetOverlay.displayName = Overlay.displayName;
const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right: "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"
      }
    },
    defaultVariants: {
      side: "right"
    }
  }
);
const SheetContent = reactExports.forwardRef(({ side = "right", className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetPortal, { children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(SheetOverlay, {}),
  /* @__PURE__ */ jsxRuntimeExports.jsxs(Content, { ref, className: cn(sheetVariants({ side }), className), ...props, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: "Close" })
    ] }),
    children
  ] })
] }));
SheetContent.displayName = Content.displayName;
const SheetHeader = ({ className, ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("flex flex-col space-y-2 text-center sm:text-left", className), ...props });
SheetHeader.displayName = "SheetHeader";
const SheetTitle = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Title,
  {
    ref,
    className: cn("text-lg font-semibold text-foreground", className),
    ...props
  }
));
SheetTitle.displayName = Title.displayName;
const SheetDescription = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
SheetDescription.displayName = Description.displayName;
const Tabs = Root2;
const TabsList = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  List,
  {
    ref,
    className: cn(
      "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
      className
    ),
    ...props
  }
));
TabsList.displayName = List.displayName;
const TabsTrigger = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Trigger$1,
  {
    ref,
    className: cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
      className
    ),
    ...props
  }
));
TabsTrigger.displayName = Trigger$1.displayName;
const TabsContent = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Content$1,
  {
    ref,
    className: cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    ),
    ...props
  }
));
TabsContent.displayName = Content$1.displayName;
const UI = {
  az: {
    search: "Menyuda axtar…",
    empty: "Heç nə tapılmadı.",
    cart: "Səbət",
    order: "Sifariş",
    status: "Sifariş statusu",
    noActive: "Hələ aktiv sifarişin yoxdur.",
    addMore: "Əlavə sifariş ver",
    total: "Cəmi",
    send: "Sifariş ver",
    emptyCart: "Səbət boşdur. Bir şey əlavə et.",
    service: "Xidmət",
    callWaiter: "Ofisiant çağır",
    waterNapkin: "Su / salfet",
    askBill: "Hesab istə",
    help: "Sizə necə kömək edə bilərik?",
    paidNote: "Ödəniş platformadan kənar — ofisiant terminal gətirəcək.",
    added: "səbətə əlavə edildi",
    waiterOnWay: "Ofisiant gəlir",
    requestSent: "Sorğu göndərildi",
    billRequested: "Hesab tələb olundu",
    orderSent: "Sifariş göndərildi",
    extraOrderSent: "Əlavə sifariş göndərildi",
    note: "Mətbəx üçün qeyd",
    notePlaceholder: "məs. soğansız",
    addToCart: "Səbətə əlavə et",
    suggestions: "Bunu da bəyənə bilərsiniz",
    welcome: "Xoş gəlmisiniz",
    quantity: "Say",
    loading: "Menyu yüklənir…"
  },
  en: {
    search: "Search the menu…",
    empty: "Nothing here.",
    cart: "Cart",
    order: "Order",
    status: "Order status",
    noActive: "No active orders yet.",
    addMore: "Add more items",
    total: "Total",
    send: "Send order",
    emptyCart: "Cart is empty. Add something delicious.",
    service: "Service",
    callWaiter: "Call waiter",
    waterNapkin: "Water / napkins",
    askBill: "Ask for bill",
    help: "How can we help?",
    paidNote: "Paid outside platform — your server will bring the terminal.",
    added: "added to cart",
    waiterOnWay: "Waiter on the way",
    requestSent: "Request sent",
    billRequested: "Bill requested",
    orderSent: "Order sent",
    extraOrderSent: "Additional order sent",
    note: "Note for the kitchen",
    notePlaceholder: "e.g. no onions",
    addToCart: "Add to cart",
    suggestions: "You might also like",
    welcome: "Welcome",
    quantity: "Qty",
    loading: "Loading menu…"
  },
  ru: {
    search: "Поиск по меню…",
    empty: "Ничего не найдено.",
    cart: "Корзина",
    order: "Заказ",
    status: "Статус заказа",
    noActive: "Активных заказов пока нет.",
    addMore: "Добавить ещё",
    total: "Итого",
    send: "Отправить заказ",
    emptyCart: "Корзина пуста. Добавьте что-нибудь.",
    service: "Сервис",
    callWaiter: "Позвать официанта",
    waterNapkin: "Вода / салфетки",
    askBill: "Запросить счёт",
    help: "Чем можем помочь?",
    paidNote: "Оплата вне платформы — официант принесёт терминал.",
    added: "добавлено в корзину",
    waiterOnWay: "Официант идёт",
    requestSent: "Запрос отправлен",
    billRequested: "Счёт запрошен",
    orderSent: "Заказ отправлен",
    extraOrderSent: "Дополнительный заказ отправлен",
    note: "Заметка для кухни",
    notePlaceholder: "напр. без лука",
    addToCart: "В корзину",
    suggestions: "Вам также может понравиться",
    welcome: "Добро пожаловать",
    quantity: "Кол-во",
    loading: "Загрузка меню…"
  }
};
function CustomerMenu() {
  const {
    slug,
    table
  } = useParams({
    from: "/m/$slug/$table"
  });
  const search = useSearch({
    from: "/m/$slug/$table"
  });
  const customerType = search.type ?? "local";
  const [restaurant, setRestaurant] = reactExports.useState(null);
  const [tableObj, setTableObj] = reactExports.useState(null);
  const [categories, setCategories] = reactExports.useState([]);
  const [items, setItems] = reactExports.useState([]);
  const [orders, setOrders] = reactExports.useState([]);
  const [suggestions, setSuggestions] = reactExports.useState([]);
  const [lang, setLang] = reactExports.useState(search.lang ?? "az");
  const [activeCat, setActiveCat] = reactExports.useState();
  const [q, setQ] = reactExports.useState("");
  const [cart, setCart] = reactExports.useState([]);
  const [activeItem, setActiveItem] = reactExports.useState(null);
  const [sheetOpen, setSheetOpen] = reactExports.useState(false);
  const [sheetTab, setSheetTab] = reactExports.useState("cart");
  const [sending, setSending] = reactExports.useState(false);
  const sessionId = reactExports.useMemo(() => customerSessionId(), []);
  const t = UI[lang];
  const loadOrders = reactExports.useCallback(async (restaurantId) => {
    const rid = restaurantId ?? restaurant?.id;
    if (!rid) return;
    const {
      data: rows
    } = await supabase.from("masaqr_orders").select("*").eq("restaurant_id", rid).eq("customer_session_id", sessionId).order("created_at", {
      ascending: false
    });
    const orderRows = rows ?? [];
    if (!orderRows.length) {
      setOrders([]);
      return;
    }
    const {
      data: orderItems
    } = await supabase.from("masaqr_order_items").select("*").in("order_id", orderRows.map((o) => o.id));
    setOrders(orderRows.map((o) => ({
      ...o,
      items: (orderItems ?? []).filter((i) => i.order_id === o.id),
      table: tableObj
    })));
  }, [restaurant?.id, sessionId, tableObj]);
  async function load() {
    try {
      const {
        data: r,
        error: rErr
      } = await supabase.from("masaqr_restaurants").select("*").eq("slug", slug).eq("is_active", true).maybeSingle();
      if (rErr) throw rErr;
      if (!r) return;
      const restaurantRow = r;
      setRestaurant(restaurantRow);
      if (!search.lang) setLang(restaurantRow.default_language || "az");
      const {
        data: tRow,
        error: tErr
      } = await supabase.from("masaqr_tables").select("*").eq("restaurant_id", restaurantRow.id).or(`table_number.eq.${table},qr_token.eq.${table}`).maybeSingle();
      if (tErr) throw tErr;
      setTableObj(tRow ?? null);
      const menu = await fetchMenu(restaurantRow.id);
      setCategories(menu.categories);
      setItems(menu.items.filter((i) => i.is_available && !i.is_sold_out));
      setActiveCat((c) => c ?? menu.categories[0]?.id);
      await supabase.from("masaqr_activity_logs").insert({
        restaurant_id: restaurantRow.id,
        table_id: tRow?.id ?? null,
        event_type: "menu_view",
        event_data: {
          slug,
          table,
          lang,
          customer_type: customerType
        }
      }).then(() => {
      }, () => {
      });
      await loadOrders(restaurantRow.id);
    } catch (err) {
      toast.error(err.message ?? "Could not load menu");
    }
  }
  reactExports.useEffect(() => {
    load();
  }, [slug, table]);
  reactExports.useEffect(() => {
    if (!restaurant?.id) return;
    const channel = supabase.channel(`customer-${sessionId}`).on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "masaqr_orders",
      filter: `customer_session_id=eq.${sessionId}`
    }, () => loadOrders()).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurant?.id, sessionId, loadOrders]);
  reactExports.useEffect(() => {
    if (!restaurant?.id || cart.length === 0) {
      setSuggestions([]);
      return;
    }
    const sourceIds = [...new Set(cart.map((c) => c.item.id))];
    fetchSuggestionsFor(restaurant.id, sourceIds).then(setSuggestions).catch(() => {
    });
  }, [restaurant?.id, cart]);
  const activeOrders = orders.filter((o) => !["served", "cancelled"].includes(o.status));
  const hasActive = activeOrders.length > 0;
  const visible = reactExports.useMemo(() => items.filter((i) => i.category_id === activeCat && (!q || localName(i.name, i.name_i18n, lang).toLowerCase().includes(q.toLowerCase()))), [items, activeCat, q, lang]);
  const cartTotal = cart.reduce((s, c) => s + c.qty * priceFor(c.item, customerType), 0);
  const cartCount = cart.reduce((s, c) => s + c.qty, 0);
  const suggestionItems = reactExports.useMemo(() => {
    if (!suggestions.length) return [];
    const inCart = new Set(cart.map((c) => c.item.id));
    const ids = [...new Set(suggestions.map((s) => s.suggested_item_id))].filter((id) => !inCart.has(id));
    return ids.map((id) => items.find((i) => i.id === id)).filter((x) => Boolean(x));
  }, [suggestions, items, cart]);
  const addToCart = (item, qty, note) => {
    setCart((c) => [...c, {
      id: Math.random().toString(36).slice(2, 8),
      item,
      qty,
      note
    }]);
    toast.success(`${localName(item.name, item.name_i18n, lang)} ${t.added}`);
    setActiveItem(null);
  };
  async function sendOrder() {
    if (!restaurant || !tableObj || cart.length === 0 || sending) return;
    setSending(true);
    try {
      const session = await openOrGetSession({
        restaurantId: restaurant.id,
        tableId: tableObj.id,
        customerSessionId: sessionId,
        customerType
      });
      const assignedWaiter = session.assigned_waiter_id ?? await resolveInitialWaiter({
        restaurantId: restaurant.id,
        tableId: tableObj.id,
        mode: restaurant.waiter_assignment_mode ?? "first_confirming_waiter"
      });
      const {
        data: order,
        error: orderError
      } = await supabase.from("masaqr_orders").insert({
        restaurant_id: restaurant.id,
        table_id: tableObj.id,
        customer_session_id: sessionId,
        session_id: session.id,
        assigned_waiter_id: assignedWaiter,
        customer_type: customerType,
        status: "pending",
        total: cartTotal
      }).select("id").single();
      if (orderError || !order) throw orderError ?? new Error("Order was not created");
      const rows = cart.map((c) => {
        const unit = priceFor(c.item, customerType);
        return {
          order_id: order.id,
          menu_item_id: c.item.id,
          quantity: c.qty,
          unit_price: unit,
          total_price: c.qty * unit,
          note: c.note || null,
          selected_modifiers: []
        };
      });
      const {
        error: itemError
      } = await supabase.from("masaqr_order_items").insert(rows);
      if (itemError) throw itemError;
      await supabase.from("masaqr_table_sessions").update({
        total: Number(session.total ?? 0) + cartTotal,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("id", session.id);
      setCart([]);
      setSheetTab("status");
      toast.success(hasActive ? t.extraOrderSent : t.orderSent);
      await loadOrders();
    } catch (err) {
      toast.error(err.message ?? "Could not send order");
    } finally {
      setSending(false);
    }
  }
  async function callRequest(type) {
    if (!restaurant || !tableObj) return;
    await supabase.from("masaqr_waiter_requests").insert({
      restaurant_id: restaurant.id,
      table_id: tableObj.id,
      type,
      status: "open"
    });
    toast.success(type === "waiter" ? t.waiterOnWay : type === "bill" ? t.billRequested : t.requestSent);
  }
  if (!restaurant) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen grid place-items-center text-sm text-muted-foreground", children: t.loading });
  const desc = localName(restaurant.description ?? null, restaurant.description_i18n ?? null, lang);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background pb-32", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "relative h-52 overflow-hidden", children: [
      restaurant.cover_url && /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: restaurant.cover_url, className: "absolute inset-0 w-full h-full object-cover", alt: "" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-foreground/95 via-foreground/50 to-transparent" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 p-5 flex flex-col justify-end text-background", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [
            restaurant.logo_url && /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: restaurant.logo_url, alt: "", className: "h-14 w-14 rounded-full object-cover ring-2 ring-background/40 flex-shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs uppercase tracking-widest opacity-70", children: [
                tableObj?.table_name ?? `${lang === "az" ? "Masa" : lang === "ru" ? "Столик" : "Table"} ${tableObj?.table_number ?? table}`,
                " · ",
                t.welcome
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl truncate", children: restaurant.name }),
              desc && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs opacity-80 mt-0.5 line-clamp-1", children: desc })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 flex-shrink-0", children: ["az", "en", "ru"].map((l) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setLang(l), className: `text-[10px] uppercase px-2 py-1 rounded-full ${lang === l ? "bg-ember text-ember-foreground" : "bg-background/20 text-background"}`, children: l }, l)) })
        ] }),
        restaurant.show_phone_on_menu !== false && restaurant.phone || restaurant.show_wifi_on_menu !== false && restaurant.wifi_name ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex flex-wrap gap-2 text-[11px]", children: [
          restaurant.show_phone_on_menu !== false && restaurant.phone && /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: `tel:${restaurant.phone}`, className: "flex items-center gap-1 bg-background/15 backdrop-blur px-2.5 py-1 rounded-full", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3 w-3" }),
            restaurant.phone
          ] }),
          restaurant.show_wifi_on_menu !== false && restaurant.wifi_name && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 bg-background/15 backdrop-blur px-2.5 py-1 rounded-full", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Wifi, { className: "h-3 w-3" }),
            restaurant.wifi_name,
            restaurant.wifi_password ? ` · ${restaurant.wifi_password}` : ""
          ] })
        ] }) : null
      ] })
    ] }),
    hasActive && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
      setSheetTab("status");
      setSheetOpen(true);
    }, className: "w-full bg-ember/10 border-y border-ember/30 px-4 py-2.5 flex items-center justify-between text-sm text-left", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "relative flex h-2 w-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-ember opacity-75" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative inline-flex rounded-full h-2 w-2 bg-ember" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
          activeOrders.length,
          " · #",
          shortOrder(activeOrders[0].id)
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-ember font-medium", children: "→" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sticky top-0 z-30 bg-background/95 backdrop-blur border-b", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: q, onChange: (e) => setQ(e.target.value), placeholder: t.search, className: "w-full pl-9 pr-3 py-2 rounded-full border bg-card text-sm" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 px-3 pb-3 overflow-x-auto", children: categories.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setActiveCat(c.id), className: `text-xs whitespace-nowrap px-3 py-1.5 rounded-full border ${activeCat === c.id ? "bg-foreground text-background border-foreground" : "bg-card"}`, children: localName(c.name, c.name_i18n, lang) }, c.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 space-y-3", children: [
      visible.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setActiveItem(item), className: "w-full bg-card border rounded-2xl overflow-hidden flex text-left transition hover:border-ember/40", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 p-4 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium mt-1", children: localName(item.name, item.name_i18n, lang) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground line-clamp-2 mt-1", children: localName(item.description, item.description_i18n, lang) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-ember font-semibold", children: money(priceFor(item, customerType), restaurant.currency) }) })
        ] }),
        item.image_url && /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: item.image_url, alt: "", className: "h-28 w-28 object-cover flex-shrink-0" })
      ] }, item.id)),
      visible.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-sm text-muted-foreground py-12", children: t.empty })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed bottom-4 left-4 right-4 flex gap-2 z-40", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Sheet, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SheetTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "bg-card shadow-lg flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-4 w-4 mr-1.5" }),
          t.service
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetContent, { side: "bottom", className: "rounded-t-2xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SheetHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SheetTitle, { children: t.help }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 mt-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => callRequest("waiter"), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Hand, { className: "h-4 w-4 mr-2" }),
              t.callWaiter
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => callRequest("water"), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Droplet, { className: "h-4 w-4 mr-2" }),
              t.waterNapkin
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "col-span-2", onClick: () => callRequest("bill"), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "h-4 w-4 mr-2" }),
              t.askBill
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground col-span-2 text-center", children: t.paidNote })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Sheet, { open: sheetOpen, onOpenChange: setSheetOpen, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SheetTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "bg-ember hover:bg-ember/90 text-ember-foreground flex-1 shadow-xl", onClick: () => setSheetTab(cart.length === 0 && hasActive ? "status" : "cart"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { className: "h-4 w-4 mr-1.5" }),
          hasActive ? t.order : t.cart,
          cartCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1.5 bg-background text-ember rounded-full px-1.5 text-xs", children: cartCount })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetContent, { side: "bottom", className: "rounded-t-2xl max-h-[88vh] overflow-y-auto", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SheetHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SheetTitle, { children: tableObj?.table_name ?? `${lang === "az" ? "Masa" : lang === "ru" ? "Столик" : "Table"} ${table}` }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: sheetTab, onValueChange: (v) => setSheetTab(v), className: "mt-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "w-full grid grid-cols-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "status", disabled: !hasActive, children: t.status }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "cart", children: [
                t.cart,
                " ",
                cartCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1.5 text-[10px] bg-ember text-ember-foreground rounded-full px-1.5", children: cartCount })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "status", className: "mt-4 space-y-4", children: [
              activeOrders.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8 text-sm text-muted-foreground", children: t.noActive }) : activeOrders.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(OrderTrackingCard, { order: o, items, lang }, o.id)),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-3 border-t", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "w-full", onClick: () => setSheetTab("cart"), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CirclePlus, { className: "h-4 w-4 mr-1.5" }),
                " ",
                t.addMore
              ] }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "cart", className: "mt-4", children: cart.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-10 text-sm text-muted-foreground", children: t.emptyCart }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: cart.map((c) => {
                const unit = priceFor(c.item, customerType);
                return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 p-3 rounded-lg border", children: [
                  c.item.image_url && /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: c.item.image_url, className: "h-12 w-12 rounded object-cover", alt: "" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium truncate", children: localName(c.item.name, c.item.name_i18n, lang) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: money(unit, restaurant.currency) })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setCart((cs) => cs.map((x) => x.id === c.id ? {
                      ...x,
                      qty: Math.max(1, x.qty - 1)
                    } : x)), className: "h-7 w-7 rounded-full border grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { className: "h-3 w-3" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-6 text-center text-sm", children: c.qty }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setCart((cs) => cs.map((x) => x.id === c.id ? {
                      ...x,
                      qty: x.qty + 1
                    } : x)), className: "h-7 w-7 rounded-full border grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3 w-3" }) })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setCart((cs) => cs.filter((x) => x.id !== c.id)), className: "h-7 w-7 rounded-full grid place-items-center text-muted-foreground hover:text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
                ] }, c.id);
              }) }),
              suggestionItems.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground mb-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5 text-ember" }),
                  t.suggestions
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 overflow-x-auto -mx-1 px-1 pb-1", children: suggestionItems.map((si) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => addToCart(si, 1), className: "flex-shrink-0 w-36 border rounded-xl overflow-hidden bg-card text-left hover:border-ember/40", children: [
                  si.image_url && /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: si.image_url, alt: "", className: "w-full h-20 object-cover" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-medium line-clamp-1", children: localName(si.name, si.name_i18n, lang) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-ember font-semibold mt-0.5", children: money(priceFor(si, customerType), restaurant.currency) })
                  ] })
                ] }, si.id)) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center justify-between text-lg font-display", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t.total }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: money(cartTotal, restaurant.currency) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "lg", disabled: sending, className: "w-full mt-4 bg-ember hover:bg-ember/90 text-ember-foreground", onClick: sendOrder, children: sending ? "…" : t.send })
            ] }) })
          ] })
        ] })
      ] })
    ] }),
    activeItem && /* @__PURE__ */ jsxRuntimeExports.jsx(ItemSheet, { item: activeItem, onClose: () => setActiveItem(null), onAdd: addToCart, lang, currency: restaurant.currency, customerType, t })
  ] });
}
function OrderTrackingCard({
  order,
  items,
  lang
}) {
  const steps = lang === "az" ? [{
    k: "pending",
    label: "Qəbul olundu"
  }, {
    k: "confirmed",
    label: "Təsdiqləndi"
  }, {
    k: "preparing",
    label: "Hazırlanır"
  }, {
    k: "ready",
    label: "Hazırdır"
  }, {
    k: "served",
    label: "Verildi"
  }] : lang === "ru" ? [{
    k: "pending",
    label: "Принят"
  }, {
    k: "confirmed",
    label: "Подтверждён"
  }, {
    k: "preparing",
    label: "Готовится"
  }, {
    k: "ready",
    label: "Готов"
  }, {
    k: "served",
    label: "Подан"
  }] : [{
    k: "pending",
    label: "Received"
  }, {
    k: "confirmed",
    label: "Confirmed"
  }, {
    k: "preparing",
    label: "Preparing"
  }, {
    k: "ready",
    label: "Ready"
  }, {
    k: "served",
    label: "Served"
  }];
  const idx = Math.max(0, steps.findIndex((s) => s.k === order.status));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-ember/5 border-b border-ember/20 p-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs uppercase tracking-wider text-ember", children: [
          "#",
          shortOrder(order.id)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-0.5 flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3" }),
          " ",
          minsAgoIso(order.created_at),
          "m"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] uppercase font-medium tracking-wider bg-background border rounded-full px-2.5 py-1", children: order.status })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 space-y-1.5", children: [
      steps.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center gap-3 ${i > idx ? "opacity-40" : ""}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-5 w-5 rounded-full grid place-items-center text-[10px] ${i < idx ? "bg-sage text-white" : i === idx ? "bg-ember text-ember-foreground animate-pulse" : "bg-muted"}`, children: i < idx ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3 w-3" }) : i + 1 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: s.label })
      ] }, s.k)),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-3 mt-2 border-t", children: order.items.map((it) => {
        const mi = items.find((x) => x.id === it.menu_item_id);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs", children: [
          it.quantity,
          "× ",
          localName(mi?.name, mi?.name_i18n, lang) || "—"
        ] }, it.id);
      }) })
    ] })
  ] });
}
function ItemSheet({
  item,
  onClose,
  onAdd,
  lang,
  currency,
  customerType,
  t
}) {
  const [qty, setQty] = reactExports.useState(1);
  const [note, setNote] = reactExports.useState("");
  const unit = priceFor(item, customerType);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Sheet, { open: true, onOpenChange: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetContent, { side: "bottom", className: "rounded-t-2xl max-h-[90vh] overflow-y-auto p-0", children: [
    item.image_url && /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: item.image_url, className: "w-full h-48 object-cover", alt: "" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SheetHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SheetTitle, { className: "font-display text-2xl", children: localName(item.name, item.name_i18n, lang) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: localName(item.description, item.description_i18n, lang) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-sm", children: t.note }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: note, onChange: (e) => setNote(e.target.value), placeholder: t.notePlaceholder, className: "mt-1 w-full p-2 rounded border bg-card text-sm" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 border rounded-full p-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setQty((q) => Math.max(1, q - 1)), className: "h-8 w-8 rounded-full grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { className: "h-3 w-3" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-6 text-center", children: qty }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setQty((q) => q + 1), className: "h-8 w-8 rounded-full grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3 w-3" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "flex-1 bg-ember hover:bg-ember/90 text-ember-foreground", onClick: () => onAdd(item, qty, note), children: [
          t.addToCart,
          " · ",
          money(unit * qty, currency)
        ] })
      ] })
    ] })
  ] }) });
}
export {
  CustomerMenu as component
};
