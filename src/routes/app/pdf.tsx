import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { useStore, tr, fmtPrice, type PdfTemplate, type Lang } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Download, Printer, Link as LinkIcon, RefreshCw, FileCheck2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/pdf")({
  head: () => ({ meta: [{ title: "PDF Menu — MasaQR" }] }),
  component: PdfStudio,
});

const TEMPLATES: { id: PdfTemplate; name: string; vibe: string }[] = [
  { id: "elegant", name: "Elegant Minimal", vibe: "Whitespace · pure type · no images" },
  { id: "bistro", name: "Modern Bistro", vibe: "Two-column · grid · image cards" },
  { id: "luxury", name: "Luxury Dark", vibe: "Dark cover · serif · gold accents" },
  { id: "casual", name: "Casual Cafe", vibe: "Warm cream · handwritten · friendly" },
];

function PdfStudio() {
  const { pdf, setPdf, categories, items } = useStore();

  return (
    <div className="p-6 md:p-10">
      <PageHeader
        title="PDF menu studio"
        subtitle="Auto-generated from your live menu. Switch templates to redesign your booklet instantly."
        actions={
          <>
            <Button variant="outline" onClick={() => { navigator.clipboard?.writeText(window.location.origin + "/m/preview").catch(() => {}); toast.success("Public PDF link copied"); }}><LinkIcon className="mr-2 h-4 w-4" />Copy link</Button>
            <Button variant="outline" onClick={() => { window.print(); toast.success("Sent to printer"); }}><Printer className="mr-2 h-4 w-4" />Print</Button>
            <Button className="bg-ember hover:bg-ember/90 text-ember-foreground" onClick={() => toast.success("PDF generated")}><Download className="mr-2 h-4 w-4" />Export PDF</Button>
          </>
        }
      />

      <div className="grid lg:grid-cols-[320px_1fr] gap-5">
        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="font-display text-lg mb-3">Template</h3>
            <div className="space-y-2">
              {TEMPLATES.map(t => (
                <button key={t.id} onClick={() => { setPdf({ template: t.id }); toast.success(`Template: ${t.name}`); }}
                  className={`w-full text-left p-3 rounded-lg border transition ${pdf.template === t.id ? "border-ember bg-ember/5 ring-1 ring-ember" : "hover:border-foreground/30"}`}>
                  <div className="font-medium text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.vibe}</div>
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-display text-lg mb-3">Language</h3>
            <div className="grid grid-cols-2 gap-1">
              {(["az", "en", "ru", "multi"] as const).map(l => (
                <button key={l} onClick={() => setPdf({ language: l })}
                  className={`text-xs uppercase py-2 rounded border ${pdf.language === l ? "bg-foreground text-background border-foreground" : "bg-card"}`}>
                  {l === "multi" ? "Multilingual" : l}
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-5 space-y-3">
            <h3 className="font-display text-lg">Content</h3>
            <Toggle label="Item images" v={pdf.showImages} on={v => setPdf({ showImages: v })} />
            <Toggle label="Allergens" v={pdf.showAllergens} on={v => setPdf({ showAllergens: v })} />
            <Toggle label="Prices" v={pdf.showPrices} on={v => setPdf({ showPrices: v })} />
            <Toggle label="Include sold-out items" v={pdf.showSoldOut} on={v => setPdf({ showSoldOut: v })} />
          </Card>

          <Card className="p-5 bg-sage/5 border-sage/30">
            <FileCheck2 className="h-5 w-5 text-sage" />
            <div className="mt-2 text-sm font-medium">PDF is in sync</div>
            <div className="text-xs text-muted-foreground mt-1">{categories.length} categories · {items.length} items</div>
            <Button variant="ghost" size="sm" className="mt-2 -ml-2 h-7" onClick={() => toast.success("Regenerated")}><RefreshCw className="h-3 w-3 mr-1" />Regenerate</Button>
          </Card>
        </div>

        <Card className="p-6 bg-foreground/[0.03]">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Live preview · {TEMPLATES.find(t => t.id === pdf.template)?.name}</div>
          <div className="space-y-4 max-h-[80vh] overflow-y-auto p-2">
            <PdfCover />
            {categories.sort((a, b) => a.order - b.order).map(c => <PdfPage key={c.id} categoryId={c.id} />)}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Toggle({ label, v, on }: { label: string; v: boolean; on: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between text-sm">
      <span>{label}</span>
      <Switch checked={v} onCheckedChange={on} />
    </label>
  );
}

function PdfCover() {
  const { pdf, restaurant } = useStore();
  const langLabel = pdf.language === "multi" ? "AZ · EN · RU" : pdf.language.toUpperCase();

  if (pdf.template === "luxury") {
    return (
      <div className="aspect-[1/1.414] bg-neutral-950 text-white shadow-2xl relative overflow-hidden">
        {restaurant.cover && <img src={restaurant.cover} className="absolute inset-0 w-full h-full object-cover opacity-30" alt="" />}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/95" />
        <div className="absolute inset-0 p-12 flex flex-col items-center justify-center text-center">
          <div className="h-px w-16 bg-amber-400" />
          <div className="mt-6 text-[10px] uppercase tracking-[0.5em] text-amber-400">Selected Menu</div>
          {restaurant.logo && <img src={restaurant.logo} alt="" className="mt-6 h-16 w-16 rounded-full object-cover ring-2 ring-amber-400/40" />}
          <div className="font-display italic text-6xl mt-8 leading-none">{restaurant.name}</div>
          <div className="mt-8 h-px w-16 bg-amber-400" />
          <div className="mt-6 text-xs tracking-[0.3em] uppercase opacity-60">Edition {new Date().getFullYear()} · {langLabel}</div>
        </div>
      </div>
    );
  }
  if (pdf.template === "elegant") {
    return (
      <div className="aspect-[1/1.414] bg-white shadow-xl grid place-items-center text-center">
        <div>
          {restaurant.logo && <img src={restaurant.logo} alt="" className="h-14 w-14 rounded-full object-cover mx-auto mb-8 grayscale" />}
          <div className="font-display text-7xl tracking-tighter">{restaurant.name}</div>
          <div className="mt-6 h-px w-16 bg-foreground mx-auto" />
          <div className="mt-6 text-xs uppercase tracking-[0.4em]">Menu · {langLabel}</div>
        </div>
      </div>
    );
  }
  if (pdf.template === "bistro") {
    return (
      <div className="aspect-[1/1.414] bg-white shadow-xl p-10 flex flex-col">
        <div className="flex items-center justify-between text-xs uppercase tracking-wider">
          <span className="flex items-center gap-2">
            {restaurant.logo && <img src={restaurant.logo} alt="" className="h-6 w-6 rounded-full object-cover" />}
            {restaurant.name}
          </span>
          <span>{langLabel}</span>
        </div>
        <div className="flex-1 grid grid-cols-2 gap-6 mt-12">
          <div>
            <div className="font-sans text-6xl font-black leading-none tracking-tight">The<br />menu</div>
            <div className="mt-6 text-sm text-neutral-600 max-w-[18ch]">Edition {new Date().getFullYear()} · made with seasonal produce</div>
          </div>
          <div className="bg-neutral-100 overflow-hidden">
            {restaurant.cover && <img src={restaurant.cover} alt="" className="w-full h-full object-cover" />}
          </div>
        </div>
        <div className="text-[10px] uppercase tracking-widest text-neutral-500">masaqr.app/{restaurant.slug}</div>
      </div>
    );
  }
  // casual
  return (
    <div className="aspect-[1/1.414] bg-[#fbf6ec] shadow-xl p-12 grid place-items-center text-center relative overflow-hidden">
      <div className="absolute inset-3 border-2 border-dashed border-amber-700/30 rounded-lg pointer-events-none" />
      <div>
        {restaurant.logo && <img src={restaurant.logo} alt="" className="h-16 w-16 rounded-full object-cover mx-auto mb-4 ring-4 ring-amber-700/10" />}
        <div className="text-xs uppercase tracking-[0.3em] text-amber-800">Today's offerings</div>
        <div className="font-display italic text-6xl mt-3 text-amber-900">{restaurant.name}</div>
        <div className="mt-6 text-amber-800/70 text-sm">— made with love · {langLabel} —</div>
        <div className="mt-10 text-3xl">☕  🥐  🥗</div>
      </div>
    </div>
  );
}

function PdfPage({ categoryId }: { categoryId: string }) {
  const { pdf, items, categories, restaurant } = useStore();
  const cat = categories.find(c => c.id === categoryId)!;
  const langs: Lang[] = pdf.language === "multi" ? ["az", "en", "ru"] : [pdf.language as Lang];
  const primary = langs[0];

  const visible = items
    .filter(i => i.categoryId === categoryId && i.showOnPdf && !i.hidden && (pdf.showSoldOut || !i.soldOut));

  // ELEGANT MINIMAL — pure type, no images, generous whitespace
  if (pdf.template === "elegant") {
    return (
      <div className="aspect-[1/1.414] bg-white shadow-xl p-16 flex flex-col font-sans">
        <div className="font-display text-3xl">{tr(cat.name, primary)}</div>
        <div className="mt-1 text-xs text-neutral-500 uppercase tracking-[0.3em]">{tr(cat.description, primary)}</div>
        <div className="mt-12 flex-1 space-y-4">
          {visible.map(i => (
            <div key={i.id} className="flex items-baseline gap-2 pb-2">
              <span className="text-sm">{tr(i.name, primary)}</span>
              {i.soldOut && <span className="text-[9px] uppercase text-neutral-400">sold out</span>}
              <span className="flex-1 border-b border-dotted border-neutral-300" />
              {pdf.showPrices && <span className="text-sm tabular-nums">{fmtPrice(i.price, restaurant.currency)}</span>}
            </div>
          ))}
        </div>
        <div className="text-[10px] uppercase tracking-[0.4em] text-neutral-400 text-center">{restaurant.name}</div>
      </div>
    );
  }

  // MODERN BISTRO — two-column grid, image cards
  if (pdf.template === "bistro") {
    return (
      <div className="aspect-[1/1.414] bg-white shadow-xl p-10 flex flex-col font-sans">
        <div className="flex items-end justify-between border-b-2 border-black pb-2">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-neutral-500">0{cat.order}</div>
            <div className="text-3xl font-black tracking-tight">{tr(cat.name, primary).toUpperCase()}</div>
          </div>
          <div className="text-xs text-neutral-500">{visible.length} items</div>
        </div>
        <div className="mt-5 flex-1 grid grid-cols-2 gap-4 content-start">
          {visible.map(i => (
            <div key={i.id} className="rounded-lg overflow-hidden border border-neutral-200">
              {pdf.showImages && i.image && <img src={i.image} alt="" className="w-full h-20 object-cover" />}
              <div className="p-2.5">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-medium truncate">{tr(i.name, primary)}</span>
                  {pdf.showPrices && <span className="text-xs font-semibold tabular-nums">{fmtPrice(i.price, restaurant.currency)}</span>}
                </div>
                <div className="text-[10px] text-neutral-500 line-clamp-2 mt-0.5">{tr(i.description, primary)}</div>
                {pdf.showAllergens && i.allergens.length > 0 && (
                  <div className="text-[9px] uppercase text-neutral-400 mt-1">⚠ {i.allergens.join(" · ")}</div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="text-[10px] uppercase tracking-widest text-neutral-400 mt-3">{restaurant.name} · p.{cat.order + 1}</div>
      </div>
    );
  }

  // LUXURY DARK — black, serif, gold accents, hero image on first item
  if (pdf.template === "luxury") {
    return (
      <div className="aspect-[1/1.414] bg-neutral-950 text-neutral-100 shadow-2xl p-12 flex flex-col">
        <div className="text-center">
          <div className="text-[9px] uppercase tracking-[0.5em] text-amber-400">Chapter {cat.order}</div>
          <div className="font-display italic text-5xl mt-2 text-amber-50">{tr(cat.name, primary)}</div>
          <div className="h-px w-12 bg-amber-400 mx-auto mt-4" />
        </div>
        <div className="mt-8 flex-1 space-y-5">
          {visible.map(i => (
            <div key={i.id} className="flex items-start gap-4 pb-4 border-b border-neutral-800">
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-display italic text-lg text-amber-50">{tr(i.name, primary)}</span>
                  {i.soldOut && <span className="text-[9px] uppercase text-neutral-500">unavailable</span>}
                </div>
                <div className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">{tr(i.description, primary)}</div>
                {pdf.showAllergens && i.allergens.length > 0 && (
                  <div className="text-[9px] uppercase tracking-wider text-amber-600/80 mt-1">{i.allergens.join(" · ")}</div>
                )}
              </div>
              {pdf.showPrices && (
                <span className="text-sm tabular-nums text-amber-400 font-display">{fmtPrice(i.price, restaurant.currency)}</span>
              )}
            </div>
          ))}
        </div>
        <div className="text-[9px] tracking-[0.4em] uppercase text-neutral-600 text-center">— {restaurant.name} —</div>
      </div>
    );
  }

  // CASUAL CAFE — warm cream, handwritten feel, friendly
  return (
    <div className="aspect-[1/1.414] bg-[#fbf6ec] shadow-xl p-10 flex flex-col">
      <div className="text-center">
        <div className="font-display italic text-4xl text-amber-900">{tr(cat.name, primary)}</div>
        <div className="text-xs text-amber-800/70 mt-1">{tr(cat.description, primary)}</div>
        <div className="mt-2 text-amber-800/50 text-sm">~ ~ ~</div>
      </div>
      <div className="mt-5 flex-1 space-y-3">
        {visible.map(i => (
          <div key={i.id} className="bg-white/60 rounded-xl p-3 flex gap-3 border border-amber-700/10">
            {pdf.showImages && i.image && <img src={i.image} alt="" className="h-16 w-16 rounded-lg object-cover flex-shrink-0" />}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="font-medium text-amber-900">{tr(i.name, primary)}</span>
                {i.soldOut && <span className="text-[9px] uppercase bg-amber-200 text-amber-900 px-1 rounded">sold out</span>}
                <span className="flex-1" />
                {pdf.showPrices && <span className="text-sm font-display text-amber-800 tabular-nums">{fmtPrice(i.price, restaurant.currency)}</span>}
              </div>
              <div className="text-xs text-amber-900/70 mt-0.5">{tr(i.description, primary)}</div>
              {pdf.showAllergens && i.allergens.length > 0 && (
                <div className="text-[9px] uppercase text-amber-700/70 mt-1">⚠ {i.allergens.join(" · ")}</div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="text-xs text-amber-800/60 text-center italic mt-2">— {restaurant.name} —</div>
    </div>
  );
}
