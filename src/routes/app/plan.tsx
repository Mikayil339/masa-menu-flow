import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/plan")({
  head: () => ({ meta: [{ title: "Plan — MasaQR" }] }),
  component: () => {
    const { plan, setPlan } = useStore();
    const trialDays = Math.max(0, Math.ceil((plan.trialEndsAt - Date.now()) / 86400000));
    const tiers = [
      { id: "starter", n: "Starter", p: 29, f: ["12 tables", "Ofisiant ekranı", "QR menu"] },
      { id: "pro", n: "Pro", p: 69, best: true, f: ["40 tables", "Modifiers", "Analytics", "Print templates"] },
      { id: "business", n: "Business", p: 149, f: ["Unlimited tables", "Advanced analytics", "Priority support"] },
    ];
    return (
      <div className="p-6 md:p-10">
        <PageHeader title="Plan" subtitle="Your MasaQR subscription. Customer payments are never part of this." />
        <Card className="p-5 mb-5 bg-ember/5 border-ember/30">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Current</div>
              <div className="font-display text-2xl capitalize">{plan.tier} {plan.tier === "trial" && `· ${trialDays} days left`}</div>
            </div>
            <Button variant="outline" onClick={() => toast.success("Trial extended by 7 days")}>Extend trial</Button>
            <Button variant="outline" className="text-destructive" onClick={() => toast.success("Cancellation requested")}>Cancel plan</Button>
          </div>
        </Card>
        <div className="grid md:grid-cols-3 gap-4">
          {tiers.map(t => (
            <Card key={t.id} className={`p-5 ${t.best ? "border-ember" : ""}`}>
              <div className="font-display text-xl">{t.n}</div>
              <div className="mt-2 font-display text-3xl">€{t.p}<span className="text-sm text-muted-foreground">/mo</span></div>
              <ul className="mt-4 space-y-1.5 text-sm">{t.f.map(x => <li key={x} className="flex gap-2"><Check className="h-4 w-4 text-sage" />{x}</li>)}</ul>
              <Button onClick={() => { setPlan(t.id as any); toast.success(`Plan changed to ${t.n}`); }} className={`mt-5 w-full ${t.best ? "bg-ember hover:bg-ember/90 text-ember-foreground" : ""}`} variant={t.best ? "default" : "outline"}>
                {plan.tier === t.id ? "Current" : "Switch"}
              </Button>
            </Card>
          ))}
        </div>
        <Card className="mt-5 p-5">
          <h3 className="font-display text-lg">Invoices</h3>
          <div className="text-sm text-muted-foreground mt-2">No invoices yet — you're on the free trial.</div>
        </Card>
      </div>
    );
  },
});
