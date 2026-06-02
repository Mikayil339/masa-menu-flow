import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { useStore, type Table, type TableStatus } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { QRPattern } from "@/components/QRPattern";
import { useState } from "react";
import { Plus, Download, Printer, RefreshCw, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/tables")({
  head: () => ({ meta: [{ title: "QR & Tables — MasaQR" }] }),
  component: TablesPage,
});

const STATUS_STYLES: Record<TableStatus, string> = {
  available: "bg-muted text-muted-foreground border-border",
  seated: "bg-sky-100 text-sky-900 border-sky-200",
  ordering: "bg-ember/10 text-ember border-ember/30",
  preparing: "bg-amber-100 text-amber-900 border-amber-200",
  ready: "bg-sage/15 text-sage border-sage/40",
  served: "bg-purple-100 text-purple-900 border-purple-200",
  bill_requested: "bg-warning/15 text-warning border-warning/40",
  paid: "bg-emerald-100 text-emerald-900 border-emerald-200",
  cleaning: "bg-neutral-200 text-neutral-700 border-neutral-300",
};

const PRINT_TEMPLATES = [
  { id: "tent", name: "Table tent", desc: "Folded card, 2 sides" },
  { id: "sticker", name: "Table sticker", desc: "Round, 80mm" },
  { id: "sheet", name: "QR sheet · 6/page", desc: "Cut & distribute" },
  { id: "branded", name: "Branded card", desc: "Cover image + QR" },
];

function TablesPage() {
  const { tables, activeBranchId, restaurant, upsertTable, deleteTable, setTableStatus } = useStore();
  const branchTables = tables.filter(t => t.branchId === activeBranchId);
  const [view, setView] = useState<"grid" | "list" | "print">("grid");
  const [printTemplate, setPrintTemplate] = useState("tent");
  const [active, setActive] = useState<Table | null>(null);

  return (
    <div className="p-6 md:p-10">
      <PageHeader
        title="QR & Tables"
        subtitle={`${branchTables.length} tables on this branch`}
        actions={
          <>
            <Button variant="outline" onClick={() => setView("print")}><Printer className="mr-2 h-4 w-4" />Print QRs</Button>
            <Button className="bg-ember hover:bg-ember/90 text-ember-foreground"
              onClick={() => {
                const n = branchTables.length + 1;
                upsertTable({ id: "t" + Math.random().toString(36).slice(2, 6), label: `T${n}`, branchId: activeBranchId, seats: 4, status: "available", qrEnabled: true });
                toast.success("Table added");
              }}>
              <Plus className="mr-1.5 h-4 w-4" /> Add table
            </Button>
          </>
        }
      />

      <div className="flex gap-1 mb-4 text-xs">
        {(["grid", "list", "print"] as const).map(v => (
          <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 rounded-md border ${view === v ? "bg-foreground text-background" : "bg-card hover:bg-muted"}`}>{v}</button>
        ))}
      </div>

      {view === "grid" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {branchTables.map(t => (
            <button key={t.id} onClick={() => setActive(t)}
              className={`aspect-square rounded-xl border-2 p-3 flex flex-col items-start justify-between ${STATUS_STYLES[t.status]} hover:scale-[1.02] transition`}>
              <div>
                <div className="font-display text-2xl">{t.label}</div>
                <div className="text-[10px] uppercase tracking-wider">{t.status.replace("_", " ")}</div>
              </div>
              <div className="text-xs">{t.seats} seats</div>
            </button>
          ))}
        </div>
      )}

      {view === "list" && (
        <Card className="overflow-hidden">
          <div className="grid grid-cols-[60px_1fr_120px_120px_100px] gap-2 px-4 py-3 text-xs uppercase text-muted-foreground border-b bg-muted/40">
            <div>Table</div><div>QR link</div><div>Seats</div><div>Status</div><div>Actions</div>
          </div>
          {branchTables.map(t => (
            <div key={t.id} className="grid grid-cols-[60px_1fr_120px_120px_100px] gap-2 px-4 py-3 text-sm border-b items-center">
              <div className="font-display text-lg">{t.label}</div>
              <div className="text-xs text-muted-foreground truncate font-mono">masaqr.app/m/{restaurant.slug}/{t.id}</div>
              <div>{t.seats}</div>
              <div><span className={`text-xs px-2 py-0.5 rounded border ${STATUS_STYLES[t.status]}`}>{t.status}</span></div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(`masaqr.app/m/${restaurant.slug}/${t.id}`); toast.success("Link copied"); }}><LinkIcon className="h-3 w-3" /></Button>
                <Button size="sm" variant="ghost" onClick={() => setActive(t)}><Printer className="h-3 w-3" /></Button>
              </div>
            </div>
          ))}
        </Card>
      )}

      {view === "print" && (
        <div className="grid lg:grid-cols-[280px_1fr] gap-5">
          <Card className="p-5 h-fit">
            <h3 className="font-display text-lg">Print template</h3>
            <div className="mt-3 space-y-2">
              {PRINT_TEMPLATES.map(t => (
                <button key={t.id} onClick={() => setPrintTemplate(t.id)} className={`w-full text-left p-3 rounded-lg border ${printTemplate === t.id ? "border-ember bg-ember/5" : ""}`}>
                  <div className="text-sm font-medium">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.desc}</div>
                </button>
              ))}
            </div>
            <Button className="mt-4 w-full bg-ember hover:bg-ember/90 text-ember-foreground" onClick={() => toast.success("QR sheet downloaded")}><Download className="h-4 w-4 mr-1.5" />Download PDF</Button>
          </Card>

          <Card className="p-6 bg-foreground/[0.03]">
            <div className="text-xs uppercase text-muted-foreground mb-3">Preview · {PRINT_TEMPLATES.find(t => t.id === printTemplate)?.name}</div>
            <PrintPreview template={printTemplate} tables={branchTables.slice(0, 6)} slug={restaurant.slug} restaurantName={restaurant.name} />
          </Card>
        </div>
      )}

      {active && <TableDialog table={active} onClose={() => setActive(null)} />}
    </div>
  );
}

function PrintPreview({ template, tables, slug, restaurantName }: any) {
  if (template === "tent") {
    return (
      <div className="aspect-[3/4] bg-white shadow-xl mx-auto max-w-sm grid place-items-center">
        <div className="text-center p-8">
          <div className="text-xs uppercase tracking-widest text-neutral-500">Scan to order</div>
          <div className="font-display text-3xl mt-2">{restaurantName}</div>
          <div className="mt-5 grid place-items-center"><QRPattern value={`${slug}/${tables[0]?.id}`} size={180} /></div>
          <div className="mt-3 font-display text-5xl">{tables[0]?.label}</div>
          <div className="text-xs text-neutral-500 mt-2">No app · Just scan</div>
        </div>
      </div>
    );
  }
  if (template === "sticker") {
    return (
      <div className="aspect-square bg-white shadow-xl mx-auto max-w-xs grid place-items-center rounded-full border-4 border-foreground">
        <div className="text-center p-6">
          <QRPattern value={`${slug}/${tables[0]?.id}`} size={120} />
          <div className="font-display text-2xl mt-2">{tables[0]?.label}</div>
        </div>
      </div>
    );
  }
  if (template === "branded") {
    return (
      <div className="aspect-[3/4] bg-white shadow-xl mx-auto max-w-sm overflow-hidden">
        <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600" className="h-1/2 w-full object-cover" alt="" />
        <div className="p-6 text-center">
          <div className="font-display italic text-2xl">{restaurantName}</div>
          <div className="mt-3"><QRPattern value={`${slug}/${tables[0]?.id}`} size={140} className="mx-auto" /></div>
          <div className="font-display text-3xl mt-2">{tables[0]?.label}</div>
        </div>
      </div>
    );
  }
  // sheet
  return (
    <div className="aspect-[1/1.414] bg-white shadow-xl mx-auto max-w-md p-8 grid grid-cols-2 gap-4">
      {tables.map((t: any) => (
        <div key={t.id} className="border border-dashed border-neutral-300 p-3 text-center">
          <QRPattern value={`${slug}/${t.id}`} size={100} className="mx-auto" />
          <div className="font-display text-xl mt-1">{t.label}</div>
          <div className="text-[8px] text-neutral-400">{restaurantName}</div>
        </div>
      ))}
    </div>
  );
}

function TableDialog({ table, onClose }: { table: Table; onClose: () => void }) {
  const { upsertTable, deleteTable, setTableStatus, restaurant } = useStore();
  const [draft, setDraft] = useState(table);
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>{table.label}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-[140px_1fr] gap-4 items-start">
          <div className="rounded-lg border bg-white p-3"><QRPattern value={`${restaurant.slug}/${table.id}`} size={130} /></div>
          <div className="space-y-3">
            <div><Label>Label</Label><Input value={draft.label} onChange={e => setDraft({ ...draft, label: e.target.value })} /></div>
            <div><Label>Seats</Label><Input type="number" value={draft.seats} onChange={e => setDraft({ ...draft, seats: +e.target.value })} /></div>
            <div className="text-xs text-muted-foreground font-mono break-all">masaqr.app/m/{restaurant.slug}/{table.id}</div>
            <div className="flex flex-wrap gap-1">
              {(["available", "seated", "preparing", "ready", "served", "bill_requested", "paid", "cleaning"] as TableStatus[]).map(s => (
                <button key={s} onClick={() => { setTableStatus(table.id, s); toast.success(`${table.label}: ${s}`); }}
                  className={`text-xs px-2 py-1 rounded border ${STATUS_STYLES[s]}`}>{s.replace("_", " ")}</button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="ghost" className="text-destructive" onClick={() => { deleteTable(table.id); toast.success("Table removed"); onClose(); }}>Delete</Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => toast.success("QR regenerated")}><RefreshCw className="h-3.5 w-3.5 mr-1" />Regenerate QR</Button>
            <Button className="bg-ember hover:bg-ember/90 text-ember-foreground" onClick={() => { upsertTable(draft); onClose(); toast.success("Saved"); }}>Save</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
