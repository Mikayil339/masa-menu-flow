import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Download, FileCheck2, Link as LinkIcon, Printer, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useMemo, useRef, useState } from "react";
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
  head: () => ({ meta: [{ title: "PDF Menyu — MasaQR" }] }),
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
  { id: "elegant", name: "Elegant Minimal", vibe: "Təmiz tipografiya · artıq element yoxdur" },
  { id: "bistro", name: "Modern Bistro", vibe: "Şəkilli kartlar · müasir restoran menyusu" },
  { id: "luxury", name: "Luxury Dark", vibe: "Qara qapaq · premium görünüş" },
  { id: "casual", name: "Casual Cafe", vibe: "İsti tonlar · rahat kafe üslubu" },
];

function PdfStudio() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [restaurant, setRestaurant] = useState<RestaurantRow | null>(null);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [items, setItems] = useState<MenuItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const [settings, setSettings] = useState<PdfSettings>({
    template: "elegant",
    language: "az",
    showImages: true,
    showPrices: true,
    showSoldOut: false,
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
    } catch (error: any) {
      toast.error(error.message ?? "PDF menyu yüklənmədi");
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
      language: settings.language === "multi" ? "az" : settings.language,
      category_id: null,
      file_url: null,
      status,
      created_by: profile.id,
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
    } catch (error: any) {
      await recordExport("failed");
      toast.error(error.message ?? "PDF export alınmadı");
    } finally {
      setExporting(false);
    }
  }

  function copyPublicLink() {
    const slug = restaurant?.slug ?? "demo";
    const link = `${window.location.origin}/m/${slug}/1`;
    navigator.clipboard?.writeText(link).catch(() => {});
    toast.success("Müştəri menyu linki kopyalandı");
  }

  if (loading) return <div className="p-6 text-sm text-muted-foreground">PDF menyu yüklənir…</div>;

  if (!profile?.restaurant_id || !restaurant) {
    return (
      <div>
        <PageHeader title="PDF Menyu" subtitle="PDF export üçün əvvəl restoran qurulumunu tamamlayın." />
        <div className="p-6"><Card className="p-6 text-sm text-muted-foreground">Restoran bu hesaba qoşulmayıb.</Card></div>
      </div>
    );
  }

  return (
    <div>
      <style>{printStyles}</style>
      <PageHeader
        title="PDF Menyu"
        subtitle="Yalnız yaradılmış menyu PDF/print üçün çıxarılır. Dashboard səhifəsi export olunmur."
        actions={
          <div className="flex flex-wrap gap-2 print:hidden">
            <Button variant="outline" onClick={copyPublicLink}><LinkIcon className="mr-2 h-4 w-4" />Menyu linki</Button>
            <Button variant="outline" onClick={printMenuOnly}><Printer className="mr-2 h-4 w-4" />Print</Button>
            <Button onClick={exportPdf} disabled={exporting}><Download className="mr-2 h-4 w-4" />{exporting ? "Export olunur..." : "Export PDF"}</Button>
          </div>
        }
      />

      <div className="grid gap-6 p-6 xl:grid-cols-[360px_1fr]">
        <Card className="h-fit p-5 print:hidden">
          <h2 className="text-lg font-semibold">Ayarlar</h2>
          <p className="mb-5 text-sm text-muted-foreground">Bu seçimlər sağdakı canlı PDF menyuya təsir edir.</p>

          <div className="space-y-6">
            <section>
              <h3 className="mb-3 text-sm font-medium">Template</h3>
              <div className="space-y-2">
                {TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSettings((current) => ({ ...current, template: template.id }))}
                    className={`w-full rounded-lg border p-3 text-left transition ${settings.template === template.id ? "border-ember bg-ember/5 ring-1 ring-ember" : "hover:border-foreground/30"}`}
                  >
                    <div className="font-medium">{template.name}</div>
                    <div className="text-xs text-muted-foreground">{template.vibe}</div>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h3 className="mb-3 text-sm font-medium">Dil</h3>
              <div className="grid grid-cols-4 gap-2">
                {(["az", "en", "ru", "multi"] as PdfLanguage[]).map((language) => (
                  <button
                    key={language}
                    onClick={() => setSettings((current) => ({ ...current, language }))}
                    className={`rounded border py-2 text-xs uppercase ${settings.language === language ? "border-foreground bg-foreground text-background" : "bg-card"}`}
                  >
                    {language === "multi" ? "3 dil" : language}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h3 className="mb-3 text-sm font-medium">Məzmun</h3>
              <div className="space-y-3">
                <Toggle label="Şəkilləri göstər" v={settings.showImages} on={(showImages) => setSettings((current) => ({ ...current, showImages }))} />
                <Toggle label="Qiymətləri göstər" v={settings.showPrices} on={(showPrices) => setSettings((current) => ({ ...current, showPrices }))} />
                <Toggle label="Bitmiş məhsulları göstər" v={settings.showSoldOut} on={(showSoldOut) => setSettings((current) => ({ ...current, showSoldOut }))} />
              </div>
            </section>

            <div className="rounded-2xl border bg-muted/40 p-4 text-sm">
              <div className="flex items-center gap-2 font-medium"><FileCheck2 className="h-4 w-4" />Real menyu datası</div>
              <p className="mt-1 text-muted-foreground">{categories.length} kateqoriya · {visibleItems.length} məhsul</p>
              <Button className="mt-3 w-full" variant="outline" onClick={loadPdfData}><RefreshCw className="mr-2 h-4 w-4" />Yenilə</Button>
            </div>
          </div>
        </Card>

        <Card className="pdf-print-wrapper overflow-hidden bg-muted/30 p-4 print:border-0 print:bg-white print:p-0 print:shadow-none">
          <div ref={printRef} className="pdf-menu-print-root mx-auto max-w-4xl rounded-3xl bg-white shadow-sm print:max-w-none print:rounded-none print:shadow-none">
            <PdfCover restaurant={restaurant} settings={settings} />
            {categories.map((category) => (
              <PdfPage key={category.id} category={category} items={visibleItems.filter((item) => item.category_id === category.id)} restaurant={restaurant} settings={settings} />
            ))}
            {categories.length === 0 ? <div className="p-12 text-center text-sm text-muted-foreground">Aktiv kateqoriya yoxdur.</div> : null}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Toggle({ label, v, on }: { label: string; v: boolean; on: (value: boolean) => void }) {
  return <label className="flex items-center justify-between rounded-xl border p-3 text-sm"><span>{label}</span><Switch checked={v} onCheckedChange={on} /></label>;
}

function PdfCover({ restaurant, settings }: { restaurant: RestaurantRow; settings: PdfSettings }) {
  const langLabel = settings.language === "multi" ? "AZ · EN · RU" : settings.language.toUpperCase();

  if (settings.template === "luxury") {
    return (
      <section className="relative min-h-[520px] overflow-hidden rounded-t-3xl bg-neutral-950 p-12 text-white print:rounded-none">
        {restaurant.cover_url ? <img src={restaurant.cover_url} className="absolute inset-0 h-full w-full object-cover opacity-30" /> : null}
        <div className="relative z-10 flex h-full min-h-[420px] flex-col justify-between">
          <div className="text-sm uppercase tracking-[0.4em] text-amber-200">Menyu</div>
          <div>
            {restaurant.logo_url ? <img src={restaurant.logo_url} className="mb-6 h-16 w-16 rounded-full object-cover" /> : null}
            <h1 className="font-display text-6xl">{restaurant.name}</h1>
            <p className="mt-4 text-amber-100">{new Date().getFullYear()} · {langLabel}</p>
          </div>
        </div>
      </section>
    );
  }

  if (settings.template === "bistro") {
    return (
      <section className="grid min-h-[420px] grid-cols-2 gap-8 p-12">
        <div className="flex flex-col justify-between">
          <div className="flex items-center gap-3">{restaurant.logo_url ? <img src={restaurant.logo_url} className="h-12 w-12 rounded-full object-cover" /> : null}<span className="font-medium">{restaurant.name}</span></div>
          <div><p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">{langLabel}</p><h1 className="mt-3 font-display text-6xl leading-none">Menyu</h1><p className="mt-4 text-muted-foreground">Mövsümi məhsullarla hazırlanmış seçimlər</p></div>
          <p className="text-sm text-muted-foreground">/m/{restaurant.slug}/1</p>
        </div>
        <div className="overflow-hidden rounded-3xl bg-muted">{restaurant.cover_url ? <img src={restaurant.cover_url} className="h-full w-full object-cover" /> : null}</div>
      </section>
    );
  }

  if (settings.template === "casual") {
    return (
      <section className="min-h-[360px] bg-[#fff7e8] p-12 text-center">
        {restaurant.logo_url ? <img src={restaurant.logo_url} className="mx-auto mb-6 h-20 w-20 rounded-full object-cover" /> : null}
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Bugünkü seçimlər</p>
        <h1 className="mt-5 font-display text-6xl">{restaurant.name}</h1>
        <p className="mt-6 text-muted-foreground">— {langLabel} —</p>
      </section>
    );
  }

  return (
    <section className="min-h-[360px] p-12 text-center">
      {restaurant.logo_url ? <img src={restaurant.logo_url} className="mx-auto mb-6 h-20 w-20 rounded-full object-cover" /> : null}
      <h1 className="font-display text-6xl">{restaurant.name}</h1>
      <p className="mt-5 text-sm uppercase tracking-[0.35em] text-muted-foreground">Menyu · {langLabel}</p>
    </section>
  );
}

function PdfPage({ category, items, restaurant, settings }: { category: CategoryRow; items: MenuItemRow[]; restaurant: RestaurantRow; settings: PdfSettings }) {
  const langs: Lang[] = settings.language === "multi" ? ["az", "en", "ru"] : [settings.language];
  const primary = langs[0];

  if (settings.template === "luxury") {
    return (
      <section className="border-t bg-neutral-950 p-12 text-white print:min-h-screen">
        <p className="text-sm uppercase tracking-[0.3em] text-amber-200">{String(category.sort_order || 1).padStart(2, "0")}</p>
        <h2 className="mt-4 font-display text-4xl">{localName(category.name, category.name_i18n, primary)}</h2>
        <div className="mt-8 space-y-6">{items.map((item) => <MenuLine key={item.id} item={item} restaurant={restaurant} settings={settings} langs={langs} luxury />)}{items.length === 0 ? <EmptyLine /> : null}</div>
      </section>
    );
  }

  if (settings.template === "bistro") {
    return (
      <section className="border-t p-12 print:min-h-screen">
        <div className="mb-8 flex items-end justify-between"><div><p className="text-sm text-muted-foreground">{String(category.sort_order || 1).padStart(2, "0")}</p><h2 className="font-display text-4xl uppercase">{localName(category.name, category.name_i18n, primary)}</h2></div><p className="text-sm text-muted-foreground">{items.length} məhsul</p></div>
        <div className="grid gap-4 md:grid-cols-2">{items.map((item) => <MenuCard key={item.id} item={item} restaurant={restaurant} settings={settings} langs={langs} />)}{items.length === 0 ? <EmptyLine /> : null}</div>
      </section>
    );
  }

  return (
    <section className={`border-t p-12 print:min-h-screen ${settings.template === "casual" ? "bg-[#fff7e8]" : ""}`}>
      <h2 className="font-display text-4xl">{localName(category.name, category.name_i18n, primary)}</h2>
      <div className="mt-8 space-y-5">{items.map((item) => <MenuLine key={item.id} item={item} restaurant={restaurant} settings={settings} langs={langs} />)}{items.length === 0 ? <EmptyLine /> : null}</div>
    </section>
  );
}

function MultiText({ item, langs, field }: { item: MenuItemRow; langs: Lang[]; field: "name" | "description" }) {
  return (
    <div className="space-y-1">
      {langs.map((lang) => {
        const value = field === "name" ? localName(item.name, item.name_i18n, lang) : localName(item.description, item.description_i18n, lang);
        if (!value) return null;
        return <div key={lang} className={field === "name" ? "font-medium" : "text-sm text-muted-foreground"}>{langs.length > 1 ? <span className="mr-2 text-[10px] uppercase text-muted-foreground">{lang}</span> : null}{value}</div>;
      })}
    </div>
  );
}

function MenuCard({ item, restaurant, settings, langs }: { item: MenuItemRow; restaurant: RestaurantRow; settings: PdfSettings; langs: Lang[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      {settings.showImages && item.image_url ? <img src={item.image_url} className="h-36 w-full object-cover" /> : null}
      <div className="p-4"><div className="flex items-start justify-between gap-4"><MultiText item={item} langs={langs} field="name" />{settings.showPrices ? <span className="font-semibold">{money(item.price, restaurant.currency)}</span> : null}</div><div className="mt-2"><MultiText item={item} langs={langs} field="description" /></div>{item.is_sold_out ? <p className="mt-3 text-xs uppercase text-muted-foreground">Bitib</p> : null}</div>
    </div>
  );
}

function MenuLine({ item, restaurant, settings, langs, luxury = false }: { item: MenuItemRow; restaurant: RestaurantRow; settings: PdfSettings; langs: Lang[]; luxury?: boolean }) {
  return (
    <div className="flex gap-4 border-b pb-4 last:border-b-0">
      {settings.showImages && item.image_url ? <img src={item.image_url} className="h-20 w-20 rounded-2xl object-cover" /> : null}
      <div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-4"><MultiText item={item} langs={langs} field="name" />{settings.showPrices ? <span className="shrink-0 font-semibold">{money(item.price, restaurant.currency)}</span> : null}</div><div className={`mt-1 ${luxury ? "text-neutral-300" : ""}`}><MultiText item={item} langs={langs} field="description" /></div>{item.is_sold_out ? <p className="mt-2 text-xs uppercase text-muted-foreground">Bitib</p> : null}</div>
    </div>
  );
}

function EmptyLine() {
  return <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">Bu kateqoriyada görünən məhsul yoxdur.</div>;
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
  .print\:hidden { display: none !important; }
}
`;
