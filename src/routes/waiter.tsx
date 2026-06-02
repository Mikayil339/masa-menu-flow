import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Bell, Check, ArrowLeft, Receipt, Hand, Droplet, ChefHat } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { fetchOrders, fetchOwnerContext, minsAgoIso, shortOrder, updateOrderStatus, type OrderBundle, type Profile, type TableRow, type WaiterRequestRow } from "@/lib/masaqr";

const ICONS: Record<string, any> = { ready_order: ChefHat, bill: Receipt, waiter: Hand, water: Droplet, other: Bell };
const COLORS: Record<string, string> = {
  ready_order: "bg-sage/10 border-sage text-sage",
  bill: "bg-warning/10 border-warning text-warning",
  waiter: "bg-ember/10 border-ember text-ember",
  water: "bg-sky-100 border-sky-300 text-sky-900",
  other: "bg-destructive/10 border-destructive text-destructive",
};
const LABELS: Record<string, string> = { ready_order: "Food ready", bill: "Bill requested", waiter: "Help needed", water: "Water / napkins", other: "Request" };

export const Route = createFileRoute("/waiter")({
  head: () => ({ meta: [{ title: "Waiter — MasaQR" }] }),
  component: Waiter,
});

function Waiter() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [alerts, setAlerts] = useState<WaiterRequestRow[]>([]);
  const [tables, setTables] = useState<TableRow[]>([]);
  const [orders, setOrders] = useState<OrderBundle[]>([]);

  async function load() {
    try {
      const ctx = await fetchOwnerContext();
      setProfile(ctx.profile);
      if (!ctx.profile?.restaurant_id) return;
      const [{ data: requestRows, error: requestError }, { data: tableRows, error: tableError }, orderRows] = await Promise.all([
        supabase.from("masaqr_waiter_requests").select("*").eq("restaurant_id", ctx.profile.restaurant_id).order("created_at", { ascending: true }),
        supabase.from("masaqr_tables").select("*").eq("restaurant_id", ctx.profile.restaurant_id),
        fetchOrders(ctx.profile.restaurant_id),
      ]);
      if (requestError) throw requestError;
      if (tableError) throw tableError;
      setAlerts((requestRows ?? []) as WaiterRequestRow[]);
      setTables((tableRows ?? []) as TableRow[]);
      setOrders(orderRows.filter(o => ["ready", "picked_up"].includes(o.status)));
    } catch (err: any) {
      toast.error(err.message ?? "Could not load waiter screen");
    }
  }

  useEffect(() => {
    load();
    const channel = supabase.channel("waiter-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "masaqr_waiter_requests" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "masaqr_orders" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function doneAlert(alert: WaiterRequestRow) {
    try {
      const { error } = await supabase.from("masaqr_waiter_requests").update({ status: "done", assigned_to: profile?.id ?? null }).eq("id", alert.id);
      if (error) throw error;
      toast.success("Acknowledged");
      await load();
    } catch (err: any) {
      toast.error(err.message ?? "Could not update request");
    }
  }

  async function setStatus(order: OrderBundle, status: string) {
    try {
      await updateOrderStatus(order, status, profile?.id);
      toast.success(`Order marked ${status}`);
      await load();
    } catch (err: any) {
      toast.error(err.message ?? "Could not update order");
    }
  }

  const open = alerts.filter(a => a.status === "open");
  const handled = alerts.filter(a => a.status !== "open").slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 bg-foreground text-background flex items-center gap-3 p-4">
        <Link to="/app" className="text-xs opacity-70"><ArrowLeft className="h-4 w-4" /></Link>
        <Bell className="h-5 w-5 text-ember" />
        <div className="font-display text-xl">Floor Alerts</div>
        <span className="ml-auto text-xs bg-ember text-ember-foreground rounded-full px-2 py-0.5">{open.length + orders.length}</span>
      </header>

      <div className="max-w-2xl mx-auto p-4 space-y-3">
        {orders.map(o => (
          <div key={o.id} className="rounded-2xl border-2 p-5 flex items-center gap-4 bg-sage/10 border-sage text-sage">
            <ChefHat className="h-8 w-8 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-xs uppercase tracking-wider opacity-80">Order {o.status}</div>
              <div className="font-display text-2xl">{o.table?.table_name ?? `Table ${o.table?.table_number ?? "?"}`}</div>
              <div className="text-xs opacity-70 mt-0.5">#{shortOrder(o.id)} · {minsAgoIso(o.created_at)}m ago</div>
            </div>
            {o.status === "ready" && <Button size="lg" className="bg-foreground text-background" onClick={() => setStatus(o, "picked_up")}><Check className="h-5 w-5 mr-1" /> Picked up</Button>}
            {o.status === "picked_up" && <Button size="lg" className="bg-foreground text-background" onClick={() => setStatus(o, "served")}><Check className="h-5 w-5 mr-1" /> Served</Button>}
          </div>
        ))}

        {open.map(a => {
          const t = tables.find(x => x.id === a.table_id);
          const Icon = ICONS[a.type] ?? Bell;
          return (
            <div key={a.id} className={`rounded-2xl border-2 p-5 flex items-center gap-4 ${COLORS[a.type] ?? COLORS.other}`}>
              <Icon className="h-8 w-8 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-xs uppercase tracking-wider opacity-80">{LABELS[a.type] ?? "Request"}</div>
                <div className="font-display text-2xl">{t?.table_name ?? `Table ${t?.table_number ?? "?"}`}</div>
                <div className="text-xs opacity-70 mt-0.5">{minsAgoIso(a.created_at)}m ago</div>
              </div>
              <Button size="lg" className="bg-foreground text-background" onClick={() => doneAlert(a)}><Check className="h-5 w-5 mr-1" /> Done</Button>
            </div>
          );
        })}
        {open.length === 0 && orders.length === 0 && <div className="text-center py-20 text-muted-foreground"><Check className="h-12 w-12 mx-auto text-sage" /><p className="mt-3">All caught up.</p></div>}

        {handled.length > 0 && <div className="pt-6 mt-6 border-t"><div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Recently handled</div>{handled.map(a => <div key={a.id} className="py-2 text-sm text-muted-foreground flex justify-between border-b last:border-0"><span>{LABELS[a.type] ?? "Request"}</span><span className="text-xs">{minsAgoIso(a.created_at)}m ago</span></div>)}</div>}
      </div>
    </div>
  );
}
