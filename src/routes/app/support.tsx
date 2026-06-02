import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/support")({
  head: () => ({ meta: [{ title: "Support — MasaQR" }] }),
  component: () => {
    const { tickets, openTicket } = useStore();
    const [subj, setSubj] = useState(""); const [type, setType] = useState("other"); const [msg, setMsg] = useState("");
    return (
      <div className="p-6 md:p-10">
        <PageHeader title="Support" subtitle="We typically reply within 4 hours." />
        <div className="grid md:grid-cols-[1fr_360px] gap-5">
          <Card className="p-5">
            <h3 className="font-display text-lg mb-3">Open a ticket</h3>
            <div className="space-y-3">
              <div><Label>Subject</Label><Input value={subj} onChange={e => setSubj(e.target.value)} /></div>
              <div><Label>Issue type</Label>
                <select value={type} onChange={e => setType(e.target.value)} className="w-full h-10 rounded-md border bg-card px-2 text-sm">
                  {["PDF export", "QR code", "Kitchen display", "Waiter alert", "Staff invite", "Plan/account", "Other"].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div><Label>Message</Label><Textarea rows={5} value={msg} onChange={e => setMsg(e.target.value)} /></div>
              <div><Label>Attach screenshot (demo)</Label><Input type="file" /></div>
              <Button className="bg-ember hover:bg-ember/90 text-ember-foreground" onClick={() => { if(!subj) return; openTicket(subj, type, msg); setSubj(""); setMsg(""); toast.success("Ticket submitted"); }}>Send ticket</Button>
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="font-display text-lg mb-3">Your tickets</h3>
            <div className="space-y-2">
              {tickets.length === 0 && <div className="text-sm text-muted-foreground">No tickets yet.</div>}
              {tickets.map(t => (
                <div key={t.id} className="p-3 rounded-lg border">
                  <div className="flex justify-between text-sm"><b>{t.subject}</b><span className="text-xs uppercase bg-muted px-2 py-0.5 rounded">{t.status}</span></div>
                  <div className="text-xs text-muted-foreground mt-1">{t.type}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  },
});
