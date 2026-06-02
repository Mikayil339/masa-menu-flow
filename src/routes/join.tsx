import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { PublicNav, PublicFooter } from "@/components/PublicNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/join")({
  head: () => ({ meta: [{ title: "Join your team — MasaQR" }] }),
  component: () => {
    const nav = useNavigate();
    const { acceptInvite, login, invites } = useStore();
    const [code, setCode] = useState(invites[0]?.code ?? "");
    const [name, setName] = useState("");

    return (
      <div>
        <PublicNav />
        <div className="mx-auto max-w-md px-6 py-16">
          <h1 className="font-display text-3xl">Join your team</h1>
          <p className="text-sm text-muted-foreground mt-1">Enter the invite code from your manager.</p>
          <form
            className="mt-8 space-y-4"
            onSubmit={e => {
              e.preventDefault();
              const member = acceptInvite(code.toUpperCase(), name);
              if (!member) { toast.error("Invalid or expired code"); return; }
              login({ email: member.email, role: member.role, name: member.name, branchId: "br1" });
              toast.success(`Welcome, ${member.name}`);
              if (member.role === "kitchen") nav({ to: "/kitchen" });
              else if (member.role === "waiter") nav({ to: "/waiter" });
              else nav({ to: "/app" });
            }}
          >
            <div className="space-y-1.5"><Label>Invite code</Label><Input required value={code} onChange={e => setCode(e.target.value)} placeholder="ABC123" className="font-mono tracking-widest" /></div>
            <div className="space-y-1.5"><Label>Your name</Label><Input required value={name} onChange={e => setName(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Create password</Label><Input type="password" required placeholder="Min 8 characters" /></div>
            <Button type="submit" className="w-full bg-ember hover:bg-ember/90 text-ember-foreground">Join team</Button>
          </form>
          {invites.length > 0 && (
            <div className="mt-6 text-xs text-muted-foreground border-t pt-4">
              <p className="font-medium mb-1">Pending invites (demo):</p>
              {invites.filter(i => i.status === "pending").map(i => (
                <div key={i.id} className="flex justify-between"><span>{i.email} · {i.role}</span><button onClick={() => setCode(i.code)} className="font-mono text-ember">{i.code}</button></div>
              ))}
            </div>
          )}
          <div className="mt-4 text-center text-xs"><Link to="/login">Already on the team? Sign in</Link></div>
        </div>
        <PublicFooter />
      </div>
    );
  },
});
