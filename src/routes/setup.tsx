import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";
import { useState } from "react";
import { Check, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/setup")({
  head: () => ({ meta: [{ title: "Set up — MasaQR" }] }),
  component: Setup,
});

const steps = ["Restaurant", "Languages", "First menu", "Tables", "Invite staff", "Done"];

function Setup() {
  const nav = useNavigate();
  const { restaurant, setRestaurant, completeSetup, inviteStaff } = useStore();
  const [step, setStep] = useState(0);
  const [r, setR] = useState({ name: restaurant.name, slug: restaurant.slug, currency: restaurant.currency, mode: restaurant.serviceMode });
  const [langs, setLangs] = useState<string[]>(["az", "en", "ru"]);
  const [tables, setTables] = useState(12);
  const [invites, setInvites] = useState<{ email: string; role: "manager" | "waiter" }[]>([
    { email: "", role: "waiter" },
  ]);

  const next = () => setStep(s => Math.min(s + 1, steps.length - 1));
  const back = () => setStep(s => Math.max(s - 1, 0));

  return (
    <div className="min-h-screen flex">
      <aside className="hidden md:flex w-72 flex-col bg-sidebar text-sidebar-foreground p-8">
        <Logo className="text-sidebar-foreground" />
        <div className="mt-12 space-y-4">
          {steps.map((s, i) => (
            <div key={s} className={`flex items-center gap-3 ${i === step ? "" : "opacity-60"}`}>
              <div className={`h-7 w-7 rounded-full grid place-items-center text-xs ${i < step ? "bg-sage text-white" : i === step ? "bg-ember text-ember-foreground" : "bg-sidebar-accent"}`}>
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className="text-sm">{s}</span>
            </div>
          ))}
        </div>
        <div className="mt-auto text-xs text-sidebar-foreground/60">Step {step + 1} of {steps.length}</div>
      </aside>
      <main className="flex-1 grid place-items-center p-8 bg-background">
        <div className="w-full max-w-xl">
          <div className="text-xs uppercase tracking-widest text-ember">Setup</div>
          <h1 className="font-display text-3xl mt-2">{steps[step]}</h1>

          {step === 0 && (
            <div className="mt-8 space-y-4">
              <div><Label>Restaurant name</Label><Input value={r.name} onChange={e => setR({ ...r, name: e.target.value })} /></div>
              <div><Label>URL slug</Label><Input value={r.slug} onChange={e => setR({ ...r, slug: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Currency</Label><Input value={r.currency} onChange={e => setR({ ...r, currency: e.target.value })} /></div>
                <div><Label>Service mode</Label>
                  <select className="w-full h-10 rounded-md border bg-card px-3 text-sm" value={r.mode} onChange={e => setR({ ...r, mode: e.target.value as any })}>
                    <option value="dine_in">Dine-in only</option>
                    <option value="qr_only">QR-only</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="mt-8 space-y-3">
              <p className="text-sm text-muted-foreground">Guests will pick from these on the menu. You can add translations later.</p>
              {[["az", "Azerbaijani"], ["en", "English"], ["ru", "Russian"]].map(([code, label]) => (
                <label key={code} className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted">
                  <input type="checkbox" checked={langs.includes(code)} onChange={e => setLangs(l => e.target.checked ? [...l, code] : l.filter(x => x !== code))} />
                  <span className="font-medium">{label}</span><span className="ml-auto text-xs text-muted-foreground uppercase">{code}</span>
                </label>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="mt-8">
              <p className="text-sm text-muted-foreground">We've pre-loaded a sample menu so you can explore. You can edit everything in the Menu Builder.</p>
              <div className="mt-4 rounded-xl border bg-card p-5">
                <div className="text-sm font-medium">Sample menu loaded</div>
                <ul className="mt-2 text-xs text-muted-foreground grid grid-cols-2 gap-1">
                  <li>✓ Starters · 2 items</li><li>✓ Mains · 2 items</li>
                  <li>✓ Drinks · 2 items</li><li>✓ Desserts · 2 items</li>
                </ul>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="mt-8 space-y-3">
              <div><Label>Number of tables</Label><Input type="number" min={1} value={tables} onChange={e => setTables(+e.target.value)} /></div>
              <p className="text-xs text-muted-foreground">Each table gets its own QR code. You can rename, regenerate, or add more later.</p>
              <div className="rounded-xl border bg-card p-5 grid grid-cols-6 gap-2">
                {Array.from({ length: Math.min(tables, 18) }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-md bg-muted grid place-items-center text-xs">T{i + 1}</div>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="mt-8 space-y-3">
              <p className="text-sm text-muted-foreground">Invite your staff. They'll get a code to join.</p>
              {invites.map((inv, i) => (
                <div key={i} className="grid grid-cols-[1fr_140px] gap-2">
                  <Input placeholder="staff@restaurant.com" value={inv.email} onChange={e => setInvites(arr => arr.map((x, idx) => idx === i ? { ...x, email: e.target.value } : x))} />
                  <select value={inv.role} onChange={e => setInvites(arr => arr.map((x, idx) => idx === i ? { ...x, role: e.target.value as any } : x))} className="h-10 rounded-md border bg-card px-3 text-sm">
                    <option value="manager">Menecer</option><option value="waiter">Ofisiant</option>
                  </select>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => setInvites([...invites, { email: "", role: "waiter" }])}>+ Add another</Button>
            </div>
          )}

          {step === 5 && (
            <div className="mt-8 text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-sage/15 text-sage grid place-items-center"><Check className="h-8 w-8" /></div>
              <p className="mt-4 font-display text-2xl">You're ready to go.</p>
              <p className="text-sm text-muted-foreground mt-2">Your restaurant workspace is ready. Print your QRs from QR & Tables when you're ready.</p>
            </div>
          )}

          <div className="mt-10 flex justify-between">
            <Button variant="ghost" onClick={back} disabled={step === 0}>Back</Button>
            {step < steps.length - 1 ? (
              <Button onClick={() => {
                if (step === 0) setRestaurant({ name: r.name, slug: r.slug, currency: r.currency, serviceMode: r.mode as any });
                if (step === 4) invites.filter(i => i.email).forEach(i => inviteStaff(i.email, i.role));
                next();
              }} className="bg-ember hover:bg-ember/90 text-ember-foreground">
                Continue <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={() => { completeSetup(); toast.success("Setup complete"); nav({ to: "/app" }); }} className="bg-ember hover:bg-ember/90 text-ember-foreground">
                Go to dashboard
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
