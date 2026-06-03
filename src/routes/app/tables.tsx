import { createFileRoute, Link } from "@tanstack/react-router";
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
  type BranchRow,
  type Profile,
  type RestaurantRow,
  type TableRow,
} from "@/lib/masaqr";

export const Route = createFileRoute("/app/tables")({
  head: () => ({ meta: [{ title: "QR & Tables — MasaQR" }] }),
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

const PRINT_TEMPLATES = [
  { id: "tent", name: "Table tent", desc: "Folded card, 2 sides" },
  { id: "sticker", name: "Table sticker", desc: "Round, 80mm" },
  { id: "sheet", name: "QR sheet · 6/page", desc: "Cut & distribute" },
  { id: "branded", name: "Branded card", desc: "Cover image + QR" },
];

function getBaseUrl() {
  if (typeof window === "undefined") return "https://masaqr.online";
  return window.location.origin;
}

function tableLabel(table: TableRow) {
  return table.table_name || `Table ${table.table_number}`;
}

function tableUrl(restaurant: RestaurantRow | null, table: TableRow) {
  const slug = restaurant?.slug || "demo";
  return `${getBaseUrl()}/m/${slug}/${table.table_number}`;
}

function newQrToken() {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function TablesPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [restaurant, setRestaurant] = useState<RestaurantRow | null>(null);
  const [branches, setBranches] = useState<BranchRow[]>([]);
  const [activeBranchId, setActiveBranchId] = useState<string>("");
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
      setBranches(ctx.branches);

      const defaultBranch = ctx.profile?.branch_id || ctx.branches[0]?.id || "";
      setActiveBranchId((current) => current || defaultBranch);

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
      toast.error(error.message ?? "Could not load tables");
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

  const branchTables = useMemo(() => {
    if (!activeBranchId) return tables;
    return tables.filter((table) => table.branch_id === activeBranchId);
  }, [tables, activeBranchId]);

  async function createTable() {
    if (!profile?.restaurant_id) {
      toast.error("Restaurant profile not found");
      return;
    }

    const branchId = activeBranchId || branches[0]?.id;
    if (!branchId) {
      toast.error("Create a branch before adding tables");
      return;
    }

    const tableNumber = draft.table_number.trim();
    if (!tableNumber) {
      toast.error("Table number is required");
      return;
    }

    setCreating(true);

    try {
      const { error } = await supabase.from("masaqr_tables").insert({
        restaurant_id: profile.restaurant_id,
        branch_id: branchId,
        table_number: tableNumber,
        table_name: draft.table_name.trim() || null,
        status: draft.status,
      });

      if (error) throw error;

      toast.success("Table added");
      setDraft({ table_number: "", table_name: "", status: "available" });
      setCreateOpen(false);
      await loadTables();
    } catch (error: any) {
      toast.error(error.message ?? "Could not add table");
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
    toast.success("QR link copied");
  }

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading tables…</div>;
  }

  if (!profile?.restaurant_id) {
    return (
      <div>
        <PageHeader
          title="QR & Tables"
          subtitle="Complete restaurant setup before creating table QR codes."
        />
        <div className="p-6">
          <Card className="p-6 text-sm text-muted-foreground">
            No restaurant is connected to this account.
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="QR & Tables"
        subtitle="Generate real customer links from Supabase table records."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setView("print")}>
              <Printer className="mr-2 h-4 w-4" />
              Print QRs
            </Button>
            <Button
              onClick={() => setCreateOpen(true)}
              className="bg-ember hover:bg-ember/90 text-ember-foreground"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add table
            </Button>
          </div>
        }
      />

      <div className="p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {branches.length > 1 ? (
              <select
                value={activeBranchId}
                onChange={(event) => setActiveBranchId(event.target.value)}
                className="h-9 rounded-md border bg-background px-3 text-sm"
              >
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            ) : null}

            {(["grid", "list", "print"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-md border text-sm capitalize ${
                  view === v ? "bg-foreground text-background" : "bg-card hover:bg-muted"
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          <Button variant="outline" size="sm" onClick={loadTables}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {view === "grid" ? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {branchTables.map((table) => (
              <button
                key={table.id}
                onClick={() => setActive(table)}
                className={`aspect-square rounded-xl border-2 p-3 flex flex-col items-start justify-between ${STATUS_STYLES[table.status as MasaqrTableStatus] ?? STATUS_STYLES.available} hover:scale-[1.02] transition text-left`}
              >
                <div>
                  <div className="text-2xl font-semibold">{tableLabel(table)}</div>
                  <div className="mt-1 text-xs capitalize">
                    {table.status.replace("_", " ")}
                  </div>
                </div>
                <div className="rounded-xl bg-background/70 p-2">
                  <QRPattern value={tableUrl(restaurant, table)} size={72} />
                </div>
              </button>
            ))}

            {branchTables.length === 0 ? (
              <Card className="col-span-full border-dashed p-8 text-center text-sm text-muted-foreground">
                No tables yet. Add your first QR table.
              </Card>
            ) : null}
          </div>
        ) : null}

        {view === "list" ? (
          <Card className="overflow-hidden">
            <div className="grid grid-cols-[1fr_2fr_1fr_1fr] gap-3 border-b px-4 py-3 text-xs font-medium uppercase text-muted-foreground">
              <div>Table</div>
              <div>QR link</div>
              <div>Status</div>
              <div>Actions</div>
            </div>

            {branchTables.map((table) => (
              <div
                key={table.id}
                className="grid grid-cols-[1fr_2fr_1fr_1fr] items-center gap-3 border-b px-4 py-3 text-sm last:border-b-0"
              >
                <div className="font-medium">{tableLabel(table)}</div>
                <div className="truncate text-muted-foreground">{tableUrl(restaurant, table)}</div>
                <div className="capitalize">{table.status}</div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => copyLink(table)}>
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setActive(table)}>
                    Edit
                  </Button>
                </div>
              </div>
            ))}

            {branchTables.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No tables yet.
              </div>
            ) : null}
          </Card>
        ) : null}

        {view === "print" ? (
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <Card className="p-4">
              <h3 className="font-medium">Print template</h3>
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
                onClick={() => toast.info("PDF download will be connected in the PDF export step.")}
              >
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </Card>

            <Card className="p-5">
              <h3 className="font-medium mb-4">
                Preview · {PRINT_TEMPLATES.find((t) => t.id === printTemplate)?.name}
              </h3>
              <PrintPreview
                template={printTemplate}
                tables={branchTables}
                restaurant={restaurant}
              />
            </Card>
          </div>
        ) : null}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add table</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Table number</Label>
              <Input
                value={draft.table_number}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, table_number: event.target.value }))
                }
                placeholder="1"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Table name</Label>
              <Input
                value={draft.table_name}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, table_name: event.target.value }))
                }
                placeholder="Table 1"
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
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="reserved">Reserved</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button disabled={creating} onClick={createTable}>
              {creating ? "Adding..." : "Add table"}
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
              toast.success("Table removed");
              setActive(null);
            }
          }}
          onSave={async (tableId, patch) => {
            const ok = await updateTable(tableId, patch);
            if (ok) {
              toast.success("Table saved");
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
        No tables to preview.
      </div>
    );
  }

  if (template === "tent") {
    return (
      <div className="mx-auto w-[360px] rounded-3xl border-2 border-dashed p-6 text-center">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Scan to order</p>
        <h3 className="mt-1 text-2xl font-semibold">{restaurant?.name}</h3>
        <div className="my-5 flex justify-center">
          <QRPattern value={tableUrl(restaurant, first)} size={180} />
        </div>
        <p className="font-medium">{tableLabel(first)}</p>
        <p className="mt-1 text-xs text-muted-foreground">No app · Just scan</p>
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
          <img src={restaurant.cover_url} className="h-28 w-full object-cover" />
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
            <Label>Table number</Label>
            <Input
              value={draft.table_number}
              onChange={(event) =>
                setDraft((current) => ({ ...current, table_number: event.target.value }))
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label>Table name</Label>
            <Input
              value={draft.table_name}
              onChange={(event) =>
                setDraft((current) => ({ ...current, table_name: event.target.value }))
              }
            />
          </div>

          <div className="rounded-xl border bg-muted/30 p-3">
            <div className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
              Customer link
            </div>
            <div className="break-all text-sm">{tableUrl(restaurant, table)}</div>
            <Button className="mt-3" variant="outline" size="sm" onClick={() => onCopy(table)}>
              <LinkIcon className="mr-2 h-4 w-4" />
              Copy link
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
                    className={`text-xs px-2 py-1 rounded border capitalize ${
                      draft.status === status ? STATUS_STYLES[status] : "bg-card"
                    }`}
                  >
                    {status}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="destructive" onClick={() => onDelete(table.id)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
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
            Regenerate QR
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
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
