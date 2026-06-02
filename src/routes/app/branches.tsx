import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/branches")({
  head: () => ({ meta: [{ title: "Branches — MasaQR" }] }),
  component: () => {
    const { branches, addBranch, toggleBranch } = useStore();
    const [name, setName] = useState(""); const [addr, setAddr] = useState("");
    return (
      <div className="p-6 md:p-10">
        <PageHeader title="Branches" subtitle="Run multiple locations from one menu." />
        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-3">
            {branches.map(b => (
              <Card key={b.id} className="p-4 flex items-center gap-3">
                <div className="flex-1"><div className="font-medium">{b.name}</div><div className="text-xs text-muted-foreground">{b.address}</div></div>
                <Switch checked={b.active} onCheckedChange={() => toggleBranch(b.id)} />
              </Card>
            ))}
          </div>
          <Card className="p-5">
            <h3 className="font-display text-lg mb-3">Add branch</h3>
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="Riverside" /></div>
              <div><Label>Address</Label><Input value={addr} onChange={e => setAddr(e.target.value)} placeholder="Street, city" /></div>
              <Button className="bg-ember hover:bg-ember/90 text-ember-foreground" onClick={() => { if(!name) return; addBranch(name, addr); setName(""); setAddr(""); toast.success("Branch added"); }}><Plus className="h-4 w-4 mr-1" />Add</Button>
            </div>
          </Card>
        </div>
      </div>
    );
  },
});
