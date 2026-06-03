import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicNav, PublicFooter } from "@/components/PublicNav";
import { Button } from "@/components/ui/button";
import {
  QrCode, FileText, BellRing, Languages, Layers, BarChart3, Printer,
  ShieldCheck, Check, Sparkles, ArrowRight, Users
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MasaQR — Restoranlar üçün QR menyu və ofisiant iş axını" },
      { name: "description", content: "Çap olunmuş menyunu QR ilə əvəzləyin, masa sessiyalarını idarə edin və ofisiantları anında məlumatlandırın. 1 ay pulsuz sınaq." },
      { property: "og:title", content: "MasaQR — Restoranlar üçün QR menyu və ofisiant iş axını" },
      { property: "og:description", content: "3 dildə QR menyu, gözəl PDF ixrac, masa və sessiya idarəetməsi, ofisiant bildirişləri." },
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
              <Sparkles className="h-3 w-3" /> 1 ay pulsuz sınaq · kart tələb olunmur
            </span>
            <h1 className="font-display text-5xl md:text-6xl mt-5 leading-[1.05]">
              Menyu, masa və ofisiantlar —<br/>
              <span className="text-ember italic">nəhayət bir ekranda.</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-lg">
              MasaQR çap olunmuş menyunu qonağın istifadə etdiyi QR-a çevirir, masa sessiyalarını idarə edir və lazımi ofisiantı düzgün anda xəbərdar edir. Azərbaycan, İngilis və Rus dillərində.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-ember text-ember-foreground hover:bg-ember/90">
                <Link to="/register">Pulsuz ayı başlat <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/m/$slug/$table" params={{ slug: "olive-ember", table: "1" }}>Qonaq menyusunu yoxla</Link>
              </Button>
            </div>
            <div className="mt-6 text-xs text-muted-foreground flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5" /> Qonaq ödənişlərinə toxunmuruq. Nəzarət sizdə qalır.
            </div>
          </div>

          {/* hero visual: stacked phone + bill */}
          <div className="relative h-[480px]">
            <div className="absolute right-4 top-2 w-[260px] h-[460px] rounded-[36px] bg-foreground/95 p-3 shadow-2xl rotate-3">
              <div className="rounded-[28px] h-full bg-background overflow-hidden flex flex-col">
                <div className="h-24 bg-[url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600')] bg-cover" />
                <div className="p-4">
                  <div className="text-xs text-muted-foreground">Olive & Ember · Masa 3</div>
                  <div className="font-display text-lg mt-1">Burrata salatı</div>
                  <div className="text-xs text-muted-foreground mt-1">Pomidor, bazilik, balzamik…</div>
                  <div className="mt-3 text-ember font-semibold">16.00 ₼</div>
                  <button className="mt-3 w-full text-xs bg-ember text-ember-foreground rounded-md py-2">Səbətə əlavə et</button>
                  <div className="mt-4 text-[10px] uppercase tracking-wider text-muted-foreground">Sessiya</div>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2 text-xs"><span className="h-2 w-2 rounded-full bg-sage" /> Sifariş qəbul edildi</div>
                    <div className="flex items-center gap-2 text-xs"><span className="h-2 w-2 rounded-full bg-sage" /> Ofisiant təsdiqlədi</div>
                    <div className="flex items-center gap-2 text-xs text-ember"><span className="h-2 w-2 rounded-full bg-ember animate-pulse" /> Hazırlanır…</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute left-0 top-16 w-[290px] rounded-2xl bg-card shadow-xl border p-4 -rotate-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">Ofisiant · Masa 3</span>
                <span className="text-ember">Yeni</span>
              </div>
              <div className="mt-3 rounded-lg border-l-4 border-ember bg-ember/5 p-3">
                <div className="flex justify-between text-xs"><b>Sessiya #21</b><span>8 dəq.</span></div>
                <div className="text-sm mt-1">2× Wagyu Burger</div>
                <div className="mt-2 flex gap-1">
                  <span className="text-[10px] bg-foreground text-background px-1.5 py-0.5 rounded">Təsdiq gözləyir</span>
                </div>
              </div>
              <div className="mt-2 rounded-lg border p-3">
                <div className="flex justify-between text-xs"><b>Sessiya #22</b><span className="text-sage">Açıq ✓</span></div>
                <div className="text-sm mt-1">3× Limonad · 1× Fondan</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LOGO STRIP */}
      <section className="border-y bg-muted/40">
        <div className="mx-auto max-w-7xl px-6 py-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-muted-foreground text-sm">
          <span className="text-xs uppercase tracking-widest">Müstəqil restoranlar tərəfindən istifadə olunur</span>
          {["Bakı", "Gəncə", "Sumqayıt", "Şəki", "Quba", "Lənkəran"].map(c => (
            <span key={c} className="font-display text-lg">{c}</span>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-20">
        <div className="max-w-2xl">
          <span className="text-xs uppercase tracking-widest text-ember">Restoranlar üçün hazırlanıb</span>
          <h2 className="font-display text-4xl mt-2">Skanlamadan masaya qədər hər şey.</h2>
          <p className="mt-3 text-muted-foreground">Lazımsız bir şey yox. Ödəniş emalını bilərəkdən daxil etməmişik — POS terminalınız bunu artıq mükəmməl edir.</p>
        </div>
        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {[
            { i: QrCode, t: "Masa-spesifik QR menyular", d: "Hər masa öz QR-ını alır. Sifariş düzgün masaya bağlı olaraq ofisiantın ekranında görünür." },
            { i: FileText, t: "Canlı PDF menyu", d: "Qiyməti redaktə edin, PDF eyni anda yenilənsin. Şablon seçin və bütün menyu real vaxtda dəyişsin." },
            { i: Users, t: "Masa sessiyaları", d: "Bir oturum üzrə bütün sifarişlər və hesab birləşir. Ofisiant masanı bağladıqda boş olur." },
            { i: BellRing, t: "Ofisiant bildirişləri", d: "Yeni sifariş, hesab tələbi, su istəyi — ofisiant bir toxunuşla qəbul edir." },
            { i: Languages, t: "AZ · EN · RU daxili", d: "Kateqoriya və yemək adlarını üç dildə yazın. Qonaq dilini seçir, PDF tək və ya çoxdilli ola bilər." },
            { i: Layers, t: "Yerli / xarici qiymət", d: "Yerli və xarici qonaqlar üçün fərqli qiymət saxlayın. Müştəri fərqi heç vaxt görmür." },
            { i: BarChart3, t: "Əməliyyat analitikası", d: "Pik saatlar, ən çox satılan yeməklər, gündəlik və aylıq gəlir. Heç bir təxmini məlumat yox." },
            { i: Printer, t: "Çapa hazır QR şablonları", d: "Masa kartı, stikerlər, brendli dizaynlar. Bir kliklə yükləyin və ya çap edin." },
            { i: Sparkles, t: "Təklif olunan yeməklər", d: "Balıq sifariş edən qonağa nar şərabı təklif edin. Ortalama hesab artır." },
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
              ["01", "Qeydiyyat", "URL seçin, bir ay pulsuz alın. Kart tələb olunmur."],
              ["02", "Menyunu hazırla", "Kateqoriyalar, yeməklər, qiymətlər, şəkillər, tərcümələr."],
              ["03", "QR çap et", "Şablon seçin, çap edin, masalara qoyun."],
              ["04", "Canlı işlə", "Qonaq skan edir, ofisiant təsdiqləyir, hesab birləşir."],
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
            { q: "Laminat menyularımızı MasaQR-ı qurduğumuz gün bağladıq. Ofisiantlar daha sifariş itirmir.", n: "Nigar A.", r: "Sahib · Şirvan Bistro" },
            { q: "PDF önbaxış əla işləyir. Dizayner üçün ayda 200 € verirdik, indi bir kliklə hazır olur.", n: "Mikhail K.", r: "Menecer · Sapphire Grill" },
            { q: "Ofisiantlar ekrana baxmaq əvəzinə bildiriş alır. Servis həqiqətən sürətlənir.", n: "Rauf M.", r: "Sahib · Olive & Ember" },
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
          <h2 className="font-display text-4xl">Sadə qiymətlər.</h2>
          <p className="mt-3 text-muted-foreground">Bir ay pulsuz. Sonra restoranınıza uyğun planı seçin.</p>
        </div>
        <div className="mt-10 grid md:grid-cols-3 gap-5">
          {[
            { n: "Starter", p: "29", d: "/ay", f: ["12 masaya qədər", "QR + PDF menyu", "Ofisiant bildirişləri", "E-poçt dəstəyi"] },
            { n: "Pro", p: "69", d: "/ay", best: true, f: ["40 masaya qədər", "Masa sessiyaları", "Təklif olunan yeməklər", "Analitika", "Çap şablonları", "Prioritetli dəstək"] },
            { n: "Business", p: "149", d: "/ay", f: ["Limitsiz masa", "Brendli PDF şablonlar", "Yerli/xarici qiymət", "Ayrıca menecer"] },
          ].map(p => (
            <div key={p.n} className={`rounded-2xl border p-7 bg-card relative ${p.best ? "border-ember shadow-lg" : ""}`}>
              {p.best && <span className="absolute -top-3 right-6 text-xs bg-ember text-ember-foreground px-2 py-0.5 rounded-full">Ən çox seçilən</span>}
              <div className="font-display text-2xl">{p.n}</div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-display text-4xl">€{p.p}</span>
                <span className="text-muted-foreground text-sm">{p.d}</span>
              </div>
              <ul className="mt-5 space-y-2 text-sm">
                {p.f.map(x => <li key={x} className="flex items-start gap-2"><Check className="h-4 w-4 text-sage mt-0.5" />{x}</li>)}
              </ul>
              <Button asChild className={`mt-6 w-full ${p.best ? "bg-ember text-ember-foreground hover:bg-ember/90" : ""}`} variant={p.best ? "default" : "outline"}>
                <Link to="/register">Pulsuz sınağı başlat</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-6 py-20">
        <h2 className="font-display text-4xl text-center">Tez-tez verilən suallar</h2>
        <div className="mt-10 space-y-3">
          {[
            ["MasaQR qonaq ödənişlərini emal edir?", "Xeyr. Qonaqlar nağd, kart terminalı və ya POS-unuzla ödəyir — biz menyu, masa sessiyaları və ofisiant axınını idarə edirik."],
            ["Hansı dillər dəstəklənir?", "Azərbaycan, İngilis və Rus dilləri ilkin olaraq. Hər qonaq dilini seçir, siz isə tək menyu saxlayırsınız."],
            ["Ofisiantlar mobil cihazda istifadə edə bilər?", "Bəli — ofisiant ekranı mobil üçün hazırlanıb."],
            ["Pulsuz sınaq necə işləyir?", "Bir ay tam funksional, kart tələb olunmur. İstənilən vaxt ləğv edə bilərsiniz."],
            ["Ləğv etsəm məlumatlarım nə olur?", "Tam menyunuzu (PDF daxil) istənilən vaxt ixrac edə bilərsiniz. Tətbiq içindən ləğv edin."],
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
          <h2 className="font-display text-4xl md:text-5xl relative">Masalarınız sizi gözləyir.</h2>
          <p className="mt-4 text-background/70 relative">Restoranınızı 10 dəqiqədən az müddətdə qurun.</p>
          <Button asChild size="lg" className="mt-7 bg-ember text-ember-foreground hover:bg-ember/90 relative">
            <Link to="/register">Pulsuz ayı başlat</Link>
          </Button>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
