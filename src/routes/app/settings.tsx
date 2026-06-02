import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const Route = createFileRoute("/app/settings")({
  head: () => ({ meta: [{ title: "Settings — MasaQR" }] }),
  component: () => {
    const { restaurant, setRestaurant, eta, setEta, resetDemo } = useStore();
    return (
      <div className="p-6 md:p-10">
        <PageHeader title="Settings" />
        <div className="grid md:grid-cols-2 gap-5">
          <Card className="p-5 space-y-3">
            <h3 className="font-display text-lg">Restaurant</h3>
            <div><Label>Name</Label><Input value={restaurant.name} onChange={e => setRestaurant({ name: e.target.value })} /></div>
            <div><Label>Slug</Label><Input value={restaurant.slug} onChange={e => setRestaurant({ slug: e.target.value })} /></div>
            <div><Label>Currency symbol</Label><Input value={restaurant.currency} onChange={e => setRestaurant({ currency: e.target.value })} /></div>
            <Button onClick={() => toast.success("Saved")} className="bg-ember hover:bg-ember/90 text-ember-foreground">Save</Button>
          </Card>
          <Card className="p-5 space-y-3">
            <h3 className="font-display text-lg">ETA & late orders</h3>
            <div><Label>Default prep time (min)</Label><Input type="number" value={eta.defaultPrep} onChange={e => setEta({ defaultPrep: +e.target.value })} /></div>
            <div><Label>Late threshold (min)</Label><Input type="number" value={eta.lateThreshold} onChange={e => setEta({ lateThreshold: +e.target.value })} /></div>
            <div><Label>Rush hour multiplier</Label><Input type="number" step="0.1" value={eta.rushMultiplier} onChange={e => setEta({ rushMultiplier: +e.target.value })} /></div>
            <label className="flex items-center justify-between text-sm"><span>Learn from past orders</span><Switch checked={eta.learning} onCheckedChange={v => setEta({ learning: v })} /></label>
            <p className="text-xs text-muted-foreground">Guests see ranges like "Approx. 15–25 min", never an exact minute.</p>
          </Card>
          <Card className="p-5 md:col-span-2">
            <h3 className="font-display text-lg">Platform operations</h3>
            <p className="text-sm text-muted-foreground mt-1">MasaQR is managed by the platform owner via WordPress Admin. Plan changes, global PDF templates, system-wide settings, and impersonation happen there — not in this app.</p>
            <Button variant="outline" className="mt-3 text-destructive" onClick={resetDemo}>Reset demo data</Button>
          </Card>
        </div>
      </div>
    );
  },
});
