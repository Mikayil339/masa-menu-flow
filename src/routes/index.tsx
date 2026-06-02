import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicNav, PublicFooter } from "@/components/PublicNav";
import { Button } from "@/components/ui/button";
import {
  QrCode, FileText, ChefHat, BellRing, Languages, Layers, BarChart3, Printer,
  Building2, ShieldCheck, Check, Sparkles, ArrowRight
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MasaQR — QR menus & kitchen flow for restaurants" },
      { name: "description", content: "Replace your printed menu, route orders to the kitchen, and alert waiters — without payment processing headaches. 1-month free trial." },
      { property: "og:title", content: "MasaQR — QR menus & kitchen flow for restaurants" },
      { property: "og:description", content: "QR menus, PDF export, kitchen flow, waiter alerts — built for restaurants in 3 languages." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div>
      <PublicNav />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grain opacity-30 pointer-events-none" />
        <div className="mx-auto max-w-7xl px-6 pt-16 pb-20 md:pt-24 md:pb-28 grid md:grid-cols-2 gap-12 items-center relative">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full bg-ember/10 text-ember border border-ember/20">
              <Sparkles className="h-3 w-3" /> 1-month free trial · no card required
            </span>
            <h1 className="font-display text-5xl md:text-6xl mt-5 leading-[1.05]">
              The menu, kitchen, and floor —<br/>
              <span className="text-ember italic">finally on the same page.</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-lg">
              MasaQR replaces your printed menu with QR codes guests actually use, routes orders to your kitchen in real time, and pings the right waiter at the right second. In Azerbaijani, English, and Russian.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-ember text-ember-foreground hover:bg-ember/90">
                <Link to="/register">Start your free month <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/m/olive-ember/t3">Try the guest menu</Link>
              </Button>
            </div>
            <div className="mt-6 text-xs text-muted-foreground flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5" /> We never touch guest payments. You stay in control.
            </div>
          </div>

          {/* hero visual: stacked phone + receipt */}
          <div className="relative h-[480px]">
            <div className="absolute right-4 top-2 w-[260px] h-[460px] rounded-[36px] bg-foreground/95 p-3 shadow-2xl rotate-3">
              <div className="rounded-[28px] h-full bg-background overflow-hidden flex flex-col">
                <div className="h-24 bg-[url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600')] bg-cover" />
                <div className="p-4">
                  <div className="text-xs text-muted-foreground">Olive & Ember · Table 3</div>
                  <div className="font-display text-lg mt-1">Burrata Salad</div>
                  <div className="text-xs text-muted-foreground mt-1">Heirloom tomato, basil…</div>
                  <div className="mt-3 text-ember font-semibold">16.00 ₼</div>
                  <button className="mt-3 w-full text-xs bg-ember text-ember-foreground rounded-md py-2">Add to cart</button>
                  <div className="mt-4 text-[10px] uppercase tracking-wider text-muted-foreground">Tracking</div>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2 text-xs"><span className="h-2 w-2 rounded-full bg-sage" /> Order received</div>
                    <div className="flex items-center gap-2 text-xs"><span className="h-2 w-2 rounded-full bg-sage" /> Kitchen accepted</div>
                    <div className="flex items-center gap-2 text-xs text-ember"><span className="h-2 w-2 rounded-full bg-ember animate-pulse" /> Preparing… ~14m</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute left-0 top-16 w-[290px] rounded-2xl bg-card shadow-xl border p-4 -rotate-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">Kitchen · Station: Grill</span>
                <span className="text-ember">3 active</span>
              </div>
              <div className="mt-3 rounded-lg border-l-4 border-ember bg-ember/5 p-3">
                <div className="flex justify-between text-xs"><b>Order A21</b><span>T3 · 8m</span></div>
                <div className="text-sm mt-1">2× Wagyu Burger <span className="text-muted-foreground text-xs">(medium)</span></div>
                <div className="mt-2 flex gap-1">
                  <span className="text-[10px] bg-foreground text-background px-1.5 py-0.5 rounded">Preparing</span>
                  <span className="text-[10px] border px-1.5 py-0.5 rounded">Gluten · Dairy</span>
                </div>
              </div>
              <div className="mt-2 rounded-lg border p-3">
                <div className="flex justify-between text-xs"><b>Order A22</b><span className="text-sage">Ready ✓</span></div>
                <div className="text-sm mt-1">3× Lemonade · 1× Fondant</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LOGO STRIP */}
      <section className="border-y bg-muted/40">
        <div className="mx-auto max-w-7xl px-6 py-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-muted-foreground text-sm">
          <span className="text-xs uppercase tracking-widest">Trusted by independent kitchens in</span>
          {["Baku", "Tbilisi", "Istanbul", "Almaty", "Yerevan", "Tashkent"].map(c => (
            <span key={c} className="font-display text-lg">{c}</span>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-20">
        <div className="max-w-2xl">
          <span className="text-xs uppercase tracking-widest text-ember">Built for hospitality</span>
          <h2 className="font-display text-4xl mt-2">Everything between scan and served.</h2>
          <p className="mt-3 text-muted-foreground">Nothing more, nothing less. We deliberately left out payments — your terminal and POS already do that beautifully.</p>
        </div>
        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {[
            { i: QrCode, t: "Table-aware QR menus", d: "Each table gets its own QR. Orders arrive in the kitchen tagged to the right table — no shouting." },
            { i: FileText, t: "Live PDF menu export", d: "Edit a price, see the PDF update. Switch templates and watch the whole booklet change in real time." },
            { i: ChefHat, t: "Kitchen display system", d: "New → Accepted → Preparing → Ready. Mark items done, see allergens, hear the bell on new orders." },
            { i: BellRing, t: "Waiter alerts that don't pile up", d: "Food ready, bill requested, water needed — waiters get one tap to acknowledge." },
            { i: Languages, t: "AZ · EN · RU built-in", d: "Translate categories, items, modifiers. Guests pick a language; the PDF can be single or multilingual." },
            { i: Layers, t: "Modifiers & add-ons", d: "Required, optional, min/max selections, per-option pricing. Pass it cleanly to the kitchen." },
            { i: BarChart3, t: "Operational analytics", d: "Peak hours, top items, average prep time, late orders, QR scans. No revenue noise." },
            { i: Printer, t: "Print-ready QR templates", d: "Table tents, stickers, sheets, branded cards. Download or send to the printer in one click." },
            { i: Building2, t: "Multi-branch from day one", d: "One menu, multiple locations. Staff and kitchen screens see only what they should." },
          ].map(({ i: Icon, t, d }) => (
            <div key={t} className="group rounded-2xl border bg-card p-6 hover:border-ember/40 hover:shadow-sm transition">
              <Icon className="h-6 w-6 text-ember" />
              <h3 className="font-display text-xl mt-4">{t}</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid md:grid-cols-4 gap-8">
            {[
              ["01", "Sign up", "Pick your slug, get a free month. No card."],
              ["02", "Build your menu", "Categories, items, prices, photos, translations."],
              ["03", "Print your QRs", "Pick a template, print, place on tables."],
              ["04", "Go live", "Guests scan, kitchen cooks, waiters serve. You watch the dashboard."],
            ].map(([n, t, d]) => (
              <div key={n}>
                <div className="font-display text-5xl text-ember">{n}</div>
                <div className="font-display text-xl mt-3">{t}</div>
                <p className="text-sm text-background/70 mt-2">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { q: "We retired our laminated menus the day we installed MasaQR. The kitchen finally stopped losing tickets.", n: "Nigar A.", r: "Owner · Şirvan Bistro" },
            { q: "The PDF preview is the killer feature. Our designer used to charge us €200 a month. Now it's instant.", n: "Mikhail K.", r: "GM · Sapphire Grill" },
            { q: "Waiters love that they get pings instead of staring at a screen. Service is genuinely faster.", n: "Rauf M.", r: "Head Chef · Olive & Ember" },
          ].map(t => (
            <div key={t.n} className="rounded-2xl border bg-card p-7">
              <div className="text-ember text-2xl">“</div>
              <p className="font-display text-lg leading-snug">{t.q}</p>
              <div className="mt-5 text-sm"><b>{t.n}</b><div className="text-muted-foreground text-xs">{t.r}</div></div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING TEASE */}
      <section id="pricing" className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="font-display text-4xl">Honest pricing.</h2>
          <p className="mt-3 text-muted-foreground">One month free. After that, pick the plan that fits your kitchen.</p>
        </div>
        <div className="mt-10 grid md:grid-cols-3 gap-5">
          {[
            { n: "Starter", p: "29", d: "/branch / month", f: ["1 branch", "Up to 12 tables", "QR + PDF menu", "Kitchen display", "Email support"] },
            { n: "Pro", p: "69", d: "/branch / month", best: true, f: ["Up to 40 tables", "Waiter alerts", "Modifiers & add-ons", "Analytics", "Print templates", "Priority support"] },
            { n: "Business", p: "149", d: "/branch / month", f: ["Unlimited tables", "Multi-branch sync", "ETA learning", "Branded PDF templates", "Dedicated account manager"] },
          ].map(p => (
            <div key={p.n} className={`rounded-2xl border p-7 bg-card relative ${p.best ? "border-ember shadow-lg" : ""}`}>
              {p.best && <span className="absolute -top-3 right-6 text-xs bg-ember text-ember-foreground px-2 py-0.5 rounded-full">Most chosen</span>}
              <div className="font-display text-2xl">{p.n}</div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-display text-4xl">€{p.p}</span>
                <span className="text-muted-foreground text-sm">{p.d}</span>
              </div>
              <ul className="mt-5 space-y-2 text-sm">
                {p.f.map(x => <li key={x} className="flex items-start gap-2"><Check className="h-4 w-4 text-sage mt-0.5" />{x}</li>)}
              </ul>
              <Button asChild className={`mt-6 w-full ${p.best ? "bg-ember text-ember-foreground hover:bg-ember/90" : ""}`} variant={p.best ? "default" : "outline"}>
                <Link to="/register">Start free trial</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-6 py-20">
        <h2 className="font-display text-4xl text-center">Frequently asked</h2>
        <div className="mt-10 space-y-3">
          {[
            ["Does MasaQR process customer payments?", "No, and that's intentional. Guests pay with cash, card terminal, or your existing POS — we just handle the menu, kitchen flow, and floor."],
            ["What languages are supported?", "Azerbaijani, English, and Russian out of the box. Each guest picks their language; you maintain a single menu."],
            ["Can my kitchen staff use MasaQR without a desktop?", "Yes — the kitchen display works on tablets and the waiter view is built mobile-first."],
            ["How does the free trial work?", "One month free, fully featured, no credit card required. You can keep using your printed menus alongside until you're ready."],
            ["What happens to my data if I cancel?", "You can export your full menu (including PDFs) at any time. Cancel from inside the app — no calls required."],
          ].map(([q, a], i) => (
            <details key={i} className="group rounded-xl border bg-card p-5">
              <summary className="cursor-pointer font-medium flex items-center justify-between">
                {q}
                <span className="text-ember group-open:rotate-45 transition">+</span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-3xl bg-foreground text-background p-12 md:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_var(--ember),_transparent_60%)] opacity-30" />
          <h2 className="font-display text-4xl md:text-5xl relative">Your tables are waiting.</h2>
          <p className="mt-4 text-background/70 relative">Set up your restaurant in under 10 minutes.</p>
          <Button asChild size="lg" className="mt-7 bg-ember text-ember-foreground hover:bg-ember/90 relative">
            <Link to="/register">Start your free month</Link>
          </Button>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
