import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { QRPattern } from "@/components/QRPattern";
import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Download,
  Printer,
  RefreshCw,
  Link as LinkIcon,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import {
  fetchOwnerContext,
  type Profile,
  type RestaurantRow,
  type TableRow,
} from "@/lib/masaqr";

export const Route = createFileRoute("/app/tables")({
  head: () => ({ meta: [{ title: "Masalar və QR — MasaQR" }] }),
  component: TablesPage,
});

type MasaqrTableStatus = "available" | "occupied" | "reserved" | "disabled";

type TableDraft = {
  table_number: string;
  table_name: string;
  status: MasaqrTableStatus;
};

const STATUS_STYLES: Record<MasaqrTableStatus, string> = {
  available: "bg-muted text-muted-foreground border-border",
  occupied: "bg-sky-100 text-sky-900 border-sky-200",
  reserved: "bg-amber-100 text-amber-900 border-amber-200",
  disabled: "bg-neutral-200 text-neutral-700 border-neutral-300",
};

const STATUS_LABELS: Record<MasaqrTableStatus, string> = {
  available: "Boş",
  occupied: "Dolu",
  reserved: "Rezerv",
  disabled: "Deaktiv",
};

const VIEW_LABELS = {
  grid: "Kartlar",
  list: "Siyahı",
  print: "Çap",
} as const;

const PRINT_TEMPLATES = [
  { id: "tent", name: "Masa kartı", desc: "Qatlanmış kart, iki tərəf" },
  { id: "sticker", name: "Masa stikerı", desc: "Dairəvi, 80mm" },
  { id: "sheet", name: "QR vərəqi · 6/səhifə", desc: "Kəs və masalara yerləşdir" },
  { id: "branded", name: "Brendli kart", desc: "Üz şəkli + QR" },
];

function getBaseUrl() {
  if (typeof window === "undefined") return "https://masaqr.online";
  return window.location.origin;
}

function tableLabel(table: TableRow) {
  return table.table_name || `Masa ${table.table_number}`;
}

function tableUrl(restaurant: RestaurantRow | null, table: TableRow) {
  const slug = restaurant?.slug || "demo";
  return `${getBaseUrl()}/m/${slug}/${table.table_number}`;
}

function newQrToken() {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function TablesPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [restaurant, setRestaurant] = useState<RestaurantRow | null>(null);
  const [tables, setTables] = useState<TableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list" | "print">("grid");
  const [printTemplate, setPrintTemplate] = useState("tent");
  const [active, setActive] = useState<TableRow | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<TableDraft>({
    table_number: "",
    table_name: "",
    status: "available",
  });

  async function loadTables() {
    try {
      const ctx = await fetchOwnerContext();
      setProfile(ctx.profile);
      setRestaurant(ctx.restaurant);

      if (!ctx.profile?.restaurant_id) {
        setTables([]);
        return;
      }

      const { data, error } = await supabase
        .from("masaqr_tables")
        .select("*")
        .eq("restaurant_id", ctx.profile.restaurant_id)
        .order("table_number", { ascending: true });

      if (error) throw error;
      setTables((data ?? []) as TableRow[]);
    } catch (error: any) {
      toast.error(error.message ?? "Masalar yüklənmədi");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTables();

    const channel = supabase
      .channel("tables-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "masaqr_tables" },
        () => loadTables()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const sortedTables = useMemo(() => tables, [tables]);

  async function createTable() {
    if (!profile?.restaurant_id) {
      toast.error("Restoran profili tapılmadı");
      return;
    }

    const tableNumber = draft.table_number.trim();
    if (!tableNumber) {
      toast.error("Masa nömrəsi vacibdir");
      return;
    }

    setCreating(true);

    try {
      const { error } = await supabase.from("masaqr_tables").insert({
        restaurant_id: profile.restaurant_id,
        table_number: tableNumber,
        table_name: draft.table_name.trim() || null,
        status: draft.status,
      });

      if (error) throw error;

      toast.success("Masa əlavə edildi");
      setDraft({ table_number: "", table_name: "", status: "available" });
      setCreateOpen(false);
      await loadTables();
    } catch (error: any) {
      toast.error(error.message ?? "Masa əlavə olunmadı");
    } finally {
      setCreating(false);
    }
  }

  async function updateTable(id: string, patch: Partial<TableRow>) {
    const { error } = await supabase
      .from("masaqr_tables")
      .update(patch)
      .eq("id", id);

    if (error) {
      toast.error(error.message);
      return false;
    }

    await loadTables();
    return true;
  }

  async function deleteTable(id: string) {
    const { error } = await supabase.from("masaqr_tables").delete().eq("id", id);

    if (error) {
      toast.error(error.message);
      return false;
    }

    await loadTables();
    return true;
  }

  async function copyLink(table: TableRow) {
    await navigator.clipboard.writeText(tableUrl(restaurant, table));
    toast.success("QR link kopyalandı");
  }

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Masalar yüklənir…</div>;
  }

  if (!profile?.restaurant_id) {
    return (
      <div>
        <PageHeader
          title="Masalar və QR"
          subtitle="Masa QR kodları yaratmaq üçün əvvəl restoran qurulumunu tamamlayın."
        />
        <div className="p-6">
          <Card className="p-6 text-sm text-muted-foreground">
            Bu hesaba restoran qoşulmayıb.
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Masalar və QR"
        subtitle="Masa QR linklərini restoran səviyyəsində yaradın və idarə edin."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setView("print")}>
              <Printer className="mr-2 h-4 w-4" />
              QR çapı
            </Button>
            <Button
              onClick={() => setCreateOpen(true)}
              className="bg-ember hover:bg-ember/90 text-ember-foreground"
            >
              <Plus className="mr-2 h-4 w-4" />
              Masa əlavə et
            </Button>
          </div>
        }
      />

      <div className="p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {(["grid", "list", "print"] as const).map((value) => (
              <button
                key={value}
                onClick={() => setView(value)}
                className={`px-3 py-1.5 rounded-md border text-sm ${
                  view === value ? "bg-foreground text-background" : "bg-card hover:bg-muted"
                }`}
              >
                {VIEW_LABELS[value]}
              </button>
            ))}
          </div>

          <Button variant="outline" size="sm" onClick={loadTables}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Yenilə
          </Button>
        </div>

        {view === "grid" ? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {sortedTables.map((table) => {
              const status = (table.status as MasaqrTableStatus) || "available";
              return (
                <button
                  key={table.id}
                  onClick={() => setActive(table)}
                  className={`aspect-square rounded-xl border-2 p-3 flex flex-col items-start justify-between ${STATUS_STYLES[status] ?? STATUS_STYLES.available} hover:scale-[1.02] transition text-left`}
                >
                  <div>
                    <div className="text-2xl font-semibold">{tableLabel(table)}</div>
                    <div className="mt-1 text-xs">{STATUS_LABELS[status] ?? status}</div>
                  </div>
                  <div className="rounded-xl bg-background/70 p-2">
                    <QRPattern value={tableUrl(restaurant, table)} size={72} />
                  </div>
                </button>
              );
            })}

            {sortedTables.length === 0 ? (
              <Card className="col-span-full border-dashed p-8 text-center text-sm text-muted-foreground">
                Hələ masa yoxdur. İlk QR masanı əlavə edin.
              </Card>
            ) : null}
          </div>
        ) : null}

        {view === "list" ? (
          <Card className="overflow-hidden">
            <div className="grid grid-cols-[1fr_2fr_1fr_1fr] gap-3 border-b px-4 py-3 text-xs font-medium uppercase text-muted-foreground">
              <div>Masa</div>
              <div>QR link</div>
              <div>Status</div>
              <div>Əməliyyatlar</div>
            </div>

            {sortedTables.map((table) => {
              const status = (table.status as MasaqrTableStatus) || "available";
              return (
                <div
                  key={table.id}
                  className="grid grid-cols-[1fr_2fr_1fr_1fr] items-center gap-3 border-b px-4 py-3 text-sm last:border-b-0"
                >
                  <div className="font-medium">{tableLabel(table)}</div>
                  <div className="truncate text-muted-foreground">{tableUrl(restaurant, table)}</div>
                  <div>{STATUS_LABELS[status] ?? status}</div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => copyLink(table)}>
                      <LinkIcon className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setActive(table)}>
                      Düzəlt
                    </Button>
                  </div>
                </div>
              );
            })}

            {sortedTables.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Hələ masa yoxdur.
              </div>
            ) : null}
          </Card>
        ) : null}

        {view === "print" ? (
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <Card className="p-4">
              <h3 className="font-medium">Çap dizaynı</h3>
              <div className="mt-3 space-y-2">
                {PRINT_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setPrintTemplate(template.id)}
                    className={`w-full text-left p-3 rounded-lg border ${
                      printTemplate === template.id ? "border-ember bg-ember/5" : ""
                    }`}
                  >
                    <div className="font-medium text-sm">{template.name}</div>
                    <div className="text-xs text-muted-foreground">{template.desc}</div>
                  </button>
                ))}
              </div>
              <Button
                className="mt-4 w-full"
                onClick={() => toast.info("QR PDF export ayrıca mərhələdə tamamlanacaq.")}
              >
                <Download className="mr-2 h-4 w-4" />
                PDF yüklə
              </Button>
            </Card>

            <Card className="p-5">
              <h3 className="font-medium mb-4">
                Ön baxış · {PRINT_TEMPLATES.find((template) => template.id === printTemplate)?.name}
              </h3>
              <PrintPreview
                template={printTemplate}
                tables={sortedTables}
                restaurant={restaurant}
              />
            </Card>
          </div>
        ) : null}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Masa əlavə et</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Masa nömrəsi</Label>
              <Input
                value={draft.table_number}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, table_number: event.target.value }))
                }
                placeholder="1"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Masa adı</Label>
              <Input
                value={draft.table_name}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, table_name: event.target.value }))
                }
                placeholder="Masa 1"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Status</Label>
              <select
                value={draft.status}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    status: event.target.value as MasaqrTableStatus,
                  }))
                }
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="available">Boş</option>
                <option value="occupied">Dolu</option>
                <option value="reserved">Rezerv</option>
                <option value="disabled">Deaktiv</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Bağla
            </Button>
            <Button disabled={creating} onClick={createTable}>
              {creating ? "Əlavə olunur..." : "Masa əlavə et"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {active ? (
        <TableDialog
          table={active}
          restaurant={restaurant}
          onClose={() => setActive(null)}
          onCopy={copyLink}
          onDelete={async (id) => {
            const ok = await deleteTable(id);
            if (ok) {
              toast.success("Masa silindi");
              setActive(null);
            }
          }}
          onSave={async (tableId, patch) => {
            const ok = await updateTable(tableId, patch);
            if (ok) {
              toast.success("Masa yadda saxlandı");
              setActive(null);
            }
          }}
        />
      ) : null}
    </div>
  );
}

function PrintPreview({
  template,
  tables,
  restaurant,
}: {
  template: string;
  tables: TableRow[];
  restaurant: RestaurantRow | null;
}) {
  const first = tables[0];

  if (!tables.length) {
    return (
      <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
        Çap üçün masa yoxdur.
      </div>
    );
  }

  if (template === "tent") {
    return (
      <div className="mx-auto w-[360px] rounded-3xl border-2 border-dashed p-6 text-center">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Sifariş üçün skan edin</p>
        <h3 className="mt-1 text-2xl font-semibold">{restaurant?.name}</h3>
        <div className="my-5 flex justify-center">
          <QRPattern value={tableUrl(restaurant, first)} size={180} />
        </div>
        <p className="font-medium">{tableLabel(first)}</p>
        <p className="mt-1 text-xs text-muted-foreground">Tətbiq lazım deyil · sadəcə skan edin</p>
      </div>
    );
  }

  if (template === "sticker") {
    return (
      <div className="mx-auto grid h-72 w-72 place-items-center rounded-full border-2 border-dashed text-center">
        <div>
          <QRPattern value={tableUrl(restaurant, first)} size={150} />
          <p className="mt-2 font-medium">{tableLabel(first)}</p>
        </div>
      </div>
    );
  }

  if (template === "branded") {
    return (
      <div className="mx-auto w-[360px] overflow-hidden rounded-3xl border bg-card">
        {restaurant?.cover_url ? (
          <img src={restaurant.cover_url} className="h-28 w-full object-cover" alt="" />
        ) : (
          <div className="h-28 bg-gradient-to-br from-ember/20 to-sage/20" />
        )}
        <div className="p-5 text-center">
          <h3 className="text-xl font-semibold">{restaurant?.name}</h3>
          <div className="my-4 flex justify-center">
            <QRPattern value={tableUrl(restaurant, first)} size={150} />
          </div>
          <p>{tableLabel(first)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      {tables.map((table) => (
        <div key={table.id} className="rounded-2xl border p-4 text-center">
          <QRPattern value={tableUrl(restaurant, table)} size={110} className="mx-auto" />
          <p className="mt-2 font-medium">{tableLabel(table)}</p>
          <p className="text-xs text-muted-foreground">{restaurant?.name}</p>
        </div>
      ))}
    </div>
  );
}

function TableDialog({
  table,
  restaurant,
  onClose,
  onCopy,
  onDelete,
  onSave,
}: {
  table: TableRow;
  restaurant: RestaurantRow | null;
  onClose: () => void;
  onCopy: (table: TableRow) => void;
  onDelete: (id: string) => void;
  onSave: (id: string, patch: Partial<TableRow>) => void;
}) {
  const [draft, setDraft] = useState({
    table_number: table.table_number,
    table_name: table.table_name ?? "",
    status: table.status as MasaqrTableStatus,
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tableLabel(table)}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Masa nömrəsi</Label>
            <Input
              value={draft.table_number}
              onChange={(event) =>
                setDraft((current) => ({ ...current, table_number: event.target.value }))
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label>Masa adı</Label>
            <Input
              value={draft.table_name}
              onChange={(event) =>
                setDraft((current) => ({ ...current, table_name: event.target.value }))
              }
            />
          </div>

          <div className="rounded-xl border bg-muted/30 p-3">
            <div className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
              Müştəri linki
            </div>
            <div className="break-all text-sm">{tableUrl(restaurant, table)}</div>
            <Button className="mt-3" variant="outline" size="sm" onClick={() => onCopy(table)}>
              <LinkIcon className="mr-2 h-4 w-4" />
              Linki kopyala
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <div className="flex flex-wrap gap-2">
              {(["available", "occupied", "reserved", "disabled"] as MasaqrTableStatus[]).map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => setDraft((current) => ({ ...current, status }))}
                    className={`text-xs px-2 py-1 rounded border ${
                      draft.status === status ? STATUS_STYLES[status] : "bg-card"
                    }`}
                  >
                    {STATUS_LABELS[status]}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="destructive" onClick={() => onDelete(table.id)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Sil
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              onSave(table.id, {
                qr_token: newQrToken(),
              })
            }
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            QR yenilə
          </Button>
          <Button
            onClick={() =>
              onSave(table.id, {
                table_number: draft.table_number.trim(),
                table_name: draft.table_name.trim() || null,
                status: draft.status,
              })
            }
          >
            Yadda saxla
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
