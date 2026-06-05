import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { P as PageHeader } from "./AppShell-DE5YGknu.mjs";
import { C as Card } from "./card-BdXDhg5r.mjs";
import { B as Button } from "./button-DjOZMqFS.mjs";
import { S as Switch } from "./switch-DkA5ZPe7.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { s as supabase } from "./supabase-C_P_XQd2.mjs";
import { f as fetchOwnerContext, e as fetchMenu, l as localName, a as money } from "./masaqr-BQ3x-CAL.mjs";
import { q as Link, i as Printer, r as Download, z as FileCheckCorner, p as RefreshCw } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-switch.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
const TEMPLATES = [{
  id: "elegant",
  name: "Elegant Minimal",
  vibe: "Təmiz tipografiya · artıq element yoxdur"
}, {
  id: "bistro",
  name: "Modern Bistro",
  vibe: "Şəkilli kartlar · müasir restoran menyusu"
}, {
  id: "luxury",
  name: "Luxury Dark",
  vibe: "Qara qapaq · premium görünüş"
}, {
  id: "casual",
  name: "Casual Cafe",
  vibe: "İsti tonlar · rahat kafe üslubu"
}];
function PdfStudio() {
  const [profile, setProfile] = reactExports.useState(null);
  const [restaurant, setRestaurant] = reactExports.useState(null);
  const [categories, setCategories] = reactExports.useState([]);
  const [items, setItems] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [exporting, setExporting] = reactExports.useState(false);
  const printRef = reactExports.useRef(null);
  const [settings, setSettings] = reactExports.useState({
    template: "elegant",
    language: "az",
    showImages: true,
    showPrices: true,
    showSoldOut: false
  });
  async function loadPdfData() {
    setLoading(true);
    try {
      const ctx = await fetchOwnerContext();
      setProfile(ctx.profile);
      setRestaurant(ctx.restaurant);
      if (!ctx.profile?.restaurant_id) {
        setCategories([]);
        setItems([]);
        return;
      }
      const menu = await fetchMenu(ctx.profile.restaurant_id);
      setCategories(menu.categories.filter((category) => category.is_active));
      setItems(menu.items);
    } catch (error) {
      toast.error(error.message ?? "PDF menyu yüklənmədi");
    } finally {
      setLoading(false);
    }
  }
  reactExports.useEffect(() => {
    loadPdfData();
  }, []);
  const visibleItems = reactExports.useMemo(() => items.filter((item) => item.is_available && (settings.showSoldOut || !item.is_sold_out)), [items, settings.showSoldOut]);
  async function recordExport(status) {
    if (!profile?.restaurant_id) return;
    await supabase.from("masaqr_pdf_exports").insert({
      restaurant_id: profile.restaurant_id,
      language: settings.language === "multi" ? "az" : settings.language,
      category_id: null,
      file_url: null,
      status,
      created_by: profile.id
    });
  }
  function printMenuOnly() {
    if (!printRef.current) return;
    window.print();
  }
  async function exportPdf() {
    setExporting(true);
    try {
      printMenuOnly();
      await recordExport("created");
      toast.success("PDF export qeydə alındı");
    } catch (error) {
      await recordExport("failed");
      toast.error(error.message ?? "PDF export alınmadı");
    } finally {
      setExporting(false);
    }
  }
  function copyPublicLink() {
    const slug = restaurant?.slug ?? "demo";
    const link = `${window.location.origin}/m/${slug}/1`;
    navigator.clipboard?.writeText(link).catch(() => {
    });
    toast.success("Müştəri menyu linki kopyalandı");
  }
  if (loading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-sm text-muted-foreground", children: "PDF menyu yüklənir…" });
  if (!profile?.restaurant_id || !restaurant) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "PDF Menyu", subtitle: "PDF export üçün əvvəl restoran qurulumunu tamamlayın." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-6 text-sm text-muted-foreground", children: "Restoran bu hesaba qoşulmayıb." }) })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: printStyles }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "PDF Menyu", subtitle: "Yalnız yaradılmış menyu PDF/print üçün çıxarılır. Dashboard səhifəsi export olunmur.", actions: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 print:hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: copyPublicLink, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { className: "mr-2 h-4 w-4" }),
        "Menyu linki"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: printMenuOnly, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "mr-2 h-4 w-4" }),
        "Print"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: exportPdf, disabled: exporting, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "mr-2 h-4 w-4" }),
        exporting ? "Export olunur..." : "Export PDF"
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 p-6 xl:grid-cols-[360px_1fr]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "h-fit p-5 print:hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Ayarlar" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-5 text-sm text-muted-foreground", children: "Bu seçimlər sağdakı canlı PDF menyuya təsir edir." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-3 text-sm font-medium", children: "Template" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: TEMPLATES.map((template) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setSettings((current) => ({
              ...current,
              template: template.id
            })), className: `w-full rounded-lg border p-3 text-left transition ${settings.template === template.id ? "border-ember bg-ember/5 ring-1 ring-ember" : "hover:border-foreground/30"}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: template.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: template.vibe })
            ] }, template.id)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-3 text-sm font-medium", children: "Dil" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-4 gap-2", children: ["az", "en", "ru", "multi"].map((language) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setSettings((current) => ({
              ...current,
              language
            })), className: `rounded border py-2 text-xs uppercase ${settings.language === language ? "border-foreground bg-foreground text-background" : "bg-card"}`, children: language === "multi" ? "3 dil" : language }, language)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-3 text-sm font-medium", children: "Məzmun" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Şəkilləri göstər", v: settings.showImages, on: (showImages) => setSettings((current) => ({
                ...current,
                showImages
              })) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Qiymətləri göstər", v: settings.showPrices, on: (showPrices) => setSettings((current) => ({
                ...current,
                showPrices
              })) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Bitmiş məhsulları göstər", v: settings.showSoldOut, on: (showSoldOut) => setSettings((current) => ({
                ...current,
                showSoldOut
              })) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-muted/40 p-4 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 font-medium", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FileCheckCorner, { className: "h-4 w-4" }),
              "Real menyu datası"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-muted-foreground", children: [
              categories.length,
              " kateqoriya · ",
              visibleItems.length,
              " məhsul"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "mt-3 w-full", variant: "outline", onClick: loadPdfData, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "mr-2 h-4 w-4" }),
              "Yenilə"
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "pdf-print-wrapper overflow-hidden bg-muted/30 p-4 print:border-0 print:bg-white print:p-0 print:shadow-none", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: printRef, className: "pdf-menu-print-root mx-auto max-w-4xl rounded-3xl bg-white shadow-sm print:max-w-none print:rounded-none print:shadow-none", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(PdfCover, { restaurant, settings }),
        categories.map((category) => /* @__PURE__ */ jsxRuntimeExports.jsx(PdfPage, { category, items: visibleItems.filter((item) => item.category_id === category.id), restaurant, settings }, category.id)),
        categories.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-12 text-center text-sm text-muted-foreground", children: "Aktiv kateqoriya yoxdur." }) : null
      ] }) })
    ] })
  ] });
}
function Toggle({
  label,
  v,
  on
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center justify-between rounded-xl border p-3 text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: v, onCheckedChange: on })
  ] });
}
function PdfCover({
  restaurant,
  settings
}) {
  const langLabel = settings.language === "multi" ? "AZ · EN · RU" : settings.language.toUpperCase();
  if (settings.template === "luxury") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "relative min-h-[520px] overflow-hidden rounded-t-3xl bg-neutral-950 p-12 text-white print:rounded-none", children: [
      restaurant.cover_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: restaurant.cover_url, className: "absolute inset-0 h-full w-full object-cover opacity-30" }) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 flex h-full min-h-[420px] flex-col justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm uppercase tracking-[0.4em] text-amber-200", children: "Menyu" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          restaurant.logo_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: restaurant.logo_url, className: "mb-6 h-16 w-16 rounded-full object-cover" }) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-6xl", children: restaurant.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-4 text-amber-100", children: [
            (/* @__PURE__ */ new Date()).getFullYear(),
            " · ",
            langLabel
          ] })
        ] })
      ] })
    ] });
  }
  if (settings.template === "bistro") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "grid min-h-[420px] grid-cols-2 gap-8 p-12", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          restaurant.logo_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: restaurant.logo_url, className: "h-12 w-12 rounded-full object-cover" }) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: restaurant.name })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm uppercase tracking-[0.3em] text-muted-foreground", children: langLabel }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-3 font-display text-6xl leading-none", children: "Menyu" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-muted-foreground", children: "Mövsümi məhsullarla hazırlanmış seçimlər" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
          "/m/",
          restaurant.slug,
          "/1"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-hidden rounded-3xl bg-muted", children: restaurant.cover_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: restaurant.cover_url, className: "h-full w-full object-cover" }) : null })
    ] });
  }
  if (settings.template === "casual") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "min-h-[360px] bg-[#fff7e8] p-12 text-center", children: [
      restaurant.logo_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: restaurant.logo_url, className: "mx-auto mb-6 h-20 w-20 rounded-full object-cover" }) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm uppercase tracking-[0.3em] text-muted-foreground", children: "Bugünkü seçimlər" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-5 font-display text-6xl", children: restaurant.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-6 text-muted-foreground", children: [
        "— ",
        langLabel,
        " —"
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "min-h-[360px] p-12 text-center", children: [
    restaurant.logo_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: restaurant.logo_url, className: "mx-auto mb-6 h-20 w-20 rounded-full object-cover" }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-6xl", children: restaurant.name }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-5 text-sm uppercase tracking-[0.35em] text-muted-foreground", children: [
      "Menyu · ",
      langLabel
    ] })
  ] });
}
function PdfPage({
  category,
  items,
  restaurant,
  settings
}) {
  const langs = settings.language === "multi" ? ["az", "en", "ru"] : [settings.language];
  const primary = langs[0];
  if (settings.template === "luxury") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "border-t bg-neutral-950 p-12 text-white print:min-h-screen", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm uppercase tracking-[0.3em] text-amber-200", children: String(category.sort_order || 1).padStart(2, "0") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 font-display text-4xl", children: localName(category.name, category.name_i18n, primary) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 space-y-6", children: [
        items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(MenuLine, { item, restaurant, settings, langs, luxury: true }, item.id)),
        items.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyLine, {}) : null
      ] })
    ] });
  }
  if (settings.template === "bistro") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "border-t p-12 print:min-h-screen", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8 flex items-end justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: String(category.sort_order || 1).padStart(2, "0") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-4xl uppercase", children: localName(category.name, category.name_i18n, primary) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
          items.length,
          " məhsul"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
        items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCard, { item, restaurant, settings, langs }, item.id)),
        items.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyLine, {}) : null
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: `border-t p-12 print:min-h-screen ${settings.template === "casual" ? "bg-[#fff7e8]" : ""}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-4xl", children: localName(category.name, category.name_i18n, primary) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 space-y-5", children: [
      items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(MenuLine, { item, restaurant, settings, langs }, item.id)),
      items.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyLine, {}) : null
    ] })
  ] });
}
function MultiText({
  item,
  langs,
  field
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: langs.map((lang) => {
    const value = field === "name" ? localName(item.name, item.name_i18n, lang) : localName(item.description, item.description_i18n, lang);
    if (!value) return null;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: field === "name" ? "font-medium" : "text-sm text-muted-foreground", children: [
      langs.length > 1 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mr-2 text-[10px] uppercase text-muted-foreground", children: lang }) : null,
      value
    ] }, lang);
  }) });
}
function MenuCard({
  item,
  restaurant,
  settings,
  langs
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-hidden rounded-2xl border bg-card", children: [
    settings.showImages && item.image_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: item.image_url, className: "h-36 w-full object-cover" }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MultiText, { item, langs, field: "name" }),
        settings.showPrices ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: money(item.price, restaurant.currency) }) : null
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MultiText, { item, langs, field: "description" }) }),
      item.is_sold_out ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-xs uppercase text-muted-foreground", children: "Bitib" }) : null
    ] })
  ] });
}
function MenuLine({
  item,
  restaurant,
  settings,
  langs,
  luxury = false
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 border-b pb-4 last:border-b-0", children: [
    settings.showImages && item.image_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: item.image_url, className: "h-20 w-20 rounded-2xl object-cover" }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MultiText, { item, langs, field: "name" }),
        settings.showPrices ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0 font-semibold", children: money(item.price, restaurant.currency) }) : null
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `mt-1 ${luxury ? "text-neutral-300" : ""}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(MultiText, { item, langs, field: "description" }) }),
      item.is_sold_out ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs uppercase text-muted-foreground", children: "Bitib" }) : null
    ] })
  ] });
}
function EmptyLine() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground", children: "Bu kateqoriyada görünən məhsul yoxdur." });
}
const printStyles = `
@media print {
  @page { size: A4 portrait; margin: 0; }
  html, body { margin: 0 !important; padding: 0 !important; background: white !important; }
  body * { visibility: hidden !important; }
  .pdf-menu-print-root,
  .pdf-menu-print-root * { visibility: visible !important; }
  .pdf-menu-print-wrapper { display: block !important; padding: 0 !important; margin: 0 !important; border: 0 !important; box-shadow: none !important; background: white !important; }
  .pdf-menu-print-root { position: absolute !important; left: 0 !important; top: 0 !important; width: 210mm !important; min-height: 297mm !important; background: white !important; box-shadow: none !important; border-radius: 0 !important; }
  .pdf-menu-print-root section { page-break-inside: avoid; }
  .print:hidden { display: none !important; }
}
`;
export {
  PdfStudio as component
};
