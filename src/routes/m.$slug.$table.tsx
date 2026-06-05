import { createFileRoute, useParams, useSearch } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useMemo, useEffect, useCallback } from "react";
import { ShoppingBag, Search, Bell, Receipt, Plus, Minus, Check, Clock, Hand, Droplet, Trash2, PlusCircle, Wifi, Phone, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import {
  customerSessionId,
  fetchMenu,
  fetchSuggestionsFor,
  localName,
  money,
  minsAgoIso,
  openOrGetSession,
  priceFor,
  resolveInitialWaiter,
  shortOrder,
  type CategoryRow,
  type CustomerType,
  type MenuItemRow,
  type OrderBundle,
  type RestaurantRow,
  type SuggestionRow,
  type TableRow,
} from "@/lib/masaqr";
import type { Lang } from "@/lib/store";

type Search = { type?: CustomerType; lang?: Lang };

export const Route = createFileRoute("/m/$slug/$table")({
  head: () => ({ meta: [{ title: "Menyu — MasaQR" }] }),
  validateSearch: (s: Record<string, unknown>): Search => ({
    type: s.type === "foreign" ? "foreign" : s.type === "local" ? "local" : undefined,
    lang: (["az", "en", "ru"] as const).includes(s.lang as any) ? (s.lang as Lang) : undefined,
  }),
  component: CustomerMenu,
});

type CartLine = { id: string; item: MenuItemRow; qty: number; note?: string };

const UI: Record<Lang, Record<string, string>> = {
  az: { search: "Menyuda axtar…", empty: "Heç nə tapılmadı.", cart: "Səbət", order: "Sifariş", status: "Sifariş statusu", noActive: "Hələ aktiv sifarişin yoxdur.", addMore: "Əlavə sifariş ver", total: "Cəmi", send: "Sifariş ver", emptyCart: "Səbət boşdur. Bir şey əlavə et.", service: "Xidmət", callWaiter: "Ofisiant çağır", waterNapkin: "Su / salfet", askBill: "Hesab istə", help: "Sizə necə kömək edə bilərik?", paidNote: "Ödəniş platformadan kənar — ofisiant terminal gətirəcək.", added: "səbətə əlavə edildi", waiterOnWay: "Ofisiant gəlir", requestSent: "Sorğu göndərildi", billRequested: "Hesab tələb olundu", orderSent: "Sifariş göndərildi", extraOrderSent: "Əlavə sifariş göndərildi", note: "Mətbəx üçün qeyd", notePlaceholder: "məs. soğansız", addToCart: "Səbətə əlavə et", suggestions: "Bunu da bəyənə bilərsiniz", welcome: "Xoş gəlmisiniz", quantity: "Say", loading: "Menyu yüklənir…" },
  en: { search: "Search the menu…", empty: "Nothing here.", cart: "Cart", order: "Order", status: "Order status", noActive: "No active orders yet.", addMore: "Add more items", total: "Total", send: "Send order", emptyCart: "Cart is empty. Add something delicious.", service: "Service", callWaiter: "Call waiter", waterNapkin: "Water / napkins", askBill: "Ask for bill", help: "How can we help?", paidNote: "Paid outside platform — your server will bring the terminal.", added: "added to cart", waiterOnWay: "Waiter on the way", requestSent: "Request sent", billRequested: "Bill requested", orderSent: "Order sent", extraOrderSent: "Additional order sent", note: "Note for the kitchen", notePlaceholder: "e.g. no onions", addToCart: "Add to cart", suggestions: "You might also like", welcome: "Welcome", quantity: "Qty", loading: "Loading menu…" },
  ru: { search: "Поиск по меню…", empty: "Ничего не найдено.", cart: "Корзина", order: "Заказ", status: "Статус заказа", noActive: "Активных заказов пока нет.", addMore: "Добавить ещё", total: "Итого", send: "Отправить заказ", emptyCart: "Корзина пуста. Добавьте что-нибудь.", service: "Сервис", callWaiter: "Позвать официанта", waterNapkin: "Вода / салфетки", askBill: "Запросить счёт", help: "Чем можем помочь?", paidNote: "Оплата вне платформы — официант принесёт терминал.", added: "добавлено в корзину", waiterOnWay: "Официант идёт", requestSent: "Запрос отправлен", billRequested: "Счёт запрошен", orderSent: "Заказ отправлен", extraOrderSent: "Дополнительный заказ отправлен", note: "Заметка для кухни", notePlaceholder: "напр. без лука", addToCart: "В корзину", suggestions: "Вам также может понравиться", welcome: "Добро пожаловать", quantity: "Кол-во", loading: "Загрузка меню…" },
};

function CustomerMenu() {
  const { slug, table } = useParams({ from: "/m/$slug/$table" });
  const search = useSearch({ from: "/m/$slug/$table" });
  const customerType: CustomerType = search.type ?? "local";

  const [restaurant, setRestaurant] = useState<(RestaurantRow & { phone?: string; wifi_name?: string; wifi_password?: string; description?: string; description_i18n?: Record<string, string> | null; show_wifi_on_menu?: boolean; show_phone_on_menu?: boolean; waiter_assignment_mode?: string }) | null>(null);
  const [tableObj, setTableObj] = useState<TableRow | null>(null);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [items, setItems] = useState<MenuItemRow[]>([]);
  const [orders, setOrders] = useState<OrderBundle[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestionRow[]>([]);
  const [lang, setLang] = useState<Lang>(search.lang ?? "az");
  const [activeCat, setActiveCat] = useState<string | undefined>();
  const [q, setQ] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [activeItem, setActiveItem] = useState<MenuItemRow | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetTab, setSheetTab] = useState<"cart" | "status">("cart");
  const [sending, setSending] = useState(false);
  const sessionId = useMemo(() => customerSessionId(), []);
  const t = UI[lang];

  const loadOrders = useCallback(async (restaurantId?: string) => {
    const rid = restaurantId ?? restaurant?.id;
    if (!rid) return;
    const { data: rows } = await supabase
      .from("masaqr_orders")
      .select("*")
      .eq("restaurant_id", rid)
      .eq("customer_session_id", sessionId)
      .order("created_at", { ascending: false });
    const orderRows = (rows ?? []) as any[];
    if (!orderRows.length) { setOrders([]); return; }
    const { data: orderItems } = await supabase.from("masaqr_order_items").select("*").in("order_id", orderRows.map(o => o.id));
    setOrders(orderRows.map(o => ({ ...o, items: (orderItems ?? []).filter((i: any) => i.order_id === o.id), table: tableObj })) as OrderBundle[]);
  }, [restaurant?.id, sessionId, tableObj]);

  async function load() {
    try {
      const { data: r, error: rErr } = await supabase.from("masaqr_restaurants").select("*").eq("slug", slug).eq("is_active", true).maybeSingle();
      if (rErr) throw rErr;
      if (!r) return;
      const restaurantRow = r as any;
      setRestaurant(restaurantRow);
      if (!search.lang) setLang(restaurantRow.default_language || "az");
      const { data: tRow, error: tErr } = await supabase
        .from("masaqr_tables")
        .select("*")
        .eq("restaurant_id", restaurantRow.id)
        .or(`table_number.eq.${table},qr_token.eq.${table}`)
        .maybeSingle();
      if (tErr) throw tErr;
      setTableObj((tRow ?? null) as TableRow | null);
      const menu = await fetchMenu(restaurantRow.id);
      setCategories(menu.categories);
      setItems(menu.items.filter(i => i.is_available && !i.is_sold_out));
      setActiveCat(c => c ?? menu.categories[0]?.id);
      await supabase.from("masaqr_activity_logs").insert({ restaurant_id: restaurantRow.id, table_id: (tRow as any)?.id ?? null, event_type: "menu_view", event_data: { slug, table, lang, customer_type: customerType } }).then(() => {}, () => {});
      await loadOrders(restaurantRow.id);
    } catch (err: any) {
      toast.error(err.message ?? "Could not load menu");
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [slug, table]);

  useEffect(() => {
    if (!restaurant?.id) return;
    const channel = supabase.channel(`customer-${sessionId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "masaqr_orders", filter: `customer_session_id=eq.${sessionId}` }, () => loadOrders())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [restaurant?.id, sessionId, loadOrders]);

  // Load suggestions whenever cart changes (based on source items in cart)
  useEffect(() => {
    if (!restaurant?.id || cart.length === 0) { setSuggestions([]); return; }
    const sourceIds = [...new Set(cart.map(c => c.item.id))];
    fetchSuggestionsFor(restaurant.id, sourceIds).then(setSuggestions).catch(() => {});
  }, [restaurant?.id, cart]);

  const activeOrders = orders.filter(o => !["served", "cancelled"].includes(o.status));
  const hasActive = activeOrders.length > 0;
  const visible = useMemo(() => items.filter(i => i.category_id === activeCat && (!q || localName(i.name, i.name_i18n, lang).toLowerCase().includes(q.toLowerCase()))), [items, activeCat, q, lang]);
  const cartTotal = cart.reduce((s, c) => s + c.qty * priceFor(c.item, customerType), 0);
  const cartCount = cart.reduce((s, c) => s + c.qty, 0);

  const suggestionItems = useMemo(() => {
    if (!suggestions.length) return [] as MenuItemRow[];
    const inCart = new Set(cart.map(c => c.item.id));
    const ids = [...new Set(suggestions.map(s => s.suggested_item_id))].filter(id => !inCart.has(id));
    return ids.map(id => items.find(i => i.id === id)).filter((x): x is MenuItemRow => Boolean(x));
  }, [suggestions, items, cart]);

  const addToCart = (item: MenuItemRow, qty: number, note?: string) => {
    setCart(c => [...c, { id: Math.random().toString(36).slice(2, 8), item, qty, note }]);
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
        customerType,
      });

      const assignedWaiter = session.assigned_waiter_id ?? await resolveInitialWaiter({
        restaurantId: restaurant.id,
        tableId: tableObj.id,
        mode: (restaurant.waiter_assignment_mode as any) ?? "first_confirming_waiter",
      });

      const { data: order, error: orderError } = await supabase.from("masaqr_orders").insert({
        restaurant_id: restaurant.id,
        table_id: tableObj.id,
        customer_session_id: sessionId,
        session_id: session.id,
        assigned_waiter_id: assignedWaiter,
        customer_type: customerType,
        status: "pending",
        total: cartTotal,
      }).select("id").single();
      if (orderError || !order) throw orderError ?? new Error("Order was not created");
      const rows = cart.map(c => {
        const unit = priceFor(c.item, customerType);
        return { order_id: order.id, menu_item_id: c.item.id, quantity: c.qty, unit_price: unit, total_price: c.qty * unit, note: c.note || null, selected_modifiers: [] };
      });
      const { error: itemError } = await supabase.from("masaqr_order_items").insert(rows);
      if (itemError) throw itemError;

      // bump session total (best-effort)
      await supabase.from("masaqr_table_sessions").update({ total: Number(session.total ?? 0) + cartTotal, updated_at: new Date().toISOString() }).eq("id", session.id);

      setCart([]);
      setSheetTab("status");
      toast.success(hasActive ? t.extraOrderSent : t.orderSent);
      await loadOrders();
    } catch (err: any) {
      toast.error(err.message ?? "Could not send order");
    } finally {
      setSending(false);
    }
  }

  async function callRequest(type: "waiter" | "water" | "bill") {
    if (!restaurant || !tableObj) return;
    await supabase.from("masaqr_waiter_requests").insert({ restaurant_id: restaurant.id, table_id: tableObj.id, type, status: "open" });
    toast.success(type === "waiter" ? t.waiterOnWay : type === "bill" ? t.billRequested : t.requestSent);
  }

  if (!restaurant) return <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">{t.loading}</div>;

  const desc = localName(restaurant.description ?? null, (restaurant.description_i18n as any) ?? null, lang);

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="relative h-52 overflow-hidden">
        {restaurant.cover_url && <img src={restaurant.cover_url} className="absolute inset-0 w-full h-full object-cover" alt="" />}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/95 via-foreground/50 to-transparent" />
        <div className="absolute inset-0 p-5 flex flex-col justify-end text-background">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {restaurant.logo_url && <img src={restaurant.logo_url} alt="" className="h-14 w-14 rounded-full object-cover ring-2 ring-background/40 flex-shrink-0" />}
              <div className="min-w-0">
                <div className="text-xs uppercase tracking-widest opacity-70">{tableObj?.table_name ?? `${lang === "az" ? "Masa" : lang === "ru" ? "Столик" : "Table"} ${tableObj?.table_number ?? table}`} · {t.welcome}</div>
                <h1 className="font-display text-3xl truncate">{restaurant.name}</h1>
                {desc && <p className="text-xs opacity-80 mt-0.5 line-clamp-1">{desc}</p>}
              </div>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              {(["az", "en", "ru"] as Lang[]).map(l => <button key={l} onClick={() => setLang(l)} className={`text-[10px] uppercase px-2 py-1 rounded-full ${lang === l ? "bg-ember text-ember-foreground" : "bg-background/20 text-background"}`}>{l}</button>)}
            </div>
          </div>
          {(restaurant.show_phone_on_menu !== false && restaurant.phone) || (restaurant.show_wifi_on_menu !== false && restaurant.wifi_name) ? (
            <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
              {restaurant.show_phone_on_menu !== false && restaurant.phone && (
                <a href={`tel:${restaurant.phone}`} className="flex items-center gap-1 bg-background/15 backdrop-blur px-2.5 py-1 rounded-full">
                  <Phone className="h-3 w-3" />{restaurant.phone}
                </a>
              )}
              {restaurant.show_wifi_on_menu !== false && restaurant.wifi_name && (
                <span className="flex items-center gap-1 bg-background/15 backdrop-blur px-2.5 py-1 rounded-full">
                  <Wifi className="h-3 w-3" />{restaurant.wifi_name}{restaurant.wifi_password ? ` · ${restaurant.wifi_password}` : ""}
                </span>
              )}
            </div>
          ) : null}
        </div>
      </header>

      {hasActive && (
        <button onClick={() => { setSheetTab("status"); setSheetOpen(true); }} className="w-full bg-ember/10 border-y border-ember/30 px-4 py-2.5 flex items-center justify-between text-sm text-left">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ember opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-ember" />
            </span>
            <span className="font-medium">{activeOrders.length} · #{shortOrder(activeOrders[0].id)}</span>
          </div>
          <span className="text-xs text-ember font-medium">→</span>
        </button>
      )}

      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b">
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder={t.search} className="w-full pl-9 pr-3 py-2 rounded-full border bg-card text-sm" />
          </div>
        </div>
        <div className="flex gap-1 px-3 pb-3 overflow-x-auto">
          {categories.map(c => <button key={c.id} onClick={() => setActiveCat(c.id)} className={`text-xs whitespace-nowrap px-3 py-1.5 rounded-full border ${activeCat === c.id ? "bg-foreground text-background border-foreground" : "bg-card"}`}>{localName(c.name, c.name_i18n, lang)}</button>)}
        </div>
      </div>

      <div className="p-3 space-y-3">
        {visible.map(item => (
          <button key={item.id} onClick={() => setActiveItem(item)} className="w-full bg-card border rounded-2xl overflow-hidden flex text-left transition hover:border-ember/40">
            <div className="flex-1 p-4 min-w-0">
              <h3 className="font-medium mt-1">{localName(item.name, item.name_i18n, lang)}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{localName(item.description, item.description_i18n, lang)}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-ember font-semibold">{money(priceFor(item, customerType), restaurant.currency)}</span>
              </div>
            </div>
            {item.image_url && <img src={item.image_url} alt="" className="h-28 w-28 object-cover flex-shrink-0" />}
          </button>
        ))}
        {visible.length === 0 && <div className="text-center text-sm text-muted-foreground py-12">{t.empty}</div>}
      </div>

      <div className="fixed bottom-4 left-4 right-4 flex gap-2 z-40">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="bg-card shadow-lg flex-1"><Bell className="h-4 w-4 mr-1.5" />{t.service}</Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl">
            <SheetHeader><SheetTitle>{t.help}</SheetTitle></SheetHeader>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <Button variant="outline" onClick={() => callRequest("waiter")}><Hand className="h-4 w-4 mr-2" />{t.callWaiter}</Button>
              <Button variant="outline" onClick={() => callRequest("water")}><Droplet className="h-4 w-4 mr-2" />{t.waterNapkin}</Button>
              <Button variant="outline" className="col-span-2" onClick={() => callRequest("bill")}><Receipt className="h-4 w-4 mr-2" />{t.askBill}</Button>
              <p className="text-xs text-muted-foreground col-span-2 text-center">{t.paidNote}</p>
            </div>
          </SheetContent>
        </Sheet>

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button className="bg-ember hover:bg-ember/90 text-ember-foreground flex-1 shadow-xl" onClick={() => setSheetTab(cart.length === 0 && hasActive ? "status" : "cart")}>
              <ShoppingBag className="h-4 w-4 mr-1.5" />{hasActive ? t.order : t.cart}
              {cartCount > 0 && <span className="ml-1.5 bg-background text-ember rounded-full px-1.5 text-xs">{cartCount}</span>}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl max-h-[88vh] overflow-y-auto">
            <SheetHeader><SheetTitle>{tableObj?.table_name ?? `${lang === "az" ? "Masa" : lang === "ru" ? "Столик" : "Table"} ${table}`}</SheetTitle></SheetHeader>
            <Tabs value={sheetTab} onValueChange={v => setSheetTab(v as any)} className="mt-3">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="status" disabled={!hasActive}>{t.status}</TabsTrigger>
                <TabsTrigger value="cart">{t.cart} {cartCount > 0 && <span className="ml-1.5 text-[10px] bg-ember text-ember-foreground rounded-full px-1.5">{cartCount}</span>}</TabsTrigger>
              </TabsList>
              <TabsContent value="status" className="mt-4 space-y-4">
                {activeOrders.length === 0 ? <div className="text-center py-8 text-sm text-muted-foreground">{t.noActive}</div> : activeOrders.map(o => <OrderTrackingCard key={o.id} order={o} items={items} lang={lang} />)}
                <div className="pt-3 border-t"><Button variant="outline" className="w-full" onClick={() => setSheetTab("cart")}><PlusCircle className="h-4 w-4 mr-1.5" /> {t.addMore}</Button></div>
              </TabsContent>
              <TabsContent value="cart" className="mt-4">
                {cart.length === 0 ? <div className="text-center py-10 text-sm text-muted-foreground">{t.emptyCart}</div> : (
                  <>
                    <div className="space-y-2">
                      {cart.map(c => {
                        const unit = priceFor(c.item, customerType);
                        return (
                          <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg border">
                            {c.item.image_url && <img src={c.item.image_url} className="h-12 w-12 rounded object-cover" alt="" />}
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">{localName(c.item.name, c.item.name_i18n, lang)}</div>
                              <div className="text-xs text-muted-foreground">{money(unit, restaurant.currency)}</div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button onClick={() => setCart(cs => cs.map(x => x.id === c.id ? { ...x, qty: Math.max(1, x.qty - 1) } : x))} className="h-7 w-7 rounded-full border grid place-items-center"><Minus className="h-3 w-3" /></button>
                              <span className="w-6 text-center text-sm">{c.qty}</span>
                              <button onClick={() => setCart(cs => cs.map(x => x.id === c.id ? { ...x, qty: x.qty + 1 } : x))} className="h-7 w-7 rounded-full border grid place-items-center"><Plus className="h-3 w-3" /></button>
                            </div>
                            <button onClick={() => setCart(cs => cs.filter(x => x.id !== c.id))} className="h-7 w-7 rounded-full grid place-items-center text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                          </div>
                        );
                      })}
                    </div>

                    {suggestionItems.length > 0 && (
                      <div className="mt-5">
                        <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground mb-2">
                          <Sparkles className="h-3.5 w-3.5 text-ember" />{t.suggestions}
                        </div>
                        <div className="flex gap-2 overflow-x-auto -mx-1 px-1 pb-1">
                          {suggestionItems.map(si => (
                            <button key={si.id} onClick={() => addToCart(si, 1)} className="flex-shrink-0 w-36 border rounded-xl overflow-hidden bg-card text-left hover:border-ember/40">
                              {si.image_url && <img src={si.image_url} alt="" className="w-full h-20 object-cover" />}
                              <div className="p-2">
                                <div className="text-xs font-medium line-clamp-1">{localName(si.name, si.name_i18n, lang)}</div>
                                <div className="text-[11px] text-ember font-semibold mt-0.5">{money(priceFor(si, customerType), restaurant.currency)}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between text-lg font-display"><span>{t.total}</span><span>{money(cartTotal, restaurant.currency)}</span></div>
                    <Button size="lg" disabled={sending} className="w-full mt-4 bg-ember hover:bg-ember/90 text-ember-foreground" onClick={sendOrder}>{sending ? "…" : t.send}</Button>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </SheetContent>
        </Sheet>
      </div>

      {activeItem && <ItemSheet item={activeItem} onClose={() => setActiveItem(null)} onAdd={addToCart} lang={lang} currency={restaurant.currency} customerType={customerType} t={t} />}
    </div>
  );
}

function OrderTrackingCard({ order, items, lang }: { order: OrderBundle; items: MenuItemRow[]; lang: Lang }) {
  const steps = lang === "az"
    ? [{ k: "pending", label: "Qəbul olundu" }, { k: "confirmed", label: "Təsdiqləndi" }, { k: "preparing", label: "Hazırlanır" }, { k: "ready", label: "Hazırdır" }, { k: "served", label: "Verildi" }]
    : lang === "ru"
    ? [{ k: "pending", label: "Принят" }, { k: "confirmed", label: "Подтверждён" }, { k: "preparing", label: "Готовится" }, { k: "ready", label: "Готов" }, { k: "served", label: "Подан" }]
    : [{ k: "pending", label: "Received" }, { k: "confirmed", label: "Confirmed" }, { k: "preparing", label: "Preparing" }, { k: "ready", label: "Ready" }, { k: "served", label: "Served" }];
  const idx = Math.max(0, steps.findIndex(s => s.k === order.status));
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="bg-ember/5 border-b border-ember/20 p-4 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-ember">#{shortOrder(order.id)}</div>
          <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1"><Clock className="h-3 w-3" /> {minsAgoIso(order.created_at)}m</div>
        </div>
        <span className="text-[10px] uppercase font-medium tracking-wider bg-background border rounded-full px-2.5 py-1">{order.status}</span>
      </div>
      <div className="p-4 space-y-1.5">
        {steps.map((s, i) => (
          <div key={s.k} className={`flex items-center gap-3 ${i > idx ? "opacity-40" : ""}`}>
            <div className={`h-5 w-5 rounded-full grid place-items-center text-[10px] ${i < idx ? "bg-sage text-white" : i === idx ? "bg-ember text-ember-foreground animate-pulse" : "bg-muted"}`}>{i < idx ? <Check className="h-3 w-3" /> : i + 1}</div>
            <span className="text-sm">{s.label}</span>
          </div>
        ))}
        <div className="pt-3 mt-2 border-t">
          {order.items.map(it => {
            const mi = items.find(x => x.id === it.menu_item_id);
            return <div key={it.id} className="text-xs">{it.quantity}× {localName(mi?.name, mi?.name_i18n, lang) || "—"}</div>;
          })}
        </div>
      </div>
    </div>
  );
}

function ItemSheet({ item, onClose, onAdd, lang, currency, customerType, t }: { item: MenuItemRow; onClose: () => void; onAdd: (item: MenuItemRow, qty: number, note?: string) => void; lang: Lang; currency: string; customerType: CustomerType; t: Record<string, string> }) {
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const unit = priceFor(item, customerType);
  return (
    <Sheet open onOpenChange={onClose}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[90vh] overflow-y-auto p-0">
        {item.image_url && <img src={item.image_url} className="w-full h-48 object-cover" alt="" />}
        <div className="p-5">
          <SheetHeader><SheetTitle className="font-display text-2xl">{localName(item.name, item.name_i18n, lang)}</SheetTitle></SheetHeader>
          <p className="text-sm text-muted-foreground mt-1">{localName(item.description, item.description_i18n, lang)}</p>
          <div className="mt-5">
            <div className="font-medium text-sm">{t.note}</div>
            <input value={note} onChange={e => setNote(e.target.value)} placeholder={t.notePlaceholder} className="mt-1 w-full p-2 rounded border bg-card text-sm" />
          </div>
          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center gap-2 border rounded-full p-1">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="h-8 w-8 rounded-full grid place-items-center"><Minus className="h-3 w-3" /></button>
              <span className="w-6 text-center">{qty}</span>
              <button onClick={() => setQty(q => q + 1)} className="h-8 w-8 rounded-full grid place-items-center"><Plus className="h-3 w-3" /></button>
            </div>
            <Button className="flex-1 bg-ember hover:bg-ember/90 text-ember-foreground" onClick={() => onAdd(item, qty, note)}>{t.addToCart} · {money(unit * qty, currency)}</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
