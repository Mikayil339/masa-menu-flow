import { createFileRoute, useParams } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useMemo, useEffect } from "react";
import { ShoppingBag, Search, Bell, Receipt, Plus, Minus, Check, Clock, Hand, Droplet, Trash2, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { customerSessionId, fetchMenu, localName, money, minsAgoIso, shortOrder, type CategoryRow, type MenuItemRow, type OrderBundle, type RestaurantRow, type TableRow } from "@/lib/masaqr";
import type { Lang } from "@/lib/store";

export const Route = createFileRoute("/m/$slug/$table")({
  head: () => ({ meta: [{ title: "Menu — MasaQR" }] }),
  component: CustomerMenu,
});

type CartLine = { id: string; item: MenuItemRow; qty: number; note?: string };

function CustomerMenu() {
  const { slug, table } = useParams({ from: "/m/$slug/$table" });
  const [restaurant, setRestaurant] = useState<RestaurantRow | null>(null);
  const [tableObj, setTableObj] = useState<TableRow | null>(null);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [items, setItems] = useState<MenuItemRow[]>([]);
  const [orders, setOrders] = useState<OrderBundle[]>([]);
  const [lang, setLang] = useState<Lang>("az");
  const [activeCat, setActiveCat] = useState<string | undefined>();
  const [q, setQ] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [activeItem, setActiveItem] = useState<MenuItemRow | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetTab, setSheetTab] = useState<"cart" | "status">("cart");
  const sessionId = useMemo(() => customerSessionId(), []);

  async function load() {
    try {
      const { data: r, error: rErr } = await supabase.from("masaqr_restaurants").select("*").eq("slug", slug).eq("is_active", true).maybeSingle();
      if (rErr) throw rErr;
      if (!r) return;
      const restaurantRow = r as RestaurantRow;
      setRestaurant(restaurantRow);
      setLang(current => current || restaurantRow.default_language || "az");
      const { data: t, error: tErr } = await supabase
        .from("masaqr_tables")
        .select("*")
        .eq("restaurant_id", restaurantRow.id)
        .or(`table_number.eq.${table},qr_token.eq.${table}`)
        .maybeSingle();
      if (tErr) throw tErr;
      setTableObj((t ?? null) as TableRow | null);
      const menu = await fetchMenu(restaurantRow.id);
      setCategories(menu.categories);
      setItems(menu.items.filter(i => i.is_available && !i.is_sold_out));
      setActiveCat(current => current ?? menu.categories[0]?.id);
      await supabase.from("masaqr_activity_logs").insert({ restaurant_id: restaurantRow.id, branch_id: (t as any)?.branch_id ?? null, table_id: (t as any)?.id ?? null, event_type: "menu_view", event_data: { slug, table, lang } });
      await loadOrders(restaurantRow.id);
    } catch (err: any) {
      toast.error(err.message ?? "Could not load menu");
    }
  }

  async function loadOrders(restaurantId = restaurant?.id) {
    if (!restaurantId) return;
    const { data: rows, error } = await supabase
      .from("masaqr_orders")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .eq("customer_session_id", sessionId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    const orderRows = (rows ?? []) as any[];
    if (!orderRows.length) { setOrders([]); return; }
    const { data: orderItems } = await supabase.from("masaqr_order_items").select("*").in("order_id", orderRows.map(o => o.id));
    setOrders(orderRows.map(o => ({ ...o, items: (orderItems ?? []).filter((i: any) => i.order_id === o.id), table: tableObj })) as OrderBundle[]);
  }

  useEffect(() => { load(); }, [slug, table]);
  useEffect(() => {
    if (!restaurant?.id) return;
    const channel = supabase.channel("customer-order-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "masaqr_orders" }, () => loadOrders())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [restaurant?.id, sessionId, tableObj?.id]);

  const activeOrders = orders.filter(o => !["served", "cancelled"].includes(o.status));
  const hasActive = activeOrders.length > 0;
  const visible = useMemo(() => items.filter(i => i.category_id === activeCat && (!q || localName(i.name, i.name_i18n, lang).toLowerCase().includes(q.toLowerCase()))), [items, activeCat, q, lang]);
  const cartTotal = cart.reduce((s, c) => s + c.qty * Number(c.item.price ?? 0), 0);
  const cartCount = cart.reduce((s, c) => s + c.qty, 0);

  const addToCart = (item: MenuItemRow, qty: number, note?: string) => {
    setCart(c => [...c, { id: Math.random().toString(36).slice(2, 8), item, qty, note }]);
    toast.success(`${localName(item.name, item.name_i18n, lang)} added to cart`);
    setActiveItem(null);
  };

  async function sendOrder() {
    if (!restaurant || !tableObj || cart.length === 0) return;
    try {
      const { data: order, error: orderError } = await supabase.from("masaqr_orders").insert({
        restaurant_id: restaurant.id,
        branch_id: tableObj.branch_id,
        table_id: tableObj.id,
        customer_session_id: sessionId,
        status: "pending",
        total: cartTotal,
      }).select("id").single();
      if (orderError || !order) throw orderError ?? new Error("Order was not created");
      const rows = cart.map(c => ({ order_id: order.id, menu_item_id: c.item.id, quantity: c.qty, unit_price: Number(c.item.price ?? 0), total_price: c.qty * Number(c.item.price ?? 0), note: c.note || null, selected_modifiers: [] }));
      const { error: itemError } = await supabase.from("masaqr_order_items").insert(rows);
      if (itemError) throw itemError;
      setCart([]);
      setSheetTab("status");
      toast.success(hasActive ? "Additional order sent" : "Order sent");
      await loadOrders();
    } catch (err: any) {
      toast.error(err.message ?? "Could not send order");
    }
  }

  if (!restaurant) return <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">Loading menu…</div>;

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="relative h-44 overflow-hidden">
        {restaurant.cover_url && <img src={restaurant.cover_url} className="absolute inset-0 w-full h-full object-cover" alt="" />}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/95 via-foreground/40 to-transparent" />
        <div className="absolute inset-0 p-5 flex flex-col justify-end text-background">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {restaurant.logo_url && <img src={restaurant.logo_url} alt="" className="h-12 w-12 rounded-full object-cover ring-2 ring-background/40" />}
              <div><div className="text-xs uppercase tracking-widest opacity-70">{tableObj?.table_name ?? `Table ${tableObj?.table_number ?? table}`} · Welcome</div><h1 className="font-display text-3xl">{restaurant.name}</h1></div>
            </div>
            <div className="flex gap-1">{(["az", "en", "ru"] as Lang[]).map(l => <button key={l} onClick={() => setLang(l)} className={`text-[10px] uppercase px-2 py-1 rounded-full ${lang === l ? "bg-ember text-ember-foreground" : "bg-background/20 text-background"}`}>{l}</button>)}</div>
          </div>
        </div>
      </header>

      {hasActive && <button onClick={() => { setSheetTab("status"); setSheetOpen(true); }} className="w-full bg-ember/10 border-y border-ember/30 px-4 py-2.5 flex items-center justify-between text-sm text-left"><div className="flex items-center gap-2"><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ember opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-ember" /></span><span className="font-medium">{activeOrders.length} active order{activeOrders.length > 1 ? "s" : ""} · #{shortOrder(activeOrders[0].id)}</span></div><span className="text-xs text-ember font-medium">Track →</span></button>}

      <div className="sticky top-0 z-30 glass border-b">
        <div className="p-3"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search the menu…" className="w-full pl-9 pr-3 py-2 rounded-full border bg-card text-sm" /></div></div>
        <div className="flex gap-1 px-3 pb-3 overflow-x-auto">{categories.map(c => <button key={c.id} onClick={() => setActiveCat(c.id)} className={`text-xs whitespace-nowrap px-3 py-1.5 rounded-full border ${activeCat === c.id ? "bg-foreground text-background border-foreground" : "bg-card"}`}>{localName(c.name, c.name_i18n, lang)}</button>)}</div>
      </div>

      <div className="p-3 space-y-3">
        {visible.map(item => <button key={item.id} onClick={() => setActiveItem(item)} className="w-full bg-card border rounded-2xl overflow-hidden flex text-left transition hover:border-ember/40"><div className="flex-1 p-4 min-w-0"><h3 className="font-medium mt-1">{localName(item.name, item.name_i18n, lang)}</h3><p className="text-xs text-muted-foreground line-clamp-2 mt-1">{localName(item.description, item.description_i18n, lang)}</p><div className="mt-2 flex items-center gap-2"><span className="text-ember font-semibold">{money(item.price, restaurant.currency)}</span></div></div>{item.image_url && <img src={item.image_url} alt="" className="h-28 w-28 object-cover flex-shrink-0" />}</button>)}
        {visible.length === 0 && <div className="text-center text-sm text-muted-foreground py-12">Nothing here.</div>}
      </div>

      <div className="fixed bottom-4 left-4 right-4 flex gap-2 z-40">
        <Sheet><SheetTrigger asChild><Button variant="outline" className="bg-card shadow-lg flex-1"><Bell className="h-4 w-4 mr-1.5" />Service</Button></SheetTrigger><SheetContent side="bottom" className="rounded-t-2xl"><SheetHeader><SheetTitle>How can we help?</SheetTitle></SheetHeader><div className="grid grid-cols-2 gap-2 mt-4"><Button variant="outline" onClick={async () => { if (restaurant && tableObj) await supabase.from("masaqr_waiter_requests").insert({ restaurant_id: restaurant.id, branch_id: tableObj.branch_id, table_id: tableObj.id, type: "waiter", status: "open" }); toast.success("Waiter on the way"); }}><Hand className="h-4 w-4 mr-2" />Call waiter</Button><Button variant="outline" onClick={async () => { if (restaurant && tableObj) await supabase.from("masaqr_waiter_requests").insert({ restaurant_id: restaurant.id, branch_id: tableObj.branch_id, table_id: tableObj.id, type: "water", status: "open" }); toast.success("Request sent"); }}><Droplet className="h-4 w-4 mr-2" />Water / napkins</Button><Button variant="outline" className="col-span-2" onClick={async () => { if (restaurant && tableObj) await supabase.from("masaqr_waiter_requests").insert({ restaurant_id: restaurant.id, branch_id: tableObj.branch_id, table_id: tableObj.id, type: "bill", status: "open" }); toast.success("Bill requested"); }}><Receipt className="h-4 w-4 mr-2" />Ask for bill</Button><p className="text-xs text-muted-foreground col-span-2 text-center">Paid outside platform — your server will bring the terminal.</p></div></SheetContent></Sheet>

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}><SheetTrigger asChild><Button className="bg-ember hover:bg-ember/90 text-ember-foreground flex-1 shadow-xl" onClick={() => setSheetTab(cart.length === 0 && hasActive ? "status" : "cart")}><ShoppingBag className="h-4 w-4 mr-1.5" />{hasActive ? "Order" : "Cart"}{cartCount > 0 && <span className="ml-1.5 bg-background text-ember rounded-full px-1.5 text-xs">{cartCount}</span>}</Button></SheetTrigger><SheetContent side="bottom" className="rounded-t-2xl max-h-[88vh] overflow-y-auto"><SheetHeader><SheetTitle>{tableObj?.table_name ?? `Table ${table}`}</SheetTitle></SheetHeader><Tabs value={sheetTab} onValueChange={v => setSheetTab(v as any)} className="mt-3"><TabsList className="w-full grid grid-cols-2"><TabsTrigger value="status" disabled={!hasActive}>Order status</TabsTrigger><TabsTrigger value="cart">Cart {cartCount > 0 && <span className="ml-1.5 text-[10px] bg-ember text-ember-foreground rounded-full px-1.5">{cartCount}</span>}</TabsTrigger></TabsList><TabsContent value="status" className="mt-4 space-y-4">{activeOrders.length === 0 ? <div className="text-center py-8 text-sm text-muted-foreground">No active orders yet.</div> : activeOrders.map(o => <OrderTrackingCard key={o.id} order={o} items={items} lang={lang} />)}<div className="pt-3 border-t"><Button variant="outline" className="w-full" onClick={() => setSheetTab("cart")}><PlusCircle className="h-4 w-4 mr-1.5" /> Add more items</Button></div></TabsContent><TabsContent value="cart" className="mt-4">{cart.length === 0 ? <div className="text-center py-10 text-sm text-muted-foreground">Cart is empty. Add something delicious.</div> : <><div className="space-y-2">{cart.map(c => <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg border">{c.item.image_url && <img src={c.item.image_url} className="h-12 w-12 rounded object-cover" alt="" />}<div className="flex-1 min-w-0"><div className="text-sm font-medium truncate">{localName(c.item.name, c.item.name_i18n, lang)}</div><div className="text-xs text-muted-foreground">{money(c.item.price, restaurant.currency)}</div></div><div className="flex items-center gap-1"><button onClick={() => setCart(cs => cs.map(x => x.id === c.id ? { ...x, qty: Math.max(1, x.qty - 1) } : x))} className="h-7 w-7 rounded-full border grid place-items-center"><Minus className="h-3 w-3" /></button><span className="w-6 text-center text-sm">{c.qty}</span><button onClick={() => setCart(cs => cs.map(x => x.id === c.id ? { ...x, qty: x.qty + 1 } : x))} className="h-7 w-7 rounded-full border grid place-items-center"><Plus className="h-3 w-3" /></button></div><button onClick={() => setCart(cs => cs.filter(x => x.id !== c.id))} className="h-7 w-7 rounded-full grid place-items-center text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button></div>)}</div><div className="mt-4 flex items-center justify-between text-lg font-display"><span>Total</span><span>{money(cartTotal, restaurant.currency)}</span></div><Button size="lg" className="w-full mt-4 bg-ember hover:bg-ember/90 text-ember-foreground" onClick={sendOrder}>Send order</Button></>}</TabsContent></Tabs></SheetContent></Sheet>
      </div>

      {activeItem && <ItemSheet item={activeItem} onClose={() => setActiveItem(null)} onAdd={addToCart} lang={lang} currency={restaurant.currency} />}
    </div>
  );
}

function OrderTrackingCard({ order, items, lang }: { order: OrderBundle; items: MenuItemRow[]; lang: Lang }) {
  const steps = [{ k: "pending", label: "Order received" }, { k: "confirmed", label: "Waiter confirmed" }, { k: "preparing", label: "Preparing" }, { k: "ready", label: "Ready" }, { k: "picked_up", label: "Picked up" }, { k: "served", label: "Served" }];
  const idx = Math.max(0, steps.findIndex(s => s.k === order.status));
  return <div className="rounded-xl border bg-card overflow-hidden"><div className="bg-ember/5 border-b border-ember/20 p-4"><div className="flex items-center justify-between"><div><div className="text-xs uppercase tracking-wider text-ember">Order #{shortOrder(order.id)}</div><div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1"><Clock className="h-3 w-3" /> {minsAgoIso(order.created_at)}m ago</div></div><span className="text-[10px] uppercase font-medium tracking-wider bg-background border rounded-full px-2.5 py-1">{order.status}</span></div></div><div className="p-4 space-y-1.5">{steps.map((s, i) => <div key={s.k} className={`flex items-center gap-3 ${i > idx ? "opacity-40" : ""}`}><div className={`h-5 w-5 rounded-full grid place-items-center text-[10px] ${i < idx ? "bg-sage text-white" : i === idx ? "bg-ember text-ember-foreground animate-pulse" : "bg-muted"}`}>{i < idx ? <Check className="h-3 w-3" /> : i + 1}</div><span className="text-sm">{s.label}</span></div>)}<div className="pt-3 mt-2 border-t"><div className="text-[10px] uppercase text-muted-foreground tracking-wider mb-1">Items</div>{order.items.map(it => { const mi = items.find(x => x.id === it.menu_item_id); return <div key={it.id} className="text-xs">{it.quantity}× {localName(mi?.name, mi?.name_i18n, lang) || "Menu item"}</div>; })}</div></div></div>;
}

function ItemSheet({ item, onClose, onAdd, lang, currency }: { item: MenuItemRow; onClose: () => void; onAdd: (item: MenuItemRow, qty: number, note?: string) => void; lang: Lang; currency: string }) {
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  return <Sheet open onOpenChange={onClose}><SheetContent side="bottom" className="rounded-t-2xl max-h-[90vh] overflow-y-auto p-0">{item.image_url && <img src={item.image_url} className="w-full h-48 object-cover" alt="" />}<div className="p-5"><SheetHeader><SheetTitle className="font-display text-2xl">{localName(item.name, item.name_i18n, lang)}</SheetTitle></SheetHeader><p className="text-sm text-muted-foreground mt-1">{localName(item.description, item.description_i18n, lang)}</p><div className="mt-5"><div className="font-medium text-sm">Note for the kitchen</div><input value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. no onions" className="mt-1 w-full p-2 rounded border bg-card text-sm" /></div><div className="mt-6 flex items-center gap-3"><div className="flex items-center gap-2 border rounded-full p-1"><button onClick={() => setQty(q => Math.max(1, q - 1))} className="h-8 w-8 rounded-full grid place-items-center"><Minus className="h-3 w-3" /></button><span className="w-6 text-center">{qty}</span><button onClick={() => setQty(q => q + 1)} className="h-8 w-8 rounded-full grid place-items-center"><Plus className="h-3 w-3" /></button></div><Button className="flex-1 bg-ember hover:bg-ember/90 text-ember-foreground" onClick={() => onAdd(item, qty, note)}>Add to cart · {money(Number(item.price) * qty, currency)}</Button></div></div></SheetContent></Sheet>;
}
