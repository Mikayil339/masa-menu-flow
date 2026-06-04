import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useMemo, useState } from "react";
import { Search, Filter, Receipt, LayoutList, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { fetchMenu, fetchOrders, fetchOwnerContext, localName, money, minsAgoIso, shortOrder, updateOrderStatus, closeSession, type MenuItemRow, type OrderBundle, type Profile, type RestaurantRow, type TableSessionRow } from "@/lib/masaqr";

export const Route = createFileRoute("/app/orders")({
  head: () => ({ meta: [{ title: "Sifarişlər və Sessiyalar — MasaQR" }] }),
  component: Orders,
});

const STATUSES = ["pending", "confirmed", "preparing", "ready", "picked_up", "served", "cancelled"] as const;

type ViewMode = "orders" | "sessions";

function Orders() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [restaurant, setRestaurant] = useState<RestaurantRow | null>(null);
  const [orders, setOrders] = useState<OrderBundle[]>([]);
  const [items, setItems] = useState<MenuItemRow[]>([]);
  const [sessions, setSessions] = useState<TableSessionRow[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<string | "all">("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>("orders");
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const ctx = await fetchOwnerContext();
      setProfile(ctx.profile);
      setRestaurant(ctx.restaurant);
      if (!ctx.profile?.restaurant_id) return;
      const rid = ctx.profile.restaurant_id;
      const [orderRows, menuRows, sessRes, tableRes] = await Promise.all([
        fetchOrders(rid),
        fetchMenu(rid),
        supabase.from("masaqr_table_sessions").select("*").eq("restaurant_id", rid).eq("status", "open").order("opened_at", { ascending: false }),
        supabase.from("masaqr_tables").select("*").eq("restaurant_id", rid),
      ]);
      setOrders(orderRows);
      setItems(menuRows.items);
      setSessions((sessRes.data ?? []) as TableSessionRow[]);
      setTables(tableRes.data ?? []);
      setSelected(c => c ?? orderRows[0]?.id ?? null);
    } catch (err: any) {
      toast.error(err.message ?? "Yüklənmədi");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const channel = supabase.channel("orders-page-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "masaqr_orders" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "masaqr_order_items" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "masaqr_table_sessions" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const filtered = useMemo(() => orders.filter(o => {
    const code = shortOrder(o.id).toLowerCase();
    if (filter !== "all" && o.status !== filter) return false;
    if (q && !code.includes(q.toLowerCase())) return false;
    return true;
  }), [orders, filter, q]);
  const order = orders.find(o => o.id === selected) ?? filtered[0];

  async function setStatus(o: OrderBundle, status: string) {
    try { await updateOrderStatus(o, status, profile?.id); toast.success(`Status: ${status}`); await load(); }
    catch (err: any) { toast.error(err.message ?? "Status yenilənmədi"); }
  }

  function itemName(id: string) {
    const it = items.find(x => x.id === id);
    return localName(it?.name, it?.name_i18n, restaurant?.default_language ?? "az") || "Məhsul";
  }

  function tableLabel(tableId: string | null) {
    const t = tables.find(x => x.id === tableId);
    return t ? (t.table_name ?? `Masa ${t.table_number}`) : "—";
  }

  async function handleClose(sessionId: string) {
    try {
      await closeSession(sessionId, profile?.id ?? null);
      toast.success("Sessiya bağlandı");
      setSelectedSession(null);
      load();
    } catch (e: any) { toast.error(e.message ?? "Bağlamaq alınmadı"); }
  }

  const activeSession = sessions.find(s => s.id === selectedSession) ?? sessions[0];
  const sessionOrders = activeSession ? orders.filter(o => (o as any).session_id === activeSession.id) : [];
  const sessionTotal = sessionOrders.filter(o => o.status !== "cancelled").reduce((s, o) => s + Number(o.total ?? 0), 0);

  if (loading) return <div className="p-6 md:p-10 text-sm text-muted-foreground">Yüklənir…</div>;

  return (
    <div className="p-6 md:p-10">
      <PageHeader
        title="Sifarişlər və Sessiyalar"
        subtitle="Bütün sifarişlər və açıq masa sessiyaları."
        actions={
          <div className="flex gap-2">
            <Button variant={view === "orders" ? "default" : "outline"} onClick={() => setView("orders")}><LayoutList className="mr-2 h-4 w-4" />Sifarişlər</Button>
            <Button variant={view === "sessions" ? "default" : "outline"} onClick={() => setView("sessions")}><Receipt className="mr-2 h-4 w-4" />Sessiyalar ({sessions.length})</Button>
          </div>
        }
      />

      {view === "orders" ? (
        <>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Sifariş kodu axtar…" className="pl-9" />
            </div>
            <div className="flex items-center gap-1 ml-auto overflow-x-auto">
              <Filter className="h-4 w-4 text-muted-foreground" />
              {(["all", ...STATUSES] as const).map(s => (
                <button key={s} onClick={() => setFilter(s)} className={`text-xs px-2.5 py-1 rounded-md border ${filter === s ? "bg-foreground text-background border-foreground" : "bg-card hover:bg-muted"}`}>{s}</button>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr_400px] gap-4">
            <Card className="p-0 overflow-hidden">
              <div className="grid grid-cols-[90px_1fr_100px_120px_90px] gap-3 px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground border-b bg-muted/40">
                <div>Kod</div><div>Məhsullar</div><div>Masa</div><div>Status</div><div>Vaxt</div>
              </div>
              <div>
                {filtered.map(o => (
                  <button key={o.id} onClick={() => setSelected(o.id)} className={`w-full grid grid-cols-[90px_1fr_100px_120px_90px] gap-3 px-4 py-3 text-left border-b last:border-0 hover:bg-muted/40 ${selected === o.id ? "bg-ember/5" : ""}`}>
                    <div className="font-mono text-sm font-bold">{shortOrder(o.id)}</div>
                    <div className="min-w-0 text-sm truncate">{o.items.map(i => `${i.quantity}× ${itemName(i.menu_item_id)}`).join(", ") || "—"}</div>
                    <div className="text-sm">{o.table?.table_name ?? `M${o.table?.table_number ?? "?"}`}</div>
                    <div><span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded bg-background border">{o.status}</span></div>
                    <div className="text-sm text-muted-foreground">{minsAgoIso(o.created_at)}d</div>
                  </button>
                ))}
                {filtered.length === 0 && <div className="text-sm text-muted-foreground text-center py-12">Sifariş yoxdur.</div>}
              </div>
            </Card>

            {order && (
              <Card className="p-5 h-fit sticky top-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">Sifariş</div>
                    <h2 className="font-display text-2xl">{shortOrder(order.id)}</h2>
                    <div className="text-xs text-muted-foreground mt-1">{order.table?.table_name ?? `Masa ${order.table?.table_number ?? "?"}`} · {minsAgoIso(order.created_at)}d əvvəl</div>
                  </div>
                  <span className="text-xs uppercase tracking-wider px-2 py-1 rounded bg-muted border">{order.status}</span>
                </div>
                <div className="mt-5 space-y-3">
                  {order.items.map(it => (
                    <div key={it.id} className="flex justify-between gap-3 border-b pb-3 last:border-0">
                      <div>
                        <div className="text-sm font-medium">{it.quantity}× {itemName(it.menu_item_id)}</div>
                        {it.note && <div className="text-xs text-muted-foreground italic">{it.note}</div>}
                      </div>
                      <div className="text-sm font-medium">{money(it.total_price, restaurant?.currency ?? "AZN")}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t flex items-center justify-between font-display text-xl"><span>Cəmi</span><span>{money(order.total, restaurant?.currency ?? "AZN")}</span></div>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  {order.status === "pending" && <Button onClick={() => setStatus(order, "confirmed")} className="col-span-2 bg-ember text-ember-foreground hover:bg-ember/90">Təsdiqlə</Button>}
                  {order.status === "confirmed" && <Button onClick={() => setStatus(order, "served")} className="col-span-2 bg-sage text-white hover:bg-sage/90">Verildi</Button>}
                  {!["served", "cancelled"].includes(order.status) && <Button variant="outline" onClick={() => setStatus(order, "cancelled")} className="col-span-2">Ləğv et</Button>}
                </div>
              </Card>
            )}
          </div>
        </>
      ) : (
        <div className="grid lg:grid-cols-[1fr_420px] gap-4">
          <Card className="p-0 overflow-hidden">
            <div className="px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground border-b bg-muted/40">Açıq sessiyalar</div>
            <div>
              {sessions.map(s => {
                const sOrders = orders.filter(o => (o as any).session_id === s.id);
                const total = sOrders.filter(o => o.status !== "cancelled").reduce((sum, o) => sum + Number(o.total ?? 0), 0);
                return (
                  <button key={s.id} onClick={() => setSelectedSession(s.id)} className={`w-full flex items-center justify-between px-4 py-3 border-b last:border-0 hover:bg-muted/40 text-left ${selectedSession === s.id ? "bg-ember/5" : ""}`}>
                    <div>
                      <div className="font-medium text-sm">{tableLabel(s.table_id)}</div>
                      <div className="text-xs text-muted-foreground">{sOrders.length} sifariş · {s.customer_type === "foreign" ? "Əcnəbi" : "Yerli"} · açıldı {minsAgoIso(s.opened_at)}d əvvəl</div>
                    </div>
                    <div className="font-semibold">{money(total, restaurant?.currency ?? "AZN")}</div>
                  </button>
                );
              })}
              {sessions.length === 0 && <div className="text-sm text-muted-foreground text-center py-12">Açıq sessiya yoxdur.</div>}
            </div>
          </Card>

          {activeSession && (
            <Card className="p-5 h-fit sticky top-4">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Hesab</div>
                  <h2 className="font-display text-2xl">{tableLabel(activeSession.table_id)}</h2>
                  <div className="text-xs text-muted-foreground mt-1">{activeSession.customer_type === "foreign" ? "Əcnəbi müştəri" : "Yerli müştəri"}</div>
                </div>
                <span className="text-xs uppercase tracking-wider px-2 py-1 rounded bg-emerald-100 text-emerald-700 border border-emerald-200">açıq</span>
              </div>

              {sessionOrders.map(o => (
                <div key={o.id} className="border-b last:border-0 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono text-muted-foreground">{shortOrder(o.id)} · {minsAgoIso(o.created_at)}d</span>
                    <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-muted border">{o.status}</span>
                  </div>
                  {o.items.map(it => (
                    <div key={it.id} className="flex justify-between text-sm">
                      <span>{it.quantity}× {itemName(it.menu_item_id)}</span>
                      <span>{money(it.total_price, restaurant?.currency ?? "AZN")}</span>
                    </div>
                  ))}
                </div>
              ))}
              {sessionOrders.length === 0 && <div className="text-sm text-muted-foreground py-6 text-center">Sifariş yoxdur.</div>}

              <div className="mt-4 pt-4 border-t-2 border-dashed flex items-center justify-between font-display text-2xl">
                <span>Cəmi</span><span>{money(sessionTotal, restaurant?.currency ?? "AZN")}</span>
              </div>

              <Button onClick={() => handleClose(activeSession.id)} className="mt-5 w-full bg-ember hover:bg-ember/90 text-ember-foreground">
                <X className="mr-2 h-4 w-4" />Hesabı bağla və masanı boşalt
              </Button>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
