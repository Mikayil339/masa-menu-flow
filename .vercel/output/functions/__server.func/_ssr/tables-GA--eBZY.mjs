import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { P as PageHeader } from "./AppShell-DE5YGknu.mjs";
import { C as Card } from "./card-BdXDhg5r.mjs";
import { B as Button } from "./button-DjOZMqFS.mjs";
import { I as Input } from "./input-D_U8fI25.mjs";
import { L as Label } from "./label-C8WJLhmR.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogFooter } from "./dialog-Fr-Qmdjb.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { s as supabase } from "./supabase-C_P_XQd2.mjs";
import { f as fetchOwnerContext } from "./masaqr-BQ3x-CAL.mjs";
import { i as Printer, o as Plus, p as RefreshCw, q as Link, r as Download, T as Trash2 } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "./Logo-g-ujtk54.mjs";
import "./store-MU1TcehK.mjs";
import "../_libs/zustand.mjs";
import "./i18n-BZSpJObU.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/react-remove-scroll.mjs";
import "tslib";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "../_libs/supabase__functions-js.mjs";
function QRPattern({ value, size = 160, className = "" }) {
  let h = 0;
  for (let i = 0; i < value.length; i++) h = h * 31 + value.charCodeAt(i) | 0;
  const N = 21;
  const cells = Array.from({ length: N }, () => Array(N).fill(false));
  let x = h >>> 0;
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    x = x * 1103515245 + 12345 & 2147483647;
    cells[r][c] = (x & 7) > 3;
  }
  const finder = (r, c) => {
    for (let i = -1; i <= 7; i++) for (let j = -1; j <= 7; j++) {
      const rr = r + i, cc = c + j;
      if (rr < 0 || rr >= N || cc < 0 || cc >= N) continue;
      if (i === -1 || i === 7 || j === -1 || j === 7) cells[rr][cc] = false;
      else if (i === 0 || i === 6 || j === 0 || j === 6) cells[rr][cc] = true;
      else if (i >= 2 && i <= 4 && j >= 2 && j <= 4) cells[rr][cc] = true;
      else cells[rr][cc] = false;
    }
  };
  finder(0, 0);
  finder(0, N - 7);
  finder(N - 7, 0);
  const cell = size / N;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: size, height: size, viewBox: `0 0 ${size} ${size}`, className, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { width: size, height: size, fill: "white" }),
    cells.flatMap((row, r) => row.map(
      (on, c) => on ? /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: c * cell, y: r * cell, width: cell, height: cell, fill: "#1a1410" }, `${r}-${c}`) : null
    ))
  ] });
}
const STATUS_STYLES = {
  available: "bg-muted text-muted-foreground border-border",
  occupied: "bg-sky-100 text-sky-900 border-sky-200",
  reserved: "bg-amber-100 text-amber-900 border-amber-200",
  disabled: "bg-neutral-200 text-neutral-700 border-neutral-300"
};
const STATUS_LABELS = {
  available: "Boş",
  occupied: "Dolu",
  reserved: "Rezerv",
  disabled: "Deaktiv"
};
const VIEW_LABELS = {
  grid: "Kartlar",
  list: "Siyahı",
  print: "Çap"
};
const PRINT_TEMPLATES = [{
  id: "tent",
  name: "Masa kartı",
  desc: "Qatlanmış kart, iki tərəf"
}, {
  id: "sticker",
  name: "Masa stikerı",
  desc: "Dairəvi, 80mm"
}, {
  id: "sheet",
  name: "QR vərəqi · 6/səhifə",
  desc: "Kəs və masalara yerləşdir"
}, {
  id: "branded",
  name: "Brendli kart",
  desc: "Üz şəkli + QR"
}];
function getBaseUrl() {
  if (typeof window === "undefined") return "https://masaqr.online";
  return window.location.origin;
}
function tableLabel(table) {
  return table.table_name || `Masa ${table.table_number}`;
}
function tableUrl(restaurant, table) {
  const slug = restaurant?.slug || "demo";
  return `${getBaseUrl()}/m/${slug}/${table.table_number}`;
}
function newQrToken() {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
function TablesPage() {
  const [profile, setProfile] = reactExports.useState(null);
  const [restaurant, setRestaurant] = reactExports.useState(null);
  const [tables, setTables] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [view, setView] = reactExports.useState("grid");
  const [printTemplate, setPrintTemplate] = reactExports.useState("tent");
  const [active, setActive] = reactExports.useState(null);
  const [createOpen, setCreateOpen] = reactExports.useState(false);
  const [creating, setCreating] = reactExports.useState(false);
  const [draft, setDraft] = reactExports.useState({
    table_number: "",
    table_name: "",
    status: "available"
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
      const {
        data,
        error
      } = await supabase.from("masaqr_tables").select("*").eq("restaurant_id", ctx.profile.restaurant_id).order("table_number", {
        ascending: true
      });
      if (error) throw error;
      setTables(data ?? []);
    } catch (error) {
      toast.error(error.message ?? "Masalar yüklənmədi");
    } finally {
      setLoading(false);
    }
  }
  reactExports.useEffect(() => {
    loadTables();
    const channel = supabase.channel("tables-live").on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "masaqr_tables"
    }, () => loadTables()).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  const sortedTables = reactExports.useMemo(() => tables, [tables]);
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
      const {
        error
      } = await supabase.from("masaqr_tables").insert({
        restaurant_id: profile.restaurant_id,
        table_number: tableNumber,
        table_name: draft.table_name.trim() || null,
        status: draft.status
      });
      if (error) throw error;
      toast.success("Masa əlavə edildi");
      setDraft({
        table_number: "",
        table_name: "",
        status: "available"
      });
      setCreateOpen(false);
      await loadTables();
    } catch (error) {
      toast.error(error.message ?? "Masa əlavə olunmadı");
    } finally {
      setCreating(false);
    }
  }
  async function updateTable(id, patch) {
    const {
      error
    } = await supabase.from("masaqr_tables").update(patch).eq("id", id);
    if (error) {
      toast.error(error.message);
      return false;
    }
    await loadTables();
    return true;
  }
  async function deleteTable(id) {
    const {
      error
    } = await supabase.from("masaqr_tables").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return false;
    }
    await loadTables();
    return true;
  }
  async function copyLink(table) {
    await navigator.clipboard.writeText(tableUrl(restaurant, table));
    toast.success("QR link kopyalandı");
  }
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-sm text-muted-foreground", children: "Masalar yüklənir…" });
  }
  if (!profile?.restaurant_id) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Masalar və QR", subtitle: "Masa QR kodları yaratmaq üçün əvvəl restoran qurulumunu tamamlayın." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-6 text-sm text-muted-foreground", children: "Bu hesaba restoran qoşulmayıb." }) })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Masalar və QR", subtitle: "Masa QR linklərini restoran səviyyəsində yaradın və idarə edin.", actions: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => setView("print"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "mr-2 h-4 w-4" }),
        "QR çapı"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setCreateOpen(true), className: "bg-ember hover:bg-ember/90 text-ember-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-2 h-4 w-4" }),
        "Masa əlavə et"
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: ["grid", "list", "print"].map((value) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setView(value), className: `px-3 py-1.5 rounded-md border text-sm ${view === value ? "bg-foreground text-background" : "bg-card hover:bg-muted"}`, children: VIEW_LABELS[value] }, value)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: loadTables, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "mr-2 h-4 w-4" }),
          "Yenilə"
        ] })
      ] }),
      view === "grid" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4", children: [
        sortedTables.map((table) => {
          const status = table.status || "available";
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setActive(table), className: `aspect-square rounded-xl border-2 p-3 flex flex-col items-start justify-between ${STATUS_STYLES[status] ?? STATUS_STYLES.available} hover:scale-[1.02] transition text-left`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-semibold", children: tableLabel(table) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-xs", children: STATUS_LABELS[status] ?? status })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl bg-background/70 p-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(QRPattern, { value: tableUrl(restaurant, table), size: 72 }) })
          ] }, table.id);
        }),
        sortedTables.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "col-span-full border-dashed p-8 text-center text-sm text-muted-foreground", children: "Hələ masa yoxdur. İlk QR masanı əlavə edin." }) : null
      ] }) : null,
      view === "list" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[1fr_2fr_1fr_1fr] gap-3 border-b px-4 py-3 text-xs font-medium uppercase text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Masa" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "QR link" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Əməliyyatlar" })
        ] }),
        sortedTables.map((table) => {
          const status = table.status || "available";
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[1fr_2fr_1fr_1fr] items-center gap-3 border-b px-4 py-3 text-sm last:border-b-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: tableLabel(table) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-muted-foreground", children: tableUrl(restaurant, table) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: STATUS_LABELS[status] ?? status }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => copyLink(table), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => setActive(table), children: "Düzəlt" })
            ] })
          ] }, table.id);
        }),
        sortedTables.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-8 text-center text-sm text-muted-foreground", children: "Hələ masa yoxdur." }) : null
      ] }) : null,
      view === "print" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 lg:grid-cols-[280px_1fr]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium", children: "Çap dizaynı" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 space-y-2", children: PRINT_TEMPLATES.map((template) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setPrintTemplate(template.id), className: `w-full text-left p-3 rounded-lg border ${printTemplate === template.id ? "border-ember bg-ember/5" : ""}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-sm", children: template.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: template.desc })
          ] }, template.id)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "mt-4 w-full", onClick: () => toast.info("QR PDF export ayrıca mərhələdə tamamlanacaq."), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "mr-2 h-4 w-4" }),
            "PDF yüklə"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-medium mb-4", children: [
            "Ön baxış · ",
            PRINT_TEMPLATES.find((template) => template.id === printTemplate)?.name
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(PrintPreview, { template: printTemplate, tables: sortedTables, restaurant })
        ] })
      ] }) : null
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: createOpen, onOpenChange: setCreateOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Masa əlavə et" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Masa nömrəsi" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: draft.table_number, onChange: (event) => setDraft((current) => ({
            ...current,
            table_number: event.target.value
          })), placeholder: "1" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Masa adı" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: draft.table_name, onChange: (event) => setDraft((current) => ({
            ...current,
            table_name: event.target.value
          })), placeholder: "Masa 1" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: draft.status, onChange: (event) => setDraft((current) => ({
            ...current,
            status: event.target.value
          })), className: "h-10 w-full rounded-md border bg-background px-3 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "available", children: "Boş" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "occupied", children: "Dolu" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "reserved", children: "Rezerv" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "disabled", children: "Deaktiv" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setCreateOpen(false), children: "Bağla" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: creating, onClick: createTable, children: creating ? "Əlavə olunur..." : "Masa əlavə et" })
      ] })
    ] }) }),
    active ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableDialog, { table: active, restaurant, onClose: () => setActive(null), onCopy: copyLink, onDelete: async (id) => {
      const ok = await deleteTable(id);
      if (ok) {
        toast.success("Masa silindi");
        setActive(null);
      }
    }, onSave: async (tableId, patch) => {
      const ok = await updateTable(tableId, patch);
      if (ok) {
        toast.success("Masa yadda saxlandı");
        setActive(null);
      }
    } }) : null
  ] });
}
function PrintPreview({
  template,
  tables,
  restaurant
}) {
  const first = tables[0];
  if (!tables.length) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground", children: "Çap üçün masa yoxdur." });
  }
  if (template === "tent") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto w-[360px] rounded-3xl border-2 border-dashed p-6 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-wide text-muted-foreground", children: "Sifariş üçün skan edin" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-1 text-2xl font-semibold", children: restaurant?.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "my-5 flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(QRPattern, { value: tableUrl(restaurant, first), size: 180 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: tableLabel(first) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Tətbiq lazım deyil · sadəcə skan edin" })
    ] });
  }
  if (template === "sticker") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto grid h-72 w-72 place-items-center rounded-full border-2 border-dashed text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(QRPattern, { value: tableUrl(restaurant, first), size: 150 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 font-medium", children: tableLabel(first) })
    ] }) });
  }
  if (template === "branded") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto w-[360px] overflow-hidden rounded-3xl border bg-card", children: [
      restaurant?.cover_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: restaurant.cover_url, className: "h-28 w-full object-cover", alt: "" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-28 bg-gradient-to-br from-ember/20 to-sage/20" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-semibold", children: restaurant?.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "my-4 flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(QRPattern, { value: tableUrl(restaurant, first), size: 150 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: tableLabel(first) })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-4 md:grid-cols-3", children: tables.map((table) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border p-4 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(QRPattern, { value: tableUrl(restaurant, table), size: 110, className: "mx-auto" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 font-medium", children: tableLabel(table) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: restaurant?.name })
  ] }, table.id)) });
}
function TableDialog({
  table,
  restaurant,
  onClose,
  onCopy,
  onDelete,
  onSave
}) {
  const [draft, setDraft] = reactExports.useState({
    table_number: table.table_number,
    table_name: table.table_name ?? "",
    status: table.status
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: tableLabel(table) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Masa nömrəsi" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: draft.table_number, onChange: (event) => setDraft((current) => ({
          ...current,
          table_number: event.target.value
        })) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Masa adı" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: draft.table_name, onChange: (event) => setDraft((current) => ({
          ...current,
          table_name: event.target.value
        })) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-muted/30 p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 text-xs uppercase tracking-wide text-muted-foreground", children: "Müştəri linki" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "break-all text-sm", children: tableUrl(restaurant, table) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "mt-3", variant: "outline", size: "sm", onClick: () => onCopy(table), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { className: "mr-2 h-4 w-4" }),
          "Linki kopyala"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: ["available", "occupied", "reserved", "disabled"].map((status) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDraft((current) => ({
          ...current,
          status
        })), className: `text-xs px-2 py-1 rounded border ${draft.status === status ? STATUS_STYLES[status] : "bg-card"}`, children: STATUS_LABELS[status] }, status)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2 sm:gap-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "destructive", onClick: () => onDelete(table.id), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "mr-2 h-4 w-4" }),
        "Sil"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => onSave(table.id, {
        qr_token: newQrToken()
      }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "mr-2 h-4 w-4" }),
        "QR yenilə"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => onSave(table.id, {
        table_number: draft.table_number.trim(),
        table_name: draft.table_name.trim() || null,
        status: draft.status
      }), children: "Yadda saxla" })
    ] })
  ] }) });
}
export {
  TablesPage as component
};
