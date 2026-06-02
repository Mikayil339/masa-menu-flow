import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { useStore, type Role } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";
import { Plus, Copy, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/staff")({
  head: () => ({ meta: [{ title: "Staff — MasaQR" }] }),
  component: () => {
    const { staff, invites, branches, inviteStaff, removeStaff, cancelInvite } = useStore();
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<Role>("waiter");

    return (
      <div className="p-6 md:p-10">
        <PageHeader title="Staff" subtitle="Invite your team. They join with a code, not a self-signup."
          actions={<Button onClick={() => setOpen(true)} className="bg-ember hover:bg-ember/90 text-ember-foreground"><Plus className="h-4 w-4 mr-1.5" />Invite staff</Button>} />

        <div className="grid lg:grid-cols-2 gap-5">
          <Card className="p-5">
            <h3 className="font-display text-lg mb-3">Team ({staff.length})</h3>
            <div className="space-y-2">
              {staff.map(s => (
                <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className="h-9 w-9 rounded-full bg-ember/15 text-ember grid place-items-center font-medium">{s.name[0]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{s.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{s.email}</div>
                  </div>
                  <span className="text-xs uppercase bg-muted px-2 py-0.5 rounded">{s.role}</span>
                  <Button size="sm" variant="ghost" onClick={() => { removeStaff(s.id); toast.success("Removed"); }}><X className="h-3 w-3" /></Button>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-display text-lg mb-3">Pending invites ({invites.filter(i => i.status === "pending").length})</h3>
            <div className="space-y-2">
              {invites.filter(i => i.status === "pending").map(i => (
                <div key={i.id} className="flex items-center gap-3 p-3 rounded-lg border bg-ember/5">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm">{i.email}</div>
                    <div className="text-xs text-muted-foreground">{i.role}</div>
                  </div>
                  <button onClick={() => { navigator.clipboard.writeText(i.code); toast.success("Code copied"); }} className="font-mono text-sm bg-card border rounded px-2 py-1 hover:bg-muted flex items-center gap-1">{i.code} <Copy className="h-3 w-3" /></button>
                  <Button size="sm" variant="ghost" onClick={() => cancelInvite(i.id)}><X className="h-3 w-3" /></Button>
                </div>
              ))}
              {invites.filter(i => i.status === "pending").length === 0 && <div className="text-sm text-muted-foreground text-center py-6">No pending invites.</div>}
            </div>
          </Card>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Invite staff</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
              <div><Label>Role</Label>
                <select className="w-full h-10 rounded-md border bg-card px-2 text-sm" value={role} onChange={e => setRole(e.target.value as Role)}>
                  <option value="manager">Manager</option><option value="kitchen">Kitchen</option><option value="waiter">Waiter</option>
                </select>
              </div>
              <p className="text-xs text-muted-foreground">They'll get a one-time code valid for 7 days.</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button className="bg-ember hover:bg-ember/90 text-ember-foreground" onClick={() => {
                const inv = inviteStaff(email, role, ["br1"]);
                toast.success(`Invite code: ${inv.code}`);
                setEmail(""); setOpen(false);
              }}>Send invite</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  },
});
