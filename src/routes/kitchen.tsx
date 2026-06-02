import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ChefHat, Maximize2, Volume2, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { fetchMenu, fetchOrders, fetchOwnerContext, localName, minsAgoIso, shortOrder, updateOrderStatus, type MenuItemRow, type OrderBundle, type Profile } from "@/lib/masaqr";

export const Route = createFileRoute("/kitchen")({
  head: () => ({ meta: [{ title: "Kitchen — MasaQR" }] }),
  component: Kitchen,
});

function Kitchen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<OrderBundle[]>([]);
  const [items, setItems] = useState<MenuItemRow[]>([]);
  const [sound, setSound] = useState(true);

  async function load() {
    try {
      const ctx = await fetchOwnerContext();
      setProfile(ctx.profile);
      if (!ctx.profile?.restaurant_id) return;
      const [orderRows, menuRows] = await Promise.all([fetchOrders(ctx.profile.restaurant_id), fetchMenu(ctx.profile.restaurant_id)]);
      setOrders(orderRows.filter(o => ["confirmed", "preparing"].includes(o.status)).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()));
      setItems(menuRows.items);
    } catch (err: any) {
      toast.error(err.message ?? "Could not load kitchen");
    }
  }

  useEffect(() => {
    load();
    const channel = supabase.channel("kitchen-live").on("postgres_changes", { event: "*", schema: "public", table: "masaqr_orders" }, () => load()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  function itemName(id: string) {
    const item = items.find(x => x.id === id);
    return localName(item?.name, item?.name_i18n, "en") || "Menu item";
  }

  async function setStatus(order: OrderBundle, status: string) {
    try {
      await updateOrderStatus(order, status, profile?.id);
      toast.success(status === "ready" ? "Waiter alerted" : `Order marked ${status}`);
      await load();
    } catch (err: any) {
      toast.error(err.message ?? "Could not update order");
    }
  }

  return (
    <div className="min-h-screen bg-sidebar text-sidebar-foreground">
      <header className="flex items-center gap-4 p-4 border-b border-sidebar-border">
        <Link to="/app" className="flex items-center gap-2 text-xs opacity-70 hover:opacity-100"><ArrowLeft className="h-3 w-3" /> Back</Link>
        <ChefHat className="h-5 w-5 text-ember" />
        <div className="font-display text-xl">Kitchen Display</div>
        <span className="text-xs text-sidebar-foreground/60">{orders.length} active</span>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => setSound(!sound)} className={`p-2 rounded ${sound ? "bg-ember/20 text-ember" : "opacity-50"}`}><Volume2 className="h-4 w-4" /></button>
          <button onClick={() => document.documentElement.requestFullscreen?.()} className="p-2 rounded hover:bg-sidebar-accent"><Maximize2 className="h-4 w-4" /></button>
        </div>
      </header>

      <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
        {orders.map(o => {
          const age = minsAgoIso(o.created_at);
          const late = age > 25;
          const tone = o.status === "confirmed" ? "border-ember bg-ember/20" : "border-sidebar-border bg-sidebar-accent";
          return (
            <div key={o.id} className={`rounded-xl border-2 p-4 ${tone}`}>
              <div className="flex items-baseline justify-between">
                <div className="font-display text-2xl">{shortOrder(o.id)}</div>
                <div className="text-xs">{o.table?.table_name ?? `Table ${o.table?.table_number ?? "?"}`} · <span className={late ? "text-warning font-bold" : ""}>{age}m</span></div>
              </div>
              <div className="text-xs uppercase mt-1 opacity-70">{o.status}</div>
              <div className="mt-3 space-y-2">
                {o.items.map(it => (
                  <div key={it.id} className="w-full text-left p-2 rounded bg-sidebar">
                    <div className="flex justify-between text-sm"><span><b>{it.quantity}×</b> {itemName(it.menu_item_id)}</span></div>
                    {it.note && <div className="text-[11px] italic opacity-70">“{it.note}”</div>}
                  </div>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-1.5">
                {o.status === "confirmed" && <Button size="sm" className="col-span-2" onClick={() => setStatus(o, "preparing")}>Start cooking</Button>}
                {o.status === "preparing" && <Button size="sm" className="col-span-2 bg-sage text-white" onClick={() => setStatus(o, "ready")}>Ready ✓</Button>}
              </div>
            </div>
          );
        })}
        {orders.length === 0 && <div className="col-span-full text-center py-20 opacity-60">No orders in queue.</div>}
      </div>
    </div>
  );
}
