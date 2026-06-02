import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { useStore, tr } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, Tooltip } from "recharts";

export const Route = createFileRoute("/app/analytics")({
  head: () => ({ meta: [{ title: "Analytics — MasaQR" }] }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { orders, items, scans, tables, categories } = useStore();
  const ordersByHour = Array.from({ length: 12 }).map((_, i) => ({
    h: `${10 + i}:00`,
    orders: Math.round(5 + Math.sin(i / 2) * 4 + Math.random() * 3),
  }));
  const topItems = items.slice(0, 6).map(i => ({ name: tr(i.name, "en").slice(0, 14), sold: Math.round(20 + Math.random() * 80) }))
    .sort((a, b) => b.sold - a.sold);
  const categoryPerf = categories.map(c => ({
    name: tr(c.name, "en").slice(0, 12),
    sold: items.filter(i => i.categoryId === c.id).reduce((s) => s + Math.round(20 + Math.random() * 60), 0),
  }));

  return (
    <div className="p-6 md:p-10">
      <PageHeader title="Analytics" subtitle="Operations, not revenue. Run a faster kitchen." />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        {[
          { l: "Orders today", v: orders.length, h: "+12% vs avg" },
          { l: "QR scans (mo)", v: scans.toLocaleString(), h: `From ${tables.length} tables` },
          { l: "Avg prep", v: "14m", h: "Goal: 15m" },
          { l: "Waiter response", v: "1m 12s", h: "Excellent" },
        ].map(s => (
          <Card key={s.l} className="p-4"><div className="text-xs uppercase text-muted-foreground">{s.l}</div><div className="font-display text-2xl mt-1">{s.v}</div><div className="text-xs text-muted-foreground">{s.h}</div></Card>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        <Card className="p-5"><div className="font-display text-lg mb-3">Orders by hour</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={ordersByHour}><XAxis dataKey="h" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Line type="monotone" dataKey="orders" stroke="oklch(0.66 0.17 38)" strokeWidth={2} dot={false} /></LineChart>
          </ResponsiveContainer>
          <div className="text-xs text-muted-foreground mt-2">Peak: 19:00–21:00</div>
        </Card>
        <Card className="p-5"><div className="font-display text-lg mb-3">Top menu items</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topItems}><XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="sold" fill="oklch(0.66 0.17 38)" radius={[4, 4, 0, 0]} /></BarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-5"><div className="font-display text-lg mb-3">Category performance</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryPerf}><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="sold" fill="oklch(0.7 0.13 160)" radius={[4, 4, 0, 0]} /></BarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-5"><div className="font-display text-lg mb-3">Waiter requests this week</div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded bg-ember/5"><div className="text-xs uppercase">Food ready</div><div className="font-display text-2xl">128</div></div>
            <div className="p-3 rounded bg-muted"><div className="text-xs uppercase">Bill requested</div><div className="font-display text-2xl">94</div></div>
            <div className="p-3 rounded bg-muted"><div className="text-xs uppercase">Help</div><div className="font-display text-2xl">31</div></div>
            <div className="p-3 rounded bg-warning/10"><div className="text-xs uppercase">Long wait</div><div className="font-display text-2xl">6</div></div>
          </div>
        </Card>
        <Card className="p-5 lg:col-span-2"><div className="font-display text-lg mb-3">Operational signals</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <Signal label="Late orders" value="3" hint="Over 25m threshold" tone="warn" />
            <Signal label="Sold-out items" value={items.filter(i => i.soldOut).length.toString()} hint="Refresh stock in kitchen" />
            <Signal label="Active tables" value={`${tables.filter(t => t.status !== "available").length}/${tables.length}`} hint="Branch occupancy" />
            <Signal label="PDF exports" value="42" hint="This month" />
            <Signal label="Avg staff response" value="1m 12s" hint="Across all alerts" />
            <Signal label="Top station" value="Grill" hint="68% of orders" />
            <Signal label="Branch with most orders" value="Downtown" hint="vs Seaside" />
            <Signal label="Active staff on shift" value="3" hint="Right now" />
          </div>
        </Card>
      </div>
    </div>
  );
}

function Signal({ label, value, hint, tone }: { label: string; value: string; hint: string; tone?: "warn" }) {
  return (
    <div className={`p-3 rounded-lg border ${tone === "warn" ? "bg-warning/5 border-warning/30" : "bg-card"}`}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-display text-xl mt-0.5">{value}</div>
      <div className="text-xs text-muted-foreground">{hint}</div>
    </div>
  );
}
