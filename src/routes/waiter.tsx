import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Bell, Check, ArrowLeft, Receipt, Hand, Droplet, ChefHat, X, Users } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import {
  closeSession,
  fetchOrders,
  fetchOwnerContext,
  minsAgoIso,
  money,
  shortOrder,
  updateOrderStatus,
  type OrderBundle,
  type Profile,
  type RestaurantRow,
  type TableRow,
  type TableSessionRow,
  type WaiterRequestRow,
} from "@/lib/masaqr";

const ICONS: Record<string, any> = { ready_order: ChefHat, bill: Receipt, waiter: Hand, water: Droplet, other: Bell };
const COLORS: Record<string, string> = {
  ready_order: "bg-sage/10 border-sage text-sage",
  bill: "bg-warning/10 border-warning text-warning",
  waiter: "bg-ember/10 border-ember text-ember",
  water: "bg-sky-100 border-sky-300 text-sky-900",
  other: "bg-destructive/10 border-destructive text-destructive",
};
const LABELS: Record<string, string> = { ready_order: "Yemək hazırdır", bill: "Hesab tələbi", waiter: "Köməklik", water: "Su / salfet", other: "Sorğu" };

export const Route = createFileRoute("/waiter")({
  head: () => ({ meta: [{ title: "Ofisiant — MasaQR" }] }),
  component: Waiter,
});

const TABS = [
  { id: "new", label: "Yeni sifarişlər" },
  { id: "mine", label: "Mənim masalarım" },
  { id: "sessions", label: "Açıq sessiyalar" },
  { id: "free", label: "Boş masalar" },
  { id: "alerts", label: "Bildirişlər" },
] as const;

type Tab = typeof TABS[number]["id"];

function Waiter() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [restaurant, setRestaurant] = useState<RestaurantRow | null>(null);
  const [alerts, setAlerts] = useState<WaiterRequestRow[]>([]);
  const [tables, setTables] = useState<TableRow[]>([]);
  const [orders, setOrders] = useState<OrderBundle[]>([]);
  const [sessions, setSessions] = useState<TableSessionRow[]>([]);
  const [tab, setTab] = useState<Tab>("new");
  const [soundOn, setSoundOn] = useState(true);
  const lastNewOrderIds = useRef<Set<string>>(new Set());
  const audioCtxRef = useRef<AudioContext | null>(null);

  function beep() {
    if (!soundOn) return;
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = audioCtxRef.current;
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.frequency.value = 880; g.gain.value = 0.08;
      o.connect(g); g.connect(ctx.destination);
      o.start(); setTimeout(() => { o.stop(); }, 220);
    } catch {}
  }

  async function load() {
    try {
      const ctx = await fetchOwnerContext();
      setProfile(ctx.profile);
      setRestaurant(ctx.restaurant);
      if (!ctx.profile?.restaurant_id) return;
      const [{ data: requestRows }, { data: tableRows }, { data: sessionRows }, orderRows] = await Promise.all([
        supabase.from("masaqr_waiter_requests").select("*").eq("restaurant_id", ctx.profile.restaurant_id).order("created_at", { ascending: true }),
        supabase.from("masaqr_tables").select("*").eq("restaurant_id", ctx.profile.restaurant_id),
        supabase.from("masaqr_table_sessions").select("*").eq("restaurant_id", ctx.profile.restaurant_id).eq("status", "open").order("opened_at", { ascending: false }),
        fetchOrders(ctx.profile.restaurant_id),
      ]);
      setAlerts((requestRows ?? []) as WaiterRequestRow[]);
      setTables((tableRows ?? []) as TableRow[]);
      setSessions((sessionRows ?? []) as TableSessionRow[]);
      setOrders(orderRows);

      // Audio: detect new pending orders relevant to this waiter
      const myMode = (ctx.restaurant as any)?.waiter_assignment_mode ?? "first_confirming_waiter";
      const myId = ctx.profile.id;
      const relevant = orderRows.filter(o => o.status === "pending" && (
        myMode === "disabled" ||
        (o as any).assigned_waiter_id === myId ||
        (myMode === "first_confirming_waiter" && !(o as any).assigned_waiter_id)
      ));
      const known = lastNewOrderIds.current;
      const fresh = relevant.filter(o => !known.has(o.id));
      if (known.size > 0 && fresh.length > 0) beep();
      lastNewOrderIds.current = new Set(relevant.map(o => o.id));
    } catch (err: any) {
      toast.error(err.message ?? "Yüklənmə xətası");
    }
  }

  useEffect(() => {
    load();
    const channel = supabase.channel("waiter-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "masaqr_waiter_requests" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "masaqr_orders" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "masaqr_table_sessions" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soundOn]);

  async function doneAlert(alert: WaiterRequestRow) {
    const { error } = await supabase.from("masaqr_waiter_requests").update({ status: "done", assigned_to: profile?.id ?? null }).eq("id", alert.id);
    if (error) return toast.error(error.message);
    toast.success("Qeyd edildi"); await load();
  }

  async function setStatus(order: OrderBundle, status: string) {
    try {
      await updateOrderStatus(order, status, profile?.id);
      // First-confirming waiter rule: claim the session on confirm
      if (status === "confirmed" && (restaurant as any)?.waiter_assignment_mode === "first_confirming_waiter") {
        const sid = (order as any).session_id;
        if (sid && profile?.id) {
          await supabase.from("masaqr_table_sessions").update({ assigned_waiter_id: profile.id }).eq("id", sid).is("assigned_waiter_id", null);
          await supabase.from("masaqr_orders").update({ assigned_waiter_id: profile.id }).eq("session_id", sid).is("assigned_waiter_id", null);
        }
      }
      toast.success(`Status: ${status}`);
      await load();
    } catch (err: any) {
      toast.error(err.message ?? "Status dəyişmədi");
    }
  }

  async function doCloseSession(session: TableSessionRow) {
    if (!confirm("Sessiyanı bağla və masanı boşalt?")) return;
    try {
      await closeSession(session.id, profile?.id ?? null);
      toast.success("Sessiya bağlandı");
      await load();
    } catch (err: any) {
      toast.error(err.message ?? "Bağlama xətası");
    }
  }

  const myId = profile?.id ?? "";
  const mode = (restaurant as any)?.waiter_assignment_mode ?? "first_confirming_waiter";
  const isMine = (o: OrderBundle) => mode === "disabled" || (o as any).assigned_waiter_id === myId || (mode === "first_confirming_waiter" && !(o as any).assigned_waiter_id);
  const sessionIsMine = (s: TableSessionRow) => mode === "disabled" || s.assigned_waiter_id === myId || (mode === "first_confirming_waiter" && !s.assigned_waiter_id);

  const newOrders = useMemo(() => orders.filter(o => o.status === "pending" && isMine(o)), [orders, myId, mode]);
  const mySessions = useMemo(() => sessions.filter(sessionIsMine), [sessions, myId, mode]);
  const occupiedTableIds = useMemo(() => new Set(sessions.map(s => s.table_id)), [sessions]);
  const freeTables = useMemo(() => tables.filter(t => !occupiedTableIds.has(t.id) && t.status !== "disabled"), [tables, occupiedTableIds]);
  const openAlerts = alerts.filter(a => a.status === "open");
  const counts: Record<Tab, number> = { new: newOrders.length, mine: mySessions.length, sessions: sessions.length, free: freeTables.length, alerts: openAlerts.length };

  function tableLabel(tid: string | null) {
    const t = tables.find(x => x.id === tid);
    return t?.table_name ?? `Masa ${t?.table_number ?? "?"}`;
  }
  function sessionOrders(sid: string) {
    return orders.filter(o => (o as any).session_id === sid);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 bg-foreground text-background flex items-center gap-3 p-4">
        <Link to="/app" className="text-xs opacity-70"><ArrowLeft className="h-4 w-4" /></Link>
        <Bell className="h-5 w-5 text-ember" />
        <div className="font-display text-xl">Ofisiant</div>
        <button onClick={() => setSoundOn(s => !s)} className={`ml-auto text-[11px] px-2 py-1 rounded-full ${soundOn ? "bg-ember text-ember-foreground" : "bg-background/20"}`}>
          🔔 {soundOn ? "Açıq" : "Səssiz"}
        </button>
      </header>

      <div className="border-b bg-card sticky top-[60px] z-10 overflow-x-auto">
        <div className="flex">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex-shrink-0 px-4 py-3 text-sm border-b-2 ${tab === t.id ? "border-ember text-ember font-medium" : "border-transparent text-muted-foreground"}`}>
              {t.label}{counts[t.id] > 0 && <span className="ml-1.5 text-[10px] bg-ember/10 text-ember rounded-full px-1.5">{counts[t.id]}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-3">
        {tab === "new" && (newOrders.length === 0
          ? <Empty msg="Yeni sifariş yoxdur." />
          : newOrders.map(o => (
            <div key={o.id} className="rounded-2xl border-2 p-5 bg-ember/5 border-ember">
              <div className="flex items-center gap-3 mb-3">
                <ChefHat className="h-7 w-7 text-ember" />
                <div className="flex-1">
                  <div className="text-xs uppercase tracking-wider opacity-70">Yeni sifariş</div>
                  <div className="font-display text-xl">{o.table?.table_name ?? `Masa ${o.table?.table_number ?? "?"}`}</div>
                  <div className="text-xs opacity-70">#{shortOrder(o.id)} · {minsAgoIso(o.created_at)}d əvvəl · {money(o.total, restaurant?.currency ?? "AZN")}</div>
                </div>
                <Button size="sm" onClick={() => setStatus(o, "confirmed")} className="bg-ember text-ember-foreground"><Check className="h-4 w-4 mr-1" />Təsdiqlə</Button>
              </div>
              <div className="text-xs text-foreground/80 space-y-0.5">
                {o.items.map(it => <div key={it.id}>{it.quantity}× {it.menu_item_id.slice(0, 6)} {it.note ? <span className="italic opacity-70">— {it.note}</span> : null}</div>)}
              </div>
            </div>
          )))}

        {tab === "mine" && (mySessions.length === 0
          ? <Empty msg="Sənə təyin olunan masa yoxdur." />
          : mySessions.map(s => <SessionCard key={s.id} session={s} tableLabel={tableLabel} orders={sessionOrders(s.id)} currency={restaurant?.currency ?? "AZN"} onClose={() => doCloseSession(s)} />))}

        {tab === "sessions" && (sessions.length === 0
          ? <Empty msg="Açıq sessiya yoxdur." />
          : sessions.map(s => <SessionCard key={s.id} session={s} tableLabel={tableLabel} orders={sessionOrders(s.id)} currency={restaurant?.currency ?? "AZN"} onClose={() => doCloseSession(s)} />))}

        {tab === "free" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {freeTables.length === 0 ? <Empty msg="Boş masa yoxdur." /> : freeTables.map(t => (
              <div key={t.id} className="rounded-xl border bg-card p-4 text-center">
                <Users className="h-5 w-5 mx-auto text-muted-foreground" />
                <div className="font-medium mt-1">{t.table_name ?? `Masa ${t.table_number}`}</div>
                <div className="text-[11px] text-sage uppercase tracking-wider mt-0.5">Boş</div>
              </div>
            ))}
          </div>
        )}

        {tab === "alerts" && (openAlerts.length === 0
          ? <Empty msg="Bildiriş yoxdur." />
          : openAlerts.map(a => {
            const Icon = ICONS[a.type] ?? Bell;
            return (
              <div key={a.id} className={`rounded-2xl border-2 p-5 flex items-center gap-4 ${COLORS[a.type] ?? COLORS.other}`}>
                <Icon className="h-8 w-8 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-xs uppercase tracking-wider opacity-80">{LABELS[a.type] ?? "Sorğu"}</div>
                  <div className="font-display text-xl">{tableLabel(a.table_id)}</div>
                  <div className="text-xs opacity-70 mt-0.5">{minsAgoIso(a.created_at)}d əvvəl</div>
                </div>
                <Button size="lg" className="bg-foreground text-background" onClick={() => doneAlert(a)}><Check className="h-5 w-5 mr-1" /> Tamam</Button>
              </div>
            );
          }))}
      </div>
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return <div className="text-center py-16 text-muted-foreground text-sm"><Check className="h-10 w-10 mx-auto text-sage opacity-60" /><p className="mt-2">{msg}</p></div>;
}

function SessionCard({ session, tableLabel, orders, currency, onClose }: { session: TableSessionRow; tableLabel: (id: string | null) => string; orders: OrderBundle[]; currency: string; onClose: () => void }) {
  const total = orders.reduce((s, o) => s + Number(o.total ?? 0), 0);
  return (
    <div className="rounded-2xl border bg-card overflow-hidden">
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <div className="font-display text-lg">{tableLabel(session.table_id)}</div>
          <div className="text-xs text-muted-foreground">{orders.length} sifariş · {minsAgoIso(session.opened_at)}d açıqdır · {session.customer_type === "foreign" ? "🌍 Xarici" : "🇦🇿 Yerli"}</div>
        </div>
        <Button size="sm" variant="outline" onClick={onClose}><X className="h-4 w-4 mr-1" />Bağla</Button>
      </div>
      <div className="p-4 space-y-2 text-sm">
        {orders.map(o => (
          <div key={o.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
            <div>
              <div className="font-mono text-xs">#{shortOrder(o.id)}</div>
              <div className="text-xs text-muted-foreground">{o.items.length} maddə · {o.status}</div>
            </div>
            <div className="font-medium">{money(o.total, currency)}</div>
          </div>
        ))}
        <div className="flex items-center justify-between pt-2 font-display text-lg">
          <span>Cəmi</span><span>{money(total, currency)}</span>
        </div>
      </div>
    </div>
  );
}
