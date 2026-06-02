import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useMemo, useState } from "react";
import { Download, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { fetchMenu, fetchOrders, fetchOwnerContext, localName, money, minsAgoIso, shortOrder, updateOrderStatus, type MenuItemRow, type OrderBundle, type Profile, type RestaurantRow } from "@/lib/masaqr";

export const Route = createFileRoute("/app/orders")({
  head: () => ({ meta: [{ title: "Orders — MasaQR" }] }),
  component: Orders,
});

const STATUSES = ["pending", "confirmed", "preparing", "ready", "picked_up", "served", "cancelled"] as const;

function Orders() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [restaurant, setRestaurant] = useState<RestaurantRow | null>(null);
  const [orders, setOrders] = useState<OrderBundle[]>([]);
  const [items, setItems] = useState<MenuItemRow[]>([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<string | "all">("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const ctx = await fetchOwnerContext();
      setProfile(ctx.profile);
      setRestaurant(ctx.restaurant);
      if (!ctx.profile?.restaurant_id) return;
      const [orderRows, menuRows] = await Promise.all([fetchOrders(ctx.profile.restaurant_id), fetchMenu(ctx.profile.restaurant_id)]);
      setOrders(orderRows);
      setItems(menuRows.items);
      setSelected(current => current ?? orderRows[0]?.id ?? null);
    } catch (err: any) {
      toast.error(err.message ?? "Could not load orders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const channel = supabase.channel("orders-page-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "masaqr_orders" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "masaqr_order_items" }, () => load())
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

  async function setStatus(order: OrderBundle, status: string) {
    try {
      await updateOrderStatus(order, status, profile?.id);
      toast.success(`Order marked ${status}`);
      await load();
    } catch (err: any) {
      toast.error(err.message ?? "Could not update order");
    }
  }

  function itemName(id: string) {
    const item = items.find(x => x.id === id);
    return localName(item?.name, item?.name_i18n, restaurant?.default_language ?? "az") || "Menu item";
  }

  if (loading) return <div className="p-6 md:p-10 text-sm text-muted-foreground">Loading orders…</div>;

  return (
    <div className="p-6 md:p-10">
      <PageHeader title="Orders" subtitle="Everything happening across your floor" actions={<Button variant="outline"><Download className="mr-2 h-4 w-4" />Export</Button>} />

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search order code…" className="pl-9" />
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
            <div>Code</div><div>Items</div><div>Table</div><div>Status</div><div>Age</div>
          </div>
          <div>
            {filtered.map(o => (
              <button key={o.id} onClick={() => setSelected(o.id)} className={`w-full grid grid-cols-[90px_1fr_100px_120px_90px] gap-3 px-4 py-3 text-left border-b last:border-0 hover:bg-muted/40 ${selected === o.id ? "bg-ember/5" : ""}`}>
                <div className="font-mono text-sm font-bold">{shortOrder(o.id)}</div>
                <div className="min-w-0 text-sm truncate">{o.items.map(i => `${i.quantity}× ${itemName(i.menu_item_id)}`).join(", ") || "No items"}</div>
                <div className="text-sm">{o.table?.table_name ?? `T${o.table?.table_number ?? "?"}`}</div>
                <div><span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded bg-background border">{o.status}</span></div>
                <div className="text-sm text-muted-foreground">{minsAgoIso(o.created_at)}m</div>
              </button>
            ))}
            {filtered.length === 0 && <div className="text-sm text-muted-foreground text-center py-12">No orders found.</div>}
          </div>
        </Card>

        {order && (
          <Card className="p-5 h-fit sticky top-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Order</div>
                <h2 className="font-display text-2xl">{shortOrder(order.id)}</h2>
                <div className="text-xs text-muted-foreground mt-1">{order.table?.table_name ?? `Table ${order.table?.table_number ?? "?"}`} · {minsAgoIso(order.created_at)}m ago</div>
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
            <div className="mt-4 pt-4 border-t flex items-center justify-between font-display text-xl"><span>Total</span><span>{money(order.total, restaurant?.currency ?? "AZN")}</span></div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              {order.status === "pending" && <Button onClick={() => setStatus(order, "confirmed")} className="col-span-2 bg-ember text-ember-foreground hover:bg-ember/90">Confirm order</Button>}
              {order.status === "confirmed" && <Button onClick={() => setStatus(order, "preparing")} className="col-span-2">Start preparing</Button>}
              {order.status === "preparing" && <Button onClick={() => setStatus(order, "ready")} className="col-span-2 bg-sage text-white hover:bg-sage/90">Mark ready</Button>}
              {order.status === "ready" && <Button onClick={() => setStatus(order, "picked_up")} className="col-span-2">Picked up</Button>}
              {order.status === "picked_up" && <Button onClick={() => setStatus(order, "served")} className="col-span-2">Mark served</Button>}
              {!["served", "cancelled"].includes(order.status) && <Button variant="outline" onClick={() => setStatus(order, "cancelled")} className="col-span-2">Cancel order</Button>}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
