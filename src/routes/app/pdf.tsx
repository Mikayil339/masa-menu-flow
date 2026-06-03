import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Download, Printer, Link as LinkIcon, RefreshCw, FileCheck2 } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  fetchMenu,
  fetchOwnerContext,
  localName,
  money,
  type CategoryRow,
  type MenuItemRow,
  type Profile,
  type RestaurantRow,
} from "@/lib/masaqr";
import type { Lang } from "@/lib/store";

export const Route = createFileRoute("/app/pdf")({
  head: () => ({
    meta: [{ title: "PDF Menu — MasaQR" }],
  }),
  component: PdfStudio,
});

type PdfTemplate = "elegant" | "bistro" | "luxury" | "casual";
type PdfLanguage = Lang | "multi";

type PdfSettings = {
  template: PdfTemplate;
  language: PdfLanguage;
  showImages: boolean;
  showPrices: boolean;
  showSoldOut: boolean;
};

const TEMPLATES: { id: PdfTemplate; name: string; vibe: string }[] = [
  { id: "elegant", name: "Elegant Minimal", vibe: "Whitespace · pure type · no images" },
  { id: "bistro", name: "Modern Bistro", vibe: "Two-column · grid · image cards" },
  { id: "luxury", name: "Luxury Dark", vibe: "Dark cover · serif · gold accents" },
  { id: "casual", name: "Casual Cafe", vibe: "Warm cream · handwritten · friendly" },
];

function PdfStudio() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [restaurant, setRestaurant] = useState<RestaurantRow | null>(null);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [items, setItems] = useState<MenuItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [settings, setSettings] = useState<PdfSettings>({
    template: "elegant",
    language: "az",
    showImages: true,
    showPrices: true,
    showSoldOut: false,
  });

  async function loadPdfData() {
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
    } catch (error: any) {
      toast.error(error.message ?? "Could not load PDF menu data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPdfData();
  }, []);

  const visibleItems = useMemo(
    () => items.filter((item) => item.is_available && (settings.showSoldOut || !item.is_sold_out)),
    [items, settings.showSoldOut]
  );

  async function recordExport(status: "created" | "failed") {
    if (!profile?.restaurant_id) return;

    await supabase.from("masaqr_pdf_exports").insert({
      restaurant_id: profile.restaurant_id,
      branch_id: profile.branch_id,
      language: settings.language === "multi" ? "az" : settings.language,
      category_id: null,
      file_url: null,
      status,
      created_by: profile.id,
    });
  }

  async function exportPdf() {
    setExporting(true);

    try {
      window.print();
      await recordExport("created");
      toast.success("PDF export recorded");
    } catch (error: any) {
      await recordExport("failed");
      toast.error(error.message ?? "Could not export PDF");
    } finally {
      setExporting(false);
    }
  }

  function copyPublicLink() {
    const slug = restaurant?.slug ?? "demo";
    const link = `${window.location.origin}/m/${slug}/1`;
    navigator.clipboard?.writeText(link).catch(() => {});
    toast.success("Public menu link copied");
  }

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading PDF menu…</div>;
  }

  if (!profile?.restaurant_id || !restaurant) {
    return (
      <div>
        <PageHeader title="PDF Menu" subtitle="Complete restaurant setup before exporting a PDF menu." />
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
        title="PDF Menu"
        subtitle="Preview and print a real menu using Supabase categories and items."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={copyPublicLink}>
              <LinkIcon className="mr-2 h-4 w-4" />
              Copy link
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button onClick={exportPdf} disabled={exporting}>
              <Download className="mr-2 h-4 w-4" />
              {exporting ? "Exporting..." : "Export PDF"}
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 p-6 xl:grid-cols-[360px_1fr]">
        <Card className="h-fit p-5">
          <h2 className="text-lg font-semibold">Settings</h2>
          <p className="mb-5 text-sm text-muted-foreground">
            These settings affect the live preview below.
          </p>

          <div className="space-y-6">
            <section>
              <h3 className="mb-3 text-sm font-medium">Template</h3>
              <div className="space-y-2">
                {TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSettings((current) => ({ ...current, template: template.id }))}
                    className={`w-full rounded-lg border p-3 text-left transition ${
                      settings.template === template.id
                        ? "border-ember bg-ember/5 ring-1 ring-ember"
                        : "hover:border-foreground/30"
                    }`}
                  >
                    <div className="font-medium">{template.name}</div>
                    <div className="text-xs text-muted-foreground">{template.vibe}</div>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h3 className="mb-3 text-sm font-medium">Language</h3>
              <div className="grid grid-cols-4 gap-2">
                {(["az", "en", "ru", "multi"] as PdfLanguage[]).map((language) => (
                  <button
                    key={language}
                    onClick={() => setSettings((current) => ({ ...current, language }))}
                    className={`rounded border py-2 text-xs uppercase ${
                      settings.language === language
                        ? "border-foreground bg-foreground text-background"
                        : "bg-card"
                    }`}
                  >
                    {language === "multi" ? "Multi" : language}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h3 className="mb-3 text-sm font-medium">Content</h3>
              <div className="space-y-3">
                <Toggle
                  label="Show images"
                  v={settings.showImages}
                  on={(showImages) => setSettings((current) => ({ ...current, showImages }))}
                />
                <Toggle
                  label="Show prices"
                  v={settings.showPrices}
                  on={(showPrices) => setSettings((current) => ({ ...current, showPrices }))}
                />
                <Toggle
                  label="Show sold out items"
                  v={settings.showSoldOut}
                  on={(showSoldOut) => setSettings((current) => ({ ...current, showSoldOut }))}
                />
              </div>
            </section>

            <div className="rounded-2xl border bg-muted/40 p-4 text-sm">
              <div className="flex items-center gap-2 font-medium">
                <FileCheck2 className="h-4 w-4" />
                Real menu data
              </div>
              <p className="mt-1 text-muted-foreground">
                {categories.length} categories · {visibleItems.length} visible items
              </p>
              <Button className="mt-3 w-full" variant="outline" onClick={loadPdfData}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden bg-muted/30 p-4 print:bg-white print:p-0">
          <div className="mx-auto max-w-4xl rounded-3xl bg-white shadow-sm print:max-w-none print:rounded-none print:shadow-none">
            <PdfCover restaurant={restaurant} settings={settings} />

            {categories.map((category) => (
              <PdfPage
                key={category.id}
                category={category}
                items={visibleItems.filter((item) => item.category_id === category.id)}
                restaurant={restaurant}
                settings={settings}
              />
            ))}

            {categories.length === 0 ? (
              <div className="p-12 text-center text-sm text-muted-foreground">
                No active categories found.
              </div>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Toggle({ label, v, on }: { label: string; v: boolean; on: (value: boolean) => void }) {
  return (
    <label className="flex items-center justify-between rounded-xl border p-3 text-sm">
      <span>{label}</span>
      <Switch checked={v} onCheckedChange={on} />
    </label>
  );
}

function PdfCover({ restaurant, settings }: { restaurant: RestaurantRow; settings: PdfSettings }) {
  const langLabel = settings.language === "multi" ? "AZ · EN · RU" : settings.language.toUpperCase();

  if (settings.template === "luxury") {
    return (
      <section className="relative min-h-[520px] overflow-hidden rounded-t-3xl bg-neutral-950 p-12 text-white print:rounded-none">
        {restaurant.cover_url ? (
          <img src={restaurant.cover_url} className="absolute inset-0 h-full w-full object-cover opacity-30" />
        ) : null}
        <div className="relative z-10 flex h-full min-h-[420px] flex-col justify-between">
          <div className="text-sm uppercase tracking-[0.4em] text-amber-200">Selected Menu</div>
          <div>
            {restaurant.logo_url ? <img src={restaurant.logo_url} className="mb-6 h-16 w-16 rounded-full object-cover" /> : null}
            <h1 className="font-display text-6xl">{restaurant.name}</h1>
            <p className="mt-4 text-amber-100">Edition {new Date().getFullYear()} · {langLabel}</p>
          </div>
        </div>
      </section>
    );
  }

  if (settings.template === "bistro") {
    return (
      <section className="grid min-h-[420px] grid-cols-2 gap-8 p-12">
        <div className="flex flex-col justify-between">
          <div className="flex items-center gap-3">
            {restaurant.logo_url ? <img src={restaurant.logo_url} className="h-12 w-12 rounded-full object-cover" /> : null}
            <span className="font-medium">{restaurant.name}</span>
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">{langLabel}</p>
            <h1 className="mt-3 font-display text-6xl leading-none">The menu</h1>
            <p className="mt-4 text-muted-foreground">Edition {new Date().getFullYear()} · made with seasonal produce</p>
          </div>
          <p className="text-sm text-muted-foreground">masaqr.online/m/{restaurant.slug}/1</p>
        </div>
        <div className="overflow-hidden rounded-3xl bg-muted">
          {restaurant.cover_url ? <img src={restaurant.cover_url} className="h-full w-full object-cover" /> : null}
        </div>
      </section>
    );
  }

  if (settings.template === "casual") {
    return (
      <section className="min-h-[360px] bg-[#fff7e8] p-12 text-center">
        {restaurant.logo_url ? <img src={restaurant.logo_url} className="mx-auto mb-6 h-20 w-20 rounded-full object-cover" /> : null}
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Today's offerings</p>
        <h1 className="mt-5 font-display text-6xl">{restaurant.name}</h1>
        <p className="mt-6 text-muted-foreground">— made with care · {langLabel} —</p>
      </section>
    );
  }

  return (
    <section className="min-h-[360px] p-12 text-center">
      {restaurant.logo_url ? <img src={restaurant.logo_url} className="mx-auto mb-6 h-20 w-20 rounded-full object-cover" /> : null}
      <h1 className="font-display text-6xl">{restaurant.name}</h1>
      <p className="mt-5 text-sm uppercase tracking-[0.35em] text-muted-foreground">Menu · {langLabel}</p>
    </section>
  );
}

function PdfPage({
  category,
  items,
  restaurant,
  settings,
}: {
  category: CategoryRow;
  items: MenuItemRow[];
  restaurant: RestaurantRow;
  settings: PdfSettings;
}) {
  const langs: Lang[] = settings.language === "multi" ? ["az", "en", "ru"] : [settings.language];
  const primary = langs[0];

  if (settings.template === "luxury") {
    return (
      <section className="border-t bg-neutral-950 p-12 text-white print:min-h-screen">
        <p className="text-sm uppercase tracking-[0.3em] text-amber-200">Chapter {category.sort_order || 1}</p>
        <h2 className="mt-4 font-display text-4xl">{localName(category.name, category.name_i18n, primary)}</h2>
        <div className="mt-8 space-y-6">
          {items.map((item) => (
            <MenuLine key={item.id} item={item} restaurant={restaurant} settings={settings} lang={primary} luxury />
          ))}
          {items.length === 0 ? <EmptyLine /> : null}
        </div>
      </section>
    );
  }

  if (settings.template === "bistro") {
    return (
      <section className="border-t p-12 print:min-h-screen">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{String(category.sort_order || 1).padStart(2, "0")}</p>
            <h2 className="font-display text-4xl uppercase">{localName(category.name, category.name_i18n, primary)}</h2>
          </div>
          <p className="text-sm text-muted-foreground">{items.length} items</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <MenuCard key={item.id} item={item} restaurant={restaurant} settings={settings} lang={primary} />
          ))}
          {items.length === 0 ? <EmptyLine /> : null}
        </div>
      </section>
    );
  }

  return (
    <section className={`border-t p-12 print:min-h-screen ${settings.template === "casual" ? "bg-[#fff7e8]" : ""}`}>
      <h2 className="font-display text-4xl">{localName(category.name, category.name_i18n, primary)}</h2>
      <div className="mt-8 space-y-5">
        {items.map((item) => (
          <MenuLine key={item.id} item={item} restaurant={restaurant} settings={settings} lang={primary} />
        ))}
        {items.length === 0 ? <EmptyLine /> : null}
      </div>
    </section>
  );
}

function MenuCard({ item, restaurant, settings, lang }: { item: MenuItemRow; restaurant: RestaurantRow; settings: PdfSettings; lang: Lang }) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      {settings.showImages && item.image_url ? <img src={item.image_url} className="h-36 w-full object-cover" /> : null}
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-medium">{localName(item.name, item.name_i18n, lang)}</h3>
          {settings.showPrices ? <span className="font-semibold">{money(item.price, restaurant.currency)}</span> : null}
        </div>
        {item.description ? <p className="mt-2 text-sm text-muted-foreground">{localName(item.description, item.description_i18n, lang)}</p> : null}
        {item.is_sold_out ? <p className="mt-3 text-xs uppercase text-muted-foreground">Sold out</p> : null}
      </div>
    </div>
  );
}

function MenuLine({
  item,
  restaurant,
  settings,
  lang,
  luxury = false,
}: {
  item: MenuItemRow;
  restaurant: RestaurantRow;
  settings: PdfSettings;
  lang: Lang;
  luxury?: boolean;
}) {
  return (
    <div className="flex gap-4 border-b pb-4 last:border-b-0">
      {settings.showImages && item.image_url ? <img src={item.image_url} className="h-20 w-20 rounded-2xl object-cover" /> : null}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-medium">{localName(item.name, item.name_i18n, lang)}</h3>
          {settings.showPrices ? <span className="shrink-0 font-semibold">{money(item.price, restaurant.currency)}</span> : null}
        </div>
        {item.description ? (
          <p className={`mt-1 text-sm ${luxury ? "text-neutral-300" : "text-muted-foreground"}`}>
            {localName(item.description, item.description_i18n, lang)}
          </p>
        ) : null}
        {item.is_sold_out ? <p className="mt-2 text-xs uppercase text-muted-foreground">Sold out</p> : null}
      </div>
    </div>
  );
}

function EmptyLine() {
  return <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">No visible items in this category.</div>;
}
